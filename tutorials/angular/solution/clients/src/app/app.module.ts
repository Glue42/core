import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from './data.service';

import { Glue42Ng } from "@glue42/ng";
import GlueWeb from "@glue42/web";
import { GlueService } from './glue.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    HttpClientModule,
    Glue42Ng.forRoot({ factory: GlueWeb })
  ],
  providers: [DataService, GlueService],
  bootstrap: [AppComponent]
})
export class AppModule { }
