import { Component, OnInit } from '@angular/core';
import {BackendService} from '../services/backend.service';
import {RewardService} from '../services/reward.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {until} from "selenium-webdriver";
import titleContains = until.titleContains;

@Component({
  selector: 'app-createassignment',
  templateUrl: './createassignment.component.html',
  styleUrls: ['./createassignment.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})
export class CreateassignmentComponent implements OnInit {

  constructor(private backendService: BackendService, private rewardService: RewardService, private headService: HeadService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; });
  }
    content: string;
    sidebarState; // state of sidebar
  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.content = '';
  }

  onChange(c) {
    this.content = c;
  }

}
