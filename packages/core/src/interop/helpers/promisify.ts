export default function <T>(promise: Promise<any>, successCallback: any, errorCallback: any): Promise<T> {

    if (typeof successCallback !== "function" && typeof errorCallback !== "function") {
        return promise;
    }

    if (typeof successCallback !== "function") {
        successCallback = () => { /* DO NOTHING */ };
    } else if (typeof errorCallback !== "function") {
        errorCallback = () => {  /* DO NOTHING */ };
    }

    return promise.then(successCallback, errorCallback);
}
