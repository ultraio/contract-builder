import glob from 'tiny-glob';
import fs from 'fs';

import { containerName } from '../constants';
import { BuildOpts } from './types';

import * as Utility from '../utility';

export async function getBuildCmd(inputPath: string, opts: BuildOpts): Promise<string> {
    const compilerName = (await Utility.docker.execDockerCommand(containerName, 'eosio-cpp --version'))
        ? 'eosio-cpp'
        : 'cdt-cpp';

    let cppFileList: Array<String> = [];
    let contractFilePath: string | undefined;

    if (opts.contractPath) {
        contractFilePath = opts.contractPath;
    } else {
        const files = await glob(`${inputPath}/*.{cpp,cc}`);
        for (let filePath of files) {
            const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
            if (data.includes('contract')) {
                contractFilePath = Utility.inputPathToDockerPath(filePath);
                continue;
            }

            cppFileList.push(Utility.inputPathToDockerPath(filePath));
        }
    }

    if (typeof contractFilePath === 'undefined') {
        const errorMessage = 'Could not find entry point .cpp or .cc file that contains "eosio::contract"';
        Utility.assert(typeof contractFilePath !== 'undefined', errorMessage);
        throw new Error(errorMessage);
    }

    // eosio-cpp classAImpl.cpp classBImpl.cpp contract.cpp -DNDEBUG=1 -DTEST=false -o /opt/buildable/contract.wasm
    // contract file should be the last in the cpp files list
    // it's a quirk in the way cpp linker works
    cppFileList.push(contractFilePath);

    const wasmFilePath = contractFilePath.substring(0, contractFilePath.lastIndexOf('.')) + '.wasm';

    if (opts.buildVars) {
        return `${compilerName} ${cppFileList.join(' ')} ${opts.buildVars} -o ${wasmFilePath}`;
    }

    return `${compilerName} ${cppFileList.join(' ')} -o ${wasmFilePath}`;
}
