import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { BackendService, ObjectID } from '../services/backend.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import {FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

import {UserService} from '../services/user.service';
import {CourseService} from '../services/course.service';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import {AuthService} from '../services/Auth/Auth.service';
import {AssignmentService} from '../services/assignment.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})

export class UserComponent implements OnInit {
  user: any;
  statistics: boolean;
  sidebarState: any;
  courses: any;
  teachCourses: any;
  modalRef: BsModalRef;
  form: FormGroup;
  defaultForm = {
    search: ''
  };
  possibleCourses: any[];
  pending: any;
  invites: any;

  constructor(private http: HttpClient, private route: ActivatedRoute, private headService: HeadService, private userService: UserService,
              private modalService: BsModalService, private backendService: BackendService, private courseService: CourseService,
              private fb: FormBuilder, public auth: AuthService, private assignmentService: AssignmentService) {

    // Subscrive to the header state
    this.headService.stateChange.subscribe(sidebarState => {
      this.sidebarState = sidebarState; });
  }

  ngOnInit() {
    this.teachCourses = this.courseService.teaching;
    this.courses = this.courseService.courses;
    this.sidebarState = this.headService.getCurrentState();
    this.user = this.userService.userInfo;
    this.statistics = false;
    this.form = this.fb.group(this.defaultForm);
    this.possibleCourses = [];
    this.getPending();
    this.getInvites();
  }

  toggleStatistics() {
    this.statistics = !this.statistics;
  }

  isDisabled() {
    return (this.teachCourses.length === 3) && (this.user.access === 'basic');
  }

  disabledButton() {
    const style = {
      'cursor': this.isDisabled() ? 'not-allowed' : 'pointer',
      'color': this.isDisabled() ? 'gray' : '',
    }
    return style;
  }

  cancelRequest(course_id) {
    console.log('request id', course_id);
    this.backendService.declineInvite(course_id, this.userService.userInfo.id)
      .then(success => {
        console.log(success);
        this.backendService.getMyPendingReq()
        .then(response => {
          this.pending = response;
        });
      })
      .catch(err => console.error('Cancel request failed', err));
  }

  openModal(modal) {
    // Opens a modal dialog

    this.form = this.fb.group(this.defaultForm);
    this.possibleCourses = [];
    this.modalRef = this.modalService.show(modal);
    this.backendService.getCourses()
      .then(response => {
        const courses = response['courses'];
        console.log('List of courses:', courses);
        for (let i = 0; i < courses.length; i++) {
          let name = '';
          if (courses[i].course_code) {
            name = courses[i].course_code;
          } else {
            name = courses[i].name;
          }
          const owner = courses[i].owner.username;
          this.possibleCourses[i] = {name: name, id: courses[i]._id, owner: owner};
        }
      })
      .catch(err => console.error('Get courses for search modal failed'));
  }


  searchCourse() {
    // Find a course to join

    this.possibleCourses = [];
    this.backendService.getSearch(this.form.value.search)
      .then((response: any) => {

        // Assign the correct identifier for the course
        for (const course of response.courses as any[]) {
          console.log('course', course);
          if (course.course_code) {
            this.possibleCourses.push({name: course.course_code, id: course._id});
          } else {
            this.possibleCourses.push({name: course.name, id: course._id});
          }
        }
      })
      .catch(err => console.error('getSearch failed', err));
  }

  join(course_id) {
    // Join a course
    this.backendService.postInvitationToCourse(course_id, this.userService.userInfo.id)
      .then(response => {
        console.log(response);
        this.getPending();
      })
      .catch(err => console.error('Join course request failed', err));
  }
  acceptInvite(course_id) {
    this.backendService.acceptInvite(course_id, this.userService.userInfo.id)
      .then(response => {
        console.log(response);
        this.getInvites();
      })
      .catch(err => console.error('Accept course invite failed', err));
  }
  declineInvite(course_id) {
    this.backendService.declineInvite(course_id, this.userService.userInfo.id)
      .then(response => {
        console.log(response);
        this.getInvites();
      })
      .catch(err => console.error('Decline course invite failed', err));
  }
  getPending() {
    this.backendService.getMyPendingReq()
      .then(pending => {
        this.pending = pending;
        console.log('pending', this.pending);
      })
      .catch(err => console.error('Get pending course requests failed', err));
  }
  getInvites() {
    this.backendService.getMyInvites()
      .then(response => {
        this.invites = response;
        console.log('invites', this.invites);
      })
      .catch(err => console.error('getInvites failed', err));
  }

  getMe() {
    // Grab my info

    return this.backendService.getMe().then(resp => {
      console.log(resp);
    }).catch(err => {
      console.error('getMe failed', err);
    });
  }
}
