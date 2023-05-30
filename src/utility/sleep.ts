export async function sleep(ms: number) {
    return new Promise((resolve: Function) => {
        setTimeout(resolve, ms);
    });
}
