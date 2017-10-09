import { Component, OnInit } from '@angular/core';
import 'codemirror/mode/go/go';
import {BackendService} from '../services/backend.service';
import {RewardService} from '../services/reward.service';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css']
})
export class AssignmentComponent implements OnInit {
  assignment: string;
  content: string;
  progress: any;

  constructor(private backendService: BackendService, private rewardService: RewardService) { }

  ngOnInit() {
    this.assignment = 'print(\'Detta är ett program som räknar hur mycket kaffe du dricker.\')\n' +
      'namn = \'Anna andersson\'\n' +
      'print(\'Jag heter\' + namn)\n' +
      'n = 2\n' +
      'print(\'Jag har druckit \' + str(n) + \'\' koppar kaffe idag.\')';
    this.content = '';
    this.progress = this.rewardService.progress;
  }

  submitCode() {
    if (this.backendService.SubmitAssignment()) {
      this.rewardService.UpdateProgress(10);
    }
  }

}
