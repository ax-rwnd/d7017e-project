import { Component, OnInit } from '@angular/core';
import 'codemirror/mode/go/go';
import {BackendService} from '../services/backend.service';
import {RewardService} from '../services/reward.service';

import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';

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
  state = 'inactive'; // state of sidebar

  constructor(private backendService: BackendService, private rewardService: RewardService, private headService: HeadService) {
    this.headService.stateChange.subscribe(state => { this.state = state; });
  }

  ngOnInit() {
    this.assignment = 'print(\'Detta är ett program som räknar hur mycket kaffe du dricker.\');\n' +
      'namn = \'Anna andersson\';\n' +
      'print(\'Jag heter \' + namn);\n' +
      'n = 2;\n' +
      'print(\'Jag har druckit \' + str(n) + \' koppar kaffe idag.\');';
    this.content = '';
    this.progress = this.rewardService.progress;
    this.assignmentScore = this.rewardService.assignmentScore;
  }

  submitCode() {
    this.backendService.SubmitAssignment(this.content)
      .then(value => this.rewardService.HandleResponse(value));
  }



}
