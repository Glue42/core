import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { Client, GlueStatus } from './types';
import { GlueService } from './glue.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public clients: Client[] = [];
  public glueStatus: GlueStatus = "disconnected";

  constructor(
    private readonly data: DataService,
    private readonly glueService: GlueService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;

    this.clients = await this.data.getClients();
  }

  public handleClientClick(client: Client): void {
    this.glueService.sendSelectedClient(client);
  }

  public joinChannel(e) {
    console.log("join", e);
  }

  public leaveChannel(e) {
    console.log("leave", e);
  }
}
