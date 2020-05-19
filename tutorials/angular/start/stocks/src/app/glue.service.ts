import { Injectable } from "@angular/core";
import { Subject, Observable } from 'rxjs';
import { Client } from './types';

@Injectable()
export class GlueService {
    private readonly selectedClientSource = new Subject<Client>();
    private readonly priceUpdateSource = new Subject<{ Ask: number, Bid: number }>();

    public onClientSelected(): Observable<Client> {
        return this.selectedClientSource.asObservable();
    }

    public onPriceUpdate(): Observable<{ Ask: number, Bid: number }> {
        return this.priceUpdateSource.asObservable();
    }
}