import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataService } from '../data.service';
import { Stock, GlueStatus } from '../types';
import { GlueService } from '../glue.service';
import { Glue42Web } from "@glue42/web";

@Component({
    templateUrl: './stock-details.component.html'
})
export class StockDetailsComponent implements OnInit, OnDestroy {

    public stock: Stock;
    public glueStatus: GlueStatus = "disconnected";
    public clientMessage: string;
    private glueSubscription: Glue42Web.Interop.Subscription;

    constructor(
        private readonly dataService: DataService,
        private readonly glueService: GlueService
    ) { }

    public async ngOnInit(): Promise<void> {
        this.glueStatus = this.glueService.glueStatus;
        this.stock = this.dataService.selectedStock;

        if (this.glueStatus === "ready") {
            this.stock = await this.glueService.getMyContext();
            this.glueSubscription = await this.glueService.subscribeToLivePrices(this.stock);
            this.glueService.subscribeToSharedContext().catch(console.log);
        }

        this.glueService.onClientSelected()
            .subscribe((client) => {
                this.clientMessage = client.portfolio.includes(this.stock.RIC) ?
                    `${client.name} has this stock in the portfolio` :
                    `${client.name} does NOT have this stock in the portfolio`;
            });

        this.glueService.onPriceUpdate().subscribe((newPrices) => {
            this.stock.Ask = newPrices.Ask;
            this.stock.Bid = newPrices.Bid;
        });
    }

    public ngOnDestroy(): void {
        if (this.glueSubscription) {
            this.glueSubscription.close();
        }
    }

}