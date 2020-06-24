import { Glue42Web } from '@glue42/web';

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

export type GlueStatus = "disconnected" | "unavailable" | "available";

export type Channel = Glue42Web.Channels.ChannelContext;
