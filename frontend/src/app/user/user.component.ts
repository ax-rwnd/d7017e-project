import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import {FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

import {UserService} from '../services/user.service';
import {CourseService} from '../services/course.service';

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
  sidebarState; // get current state
  modalRef: BsModalRef;
  form: FormGroup;
  defaultForm = {
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    course_info: ['', [Validators.required]],
    progress: [false, []],
    score: [false, []],
    badges: [false, []],
    leaderboard: [false, []],
  };

  constructor(private route: ActivatedRoute, private headService: HeadService, private userService: UserService,
              private modalService: BsModalService, private courseService: CourseService, private fb: FormBuilder) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; }); // subscribe to the state value head provides
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.user = this.userService.userInfo;
    this.statistics = false;
    this.form = this.fb.group(this.defaultForm);
  }
  toggleStatistics() {
    this.statistics = !this.statistics;
  }
  openModal(modal) {
    this.form = this.fb.group(this.defaultForm);
    this.modalRef = this.modalService.show(modal);
  }
  createCourse() {
    const course = this.courseService.CreateCourse(this.form.value.name, this.form.value.code,
      this.form.value.info, this.form.value.progress, this.form.value.score, this.form.value.badges, this.form.value.leaderboard);
    this.courseService.AddCourse(course);
  }

}
