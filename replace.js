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
    
    content = content.replace(/text-white/g, 'text-black');
    content = content.replace(/bg-gradient-to-r from-synth-cyan to-synth-blue text-black/g, 'bg-black text-white');
    content = content.replace(/bg-gradient-to-br from-synth-cyan to-synth-blue text-black/g, 'bg-black text-white');
    
    content = content.replace(/border-white\/10/g, 'border-black/10');
    content = content.replace(/border-white\/20/g, 'border-black/20');
    content = content.replace(/border-white\/5/g, 'border-black/5');
    
    content = content.replace(/bg-black\/20/g, 'bg-[#F6F6F6]');
    content = content.replace(/bg-black\/40/g, 'bg-[#E2E2E2]');
    content = content.replace(/bg-black\/50/g, 'bg-white');
    content = content.replace(/bg-black\/80/g, 'bg-[#F6F6F6]');
    
    content = content.replace(/from-\[#040d1a\]/g, 'from-white');
    
    content = content.replace(/rgba\(0,0,0,0\.5\)/g, 'rgba(0,0,0,0.05)');
    content = content.replace(/rgba\(0,0,0,0\.8\)/g, 'rgba(0,0,0,0.1)');
    content = content.replace(/rgba\(0,210,255,/g, 'rgba(0,0,0,');
    
    fs.writeFileSync(file, content);
    console.log('Processed:', file);
});
