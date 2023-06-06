import * as path from 'path';
// import ora from 'ora';

import * as System from './system';
import * as Utility from './utility';
import { build as buildContract } from './builder';

async function main() {
    const isAvailable = await System.docker.isDockerAvailable();
    if (!isAvailable) {
        console.log(`Program will exit in 10 seconds...`);
        Utility.waitToExit(10000);
        return;
    }

    const didPullImage = await System.docker.getLatestImage();
    if (!didPullImage) {
        console.log(`Program will exit in 10 seconds...`);
        Utility.waitToExit(10000);
        return;
    }

    const [inputPath, outputPath] = await System.cli.getInputAndOutput();
    if (typeof inputPath === 'undefined' || typeof outputPath === 'undefined') {
        console.log(`Could not determine input path for files, try another path.`);
        console.log(`Program will exit in 10 seconds...`);
        Utility.waitToExit(10000);
        return;
    }

    const didClearContainers = await System.docker.stopRelevantContainers();
    if (!didClearContainers) {
        console.log(`Could not clear pre-existing containers.`);
        console.log(`Program will exit in 10 seconds...`);
        Utility.waitToExit(10000);
        return;
    }

    const isDir = System.cli.isDir(inputPath);
    const didStart = await System.docker.startContainer(isDir ? inputPath : path.dirname(inputPath));
    if (!didStart) {
        console.log(`Could not start Docker Container.`);
        console.log(`Program will exit in 10 seconds...`);
        Utility.waitToExit(10000);
        return;
    }
    // const spinner = ora('Building contracts...').start();
    try {
        await buildContract(inputPath);
    } catch (err) {
        console.log('Failed to build a project:', err);
    }
    // spinner.stop();

    console.log(`Program will stop container in 5 seconds...`);
    await Utility.sleep(5000);
    await System.docker.stopRelevantContainers();
}

main();
