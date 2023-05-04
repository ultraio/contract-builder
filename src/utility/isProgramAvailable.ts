import { execSync } from 'child_process';

export function isProgramAvailable(program: string, expectedResult: string) {
    return execSync(program).toString().toLowerCase().includes(expectedResult.toLocaleLowerCase());
}
