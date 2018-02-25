import { Component, OnInit } from '@angular/core';
import {ChatDataService} from "../chat-data.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public chatDataService: ChatDataService) { }

  ngOnInit() {
  }

}
