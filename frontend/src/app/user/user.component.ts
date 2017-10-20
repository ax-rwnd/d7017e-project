import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';

import {UserService} from '../services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})

export class UserComponent implements OnInit {
  user: any;
  statistics: boolean;
  sidebarState; // get current state

  constructor(private route: ActivatedRoute, private headService: HeadService, private userService: UserService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; }); // subscribe to the state value head provides
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.user = this.userService.userInfo;
    this.statistics = false;
  }
  toggleStatistics() {
    this.statistics = !this.statistics;
  }

}
