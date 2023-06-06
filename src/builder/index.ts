import * as path from 'path';
import * as fs from 'fs';

import { BuildOpts } from './types';
import * as cdt from './cdt';
import * as cmake from './cmake';

import { containerBuildDir, containerName } from '../constants';
import { execDockerCommand } from '../utility/execCommand';

const CMAKE_FILENAME = 'CMakeLists.txt';

export async function build(inputPath: string) {
    let opts: BuildOpts = {};
    let buildCmd: string;
    let getBuildCmd: (inputPath: string, opts: BuildOpts) => Promise<string>;

    const isDir = fs.lstatSync(inputPath).isDirectory();

    if (isDir && fs.existsSync(path.join(inputPath, CMAKE_FILENAME))) {
        getBuildCmd = cmake.getBuildCmd;
    } else {
        if (!isDir) {
            opts.contractPath = path.join(containerBuildDir, path.basename(inputPath));
        }
        getBuildCmd = cdt.getBuildCmd;
    }

    buildCmd = await getBuildCmd(inputPath, opts);
    await execDockerCommand(containerName, buildCmd, true, true);
}
