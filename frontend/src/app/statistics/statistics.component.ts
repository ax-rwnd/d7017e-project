import {Component, Injector, OnInit} from '@angular/core';
import {RewardService} from '../services/reward.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  courses: Course[];
  progress: any;

  constructor(private rewardService: RewardService) {
  }

  ngOnInit() {
    this.progress = this.rewardService.progress;
    this.courses = [
      {
        name: 'Course1',
        code: 'D0001E',
        progress: 100,
        latestBadge: 'star'
      },
      {
        name: 'Course2',
        code: 'D0002E',
        progress: 70,
        latestBadge: 'wrench'
      },
      {
        name: 'Course3',
        code: 'D0009E',
        progress: this.progress['D0009E'],
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
