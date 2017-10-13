import { Injectable } from '@angular/core';

@Injectable()
export class RewardService {
  progress = {
    'current': 0
  };
  constructor() { }
  UpdateProgress(inc) {
    this.progress.current += inc;
  }

  HandleResponse(value) {
    if (value[0]['ok']) {
      this.UpdateProgress(10);
    }
  }
}
