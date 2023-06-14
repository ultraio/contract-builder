import * as path from 'path';
import * as fs from 'fs';

import { BuildOpts } from './types';
import * as cdt from './cdt';
import * as cmake from './cmake';

import { containerBuildDir, containerName } from '../constants';
import { execDockerCommand } from '../utility/execCommand';

const CMAKE_FILENAME = 'CMakeLists.txt';

export async function buildContract(
    inputPath: string,
    options: { buildOpts?: string; appendLine?: (value: string) => void } = {}
) {
    let opts: BuildOpts = {};
    let buildCmd: string;
    let getBuildCmd: (inputPath: string, opts: BuildOpts) => Promise<string>;

    const isDir = fs.lstatSync(inputPath).isDirectory();
    const isCmake = isDir && fs.existsSync(path.join(inputPath, CMAKE_FILENAME));

    opts.buildVars = options.buildOpts ? options.buildOpts : '';

    if (isCmake) {
        getBuildCmd = cmake.getBuildCmd;
        await execDockerCommand(containerName, `mkdir -p /opt/buildable/build`);
    } else {
        if (!isDir) {
            opts.contractPath = path.join(containerBuildDir, path.basename(inputPath));
        }
        getBuildCmd = cdt.getBuildCmd;
    }

    buildCmd = await getBuildCmd(inputPath, opts);

    let response = await execDockerCommand(containerName, buildCmd, {
        returnErr: true,
        echo: true,
        workdir: isCmake ? '/opt/buildable/build' : undefined,
    });

    if (options.appendLine) {
        options.appendLine(response);
    }

    if (isCmake) {
        response = await execDockerCommand(containerName, 'make -j', {
            returnErr: true,
            echo: true,
            workdir: isCmake ? '/opt/buildable/build' : undefined,
        });
    }

    if (options.appendLine) {
        options.appendLine(response);
    }
}
