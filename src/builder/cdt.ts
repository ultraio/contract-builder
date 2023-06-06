import * as path from 'path';

import { containerName, containerBuildDir } from '../constants';
import { BuildOpts } from "./types"

import { execDockerCommand } from "../utility/execCommand";
import { assert } from '../utility/assert';

async function findContractPath() {
  // sorry for this. i know it looks awful
  // \\\ is to prevent interpolation
  const grepCmd = `bash -c '\
    grep -i contract /opt/buildable/* --exclude="*.abi" --exclude="*.wasm" \
    | awk -F: "{print \\\$1}" \
    | uniq'`
  let paths = await execDockerCommand(containerName, grepCmd)
  assert(paths, "Couldn't find a contract file");
  assert(paths.indexOf('\n') == -1, 'Multiple matches. Please drag and drop the correct contract file');
  return paths;
}

export async function getBuildCmd(opts: BuildOpts): Promise<string> {
  const compilerName = (await execDockerCommand(containerName, "eosio-cpp --version")) ? "eosio-cpp" : "cdt-cpp";
  let cppFileList: Array<String> = [];
  let contractFilePath;
  if (opts.contractPath) {
    contractFilePath = opts.contractPath;
  } else {
    contractFilePath = await findContractPath();
    const currentDirectoryFiles = (await execDockerCommand(containerName, 'ls /opt/buildable')).split('\n');
    for (let filename of currentDirectoryFiles) {
      const extension = path.extname(filename);
      const filePath = path.join(containerBuildDir, filename)
      if (filePath != contractFilePath && (extension === '.cpp' || extension === '.cc')) {
        cppFileList.push(filePath)
      }
    }
  }
  // eosio-cpp classAImpl.cpp classBImpl.cpp contract.cpp -o /opt/buildable/contract.wasm
  // contract file should be the last in the cpp files list
  // it's a quirk in the way cpp linker works
  cppFileList.push(contractFilePath)
  const wasmFilePath = contractFilePath.substring(0, contractFilePath.lastIndexOf('.')) + '.wasm';
  return `${compilerName} ${cppFileList.join(' ')} -o ${wasmFilePath}`;
}