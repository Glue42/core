export interface Client {
    accountManager: string;
    address: string;
    branchCode: string;
    contactNumbers: string;
    eId: string;
    email: string;
    gId: string;
    id: string;
    name: string;
    pId: string;
    portf: string;
    portfolio: string;
    preferredName: string;
    spn: string;
    notes: string[];
}

export type GlueStatus = "disconnected" | "failed" | "ready";

export interface Channel {
    name: string;
    data?: any;
    meta: {
        color: string;
    };
}