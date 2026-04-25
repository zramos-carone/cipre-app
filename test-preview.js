const https = require('https');

https.get('https://cipre-app-git-main-zramos-carones-projects.vercel.app/?bypass=' + Date.now(), (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', () => {});
}).on('error', (e) => {
  console.error('Error:', e);
});
