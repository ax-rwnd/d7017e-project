import { Component, OnInit } from '@angular/core';
import { HeadComponent} from '../head/head.component';
import { StatisticsComponent} from '../statistics/statistics.component';

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

  constructor() { }

  ngOnInit() {
  }

}
