export const getFeedbackErrorMessage = (message: string) => {
    const innerMessageRegex = /Inner message:\s+(.+)/gm;
    const regexResult = innerMessageRegex.exec(message);
    const innerMessage = (regexResult && regexResult[1]) || message;

    return innerMessage;
}