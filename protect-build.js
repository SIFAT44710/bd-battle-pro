const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify } = require('html-minifier-terser');

// ========================================================
// ADVANCED ANTI-REVERSE ENGINEERING & ATTACK BACKLASH TRAP
// ========================================================
const ATTACK_BACKLASH_GUARD = `
<script>
(function() {
  'use strict';

  // 1. DOMAIN INTEGRITY LOCK (Self-destructs if cloned/run offline on attacker machine)
  var allowedHosts = ['ff-squad-arena-bd.web.app', 'ff-squad-arena-bd.firebaseapp.com'];
  var currentHost = window.location.hostname;
  if (currentHost && allowedHosts.indexOf(currentHost) === -1) {
    while (true) {
      window.location.href = 'https://ff-squad-arena-bd.web.app';
      window.history.pushState(0, 0, Math.random().toString());
    }
  }

  // 2. DISABLE RIGHT CLICK & INSPECTION HOTKEYS
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; }, false);
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123 ||
       (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
       (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) ||
       (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67))) {
      e.preventDefault();
      triggerBacklash();
      return false;
    }
  }, false);

  // 3. NEUTRALIZE CONSOLE
  try {
    var noop = function() {};
    var methods = ['log', 'debug', 'info', 'warn', 'error', 'dir', 'table', 'trace', 'profile'];
    for (var i = 0; i < methods.length; i++) { console[methods[i]] = noop; }
  } catch(e) {}

  // 4. ATTACKER BACKLASH TRAP (Freezes & Crashes Inspector / Tab if DevTools is opened)
  function triggerBacklash() {
    try {
      document.body.innerHTML = '<div style="background:#050811;color:#EF4444;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:24px;">' +
        '<h1 style="font-size:2rem;margin-bottom:12px;">⛔ ATTACK INTERCEPTED</h1>' +
        '<p style="color:#94A3B8;max-width:480px;font-size:1rem;">Tampering, code inspection and reverse engineering are strictly forbidden. Session neutralized.</p>' +
        '</div>';
    } catch(e) {}

    setInterval(function() {
      (function() { Function('debugger')(); })();
    }, 50);
  }

  // 5. DEVTOOLS ACTIVE DETECTION
  var threshold = 160;
  setInterval(function() {
    if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
      triggerBacklash();
    }
    var t0 = Date.now();
    (function() { Function('debugger')(); })();
    var t1 = Date.now();
    if (t1 - t0 > 100) {
      triggerBacklash();
    }
  }, 1000);

  // 6. ANTI-SELECTION & ANTI-DRAG
  document.addEventListener('selectstart', function(e) { e.preventDefault(); return false; });
  document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; });
})();
</script>
`;

async function processHtmlFile(sourcePath) {
  let content = fs.readFileSync(sourcePath, 'utf8');

  // Inject the attack backlash guard into <head>
  if (content.includes('</head>')) {
    content = content.replace('</head>', ATTACK_BACKLASH_GUARD + '\n</head>');
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
      const obfuscated = JavaScriptObfuscator.obfuscate(m.code, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1.0, // 100% control flow flattened
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.5,
        debugProtection: true,
        debugProtectionInterval: 1000,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true, // Auto-crashes if formatted/beautified
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 1.0, // 100% strings encrypted
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
  console.log("🛡️ INITIATING MILITARY-GRADE ANTI-REVERSE ENGINEERING PIPELINE...");

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

  console.log("🔒 ALL ASSETS ARMORED WITH ANTI-TAMPER, ATTACKER BACKLASH TRAP & DOMAIN LOCK!");
}

run().catch(console.error);
