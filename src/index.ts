import * as System from './system';
import * as Utility from './utility';

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

    await System.docker.stopRelevantContainers();
    await System.docker.startContainer(inputPath);

    Utility.waitToExit(60000 * 5);
}

main();
