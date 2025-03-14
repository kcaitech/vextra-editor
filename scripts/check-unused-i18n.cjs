const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const i18nResources = new Map();
const usedResources = new Set();

// 扫描语言资源文件
function scanI18nFiles() {
    const langDir = path.join(projectRoot, 'src/assets/lang');
    const langs = fs.readdirSync(langDir).filter(item => 
        fs.statSync(path.join(langDir, item)).isDirectory()
    );
    
    function extractResources(obj, prefix = '') {
        Object.entries(obj).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
                extractResources(value, fullKey);
            } else {
                i18nResources.set(fullKey, value);
            }
        });
    }

    function scanLangFiles(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanLangFiles(fullPath);
            } else if (file.endsWith('.ts')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                try {
                    // Extract the object literal directly
                    const match = content.match(/=\s*({[\s\S]*})/);
                    if (match) {
                        const objStr = match[1];
                        // Convert the object string to a real object
                        const obj = Function(`return ${objStr}`)();
                        const fileName = path.parse(file).name;
                        const moduleObj = { [fileName]: obj };
                        extractResources(moduleObj);
                    }
                } catch (error) {
                    console.warn(`Warning: Could not parse file ${fullPath}:`, error.message);
                }
            }
        });
    }

    langs.forEach(lang => {
        scanLangFiles(path.join(langDir, lang));
    });
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

// 检查文件中的语言资源使用
function checkFileForI18nUsage(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    i18nResources.forEach((value, key) => {
        // 检查更多 i18n 使用模式
        const patterns = [
            `t('${key}')`,
            `t("${key}")`,
            `t(\`${key}\`)`,
            `'${key}'`,
            `"${key}"`,
            `\`${key}\``,
            `t('${key}',`,    // 带参数的调用
            `t("${key}",`,
            `t(\`${key}\`,`,
        ];
        
        if (patterns.some(pattern => content.includes(pattern))) {
            usedResources.add(key);
        }
    });
}

// 主函数
async function main() {
    // 扫描语言资源文件
    scanI18nFiles();
    console.log(`找到 ${i18nResources.size} 个语言资源项`);

    // 扫描所有 ts、vue 文件
    const sourceFiles = scanSourceFiles();
    console.log(`找到 ${sourceFiles.size} 个源代码文件`);

    // 检查每个文件
    sourceFiles.forEach(file => {
        checkFileForI18nUsage(file);
    });

    // 找出未使用的语言资源
    const unusedResources = Array.from(i18nResources.keys())
        .filter(key => !usedResources.has(key));

    if (unusedResources.length > 0) {
        console.log('\n未使用的语言资源:');
        unusedResources.forEach(key => {
            console.log(`- ${key}: ${i18nResources.get(key)}`);
        });
        console.log(`\n共发现 ${unusedResources.length} 个未使用的语言资源`);

        // 询问是否删除
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question('\n是否删除这些未使用的语言资源？(y/N) ', (answer) => {
            if (answer.toLowerCase() === 'y') {
                const fileGroups = new Map();
                unusedResources.forEach(key => {
                    const [file] = key.split('.');
                    if (!fileGroups.has(file)) {
                        fileGroups.set(file, []);
                    }
                    fileGroups.get(file).push(key);
                });

                // 获取所有语言目录
                const langDir = path.join(projectRoot, 'src/assets/lang');
                const langs = fs.readdirSync(langDir).filter(item => 
                    fs.statSync(path.join(langDir, item)).isDirectory()
                );

                // 处理每个语言目录
                fileGroups.forEach((keys, file) => {
                    langs.forEach(lang => {
                        const filePath = path.join(projectRoot, 'src/assets/lang', lang, `${file}.ts`);
                        if (fs.existsSync(filePath)) {
                            let content = fs.readFileSync(filePath, 'utf-8');
                            keys.forEach(key => {
                                const resourceKey = key.split('.').slice(1).join('.');
                                content = content.replace(new RegExp(`\\s*${resourceKey}:\\s*'[^']*',?\\n`), '\n');
                            });
                            content = content.replace(/\n\s*\n/g, '\n');
                            fs.writeFileSync(filePath, content);
                            console.log(`已更新: ${filePath}`);
                        }
                    });
                });

                console.log('\n删除完成！');
            }
            readline.close();
        });
    } else {
        console.log('\n没有发现未使用的语言资源');
    }
}

// 运行脚本
main().catch(console.error);