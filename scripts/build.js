const fs = require('fs');
const { exec } = require('pkg');
const packageJson = require('../package');
const rimraf = require('rimraf');

const PROGRAM_NAME = 'contract-builder'

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

    packageJson.bin = 'dist/index.js';

    rimraf.sync('./releases');
    fs.mkdirSync('./releases');

    fs.renameSync('package.json', 'package.json.backup');
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
    await exec(['package.json', '--out-path', 'releases', '--compress', 'Brotli']);
    fs.renameSync('package.json.backup', 'package.json');

    const releaseName = `${PROGRAM_NAME}-v${releaseVersion}`;
    fs.renameSync(`./releases/${PROGRAM_NAME}-linux`, `./releases/${releaseName}-linux`);
    fs.renameSync(`./releases/${PROGRAM_NAME}-macos`, `./releases/${releaseName}-macos`);
    fs.renameSync(`./releases/${PROGRAM_NAME}-win.exe`, `./releases/${releaseName}-win.exe`);

    packageJson.bin = {
        metadataTool: './bin/index.js',
    };
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
})();
