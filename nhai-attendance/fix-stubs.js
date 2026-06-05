const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // strip comments and whitespace
            const stripped = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s/g, '');
            if (stripped === 'export{};') {
                console.log('Fixing stub:', fullPath);
                
                if (file === 'index.ts') {
                    const dirName = path.basename(dir);
                    if (fs.existsSync(path.join(dir, dirName + '.ts')) || fs.existsSync(path.join(dir, dirName + '.tsx'))) {
                        fs.writeFileSync(fullPath, `export * from './${dirName}';\n`);
                    } else {
                        const exports = fs.readdirSync(dir)
                            .filter(f => f !== 'index.ts' && (f.endsWith('.ts') || f.endsWith('.tsx')))
                            .map(f => `export * from './${f.replace(/\.tsx?$/, '')}';`)
                            .join('\n');
                        fs.writeFileSync(fullPath, exports + '\n');
                    }
                } else {
                    const name = file.replace(/\.tsx?$/, '');
                    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                    fs.writeFileSync(fullPath, `export interface ${capitalizedName} {\n  // Implementation pending\n}\n`);
                }
            }
        }
    });
}

walkDir(srcDir);
