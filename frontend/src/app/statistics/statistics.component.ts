import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  courses: Course[];

  constructor() { }

  ngOnInit() {
    this.courses = [
      {
        name: 'Course1',
        code: 'D0001',
        progress: 1.0,
        latestBadge: 'star'
      },
      {
        name: 'Course2',
        code: 'D0001',
        progress: 0.7,
        latestBadge: 'hammer'
      },
      {
        name: 'Course3',
        code: 'D0001',
        progress: 0.4,
        latestBadge: 'coffee'
      }
    ];
  }

}

interface Course {
  name: string;
  code: string;
  progress: number;
  latestBadge: string;
}
