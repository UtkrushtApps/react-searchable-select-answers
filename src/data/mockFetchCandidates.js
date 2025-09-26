// data/mockFetchCandidates.js
// Returns a promise that resolves to filtered candidate array
const ALL_CANDIDATES = Array.from({length: 1000}).map((_, i) => ({
  value: `cand_${i}`,
  label: `Candidate #${i} - ${['James','Taylor','Maya','Yoshi','Maria','Zhang','Ali','Emily','Ravi','Omar','Ava','Lucas'][i%12]} ${['Smith','Garcia','Chen','Patel','Lopez','Rossi','Khan','Kim','Singh','Nguyen','Meijer','Nakamura'][i%12]}`,
  email: `user${i}@mail.com`,
  avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i%100}.jpg`
}));

function mockFetchCandidates(query = '') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Random error simulation for demo
      if (query && query.toLowerCase().includes('error')) {
        reject(new Error('Mocked error (remove query text to recover)'));
        return;
      }
      const lower = query.toLowerCase();
      const results = ALL_CANDIDATES.filter(
        c =>
          c.label.toLowerCase().includes(lower) ||
          c.email.toLowerCase().includes(lower) ||
          c.value.toLowerCase().includes(lower)
      ).slice(0, 300); // limit for perf
      resolve(results);
    }, 400);
  });
}

export default mockFetchCandidates;
