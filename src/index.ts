import inquirer from 'inquirer';
import * as Utility from './utility';

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

    const { programStarted } = await inquirer.prompt({
        name: 'programStarted',
        message: 'Hello World! This program will exit after response.',
        type: 'confirm',
    });

    console.log(`Your response was: ${programStarted}`);
}

main();
