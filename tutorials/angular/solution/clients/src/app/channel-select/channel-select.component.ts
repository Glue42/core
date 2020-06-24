import { Component, Input, ElementRef, Renderer2, Output, EventEmitter } from "@angular/core";
import { MatSelectChange } from '@angular/material/select';
import { Channel } from '../types';

@Component({
    selector: 'channel-select',
    templateUrl: './channel-select.component.html'
})
export class ChannelSelectComponent {

    @Input() public channels: Channel[];
    private currentChannel: Channel;
    public NO_CHANNEL = 'no-channel';
    @Output() private channelLeaveEmitter = new EventEmitter();
    @Output() private channelJoinEmitter = new EventEmitter();

    constructor(
        private readonly elem: ElementRef,
        private readonly renderer: Renderer2
    ) { }

    public async selectChannel(selected: MatSelectChange) {

        if (selected.value === this.NO_CHANNEL && !this.currentChannel) {
            return;
        }

        const foundChannel = this.channels.find((channel) => channel.name === selected.value);

        if (foundChannel && foundChannel.name === this.currentChannel?.name) {
            return;
        }

        let selectedElement = this.elem.nativeElement.querySelectorAll('.mat-select-value')[0];

        this.renderer.removeStyle(selectedElement, 'color');

        if (selected.value === this.NO_CHANNEL) {

            this.channelLeaveEmitter.emit();

            delete this.currentChannel;

            return;
        }

        this.currentChannel = foundChannel;

        this.channelJoinEmitter.emit({ name: this.currentChannel.name });

        this.renderer.setStyle(selectedElement, 'color', this.currentChannel.meta.color);
    }
}