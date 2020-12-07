import { Glue42Core } from "@glue42/core";

class PlatformLogger {

    private _logger: Glue42Core.Logger.API | undefined;

    public setLogger(logger: Glue42Core.Logger.API): void {
        this._logger = logger;
    }

    public get(subSystem: string): Glue42Core.Logger.API | undefined {
        if (!this._logger) {
            return;
        }
        return this._logger.subLogger(subSystem);
    }
}

export default new PlatformLogger();