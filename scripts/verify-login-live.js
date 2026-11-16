const https = require('https');

const urls = [
  "https://ff-squad-arena-bd.web.app/login",
  "https://ff-squad-arena-bd.web.app/login/index.html",
  "https://ff-squad-arena-bd.web.app/signup",
  "https://ff-squad-arena-bd.web.app/admin",
  "https://ff-squad-arena-bd.web.app/player",
  "https://ff-squad-arena-bd.web.app/orbit"
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          hasLoginTitle: body.includes('আয়োজক লগইন'),
          bodySnippet: body.substring(0, 150).replace(/\n/g, ' ')
        });
      });
    }).on('error', (e) => {
      resolve({ url, status: 'ERROR', error: e.message });
    });
  });
}

async function run() {
  console.log("=== VERIFYING LIVE SAAS DEPLOYMENT ===");
  for (const url of urls) {
    const result = await checkUrl(url);
    console.log(`[${result.status}] ${url} (hasLoginTitle: ${result.hasLoginTitle})`);
  }
}

run();
