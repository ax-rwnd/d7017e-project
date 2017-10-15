import { Injectable } from '@angular/core';

@Injectable()
export class RewardService {
  progress = {
    'D0009E': 0
  };
  assignmentScore = {
    'assignment1': 0
  }
  constructor() { }
  UpdateProgress(inc) {
    this.progress.D0009E += inc;
  }

  HandleResponse(value) {
    if (value[0]['ok']) {
      this.UpdateProgress(10);
      this.assignmentScore.assignment1 = 10;
    }
  }
}
