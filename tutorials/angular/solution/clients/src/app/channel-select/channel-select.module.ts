import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ChannelSelectComponent } from './channel-select.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [ChannelSelectComponent],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        MatSelectModule
    ],
    exports: [ChannelSelectComponent]
})
export class ChannelSelectModule { }