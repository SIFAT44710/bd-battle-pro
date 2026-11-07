const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify } = require('html-minifier-terser');

// Security Guard to block right-click, F12, DevTools, Ctrl+U
const SECURITY_GUARD = `
<script>
(function() {
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; }, false);
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) { e.preventDefault(); return false; }
    if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) { e.preventDefault(); return false; }
    if (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) { e.preventDefault(); return false; }
  }, false);
  try {
    var noop = function() {};
    var methods = ['log', 'debug', 'info', 'warn', 'error', 'dir', 'table', 'trace'];
    for (var i = 0; i < methods.length; i++) { console[methods[i]] = noop; }
  } catch(e) {}
  var threshold = 160;
  setInterval(function() {
    if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
      document.body.innerHTML = '<div style="background:#0B0F19;color:#FACC15;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px;"><h2>🔒 Security Notice: Inspection Prohibited</h2><p style="color:#94A3B8;max-width:400px;margin-top:8px;">Developer tools access is disabled to protect proprietary tournament infrastructure and player data.</p></div>';
    }
  }, 1000);
})();
</script>
`;

async function processHtmlFile(sourcePath) {
  let content = fs.readFileSync(sourcePath, 'utf8');

  // Insert security guard in head
  if (content.includes('</head>')) {
    content = content.replace('</head>', SECURITY_GUARD + '\n</head>');
  }

  // Regex to find all script tags
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  const matches = [];
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    // Only obfuscate scripts with actual body (not external src)
    if (!match[1].includes('src=') && match[2].trim().length > 0) {
      matches.push({
        fullTag: match[0],
        attributes: match[1],
        code: match[2]
      });
    }
  }

  for (const m of matches) {
    try {
      const obfuscated = JavaScriptObfuscator.obfuscate(m.code, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.3,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        selfDefending: true,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.85,
        disableConsoleOutput: true,
        target: 'browser'
      }).getObfuscatedCode();

      const newTag = `<script${m.attributes}>\n${obfuscated}\n</script>`;
      content = content.replace(m.fullTag, newTag);
    } catch (err) {
      console.warn(`Obfuscation warning in ${sourcePath}:`, err.message);
    }
  }

  // Minify HTML & CSS
  const minified = await minify(content, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: false,
    keepClosingSlash: true
  });

  return minified;
}

async function run() {
  console.log("🔒 Starting Code Encryption & Protection Pipeline...");

  const baseDir = __dirname;
  const srcDir = path.join(baseDir, 'src_backup');

  // Process Landing Page
  console.log("-> Encrypting Landing Page...");
  const protectedLanding = await processHtmlFile(path.join(srcDir, 'index.html'));
  fs.writeFileSync(path.join(baseDir, 'index.html'), protectedLanding, 'utf8');

  // Process Player Panel
  console.log("-> Encrypting Player Panel...");
  const protectedPlayer = await processHtmlFile(path.join(srcDir, 'player.html'));
  fs.writeFileSync(path.join(baseDir, 'player', 'dashboard.html'), protectedPlayer, 'utf8');
  fs.writeFileSync(path.join(baseDir, 'player', 'index.html'), protectedPlayer, 'utf8');

  // Process Admin Panel
  console.log("-> Encrypting Admin Panel...");
  const protectedAdmin = await processHtmlFile(path.join(srcDir, 'admin.html'));
  fs.writeFileSync(path.join(baseDir, 'admin.html'), protectedAdmin, 'utf8');
  fs.writeFileSync(path.join(baseDir, 'admin', 'index.html'), protectedAdmin, 'utf8');

  console.log("✅ All pages successfully encrypted, obfuscated and locked down!");
}

run().catch(console.error);
