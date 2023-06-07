import { BuildOpts } from './types';

export async function getBuildCmd(originalPath: string, opts: BuildOpts): Promise<string> {
    return `mkdir -p /opt/buildable/build && cd /opt/buildable/build && cmake ${opts.buildVars} .. && make -j`;
}
