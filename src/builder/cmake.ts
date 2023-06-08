import { BuildOpts } from './types';

export async function getBuildCmd(originalPath: string, opts: BuildOpts): Promise<string> {
    return `cmake ${opts.buildVars ? opts.buildVars : ''} ..`;
}
