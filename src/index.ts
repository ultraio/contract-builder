import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { Command } from 'commander';
import * as Utility from './utility';

const program = new Command();

const CPP_FILE_EXTENSIONS = ['.cpp', '.hpp', '.cc', '.h'];

function validatePath(inputPath) {
    if (fs.lstatSync(inputPath).isDirectory()) {
        return true;
    }
    const fileExtension = path.extname(inputPath);
    console.debug(`ext: ${fileExtension}`);
    return CPP_FILE_EXTENSIONS.indexOf(path.extname(inputPath)) != -1;
}

function getOutputPath(inputPath) {
    return fs.lstatSync(inputPath).isDirectory() ? inputPath : path.dirname(inputPath);
}

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

    let inputPath, outputPath;

    if (process.argv.length == 3) {
        // drag & drop
        inputPath = process.argv[2];
    } else if (program.getOptionValue('input')) {
        // command line
        inputPath = program.opts().input;
        outputPath = program.getOptionValue('output') ? program.opts().output : '';
    } else {
        // user double-clicked on an executable
        ({ inputPath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'inputPath',
                message: 'Enter directory/file path:',
                validate(answer) {
                    return fs.existsSync(answer) ? true : Utility.ErrorGenerator.get('INVALID_PATH', answer);
                },
            },
        ]));
    }

    inputPath = path.resolve(inputPath);
    if (!validatePath(inputPath)) {
        console.log(`File extension is not a valid C++ extension, supported extensions: ${CPP_FILE_EXTENSIONS}`);
        process.exit(1);
    }

    outputPath = getOutputPath(inputPath);
    console.log(`input ${inputPath}, output: ${outputPath}`);
}

main();
