// useAsyncOptions.js
import { useState, useEffect, useRef } from 'react';

function useAsyncOptions(fetchOptions, query) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastCall = useRef(0);

  // Fetch options when query or fetchOptions change
  const fetch = (overrideQuery = undefined) => {
    const actualQuery = overrideQuery !== undefined ? overrideQuery : query;
    const thisCall = ++lastCall.current;
    setLoading(true);
    setError(null);
    Promise.resolve(fetchOptions(actualQuery))
      .then(res => {
        if (lastCall.current !== thisCall) return; // ignore stale results
        setOptions(res || []);
        setError(null);
      })
      .catch(err => {
        if (lastCall.current !== thisCall) return;
        setOptions([]);
        setError(err.message || 'Error');
      })
      .finally(() => {
        if (lastCall.current === thisCall) setLoading(false);
      });
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line
  }, [fetchOptions, query]);

  return {
    options,
    loading,
    error,
    fetch,
  };
}

export default useAsyncOptions;
