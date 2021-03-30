/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { BridgeOperation, InternalPlatformConfig, LibController, SystemOperationTypes } from "../common/types";
import { anyDecoder, systemOperationTypesDecoder } from "../shared/decoders";
import logger from "../shared/logger";

export class SystemController implements LibController {

    private environment: any;
    private base: any = {};
    private started = false;

    private operations: { [key in SystemOperationTypes]: BridgeOperation } = {
        getEnvironment: { name: "getEnvironment", resultDecoder: anyDecoder, execute: this.handleGetEnvironment.bind(this) },
        getBase: { name: "getBase", resultDecoder: anyDecoder, execute: this.handleGetBase.bind(this) }
    }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("applications.controller");
    }

    public async start(config: InternalPlatformConfig): Promise<void> {
        this.environment = config.environment;
        this.base = {
            workspacesFrameCache: typeof config.workspaces?.frameCache === "boolean" ? config.workspaces?.frameCache : true
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async handleControl(args: any): Promise<any> {
        if (!this.started) {
            new Error("Cannot handle this system control message, because the controller has not been started");
        }

        const applicationData = args.data;

        const commandId = args.commandId;

        const operationValidation = systemOperationTypesDecoder.run(args.operation);

        if (!operationValidation.ok) {
            throw new Error(`This system request cannot be completed, because the operation name did not pass validation: ${JSON.stringify(operationValidation.error)}`);
        }

        const operationName: SystemOperationTypes = operationValidation.result;

        const incomingValidation = this.operations[operationName].dataDecoder?.run(applicationData);

        if (incomingValidation && !incomingValidation.ok) {
            throw new Error(`System request for ${operationName} rejected, because the provided arguments did not pass the validation: ${JSON.stringify(incomingValidation.error)}`);
        }

        this.logger?.debug(`[${commandId}] ${operationName} command is valid with data: ${JSON.stringify(applicationData)}`);

        const result = await this.operations[operationName].execute(applicationData, commandId);

        const resultValidation = this.operations[operationName].resultDecoder?.run(result);

        if (resultValidation && !resultValidation.ok) {
            throw new Error(`System request for ${operationName} could not be completed, because the operation result did not pass the validation: ${JSON.stringify(resultValidation.error)}`);
        }

        this.logger?.trace(`[${commandId}] ${operationName} command was executed successfully`);

        return result;
    }

    private async handleGetEnvironment(): Promise<any> {
        return this.environment;
    }

    private async handleGetBase(): Promise<any> {
        return this.base;
    }
}