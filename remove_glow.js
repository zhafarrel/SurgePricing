const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
};

const files = walk('frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove drop shadows
    content = content.replace(/drop-shadow-\[.*?\]/g, '');
    
    // Remove text shadows and standard shadows if any
    content = content.replace(/shadow-\[.*?\]/g, '');
    
    // Remove pulse animations
    content = content.replace(/animate-pulse/g, '');
    
    // Remove animate-ping
    content = content.replace(/animate-ping/g, '');
    
    fs.writeFileSync(file, content);
});
