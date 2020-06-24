import { Component, OnInit } from '@angular/core';
import { Stock, GlueStatus, Channel } from '../types';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { GlueService } from '../glue.service';

@Component({
  templateUrl: './stocks.component.html'
})
export class StocksComponent implements OnInit {
  private allStocks: Stock[] = [];
  public stocks: Stock[] = [];
  public glueStatus: GlueStatus = "disconnected";
  public channels: Channel[] = [];

  constructor(
    private readonly data: DataService,
    private readonly router: Router,
    private readonly glueService: GlueService
  ) { }

  public async ngOnInit(): Promise<void> {

    this.glueStatus = this.glueService.glueStatus;

    if (this.glueService.glueStatus === "available") {
      // this.glueService.registerClientSelect().catch(console.log);
      this.glueService.createPriceStream().catch(console.log);
      // this.glueService.subscribeToSharedContext().catch(console.log);
      this.glueService.subscribeToChannelContext();

      this.glueService.onClientSelected()
        .subscribe((client) => {
          if (client.portfolio) {
            this.stocks = this.allStocks.filter((stock) => client.portfolio.includes(stock.RIC));
            return;
          }

          this.stocks = this.allStocks;
        });
    }

    [this.channels, this.allStocks] = await Promise.all([
      this.glueService.getAllChannels(),
      this.data.getStocks()
    ]);

    this.stocks = this.allStocks;

    this.data.onStockPrices()
      .subscribe((update) => {
        this.stocks.forEach((stock) => {
          const matchingStock = update.stocks.find((stockUpdate) => stockUpdate.RIC === stock.RIC);
          stock.Ask = matchingStock.Ask;
          stock.Bid = matchingStock.Bid;
        })
      });
  }

  public handleStockClick(stock: Stock): void {
    if (this.glueService.glueStatus === "available") {
      this.glueService.openStockDetails(stock).catch(console.error);
    } else {
      this.data.selectedStock = stock;
      this.router.navigate(['/details']);
    }
  }

  public handleJoinChannel({ name }: { name: string }) {
    this.glueService.joinChannel(name).catch(console.log);
  }

  public handleLeaveChannel() {
    this.glueService.leaveChannel().catch(console.log);
  }
}
