import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { CourseService } from '../services/course.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { AssignmentService } from '../services/assignment.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BackendService } from '../services/backend.service';


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
  teachCourses: any;
  assignments: string[];
  exercises: string[];
  sidebarState; // state of sidebar
  progress: any;
  currentCourse: any;
  possibleStudents: any[];
  form: FormGroup;
  modalRef: BsModalRef;
  defaultForm = {
    search: ''
  };

  constructor(private courseService: CourseService, private route: ActivatedRoute, private headService: HeadService,
              private fb: FormBuilder, private assignmentService: AssignmentService, private modalService: BsModalService,
              private backendService: BackendService) {

    // Subscribe to the sidebar state
    this.headService.stateChange.subscribe(sidebarState => {
      this.sidebarState = sidebarState; });

    this.route.params.subscribe( (params: any) => {
      // Grab the current course
      this.currentCourse = this.courseService.GetCourse(params.course);

      // Assign groups for assignments
      if (this.assignmentService.courseAssignments[this.currentCourse.id] !== undefined) {
        this.assignmentGroups = this.assignmentService.courseAssignments[this.currentCourse.id];
      } else {
        this.assignmentGroups = this.assignmentService.courseAssignments['default'];
      }

      // Get a list of the users waiting to join the course
      this.backendService.getPendingUsers(this.currentCourse.id)
        .then(response => console.log('pending', response));
    });
  }

  ngOnInit() {
    this.teachCourses = this.courseService.teaching;
    this.sidebarState = this.headService.getCurrentState();
    this.possibleStudents = [];
    this.form = this.fb.group(this.defaultForm);
  }

  getProgress() {
    // Retrieve progress from courseService
    // TODO: deprecated?

    return (this.courseService.GetProgress(this.currentCourse.id));
  }

  openModal(modal) {
    // Open a modal dialog box

    this.modalRef = this.modalService.show(modal);
  }

  invite(student_id) {
    // Invite a student to this course

    this.backendService.postInvitationToCourse(this.currentCourse.id, student_id)
      .then(response => console.error(response));
  }

  search() {
    // Perform a search for students through the backend

    this.possibleStudents = [];
    this.backendService.getSearch(this.form.value.search)
      .then((response: any) => {

        // Populate matches
        for (const user of response.users as any[]) {
          this.possibleStudents.push({name: user.username, id: user._id});
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


