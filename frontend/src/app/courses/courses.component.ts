import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {CourseService} from '../services/course.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';

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

  constructor(private courseService: CourseService, private route: ActivatedRoute, private headService: HeadService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; });
    this.route.params.subscribe( params => this.currentCourse = this.courseService.GetCourse(params['course']));
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    const a = [{id: 1, name: 'Assignment 1'}, {id: 2, name: 'Assignment 2'}, {id: 3, name: 'Assignment 3'},
      {id: 4, name: 'Assignment 4'}, {id: 5, name: 'Assignment 5'}];
    const e = [{id: 1, name: 'Exercise 1'}, {id: 2, name: 'Exercise 2'}, {id: 3, name: 'Exercise 3'},
      {id: 4, name: 'Exercise 4'}, {id: 5, name: 'Exercise 5'}];
    const special = {name: 'Special exercises', collapse: true, assignments: e, groups: []};
    const aLvl1 = {name: 'Level 1', collapse: false, assignments: a, groups: []};
    const aLvl2 = {name: 'Level 2', collapse: true, assignments: a, groups: []};
    const aLvl3 = {name: 'Level 3', collapse: true, assignments: a, groups: []};
    const eLvl1 = {name: 'Level 1', collapse: false, assignments: e, groups: []};
    const eLvl2 = {name: 'Level 2', collapse: true, assignments: e, groups: []};
    const eLvl3 = {name: 'Level 3', collapse: true, assignments: e, groups: [special]};
    this.assignmentGroups = [];
    this.assignmentGroups[0] = {name: 'Assignments', collapse: true, assignments: [], groups: [aLvl1, aLvl2, aLvl3]};
    this.assignmentGroups[1] = {name: 'Exercises', collapse: true, assignments: [], groups: [eLvl1, eLvl2, eLvl3]};
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
}
