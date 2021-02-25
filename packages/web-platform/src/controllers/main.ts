import { Glue42Web } from "@glue42/web";
import { CoreClientData, InternalPlatformConfig, LibController, LibDomains } from "../common/types";
import { libDomainDecoder } from "../shared/decoders";
import { GlueController } from "./glue";
import { WindowsController } from "../libs/windows/controller";
import { PortsBridge } from "../connection/portsBridge";
import { ApplicationsController } from "../libs/applications/controller";
import { StateController } from "./state";
import logger from "../shared/logger";
import { generate } from "shortid";
import { LayoutsController } from "../libs/layouts/controller";
import { WorkspacesController } from "../libs/workspaces/controller";
import { IntentsController } from "../libs/intents/controller";
import { ChannelsController } from "../libs/channels/controller";
import { Glue42WebPlatform } from "../../platform";

export class PlatformController {

    private readonly controllers: { [key in LibDomains]: LibController } = {
        windows: this.windowsController,
        appManager: this.applicationsController,
        layouts: this.layoutsController,
        workspaces: this.workspacesController,
        intents: this.intentsController,
        channels: this.channelsController
    }

    constructor(
        private readonly glueController: GlueController,
        private readonly windowsController: WindowsController,
        private readonly applicationsController: ApplicationsController,
        private readonly layoutsController: LayoutsController,
        private readonly workspacesController: WorkspacesController,
        private readonly intentsController: IntentsController,
        private readonly channelsController: ChannelsController,
        private readonly portsBridge: PortsBridge,
        private readonly stateController: StateController
    ) { }

    private get logger(): Glue42Web.Logger.API | undefined {
        return logger.get("main.web.platform");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async start(config: InternalPlatformConfig): Promise<void> {
        await this.portsBridge.start(config.gateway);

        this.portsBridge.onClientUnloaded(this.handleClientUnloaded.bind(this));

        await this.glueController.start(config);

        await Promise.all([
            this.glueController.createPlatformSystemMethod(this.handleControlMessage.bind(this)),
            this.glueController.createPlatformSystemStream()
        ]);

        this.stateController.start();

        await Promise.all(Object.values(this.controllers).map((controller) => controller.start(config)));

        await this.glueController.initClientGlue(config?.glue, config?.glueFactory, config?.workspaces?.isFrame);

        config.plugins?.definitions.forEach(this.startPlugin.bind(this));
    }

    public getClientGlue(): Glue42Web.API {
        return this.glueController.clientGlue;
    }

    private startPlugin(definition: Glue42WebPlatform.Plugins.PluginDefinition): void {
        try {
            definition.start(this.glueController.clientGlue, definition.config);
        } catch (error) {
            this.logger?.warn(`Plugin: ${definition.name} threw while initiating: ${JSON.stringify(error.message)}`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handleControlMessage(args: any, caller: Glue42Web.Interop.Instance, success: (args?: unknown) => void, error: (error?: string | object) => void): void {
        const decodeResult = libDomainDecoder.run(args.domain);

        if (!decodeResult.ok) {
            const errString = JSON.stringify(decodeResult.error);

            this.logger?.trace(`rejecting execution of a command, because of a domain validation error: ${errString}`);

            return error(`Cannot execute this platform control, because of domain validation error: ${errString}`);
        }

        const domain = decodeResult.result;

        args.commandId = generate();

        this.logger?.trace(`[${args.commandId}] received a command for a valid domain: ${domain} from window ${caller.windowId} and interop id ${caller.instance}, forwarding to the appropriate controller`);

        this.controllers[domain]
            .handleControl(args)
            .then((result) => {
                success(result);
                this.logger?.trace(`[${args.commandId}] this command was executed successfully, sending the result to the caller.`);
            })
            .catch((err) => {
                const stringError = typeof err === "string" ? err : JSON.stringify(err.message);
                this.logger?.trace(`[${args.commandId}] this command's execution was rejected, reason: ${stringError}`);
                error(`The platform rejected operation ${args.operation} for domain: ${domain} with reason: ${stringError}`);
            });
    }

    private handleClientUnloaded(client: CoreClientData): void {
        this.logger?.trace(`detected unloading of client: ${client.windowId}, notifying all controllers`);

        Object.values(this.controllers).forEach((controller, idx) => {
            try {
                controller.handleClientUnloaded?.(client.windowId, client.win);
            } catch (error) {
                const controllerName = Object.keys(this.controllers)[idx];
                this.logger?.error(`${controllerName} controller threw when handling unloaded client ${client.windowId} with error message: ${JSON.stringify(error.message)}`);
            }
        });
    }
}
