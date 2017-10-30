import { Component, OnInit } from '@angular/core';
import 'codemirror/mode/go/go';
import {BackendService} from '../services/backend.service';
import {RewardService} from '../services/reward.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {CourseService} from '../services/course.service';


@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})
export class AssignmentComponent implements OnInit {
  assignment: string;
  content: string;
  progress: any;
  assignmentScore: any;
  theme: string;
  language: string;
  status; string;
  sidebarState; // state of sidebar

  constructor(private backendService: BackendService, private rewardService: RewardService, private headService: HeadService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; });
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.assignment = this.backendService.getAssignment();
    this.language = 'python'; // hardcoded, should probably be read from getAssignment form backend?
    this.theme = 'eclipse'; // default theme for now, could be saved on backend
    this.content = '';
    this.status = 'Not Completed'; // hardcoded for now, endpoint to backend needed
    this.progress = this.rewardService.progress;
    this.assignmentScore = this.rewardService.assignmentScore;
  }

  submitCode() {
    this.backendService.SubmitAssignment(this.content)
      .then(value => this.rewardService.HandleResponse(value));
  }

  setTheme(th) {
    this.theme = th;
  }



}
