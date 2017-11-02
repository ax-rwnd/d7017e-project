import { Injectable } from '@angular/core';

@Injectable()
export class RewardService {
  progress = {
    D0012E: 100,
    D0010E: 70,
    D0009E: 0
  };
  assignmentScore = {
    'assignment1': 0
  };
  feedback = [];

  constructor() { }
  UpdateProgress(inc) {
    this.progress.D0009E += inc;
  }

  HandleResponse(value) {
    this.feedback = [];
    const results = value['results'];

    let passTests = true;
    // Check the IO tests
    for (let i = 0; i < results['io'].length; i++) { // How do we handle hidden tests? Do i know if a hidden test failed?
      const test = results['io'][i];
      const testindex = i + 1;
      if (!test['ok']) {
        this.feedback.push('Test ' + testindex + ' failure: ' + test['stderr']);
        passTests = false;
      } else {
        this.feedback.push('Test ' + testindex + ' ok');
      }
    }
    if (passTests) {
      this.feedback.push('All I/O tests passed');
    }

    // Check lint test
    if (results['lint'] !== '') {
      this.feedback.push(results['lint']);
      passTests = false;
    }

    // Check prepare/compile step
    if (results['prepare'] !== '') {
      this.feedback.push(results['prepare']);
      passTests = false;
    }

    if (passTests) {
      this.UpdateProgress(10);
      this.assignmentScore.assignment1 = 10;
    }
    return this.feedback;
  }
}
