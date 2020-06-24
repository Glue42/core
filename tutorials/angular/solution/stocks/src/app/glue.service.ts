import { Injectable, NgZone } from "@angular/core";
import { Glue42Store } from '@glue42/ng';
import { Glue42Web } from "@glue42/web";
import { GlueStatus, Stock, Client, Channel } from './types';
import { Observable, Subject } from 'rxjs';
import { DataService } from './data.service';

@Injectable()
export class GlueService {

    private readonly selectedClientSource = new Subject<Client>();
    private readonly priceUpdateSource = new Subject<{ Ask: number, Bid: number }>();

    constructor(private readonly glueStore: Glue42Store, private _zone: NgZone, private readonly dataService: DataService) { }

    public get glueStatus(): GlueStatus {
        return this.glueStore.initError ? "unavailable" : "available";
    }

    public onClientSelected(): Observable<Client> {
        return this.selectedClientSource.asObservable();
    }

    public onPriceUpdate(): Observable<{ Ask: number, Bid: number }> {
        return this.priceUpdateSource.asObservable();
    }

    public async openStockDetails(stock: Stock): Promise<void> {
        const openSettings: Glue42Web.Windows.CreateOptions = {
            width: 600,
            height: 600
        };

        openSettings.context = stock;

        await this.glueStore.glue.windows.open(`${stock.BPOD} Details`, "http://localhost:4242/stocks/details/", openSettings);
    }

    public async getMyContext() {
        return await this.glueStore.glue.windows.my().getContext();
    }

    public async subscribeToLivePrices(stock: Stock): Promise<Glue42Web.Interop.Subscription> {

        const stream = this.glueStore.glue.interop.methods().find((method) => method.name === "LivePrices" && method.supportsStreaming);

        if (!stream) {
            return;
        }

        const subscription = await this.glueStore.glue.interop.subscribe(stream);

        subscription.onData((streamData) => {
            const newPrices = streamData.data.stocks;

            const selectedStockPrice = newPrices.find((prices) => prices.RIC === stock.RIC);

            this._zone.run(() => this.priceUpdateSource.next({
                Ask: Number(selectedStockPrice.Ask),
                Bid: Number(selectedStockPrice.Bid)
            }));

        });

        return subscription;
    }

    public subscribeToChannelContext() {
        this.glueStore.glue.channels.subscribe((client) => {
            this._zone.run(() => this.selectedClientSource.next(client));
        });
    }

    public async subscribeToSharedContext() {
        await this.glueStore.glue.contexts.subscribe('SelectedClient', (client) => {
            this._zone.run(() => this.selectedClientSource.next(client));
        });
    }

    public async registerClientSelect() {
        await this.glueStore.glue.interop.register("SelectClient", (args) => {
            this._zone.run(() => this.selectedClientSource.next(args.client));
        });
    }

    public async createPriceStream() {
        const priceStream = await this.glueStore.glue.interop.createStream("LivePrices");
        this.dataService.onStockPrices().subscribe((priceUpdate) => priceStream.push(priceUpdate));
    }

    public getAllChannels(): Promise<Channel[]> {
        return this.glueStore.glue.channels.list();
    }

    public joinChannel(name: string): Promise<void> {
        return this.glueStore.glue.channels.join(name);
    }

    public leaveChannel(): Promise<void> {
        return this.glueStore.glue.channels.leave();
    }
}
