import {Component, Injector, OnInit} from '@angular/core';
import {RewardService} from '../services/reward.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  courses: Course[];

  constructor(private rewardService: RewardService) {
  }

  ngOnInit() {
    this.courses = [
      /*{
        name: 'Course1',
        code: 'D0001E',
        progress: 1.0,
        latestBadge: 'star'
      },
      {
        name: 'Course2',
        code: 'D0002E',
        progress: 0.7,
        latestBadge: 'wrench'
      },*/
      {
        name: 'Course3',
        code: 'D0003E',
        progress: this.rewardService.progress,
        latestBadge: 'flash'
      }
    ];
  }
}

interface Course {
  name: string;
  code: string;
  progress: any;
  latestBadge: string;
}
