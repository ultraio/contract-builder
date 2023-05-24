import { dockerCommand } from 'docker-cli-js';
import ora from 'ora'; // CommonJS is only supported up-to 5.4.1

const containerName = 'ultra-contract-builder';
const imageName = 'quay.io/ultra.io/3rdparty-devtools';

export async function isDockerAvailable(): Promise<boolean> {
    const result = await dockerCommand('version', { echo: false }).catch(() => {
        return false;
    });

    if (!result) {
        console.log(`Docker does not seem to be available on this machine.`);
    }

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

export async function stopRelevantContainers(): Promise<void> {
    const result: { containerList: Array<string> } = await dockerCommand(
        `ps -a --no-trunc --filter name=${containerName}`,
        {
            echo: false,
        }
    ).catch((err) => {
        console.log(err);
        console.log(`Unable to Pull Latest Docker Image from 'quay.io/ultra.io/3rdparty-devtools:latest'`);
        return false;
    });

    if (result && result.containerList.length >= 1) {
        await dockerCommand(`stop ${containerName}`);

        const newResult = await dockerCommand(`rm ${containerName}`).catch((err) => {
            console.log(err);
            return;
        });

        console.log(newResult);
    }
}

export async function startContainer(inputPath: string): Promise<boolean> {
    const result = await dockerCommand(
        `run -d -i -t -v ${inputPath}:/opt/buildable --name ${containerName} ${imageName}`
    ).catch((err) => {
        console.error(err);
    });

    return true;
}
