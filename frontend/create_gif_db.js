const fs = require('fs');
const path = require('path');

const gifFolder = 'Workout  GIFS';
const outputFile = 'js/gif_database.js';

let jsContent = `// GIF Database - Embedded Base64 GIFs for portability
// These GIFs work on any system without file dependencies

const gifDatabase = {
`;

// Recursively get all GIF files
function getAllGifFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getAllGifFiles(filePath, fileList);
        } else if (file.endsWith('.gif')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

const gifFiles = getAllGifFiles(gifFolder);

gifFiles.forEach(filePath => {
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/gif;base64,${base64}`;
    const fileName = path.basename(filePath);
    
    jsContent += `    '${fileName}': '${dataUrl}',\n`;
});

// Remove the last comma and close the object
jsContent = jsContent.slice(0, -2) + `\n\n};\n\n`;
jsContent += `// Export for use in other files\n`;
jsContent += `if (typeof module !== 'undefined' && module.exports) {\n`;
jsContent += `    module.exports = gifDatabase;\n`;
jsContent += `}`;

fs.writeFileSync(outputFile, jsContent);
console.log(`✅ GIF Database created successfully at ${outputFile}`);
console.log(`📊 Total GIFs embedded: ${gifFiles.length}`);
