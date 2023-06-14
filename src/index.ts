import * as path from 'path';
import * as System from './system';
import * as Utility from './utility';
import { buildContract } from './builder';

export async function start() {
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

    const [inputPath, outputPath, buildOpts] = await System.cli.getInputAndOutput();

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

    try {
        await buildContract(inputPath, { buildOpts });
    } catch (err) {
        console.log('Failed to build a project:', err);
    }

    console.log(`Program will stop container in 5 seconds...`);
    await Utility.sleep(5000);
    await System.docker.stopRelevantContainers();
}

/**
 * Build a smart contract located in a specific directory.
 *
 * Only need to pass the directory where the cmake file, or .cpp files are located.
 *
 * It will return true, if it tried to build the contract.
 *
 * @export
 * @param {string} inputPath
 * @param {(string | undefined)} [buildOpts=undefined]
 * @return {Promise<boolean>}
 */
export async function build(
    inputPath: string,
    options: { buildOpts?: string; appendLine?: (value: string) => void }
): Promise<boolean> {
    const isAvailable = await System.docker.isDockerAvailable();
    if (!isAvailable) {
        const comment = `Docker is unavailable on this system.`;

        if (options.appendLine) {
            options.appendLine(comment);
        }

        console.error(comment);
        return false;
    }

    const didPullImage = await System.docker.getLatestImage();
    if (!didPullImage) {
        const comment = `Could not pull latest image with docker.`;

        if (options.appendLine) {
            options.appendLine(comment);
        }

        console.error(comment);
        return false;
    }

    const didClearContainers = await System.docker.stopRelevantContainers();
    if (!didClearContainers) {
        const comment = `Was unable to stop existing containers for building contracts.`;

        if (options.appendLine) {
            options.appendLine(comment);
        }

        console.error(comment);
        return false;
    }

    const isDir = System.cli.isDir(inputPath);
    const didStart = await System.docker.startContainer(isDir ? inputPath : path.dirname(inputPath));
    if (!didStart) {
        const comment = `Unable to start the container successfully for building contracts.`;

        if (options.appendLine) {
            options.appendLine(comment);
        }

        console.error(comment);
        return false;
    }

    try {
        await buildContract(inputPath, options);
    } catch (err: unknown) {
        const comment = `Failed to build project:`;

        if (options.appendLine) {
            options.appendLine(comment + String(err));
        }

        console.error(comment, err);
        return false;
    }

    return true;
}

if (process.argv.includes('--start')) {
    start();
}
