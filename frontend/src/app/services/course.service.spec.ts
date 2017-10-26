import { TestBed, inject } from '@angular/core/testing';

import { CourseService } from './course.service';

describe('CourseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CourseService]
    });
  });

  it('should be created', inject([CourseService], (service: CourseService) => {
    expect(service).toBeTruthy();
  }));
  it('should return a course object with no gamification elements', inject([CourseService], (service: CourseService) => {
    const result = service.CreateCourse('name', 'code', 'course_info', false, false, false, false);
    const course = {
      name: 'name',
      code: 'code',
      course_info: 'course_info',
      rewards: {
        progress: false,
        score: false,
        badges: false,
        leaderboard: false
      }
    };
    expect(result.name).toBe(course.name);
    expect(result.code).toBe(course.code);
    expect(result.course_info).toBe(course.course_info);
    expect(result.rewards.progress).toBe(course.rewards.progress);
    expect(result.rewards.score).toBe(course.rewards.score);
    expect(result.rewards.leaderboard).toBe(course.rewards.leaderboard);
    expect(result.rewards.badges).toBe(course.rewards.badges);
  }));
});
