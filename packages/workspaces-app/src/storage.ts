class Storage {
    public readonly LAST_SESSION_KEY = "lastSession";

    public get(key: string) {
        return JSON.parse(localStorage.getItem(key));
    }

    public set(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export default new Storage();
