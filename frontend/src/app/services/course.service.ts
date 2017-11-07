import { Injectable } from '@angular/core';


@Injectable()
export class CourseService {
  courses: Course[];
  constructor() {
    this.courses = [];
    /***hardcoded info later gotten from database***/
    let lbEntry1 = {name: 'anonymous', score: 80};
    let lbEntry2 = {name: 'anonymous', score: 76};
    let lbEntry3 = {name: 'you', score: 70};
    let lbEntry4 = {name: 'anonymous', score: 67};
    let lbEntry5 = {name: 'anonymous', score: 65};
    let leaderboard = [lbEntry1, lbEntry2, lbEntry3, lbEntry4, lbEntry5];
    const rewards1 = newRewards(50, 70, ['silver_medal_badge', 'bronze_trophy_badge'], leaderboard);
    const course0 = newCourse('Introduction to programming', 'D0009E', 'Course info', rewards1);
    lbEntry1 = {name: 'anonymous', score: 200};
    lbEntry2 = {name: 'anonymous', score: 190};
    lbEntry3 = {name: 'you', score: 180};
    lbEntry4 = {name: 'anonymous', score: 178};
    lbEntry5 = {name: 'anonymous', score: 165};
    leaderboard = [lbEntry1, lbEntry2, lbEntry3, lbEntry4, lbEntry5];
    const rewards2 = newRewards(90, 180, ['bronze_medal_badge', 'silver_trophy_badge'], leaderboard);
    const course1 = newCourse('Course name 2', 'D0010E', 'Course info', rewards2);
    const rewards3 = newRewards(40, 50, false, false);
    const course2 = newCourse('Course name 3', 'D0011E', 'Course info', rewards3);
    const rewards4 = newRewards(false, false, ['gold_medal_badge', 'gold_trophy_badge', 'computer_badge',
      'bronze_medal_badge', 'silver_trophy_badge', 'bronze_trophy_badge'], false);
    const course3 = newCourse('Course name 4', 'D0012E', 'Course info', rewards4);
    this.courses[0] = course0;
    this.courses[1] = course1;
    this.courses[2] = course2;
    this.courses[3] = course3;
  }
  CreateCourse(name, code, course_info, progress, score, badges, leaderboard) {
    const progValue = progress ? 0 : false;
    const scoreValue = score ? 0 : false;
    const badgesArr = badges ? [] : false;
    const lbArr = leaderboard ? [{name: 'anonymous', score: 20}, {name: 'anonymous', score: 10}, {name: 'you', score: 10},
        {name: 'anonymous', score: 0}, {name: 'anonymous', score: 0}] : false;
    return newCourse(name, code, course_info, newRewards(progValue, scoreValue, badgesArr, lbArr));
  }
  GetCourse(courseCode) {
    for (let i = 0; i < this.courses.length; i++) {
      if (this.courses[i].code === courseCode) {
        return this.courses[i];
      }
    }
  }
  AddCourse(course) {
    this.courses[this.courses.length] = course;
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

interface Course {
  name: string;
  code: string;
  course_info: string;
  rewards: Rewards;
}

interface Rewards {
  progress: any;
  score: any;
  badges: any;
  leaderboard: any;
}