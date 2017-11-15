import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {CourseService} from '../services/course.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { AssignmentService } from '../services/assignment.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})
export class CoursesComponent implements OnInit {
  assignmentGroups: AssignmentGroup[];
  assignments: string[];
  exercises: string[];
  sidebarState; // state of sidebar
  progress: any;
  currentCourse: any;
  currentAssignment: any;

  constructor(private courseService: CourseService, private route: ActivatedRoute, private headService: HeadService,
              private assignmentService: AssignmentService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; });
    this.route.params.subscribe( params => {
      this.currentCourse = this.courseService.GetCourse(params['course']);
      if (this.assignmentService.courseAssignments[this.currentCourse.id] !== undefined) {
        this.assignmentGroups = this.assignmentService.courseAssignments[this.currentCourse.id];
      } else {
        this.assignmentGroups = this.assignmentService.courseAssignments['default'];
      }
    });
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    console.log('code', this.currentCourse.code);
    console.log('assignmentGroup', this.assignmentService.courseAssignments[this.currentCourse.id]);
    console.log('all assignmentGroups', this.assignmentService.courseAssignments);
    /*if (this.assignmentService.courseAssignments[this.currentCourse.code] !== undefined) {
      this.assignmentGroups = this.assignmentService.courseAssignments[this.currentCourse.code];
    } else {
      this.assignmentGroups = this.assignmentService.courseAssignments['default'];
    }*/
    // this.currentAssignment = this.assignmentGroups[0].groups[0].assignments[0].name;
  }

  getCourseElement(number) {
    //todo
    //fetch the correct assignment/lab from the course
    if (this.assignmentGroups[0].groups[0].assignments[number-1].available != false){
    this.currentAssignment = this.assignmentGroups[0].groups[0].assignments[number-1].name;
  }}

  getProgress() {
    return (this.progress / this.assignmentService.numberOfAssignments(this.currentCourse.id)) * 100;
  }
}

interface AssignmentGroup {
  name: string;
  collapse: boolean;
  assignments: Assignment[];
  groups: AssignmentGroup[];
}

interface Assignment {
  id: number;
  name: string;
  available: boolean;
}


