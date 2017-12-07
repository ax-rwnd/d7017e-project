import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { CourseService } from '../services/course.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { AssignmentService } from '../services/assignment.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { BackendService } from '../services/backend.service';
import { ToastService } from '../services/toast.service';
import {UserService} from '../services/user.service';


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
  assignmentGroups: any[];
  teachCourses: any;
  sidebarState; // state of sidebar
  progress: any;
  currentCourse: any;
  currentCourseSaved: any;
  possibleStudents: any[];
  form: FormGroup;
  modalRef: BsModalRef;
  pendingReqs: any;
  defaultForm = {
    search: ''
  };
  teacherViewBool = false;
  selectedBadge: string;
  badges: Array<Object> = [
    {key: 'bronze_medal_badge', name: 'Bronze medal'},
    {key: 'silver_medal_badge', name: 'Silver medal'},
    {key: 'gold_medal_badge', name: 'Gold medal'},
    {key: 'cake_badge', name: 'Cake'},
    {key: 'computer_badge', name: 'Computer'},
    {key: 'bronze_trophy_badge', name: 'Bronze trophy'},
    {key: 'silver_trophy_badge', name: 'Silver trophy'},
    {key: 'gold_trophy_badge', name: 'Gold trophy'},
    {key: 'badge1', name: 'Smiley'},
    {key: 'badge2', name: 'Silver trophy 2'},
    {key: 'badge3', name: 'Lightning'},
  ];
  selectedAssignments: any[];
  tests: any;
  badgeName: string;
  badgeDescription: string;

  constructor(private courseService: CourseService, private route: ActivatedRoute, private headService: HeadService,
              private fb: FormBuilder, private assignmentService: AssignmentService, private modalService: BsModalService,
              private backendService: BackendService, private toastService: ToastService, private userService: UserService,
              private router: Router) {

    // Subscribe to the sidebar state
    this.headService.stateChange.subscribe(sidebarState => {
      this.sidebarState = sidebarState; });

    this.route.params.subscribe( (params: any) => {
      // Grab the current course
      this.currentCourse = this.courseService.GetCourse(params.course);

      this.currentCourseSaved = this.currentCourse;
      console.log('course', this.currentCourse);
      // Assign groups for assignments

      this.assignmentGroups = this.assignmentService.courseAssignments[this.currentCourse.id]['groups'];
      console.log('Assignmentsgroups:', this.assignmentGroups);
      /*
      if (this.assignmentService.courseAssignments[this.currentCourse.id] !== undefined) {
        this.assignmentGroups = this.assignmentService.courseAssignments[this.currentCourse.id]['groups'];
        console.log('assignments', this.assignmentService.courseAssignments[this.currentCourse.id]);
      } else {
        this.assignmentGroups = this.assignmentService.courseAssignments['default'];
        console.log('assignments', this.assignmentGroups);
      }
      */
    });
  }

  ngOnInit() {
    this.route.params.subscribe( (params: any) => { // so might not need subscribe in constructor
      this.currentCourse = this.courseService.GetCourse(params.course);
    });
    this.teachCourses = this.courseService.teaching;
    this.sidebarState = this.headService.getCurrentState();
    this.possibleStudents = [];
    this.selectedBadge = 'bronze_medal_badge';
    this.form = this.fb.group(this.defaultForm);
    this.tests = {};
  }

  /*
  toggleView() {
    this.teacherViewBool = !this.teacherViewBool;
    if (this.teacherViewBool) {
      this.courseService.GetTeacherStudentViewHelper(this.currentCourse).then(res => {
        console.log(res);
        this.currentCourse = res;
      });
    } else {
      this.currentCourse = this.currentCourseSaved;
    }
  }
  */

  /* Decides if toggle button should be shown. */

  /*
  toggleHelper(): boolean {
    const myCourse = this.userService.userInfo.teaching.find((curr) => curr._id === this.currentCourseSaved.id);
    if (myCourse !== undefined) {
      return true;
    }
    return false;
  }
  */

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


