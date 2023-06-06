import { dockerCommand } from 'docker-cli-js';
import ora from 'ora'; // CommonJS is only supported up-to 5.4.1

import {containerName, imageName} from '../constants';

export async function isDockerAvailable(): Promise<boolean> {
    const spinner = ora('Checking for Docker Installation...').start();
    const result = await dockerCommand('version', { echo: false }).catch(() => {
        return false;
    });

    if (!result) {
        console.log(`Docker does not seem to be available on this machine.`);
    }

    spinner.stop();
    return result;
}

export async function getLatestImage(): Promise<boolean> {
    const spinner = ora('Pulling docker image...').start();
    spinner.color = 'magenta';
    spinner.text = 'Pulling docker image...';
    const result = await dockerCommand('pull quay.io/ultra.io/3rdparty-devtools:latest', { echo: false }).catch(() => {
        console.log(`Unable to Pull Latest Docker Image from 'quay.io/ultra.io/3rdparty-devtools:latest'`);
        return false;
    });

    spinner.stop();
    return result;
}

export async function stopRelevantContainers(): Promise<boolean> {
    const spinner = ora('Stopping Pre-Existing Containers...').start();

    let result: { containerList: Array<string> } = await dockerCommand(
        `ps -a --no-trunc --filter name=${containerName}`,
        {
            echo: false,
        }
    ).catch((err) => {
        console.log(`Unable to Pull Latest Docker Image from 'quay.io/ultra.io/3rdparty-devtools:latest'`);
        return false;
    });

    if (!result) {
        return false;
    }

    if (result && result.containerList.length >= 1) {
        await dockerCommand(`stop ${containerName}`, {
            echo: false,
        });
        result = await dockerCommand(`rm ${containerName}`, {
            echo: false,
        }).catch((err) => {
            return false;
        });
    }

    spinner.stop();
    return result ? true : false;
}

export async function startContainer(inputPath: string): Promise<boolean> {
    const spinner = ora('Starting Container...').start();
    const result = await dockerCommand(
        `run -d -i -t -v ${inputPath}:/opt/buildable --name ${containerName} ${imageName}`,
        {
            echo: false,
        }
    ).catch((err) => {
        console.error(err);
        return false;
    });

    spinner.stop();
    return result ? true : false;
}
