// import GlueWeb, { Glue42Web } from "@glue42/web";

export class Glue42ProviderService {
    // private glueInstance: Glue42Web.API;

    // public async initialize(config: any, factory: any) {
    //     const glueFactory = factory || GlueWeb || (window as any).GlueWeb;

    //     this.glueInstance = await glueFactory(config);
    //     (window as any).glue = this.glueInstance;
    // }

    // public get glue() {
    //     return this.glueInstance;
    // }

    public async initialize(): Promise<void> {
        console.log("0.1.5");
    }
}

