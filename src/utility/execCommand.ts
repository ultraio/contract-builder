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
    options: { returnErr?: boolean; echo?: boolean; workdir?: string } = {}
): Promise<string> {
    const { returnErr = false, echo = false, workdir = undefined } = options;
    return new Promise((resolve, reject) => {
        const execCmd = workdir ? `exec --workdir ${workdir}` : `exec`;
        const command = `${execCmd} ${container} ${cmd}`;

        console.log(command);
        dockerCommand(command, { echo: echo })
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
