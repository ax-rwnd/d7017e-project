import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import {NgForm} from '@angular/forms';

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

  constructor(private route: ActivatedRoute, private headService: HeadService, private userService: UserService,
              private modalService: BsModalService, private courseService: CourseService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; }); // subscribe to the state value head provides
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.user = this.userService.userInfo;
    this.statistics = false;
  }
  toggleStatistics() {
    this.statistics = !this.statistics;
  }
  openModal(modal) {
    this.modalRef = this.modalService.show(modal);
  }
  createCourse(form: NgForm) {
    const progress = form.value.progress === '' ? false : form.value.progress;
    const score = form.value.score === '' ? false : form.value.score;
    const badges = form.value.badges === '' ? false : form.value.badges;
    const leaderboard = form.value.leaderboard === '' ? false : form.value.leaderboard;
    this.courseService.CreateCourse(form.value.name, form.value.code, form.value.info, progress, score, badges, leaderboard);
  }

}
