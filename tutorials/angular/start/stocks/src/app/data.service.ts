import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Stock, FullPriceUpdate } from './types';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class DataService {

    private stockPricesSource = new Subject<FullPriceUpdate>();
    public selectedStock: Stock;

    constructor(private readonly http: HttpClient) {
        this.startGeneratingStockPrices();
    }

    public getStocks(): Promise<Stock[]> {
        return this.http.get<Stock[]>('http://localhost:8080/api/portfolio').toPromise();
    }

    public onStockPrices(): Observable<FullPriceUpdate> {
        return this.stockPricesSource.asObservable();
    }

    private handleStockPricesUpdate(update: FullPriceUpdate) {
        this.stockPricesSource.next(update);
    }

    private startGeneratingStockPrices() {
        setInterval(() => {
            const priceUpdate = {
                stocks: [
                    {
                        RIC: 'VOD.L',
                        Bid: Number((70 - Math.random() * 10).toFixed(2)),
                        Ask: Number((70 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'TSCO.L',
                        Bid: Number((90 - Math.random() * 10).toFixed(2)),
                        Ask: Number((90 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'BARC.L',
                        Bid: Number((105 - Math.random() * 10).toFixed(2)),
                        Ask: Number((105 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'BMWG.DE',
                        Bid: Number((29 - Math.random() * 10).toFixed(2)),
                        Ask: Number((29 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'AAL.L',
                        Bid: Number((46 - Math.random() * 10).toFixed(2)),
                        Ask: Number((46 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'IBM.N',
                        Bid: Number((70 - Math.random() * 10).toFixed(2)),
                        Ask: Number((70 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'AAPL.OQ',
                        Bid: Number((90 - Math.random() * 10).toFixed(2)),
                        Ask: Number((90 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'BA.N',
                        Bid: Number((105 - Math.random() * 10).toFixed(2)),
                        Ask: Number((105 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'TSLA:OQ',
                        Bid: Number((29 - Math.random() * 10).toFixed(2)),
                        Ask: Number((29 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'ENBD.DU',
                        Bid: Number((46 - Math.random() * 10).toFixed(2)),
                        Ask: Number((46 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'AMZN.OQ',
                        Bid: Number((29 - Math.random() * 10).toFixed(2)),
                        Ask: Number((29 + Math.random() * 10).toFixed(2))
                    },
                    {
                        RIC: 'MSFT:OQ',
                        Bid: Number((46 - Math.random() * 10).toFixed(2)),
                        Ask: Number((46 + Math.random() * 10).toFixed(2))
                    }
                ]
            };

            this.handleStockPricesUpdate(priceUpdate);
        }, 1500);
    }
}