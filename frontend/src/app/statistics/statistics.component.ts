import {Component, OnInit} from '@angular/core';
import {CourseService} from '../services/course.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  courses: any;
  constructor(private courseService: CourseService) {
  }

  ngOnInit() {
    this.courses = this.courseService.courses;
  }
}

