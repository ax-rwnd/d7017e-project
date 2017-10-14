import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';

import { User } from './user';

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
  user: User = {
    firstName: 'First',
    lastName: 'LastName',
    ltuid: 'test-3'
  };
  statistics: boolean;
  state = 'inactive'; // state of sidebar

  constructor(private route: ActivatedRoute, private headService: HeadService) {
    this.headService.stateChange.subscribe(state => { this.state = state; }); // subscribe to the state value head provides
  }

  ngOnInit() {
    this.user.ltuid = this.route.snapshot.paramMap.get('user');
    this.statistics = false;
  }
  toggleStatistics() {
    this.statistics = !this.statistics;
  }

}
