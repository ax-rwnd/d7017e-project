import { Component, OnInit } from '@angular/core';
import { HeadComponent} from '../head/head.component';
import { StatisticsComponent} from '../statistics/statistics.component';
import { ActivatedRoute } from '@angular/router';

import { User } from './user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})

export class UserComponent implements OnInit {
  user: User = {
    firstName: 'First',
    lastName: 'LastName',
    ltuid: 'test-3'
  };
  statistics: boolean;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.user.ltuid = this.route.snapshot.paramMap.get('user');
    this.statistics = false;
  }
  toggleStatistics() {
    this.statistics = !this.statistics;
  }

}
