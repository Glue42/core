export interface Stock {
    Ask: number;
    Bid: number;
    BPOD: string;
    Bloomberg: string;
    Description: string;
    Exchange: string;
    RIC: string;
    Venues: string;
}

export interface StockPriceUpdate {
    RIC: string;
    Bid: number;
    Ask: number;
}

export interface FullPriceUpdate {
    stocks: StockPriceUpdate[];
}

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