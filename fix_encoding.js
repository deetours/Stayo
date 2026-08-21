const fs = require('fs');
const path = require('path');
const win1252 = { 
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡', 
  0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ', 0x8e: 'Ž', 0x91: '‘', 
  0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—', 0x98: '˜', 
  0x99: '™', 0x9a: 'š', 0x9b: '›', 0x9c: 'œ', 0x9e: 'ž', 0x9f: 'Ÿ',
  0xa9: '©', 0xb7: '·'
};

function walk(dir) {
  let results = [];
  let list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

walk('src').forEach(f => {
  let b = fs.readFileSync(f);
  
  // First, verify if it's already UTF-8. If it decodes without replacement chars, it might be fine,
  // but to be safe, if we see bytes in the 128-255 range that are NOT part of a valid UTF-8 sequence,
  // we fix it. Let's just catch Turbopack's error by trying to decode as UTF-8.
  let str = b.toString('utf8');
  if (str.includes('\uFFFD')) { // Invalid UTF-8 sequence results in replacement character
    let out = '';
    for(let i=0; i<b.length; i++) {
      if (b[i] < 128) out += String.fromCharCode(b[i]);
      else if (win1252[b[i]]) out += win1252[b[i]];
      else out += String.fromCharCode(b[i]);
    }
    fs.writeFileSync(f, Buffer.from(out, 'utf8'));
    console.log('Converted to UTF-8:', f);
  }
});
