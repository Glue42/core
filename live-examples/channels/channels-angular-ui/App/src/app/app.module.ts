import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Glue42Ng } from '@glue42/ng';
import GlueWeb from '@glue42/web';
import { GlueService } from './glue.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    Glue42Ng.forRoot({ factory: GlueWeb, config: { channels: true } }),
    BrowserAnimationsModule,
    MatSelectModule
  ],
  providers: [GlueService],
  bootstrap: [AppComponent]
})
export class AppModule { }
