const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const svgFiles = new Set();
const usedSvgFiles = new Set();

// 扫描所有 SVG 文件
function scanSvgFiles() {
    const assetsDir = path.join(projectRoot, 'src/assets');
    function scanDir(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath);
            } else if (file.endsWith('.svg')) {
                svgFiles.add(fullPath);
            }
        });
    }
    scanDir(assetsDir);
}

// 扫描源代码文件
function scanSourceFiles() {
    const sourceFiles = new Set();
    function scanDir(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath);
            } else if (file.endsWith('.ts') || file.endsWith('.vue')) {
                sourceFiles.add(fullPath);
            }
        });
    }
    scanDir(path.join(projectRoot, 'src'));
    return sourceFiles;
}

// 检查文件中的 SVG 引用
function checkFileForSvgUsage(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    svgFiles.forEach(svgPath => {
        const relativePath = path.relative(projectRoot, svgPath);
        const aliasPath = relativePath.replace('src', '@');
        
        if (content.includes(relativePath) || 
            content.includes(svgPath) || 
            content.includes(aliasPath)) {
            usedSvgFiles.add(svgPath);
        }
    });
}

// 主函数
async function main() {
    // 扫描 SVG 文件
    scanSvgFiles();
    console.log(`找到 ${svgFiles.size} 个 SVG 文件`);

    // 扫描所有 ts、vue 文件
    const sourceFiles = scanSourceFiles();
    console.log(`找到 ${sourceFiles.size} 个源代码文件`);

    // 检查每个文件
    sourceFiles.forEach(file => {
        checkFileForSvgUsage(file);
    });

    // 找出未使用的 SVG 文件
    const unusedSvgs = Array.from(svgFiles).filter(file => !usedSvgFiles.has(file));

    if (unusedSvgs.length > 0) {
        console.log('\n未使用的 SVG 文件:');
        unusedSvgs.forEach(file => {
            console.log(`- ${path.relative(projectRoot, file)}`);
        });
        console.log(`\n共发现 ${unusedSvgs.length} 个未使用的 SVG 文件`);

        // 询问是否删除
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question('\n是否删除这些未使用的 SVG 文件？(y/N) ', (answer) => {
            if (answer.toLowerCase() === 'y') {
                unusedSvgs.forEach(file => {
                    fs.unlinkSync(file);
                    console.log(`已删除: ${path.relative(projectRoot, file)}`);
                });
                console.log('\n删除完成！');
            }
            readline.close();
        });
    } else {
        console.log('\n没有发现未使用的 SVG 文件');
    }
}

// 运行脚本
main().catch(console.error);