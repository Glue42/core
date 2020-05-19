import { Component, OnInit } from "@angular/core";
import { DataService } from '../data.service';
import { Stock, GlueStatus } from '../types';
import { GlueService } from '../glue.service';
import { Glue42Web } from "@glue42/web";

@Component({
    templateUrl: './stock-details.component.html'
})
export class StockDetailsComponent implements OnInit {

    public stock: Stock;
    public glueStatus: GlueStatus = "disconnected";
    public clientMessage: string;
    private glueSubscription: Glue42Web.Interop.Subscription;

    constructor(private readonly dataService: DataService, private readonly glueService: GlueService) { }

    public ngOnInit(): void {
        this.stock = this.dataService.selectedStock;
    }

}