import { exec } from 'child_process';
import { dockerCommand } from 'docker-cli-js';

export function execCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      console.log('gotta', error, stdout, stderr)
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

export function execDockerCommand(container: string, cmd: string, returnErr?: boolean, echo = false): Promise<string> {
  return new Promise((resolve, reject) => {
    dockerCommand(
      `exec ${container} ${cmd}`, { echo: echo }
    ).then((res) => {
      // console.log('gotta ', res)
      resolve(res.raw.trim())
    }).catch((err) => {
      // console.log('gotta err:', err)
      if (returnErr) {
        reject(err.stderr)
      } else {
        resolve('')
      }
    })
  })
}