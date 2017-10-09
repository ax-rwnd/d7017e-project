import { TestBed, inject } from '@angular/core/testing';

import { RewardService } from './reward.service';

describe('RewardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RewardService]
    });
  });

  it('should be created', inject([RewardService], (service: RewardService) => {
    expect(service).toBeTruthy();
  }));
});
