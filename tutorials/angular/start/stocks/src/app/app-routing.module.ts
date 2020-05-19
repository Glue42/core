import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockDetailsComponent } from './stock-details/stock-details.component';
import { StocksComponent } from './stocks/stocks.component';

const routes: Routes = [
  { path: "details", component: StockDetailsComponent },
  { path: '', component: StocksComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
