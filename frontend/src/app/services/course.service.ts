import { Injectable } from '@angular/core';


@Injectable()
export class CourseService {
  courses = [];
  constructor() {
    /***hardcoded info later gotten from database***/
    let lbEntry1 = {name: 'anonymous', score: 80};
    let lbEntry2 = {name: 'anonymous', score: 76};
    let lbEntry3 = {name: 'you', score: 70};
    let lbEntry4 = {name: 'anonymous', score: 67};
    let lbEntry5 = {name: 'anonymous', score: 65};
    let leaderboard = [lbEntry1, lbEntry2, lbEntry3, lbEntry4, lbEntry5];
    const rewards1 = newRewards(50, 70, ['flash', 'wrench'], leaderboard);
    const course0 = newCourse('Introduktion till programmering', 'D0009E', 'Course info', rewards1);
    lbEntry1 = {name: 'anonymous', score: 200};
    lbEntry2 = {name: 'anonymous', score: 190};
    lbEntry3 = {name: 'you', score: 180};
    lbEntry4 = {name: 'anonymous', score: 178};
    lbEntry5 = {name: 'anonymous', score: 165};
    leaderboard = [lbEntry1, lbEntry2, lbEntry3, lbEntry4, lbEntry5];
    const rewards2 = newRewards(90, 180, ['flash', 'star'], leaderboard);
    const course1 = newCourse('Course name 2', 'D0010E', 'Course info', rewards2);
    const rewards3 = newRewards(40, 50, false, false);
    const course2 = newCourse('Course name 3', 'D0011E', 'Course info', rewards3);
    const rewards4 = newRewards(false, false, ['flash', 'star', 'wrench'], false);
    const course3 = newCourse('Course name 4', 'D0012E', 'Course info', rewards4);
    this.courses[0] = course0;
    this.courses[1] = course1;
    this.courses[2] = course2;
    this.courses[3] = course3;
  }
  GetCourse(courseCode) {
    for (let i = 0; i < this.courses.length; i++) {
      if (this.courses[i].code === courseCode) {
        return this.courses[i];
      }
    }
  }
}

function newCourse(name, code, course_info, rewards) {
  return {
    name: name,
    code: code,
    course_info: course_info,
    rewards: rewards
  };
}

function newRewards(progress, score, badges, leaderboard) {
  return {
    progress: progress,
    score: score,
    badges: badges,
    leaderboard: leaderboard
  };
}
