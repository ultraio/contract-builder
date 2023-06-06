export function normalizePath(inputPath: string): string {
    return inputPath.replace(/\\/gm, '/');
}

export function inputPathToDockerPath(filePath: string): string {
    filePath = normalizePath(filePath);
    const splitPaths = filePath.split('/');
    return `/opt/buildable/${splitPaths[splitPaths.length - 1]}`;
}
