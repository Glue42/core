
import manager from "./manager";
import facade from "./interop/facade";
import jquery = require("jquery");
import GlueWeb,{Glue42Web} from "@glue42/web";

declare var window: Window & { glue: Glue42Web.API, $: JQueryStatic };

const config = {
    application: "Workspaces",
    appManager: true
};

window.$ = jquery;

GlueWeb(config).then((glue) => {
    window.glue = glue;
    return manager.init(glue.agm.instance.peerId);
}).then(() => {
    return facade.init(window.glue.agm.instance.peerId);
// tslint:disable-next-line: no-console
}).catch(console.warn);

