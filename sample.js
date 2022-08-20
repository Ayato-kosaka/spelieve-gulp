import fetch from 'node-fetch';
const endpoint = "https://script.google.com/macros/s/AKfycbzYzAnFFUcpKkx5xVoA_yblPIfnsG6dDlLlYlvDOn4vUx0a1eTrSVQuY0morntQFDPaPA/exec";

(async () => {
  try {
    const response = await fetch(endpoint);
    const json = await response.json();
    console.log(json.TABLES);
  } catch (error) {
    console.log(error);
  }
})();