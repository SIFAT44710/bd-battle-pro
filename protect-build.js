const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify } = require('html-minifier-terser');

// Clean, safe desktop inspection protection that NEVER interferes with mobile browsers
const SAFE_CLIENT_GUARD = `
<script>
(function() {
  'use strict';
  // Desktop-only right click prevention
  document.addEventListener('contextmenu', function(e) {
    if (window.innerWidth > 768) {
      e.preventDefault();
      return false;
    }
  }, false);

  // Disable DevTools hotkeys on desktop
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123 ||
       (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
       (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83))) {
      e.preventDefault();
      return false;
    }
  }, false);
})();
</script>
`;

async function processHtmlFile(sourcePath) {
  let content = fs.readFileSync(sourcePath, 'utf8');

  // Inject the safe guard into <head>
  if (content.includes('</head>')) {
    content = content.replace('</head>', SAFE_CLIENT_GUARD + '\n</head>');
  }

  // Regex to extract and obfuscate all inline script tags
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const matches = [];
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
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
      const isModule = m.attributes.includes('module');
      const obfuscated = JavaScriptObfuscator.obfuscate(m.code, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false,
        debugProtection: false, // Safe for mobile devices
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: false, // Safe for mobile webviews & browsers
        sourceType: isModule ? 'module' : 'script',
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.8,
        transformObjectKeys: true,
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
  console.log("🛡️ INITIATING PRODUCTION BUILD & SAFE OBFUSCATION PIPELINE...");

  const baseDir = __dirname;
  const srcDir = path.join(baseDir, 'src_backup');

  // 1. Process Landing Page
  console.log("-> Compiling & Hardening Landing Page...");
  const protectedLanding = await processHtmlFile(path.join(srcDir, 'index.html'));
  fs.writeFileSync(path.join(baseDir, 'index.html'), protectedLanding, 'utf8');

  // 2. Process Player Panel
  console.log("-> Compiling & Hardening Player Panel...");
  const protectedPlayer = await processHtmlFile(path.join(srcDir, 'player.html'));
  fs.writeFileSync(path.join(baseDir, 'player', 'dashboard.html'), protectedPlayer, 'utf8');
  fs.writeFileSync(path.join(baseDir, 'player', 'index.html'), protectedPlayer, 'utf8');

  // 3. Process Admin Panel
  console.log("-> Compiling & Hardening Admin Panel...");
  const protectedAdmin = await processHtmlFile(path.join(srcDir, 'admin.html'));
  fs.writeFileSync(path.join(baseDir, 'admin.html'), protectedAdmin, 'utf8');
  fs.writeFileSync(path.join(baseDir, 'admin', 'index.html'), protectedAdmin, 'utf8');

  console.log("🔒 ALL ASSETS ARMORED & 100% OPTIMIZED FOR MOBILE PHONES AND DESKTOP!");
}

run().catch(console.error);
