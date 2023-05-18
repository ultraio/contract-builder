import fs from 'fs';
import inquirer from 'inquirer';
import * as Utility from './utility';
import { ErrorGenerator } from './utility/errorGenerator';

import { Command } from 'commander';

const program = new Command();

const DEFAULT_OUTPUT_PATH = '~/ultra/contracts/build'

async function main() {
    // Primitive check to see if Docker is installed...
    if (!Utility.isProgramAvailable('docker version', 'Docker Desktop')) {
        console.log(`Docker is unavailable on this machine.`);
        console.log(`Program will exit in 5 seconds...`);
        setTimeout(() => {
            process.exit(1);
        }, 5000);
        return;
    }

    program
        .option('-i, --input <inputPath>', 'Specify the input path')
        .option('-o, --output <outputPath>', 'Specify the output path')
        .parse(process.argv);


    let inputPath = program.opts().input || '';
    const outputPath = program.opts().output || DEFAULT_OUTPUT_PATH;

    if (!inputPath) {
        ({ inputPath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'inputPath',
                message: 'Enter directory/file path:',
                validate(answer) {
                    return fs.existsSync(answer) ? true : ErrorGenerator.get('INVALID_PATH', answer);
                },
            },
        ]));
    }

    console.log(`input ${inputPath}, output: ${outputPath}`);
}

main();
