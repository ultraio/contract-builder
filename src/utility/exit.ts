/**
 * Wait to exit the program.
 *
 * @export
 * @param {number} [ms=60000]
 */
export function waitToExit(ms: number = 60000) {
    setTimeout(() => {
        process.exit(1);
    }, ms);
}
