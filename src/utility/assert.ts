export function assert(condition, msg?: string) {
    if (!condition) {
        throw new Error(msg);
    }
}
