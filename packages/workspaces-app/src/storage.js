"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Storage {
    constructor() {
        this.LAST_SESSION_KEY = "lastSession";
    }
    get(key) {
        return JSON.parse(localStorage.getItem(key));
    }
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
exports.default = new Storage();
//# sourceMappingURL=storage.js.map