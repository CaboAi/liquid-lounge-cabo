const fs = require('fs');
const path = require('path');

console.log('Comprehensive router fix starting...');

function getAllFiles(dirPath, arrayOfFiles = []) {
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(function(file) {
            const filePath = path.join(dirPath, file);
            try {
                if (fs.statSync(filePath).isDirectory()) {
                    arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
                } else if (file.match(/\.(tsx?|jsx?)$/)) {
                    arrayOfFiles.push(filePath);
                }
            } catch (err) {
                console.log('Skipping:', filePath);
            }
        });
    } catch (error) {
        console.log('Error with directory:', dirPath);
    }
    return arrayOfFiles;
}

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Fix react-router-dom imports
        if (content.includes('from "react-router-dom"') || content.includes("from 'react-router-dom'")) {
            // Replace Link import
            content = content.replace(
                /import\s*{\s*Link\s*}\s*from\s*["']react-router-dom["'];?/g,
                'import Link from "next/link";'
            );
            
            // Replace mixed imports containing Link
            content = content.replace(
                /import\s*{\s*([^}]*),?\s*Link\s*,?\s*([^}]*)\s*}\s*from\s*["']react-router-dom["'];?/g,
                (match, before, after) => {
                    let result = 'import Link from "next/link";\n';
                    const otherImports = (before + ',' + after).split(',').filter(s => s.trim() && s.trim() !== 'Link');
                    if (otherImports.length > 0) {
                        result += `import { ${otherImports.join(', ')} } from "react-router-dom";`;
                    }
                    return result;
                }
            );
            
            // Replace useNavigate
            content = content.replace(
                /import\s*{\s*([^}]*)\s*}\s*from\s*["']react-router-dom["'];?/g,
                (match, imports) => {
                    if (imports.includes('useNavigate')) {
                        return 'import { useRouter } from "next/navigation";';
                    }
                    return match;
                }
            );
            
            content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\)/g, 'const router = useRouter()');
            content = content.replace(/navigate\(/g, 'router.push(');
            
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed:', path.basename(filePath));
        }
    } catch (err) {
        console.log('Error processing:', filePath);
    }
}

// Process all files
const srcPath = path.join(__dirname, 'src');
const componentsPath = path.join(srcPath, 'components');
const appPath = path.join(srcPath, 'app');
const hooksPath = path.join(srcPath, 'hooks');

let allFiles = [];
if (fs.existsSync(componentsPath)) allFiles = allFiles.concat(getAllFiles(componentsPath));
if (fs.existsSync(appPath)) allFiles = allFiles.concat(getAllFiles(appPath));
if (fs.existsSync(hooksPath)) allFiles = allFiles.concat(getAllFiles(hooksPath));

console.log(`Processing ${allFiles.length} files...`);
allFiles.forEach(file => fixFile(file));

console.log('Router fixes complete!');
