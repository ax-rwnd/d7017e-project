import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from './services/head.service';
import { CourseService } from './services/course.service';

class Course {
  id: string;
}

/*const courses: Course[] = [
  { id: 'D0009E'},
  { id: 'D0011E'},
  { id: 'D0012E'},
  { id: 'D0024E'},
  { id: 'D0099E'},
  { id: 'D1337E'}
]*/


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('sidebar', [
      state('inactive', style({display: 'none', transform: 'translateX(-100%)'})),
      state('active', style({display: 'block', transform: 'translateX(0)'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})
export class AppComponent implements OnInit {
  sidebarState;
  courses: any;
  teachCourses: any;

  constructor(private headService: HeadService, private courseService: CourseService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; });
  }

  displayCourseName(name: string): string {
    return (name.length > 20) ? name.substr(0, 19) + '...' : name;
  }

   ngOnInit() {
    this.sidebarState = 'inactive';
    this.courses = this.courseService.courses;
    this.teachCourses = this.courseService.teaching;
  }
}
