import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import {CourseService} from '../services/course.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { AssignmentService } from '../services/assignment.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BackendService} from '../services/backend.service';


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
  possibleStudents: any[];
  form: FormGroup;
  modalRef: BsModalRef;
  defaultForm = {
    search: ''
  };

  constructor(private courseService: CourseService, private route: ActivatedRoute, private headService: HeadService,
              private fb: FormBuilder, private assignmentService: AssignmentService, private modalService: BsModalService,
              private backendService: BackendService) {
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
    this.possibleStudents = [{name: 'asdfgh-3', id: '0'}, {name: 'qwerty-2', id: '1'}];
    this.form = this.fb.group(this.defaultForm);
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
    return (this.courseService.GetProgress(this.currentCourse.id));
  }
  openModal(modal) {
    this.modalRef = this.modalService.show(modal);
  }
  invite(id) {
    console.log(id);
  }
  search() {
    console.log(this.form.value.search);
    this.possibleStudents = [];
    this.backendService.getSearch(this.form.value.search)
      .then(response => {
        const users = response['users'];
        for (let i = 0; i < users.length; i++) {
          console.log(users[i]);
          this.possibleStudents[i] = {name: users[i]['username'], id: users[i]['_id']};
        }
      });
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


