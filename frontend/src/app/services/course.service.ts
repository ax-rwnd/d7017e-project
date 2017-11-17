import { Injectable } from '@angular/core';
import {BackendService} from './backend.service';
import {AssignmentService} from './assignment.service';


@Injectable()
export class CourseService {
  courses: Course[];
  updated = false;
  constructor(private backendService: BackendService, private assignmentService: AssignmentService) {
    this.courses = [];
    /***hardcoded info later gotten from database***/
    /*let lbEntry1 = {name: 'anonymous', score: 80};
    let lbEntry2 = {name: 'anonymous', score: 76};
    let lbEntry3 = {name: 'you', score: 70};
    let lbEntry4 = {name: 'anonymous', score: 67};
    let lbEntry5 = {name: 'anonymous', score: 65};
    let leaderboard = [lbEntry1, lbEntry2, lbEntry3, lbEntry4, lbEntry5];
    const rewards1 = newRewards(50, 70, ['silver_medal_badge', 'bronze_trophy_badge'], leaderboard);
    const course0 = newCourse('0', 'Introduction to programming', 'D0009E', '# Information\n' +
      '\n' +
      '## Kursens mål\n' +
      '*Att ge en grundlig introduktion till datorbaserad problemlösning med hjälp av ett modern imperativt programmeringsspråk*\n' +
      '\n' +
      '## Innehåll\n' +
      '\n' +
      '* Introduktion till programutveckling och programutvecklingsmiljöer.\n' +
      '* Variabler och programtillstånd, vägval, iteration.\n' +
      '* Aritmetiska och logiska uttryck, strängar och textbehandling.\n' +
      '* Sammansatta datatyper, parametrisering och funktionsabstraktion.\n' +
      '* Filbegreppet, standardbibliotek och felhantering.\n' +
      '* Referenser kontra värden, dynamiska datastrukturer.\n' +
      '* Introduktion till objektbegreppet.\n' +
      '* Problemlösning, programstruktur och dokumentation.\n' +
      '\n' +
      '## Litteratur\n' +
      'Allen Downey, Jeffrey Elkner, Chris Meyers.\n' +
      '\n' +
      '*How to Think Like a Computer Scientist: Learning with Python*,\n' +
      '\n' +
      'Green Tea Press, 2002.\n' +
      '\n' +
      'ISBN: 0971677506\n' +
      '\n' +
      'Kurslitteraturen finns även anpassad till Java och C++\n' +
      '\n' +
      '(Alternativ kurslitteratur: *Alan Gauld, Learning to program*)', rewards1);
    lbEntry1 = {name: 'anonymous', score: 200};
    lbEntry2 = {name: 'anonymous', score: 190};
    lbEntry3 = {name: 'you', score: 180};
    lbEntry4 = {name: 'anonymous', score: 178};
    lbEntry5 = {name: 'anonymous', score: 165};
    leaderboard = [lbEntry1, lbEntry2, lbEntry3, lbEntry4, lbEntry5];
    const rewards2 = newRewards(90, 180, ['bronze_medal_badge', 'silver_trophy_badge'], leaderboard);
    const course1 = newCourse('1', 'Course name 2', 'D0010E', 'Course info', rewards2);
    const rewards3 = newRewards(40, 50, false, false);
    const course2 = newCourse('2', 'Course name 3', 'D0011E', 'Course info', rewards3);
    const rewards4 = newRewards(false, false, ['gold_medal_badge', 'gold_trophy_badge', 'computer_badge',
      'bronze_medal_badge', 'silver_trophy_badge', 'bronze_trophy_badge'], false);
    const course3 = newCourse('3', 'Course name 4', 'D0012E', 'Course info', rewards4);
    this.courses[0] = course0;
    this.courses[1] = course1;
    this.courses[2] = course2;
    this.courses[3] = course3;*/
  }
  CreateCourse(id, name, code, course_info, progress, score, badges, leaderboard) {
    const progValue = progress ? 0 : false;
    const scoreValue = score ? 0 : false;
    const badgesArr = badges ? [] : false;
    const lbArr = leaderboard ? [{name: 'anonymous', score: 20}, {name: 'anonymous', score: 10}, {name: 'you', score: 10},
        {name: 'anonymous', score: 0}, {name: 'anonymous', score: 0}] : false;
    const progress_assignments = newProgress(0, 0);
    return newCourse(id, name, code, course_info, newRewards(progValue, scoreValue, badgesArr, lbArr), progress_assignments);
  }
  GetCourse(courseId) {
    for (let i = 0; i < this.courses.length; i++) {
      if (this.courses[i].id === courseId) {
        return this.courses[i];
      }
    }
  }
  AddCourse(course) {
    this.courses[this.courses.length] = course;
  }
  GetAllCoursesForUser() {
    const promise = new Promise((resolve, reject) => {
      this.backendService.getMyCourses()
        .then(response => {
          console.log('getCoursesForUser', response);
          updateCourses(response, this.backendService, this, this.assignmentService)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
    return promise;
  }
  UpdateCourseProgress(courseId, progress) {
    // Updates the progress field of the course, not to be confused with reward.progress
    let i;
    for (i = 0; i < this.courses.length; i++) {
      if (this.courses[i].id === courseId) {
        this.courses[i].progress = progress;
      }
    }
  }
  GetProgress(courseId) {
    // Returns progress for a course
    const course = this.GetCourse(courseId);
    return  (course.progress.completed / course.progress.total) * 100;
  }
}

function updateCourses(response, backendService, courseService, assignmentService) {
  // Updates the courses with input from backend, some course service a´nd an assignment service

  const courses = response.courses;
  console.log('response', response);
  const promiseArray = [];

  for (let i = 0; i < courses.length; i++) {
    promiseArray.push(backendService.getFeaturesCourseMe(courses[i]._id)
      .then(featureResponse => {
        const rewards = handleFeatureResponse(featureResponse);
        const progress = newProgress(featureResponse.total_assignments, featureResponse.completed_assignments);
        const course = newCourse(courses[i]._id, courses[i].name, courses[i].course_code, courses[i].description, rewards, progress);
        courseService.AddCourse(course);
      })
      .catch( err => {
        const rewards = newRewards(false, false, false, false);
        const progress = newProgress(0, 0);
        const course = newCourse(courses[i]._id, courses[i].name, courses[i].course_code, courses[i].description, rewards, progress);
        courseService.AddCourse(course);
      }));
    promiseArray.push(backendService.getCourseAssignments(courses[i]._id)
      .then(assignmentsResponse => {
        assignmentService.AddCourseAssignments(courses[i]._id, assignmentsResponse.assignments);
      }));
  }
  return Promise.all(promiseArray);
}

function handleFeatureResponse(response: any) {
  let progress;
  const score = false;
  let badges;
  const leaderboard = false;
  if (response.progress !== undefined) {
    progress = response.progress;
  } else {
    progress = false;
  }
  if (response.badges !== undefined) {
    badges = [];
    console.log(response.badges);
    for (let i = 0; i < response.badges.length; i++) {
      if (response.badges[i] === '59ff02b9d86066321c71afce') {
        badges[badges.length] = 'bronze_medal_badge';
      } else {
        badges[badges.length] = 'silver_medal_badge';
      }
    }
  } else {
    badges = false;
  }
  return newRewards(progress, score, badges, leaderboard);
}

function newCourse(id, name, code, course_info, rewards, progress) {
  return {
    id: id,
    name: name,
    code: code,
    course_info: course_info,
    rewards: rewards,
    progress: progress
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

function newProgress(total, completed) {
  return {
    total: total,
    completed: completed
  };
}

interface Progress {
  total: number;
  completed: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  course_info: string;
  rewards: Rewards;
  progress: any;
}

interface Rewards {
  progress: any;
  score: any;
  badges: any;
  leaderboard: any;
}
