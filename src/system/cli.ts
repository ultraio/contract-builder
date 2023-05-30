import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { Command } from 'commander';
import * as Utility from '../utility';

const program = new Command();

const CPP_FILE_EXTENSIONS = ['.cpp', '.hpp', '.cc', '.h'];

/**
 * Returns a directory from a path if the path is a file.
 *
 * @param {string} inputPath
 * @return {string}
 */
function getOutputPath(inputPath: string): string {
    return fs.lstatSync(inputPath).isDirectory() ? inputPath : path.dirname(inputPath);
}

function validatePath(inputPath) {
    if (fs.lstatSync(inputPath).isDirectory()) {
        return true;
    }

    const fileExtension = path.extname(inputPath);
    console.debug(`ext: ${fileExtension}`);
    return CPP_FILE_EXTENSIONS.indexOf(path.extname(inputPath)) != -1;
}

export async function getInputAndOutput(): Promise<[input: string, output: string]> {
    program.option('-i, --input <inputPath>', 'Specify the input path').parse(process.argv);

    let inputPath, outputPath;

    if (process.argv.length == 3) {
        // drag & drop
        inputPath = process.argv[2];
    } else if (program.getOptionValue('input')) {
        // command line
        inputPath = program.opts().input;
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
    return [inputPath, outputPath];
}
