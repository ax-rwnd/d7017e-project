import { Injectable } from '@angular/core';

@Injectable()
export class RewardService {
  progress = 0;
  constructor() { }
  UpdateProgress(progress) {
    this.progress += progress;
}
}
