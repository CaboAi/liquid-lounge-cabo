const fs = require('fs');
const path = require('path');

console.log('Starting component transformation...');

function getAllFiles(dirPath, arrayOfFiles = []) {
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(function(file) {
            const filePath = path.join(dirPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
            } else if (file.match(/\.(tsx?|jsx?)$/)) {
                arrayOfFiles.push(filePath);
            }
        });
    } catch (error) {
        console.log('Error reading directory:', dirPath);
    }
    return arrayOfFiles;
}

function transformFile(filePath) {
    console.log('Processing:', path.basename(filePath));
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix Lovable imports to Next.js
    const replacements = [
        [/from ["']@\/integrations\/supabase\/client["']/g, 'from "@/lib/supabase/client"'],
        [/from ["']@\/integrations\/supabase/g, 'from "@/lib/supabase'],
        [/from ["']\.\.\/integrations\/supabase/g, 'from "@/lib/supabase'],
        [/navigate\(/g, 'router.push('],
        [/const navigate = /g, 'const router = '],
        [/import { useNavigate }/g, 'import { useRouter }'],
        [/useNavigate\(\)/g, 'useRouter()']
    ];
    
    replacements.forEach(([pattern, replacement]) => {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
            content = newContent;
            modified = true;
        }
    });
    
    // Add use client directive for client components
    if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
        if (content.includes('useState') || content.includes('useEffect') || content.includes('onClick')) {
            content = "'use client'\n\n" + content;
            modified = true;
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('  Transformed:', path.basename(filePath));
    }
}

const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
    const files = getAllFiles(srcPath);
    console.log('Found', files.length, 'files to process');
    files.forEach(file => transformFile(file));
    console.log('Transformation complete!');
} else {
    console.error('src directory not found');
}
