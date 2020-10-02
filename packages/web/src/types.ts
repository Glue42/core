
import { Glue42 } from "@glue42/desktop";

/** Optional context passed to new windows */
export interface StartingContext {
    context: object;
    name: string;
    parent: string; // id of the parent window
}

/** Extra objects available in the global window object when your app is running in Glue42 Enterprise  */
export interface Glue42DesktopWindowContext {
    glue42gd: Glue42.GDObject;
    Glue: (config?: Glue42.Config) => Promise<Glue42.Glue>;
}
