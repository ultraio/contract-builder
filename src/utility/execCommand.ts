import { exec } from 'child_process';
import { dockerCommand } from 'docker-cli-js';

export function execCommand(command: string): Promise<string> {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve('');
                return;
            }
            if (stderr) {
                resolve('');
                return;
            }
            resolve(stdout.trim());
        });
    });
}

export function execDockerCommand(
    container: string,
    cmd: string,
    options: { returnErr?: boolean; echo?: boolean } = {}
): Promise<string> {
    const { returnErr = false, echo = false } = options;
    return new Promise((resolve, reject) => {
        dockerCommand(`exec ${container} ${cmd}`, { echo: echo })
            .then((res) => {
                resolve(res.raw.trim());
            })
            .catch((err) => {
                if (returnErr) {
                    reject(err.stderr);
                } else {
                    resolve('');
                }
            });
    });
}
