const ReplaceMe = '>MISSING_ARGUMENT<';

const ErrorList = {
    NO_ERROR_CODE: `Error code does not exist. ${ReplaceMe}`,
    INVALID_PATH: `Directory/File ${ReplaceMe} does not exist!. Please provide a valid directory.`,
};

const Internal = {
    /**
     * Takes all arguments and tries to apply them to the error message.
     *
     * @param {string} errorMessage
     * @param {...Array<string>} args
     * @return {*}
     */
    formatError(errorMessage: string, ...args: Array<string | number>) {
        for (let i = 0; i < args.length; i++) {
            errorMessage = errorMessage.replace(ReplaceMe, String(args[i]));
        }

        return errorMessage;
    },
};

export const ErrorGenerator = {
    /**
     * Returns a formatted error message.
     *
     * @param {keyof typeof ErrorList} key
     * @param {...Array<string>} args
     * @return {string}
     */
    get(key: keyof typeof ErrorList, ...args: Array<string | number>): string {
        return typeof ErrorList[key] === 'undefined'
            ? Internal.formatError(ErrorList.NO_ERROR_CODE, ...args)
            : Internal.formatError(ErrorList[key], ...args);
    },
};
