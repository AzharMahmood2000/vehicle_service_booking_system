const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace JSX/JS banner comments like:
    // {/* ================= TEXT ================= */}
    // // ==============================================
    // // TEXT
    // // ==============================================
    // // ================= TEXT =================
    
    // Pattern for single line {/* ==== TEXT ==== */}
    content = content.replace(/\{\/\*\s*=+\s*(.+?)\s*=+\s*\*\/\}/g, (match, p1) => {
        let text = p1.trim().replace(/\s*\(UNCHANGED\)/gi, '');
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        return `{/* ${text} */}`;
    });

    // Pattern for single line // ==== TEXT ====
    content = content.replace(/\/\/\s*=+\s*(.+?)\s*=+/g, (match, p1) => {
        if (!p1.trim()) return ''; // Empty inner
        let text = p1.trim().replace(/\s*\(UNCHANGED\)/gi, '');
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        return `// ${text}`;
    });

    // Pattern for multiline CSS /* === \n TEXT \n === */
    content = content.replace(/\/\*\s*=+\s*\n\s*(.+?)\s*\n\s*=+\s*\*\//g, (match, p1) => {
        let text = p1.trim();
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        return `/* ${text} */`;
    });

    // Pattern for single line CSS /* ==== TEXT ==== */
    content = content.replace(/\/\*\s*=+\s*(.+?)\s*=+\s*\*\//g, (match, p1) => {
        let text = p1.trim();
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        return `/* ${text} */`;
    });
    
    // Pattern for multiline JS block comments
    content = content.replace(/\/\/\s*=+\n\/\/\s*(.+?)\n\/\/\s*=* /g, (match, p1) => {
        let text = p1.trim();
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        return `// ${text}`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated comments in ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src'));
console.log('Done!');
