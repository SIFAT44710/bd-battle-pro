const fs = require('fs');
const path = require('path');

function stripJS(filename, newJsPath) {
    try {
        const filepath = path.join(__dirname, filename);
        let content = fs.readFileSync(filepath, 'utf-8');
        
        const pattern = /<script.*?>.*?<\/script>/gis;
        const matches = [...content.matchAll(pattern)];
        
        if (matches.length > 0) {
            // Find the largest script tag by length
            let largestMatch = matches[0];
            for (let i = 1; i < matches.length; i++) {
                if (matches[i][0].length > largestMatch[0].length) {
                    largestMatch = matches[i];
                }
            }
            
            if (largestMatch[0].length > 5000) {
                fs.writeFileSync(filepath + '.backup.js', largestMatch[0]);
                content = content.substring(0, largestMatch.index) + 
                          `<script type="module" src="${newJsPath}"></script>` + 
                          content.substring(largestMatch.index + largestMatch[0].length);
                fs.writeFileSync(filepath, content);
                console.log(`Successfully stripped largest JS from ${filename}`);
            } else {
                console.log(`No large script found in ${filename}`);
            }
        } else {
            console.log(`No scripts found in ${filename}`);
        }
    } catch (err) {
        console.error(`Error processing ${filename}:`, err.message);
    }
}

stripJS('player/dashboard.html', './js/player.js');
stripJS('admin/index.html', './js/admin.js');
