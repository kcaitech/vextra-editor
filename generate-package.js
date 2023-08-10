const fs = require('fs').promises;

async function Generate() {
    const validArgs = ['dev', 'prod'];
    const args = process.argv.slice(2);
    if (args.length === 0 || !validArgs.includes(args[0])) {
        throw new Error(`请输入运行环境 可选值：${args.join(' ')}`);
    }
    const runEnv = args[0];

    const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));
    const patchPackageJson = JSON.parse(await fs.readFile(`./package.${runEnv}.json`, 'utf8'));

    // 合并scripts、dependencies、devDependencies
    packageJson.scripts = { ...packageJson.scripts, ...patchPackageJson.scripts };
    packageJson.dependencies = { ...packageJson.dependencies, ...patchPackageJson.dependencies };
    packageJson.devDependencies = { ...packageJson.devDependencies, ...patchPackageJson.devDependencies };

    // 添加生成命令
    packageJson.scripts['generate-package-dev'] = 'node generate-package.js dev && npm install';
    packageJson.scripts['generate-package-prod'] = 'node generate-package.js prod && npm install';

    // 覆盖package.json
    await fs.writeFile('./package.json', JSON.stringify(packageJson, null, 2), 'utf8');
}

// 调用函数
Generate().then().catch((err) => {
    console.error(err);
    process.exit(1);
});
