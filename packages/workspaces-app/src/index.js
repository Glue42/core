"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("./manager");
const facade_1 = require("./interop/facade");
const jquery = require("jquery");
const web_1 = require("@glue42/web");
const config = {
    application: "Workspaces",
    appManager: true
};
window.$ = jquery;
web_1.default(config).then((glue) => {
    window.glue = glue;
    return manager_1.default.init(glue.agm.instance.peerId);
}).then(() => {
    return facade_1.default.init(window.glue.agm.instance.peerId);
    // tslint:disable-next-line: no-console
}).catch(console.warn);
//# sourceMappingURL=index.js.map