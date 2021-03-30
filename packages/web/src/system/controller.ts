import { Glue42Core } from "@glue42/core";
import { GlueBridge } from "../communication/bridge";
import { IoC } from "../shared/ioc";
import { LibController } from "../shared/types";
import { operations } from "./protocol";

export class SystemController implements LibController {
    private bridge!: GlueBridge;

    public async start(coreGlue: Glue42Core.GlueCore, ioc: IoC): Promise<void> {
        this.bridge = ioc.bridge;

        await this.setEnvironment();
    }

    public async handleBridgeMessage(): Promise<void> {
        // noop
    }

    private async setEnvironment(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const environment = await this.bridge.send<void, any>("system", operations.getEnvironment, undefined);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const base = await this.bridge.send<void, any>("system", operations.getBase, undefined);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const glue42core = Object.assign({}, (window as any).glue42core, base, { environment });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).glue42core = Object.freeze(glue42core);
    }
}