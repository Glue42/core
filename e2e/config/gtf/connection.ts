import { Glue42Web } from "../../../packages/web/web.d";
import { Gtf } from "./types";

export class GtfConnection implements Gtf.Connection {
    public async disconnectGlues(gluesToDisconnect: Glue42Web.API[]): Promise<void> {
        await Promise.all(gluesToDisconnect.map((glue) => glue.connection.logout()));
    }
}
