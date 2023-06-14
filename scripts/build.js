const fs = require('fs');
const { exec } = require('pkg');
const packageJson = require('../package');
const PROGRAM_NAME = 'contract-builder';

function matchRule(str, rule) {
    var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    return new RegExp('^' + rule.split('*').map(escapeRegex).join('.*') + '$').test(str);
}

(async () => {
    const releaseVersion = process.argv[2] ? process.argv[2] : packageJson.version.replace(/\./g, '-');
    if ((!matchRule(releaseVersion, '*.*.*') && !matchRule(releaseVersion, '*-*-*')) || releaseVersion.includes('/')) {
        console.error(`Incorrect version: ${releaseVersion}`);
        process.exit(1);
    }

    packageJson.bin = 'lib/index.js';

    if (fs.existsSync('./releases')) {
        fs.rmSync('./releases', { recursive: true, force: true });
    }

    fs.mkdirSync('./releases');

    // Re-program start script to auto-call start(); at the end of the file.
    const compiledIndexFile = fs.readFileSync('./lib/index.js', 'utf-8');
    const lines = compiledIndexFile.split('\n');
    if (!lines[lines.length - 1].includes('start();')) {
        fs.appendFileSync('./lib/index.js', '\r\nstart();', 'utf-8');
    }

    fs.renameSync('package.json', 'package.json.bak');
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
    await exec(['package.json', '--out-path', 'releases']);
    fs.renameSync('package.json.bak', 'package.json');

    packageJson.bin = {
        [PROGRAM_NAME]: './bin/cli.js',
    };

    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
})();
