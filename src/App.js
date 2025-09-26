// App.js (for demo usage)
import React, { useState } from 'react';
import SearchableSelect from './SearchableSelect';
import mockFetchCandidates from './data/mockFetchCandidates';

function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{maxWidth:400, margin: '5rem auto'}}>
      <h2>Select Candidate</h2>
      <SearchableSelect
        fetchOptions={mockFetchCandidates}
        value={selected}
        onChange={setSelected}
        getOptionLabel={opt => (
          <span style={{display:'flex',alignItems:'center'}}>
            <img
              src={opt.avatar}
              alt={opt.label}
              style={{width:28,height:28,borderRadius:'50%',marginRight:8}}
            />
            {opt.label} <span style={{color:'#888', marginLeft:6, fontSize:12}}>{opt.email}</span>
          </span>
        )}
        getOptionValue={opt => opt.value}
        placeholder="Type name or email..."
        noResultsText="No candidates found."
        loadingText="Loading candidates..."
        errorText="Could not load candidates."
      />
      {selected && (
        <div style={{marginTop:20, background:'#f7f7f7', padding:10}}>
          <b>Selected:</b><br />
          <img src={selected.avatar} alt="avatar" style={{width:32, height:32, borderRadius:16, marginBottom:8}} /><br />
          <span>{selected.label}</span><br />
          <small>{selected.email}</small>
        </div>
      )}
    </div>
  );
}

export default App;
