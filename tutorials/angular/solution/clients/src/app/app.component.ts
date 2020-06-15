import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { Client, GlueStatus, Channel } from './types';
import { GlueService } from './glue.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  public clients: Client[] = [];
  public glueStatus: GlueStatus = "disconnected";
  public channels: Channel[] = [];

  constructor(
    private readonly data: DataService,
    private readonly glueService: GlueService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;

    [this.clients, this.channels] = await Promise.all([
      this.data.getClients(),
      this.glueService.getAllChannels()
    ]);
  }

  public handleClientClick(client: Client): void {
    this.glueService.sendSelectedClient(client).catch(console.log);
  }

  public handleJoinChannel({ name }: { name: string }) {
    this.glueService.joinChannel(name).catch(console.log);
  }

  public handleLeaveChannel() {
    this.glueService.leaveChannel().catch(console.log);
  }
}
