import {Component, OnInit} from '@angular/core';
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
        code: 'D0012E',
        progress: this.progress['D0012E'],
        latestBadge: 'star'
      },
      {
        name: 'Course2',
        code: 'D0010E',
        progress: this.progress['D0010E'],
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
