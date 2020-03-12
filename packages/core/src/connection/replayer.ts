import { Glue42Core } from "../../glue";

export class MessageReplayerImpl implements Glue42Core.Connection.MessageReplayer {
    private specs: { [name: string]: Glue42Core.Connection.MessageReplaySpec };
    private specsNames: string[] = [];
    private messages: { [type: string]: object[] } = {};
    private isDone: boolean | undefined;
    private subs: { [type: string]: any } = {};
    private subsRefCount: { [type: string]: number } = {};
    private connection: Glue42Core.Connection.API | undefined;

    constructor(specs: Glue42Core.Connection.MessageReplaySpec[]) {
        this.specs = {};
        for (const spec of specs) {
            this.specs[spec.name] = spec;
            this.specsNames.push(spec.name);
        }
    }

    public init(connection: Glue42Core.Connection.API) {
        this.connection = connection;
        for (const name of this.specsNames) {
            for (const type of this.specs[name].types) {
                let refCount = this.subsRefCount[type];
                if (!refCount) {
                    refCount = 0;
                }
                refCount += 1;
                this.subsRefCount[type] = refCount;
                if (refCount > 1) {
                    continue;
                }

                const sub = connection.on<object>(
                    type,
                    (msg) => this.processMessage(type, msg));

                this.subs[type] = sub;
            }
        }
    }

    public processMessage(type: string, msg: object) {
        if (this.isDone || !msg) {
            return;
        }

        for (const name of this.specsNames) {
            if (this.specs[name].types.indexOf(type) !== -1) {
                const messages = this.messages[name] || [];
                this.messages[name] = messages;
                messages.push(msg);
            }
        }
    }

    public drain(name: string, callback?: (msg: object) => void) {
        if (callback) {
            (this.messages[name] || []).forEach(callback);
        }

        delete this.messages[name];

        for (const type of this.specs[name].types) {
            this.subsRefCount[type] -= 1;
            if (this.subsRefCount[type] <= 0) {
                this.connection?.off(this.subs[type]);
                delete this.subs[type];
                delete this.subsRefCount[type];
            }
        }

        delete this.specs[name];

        if (!this.specs.length) {
            this.isDone = true;
        }
    }
}
