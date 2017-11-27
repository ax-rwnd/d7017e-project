import { Injectable } from '@angular/core';
import {BackendService} from './backend.service';
import {AssignmentService} from './assignment.service';


@Injectable()
export class CourseService {
  courses: Course[];
  teaching: Course[];
  updated = false;
  constructor(private backendService: BackendService, private assignmentService: AssignmentService) {
    this.courses = [];
    this.teaching = [];
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
    const parti = this.courses.find((current) => current.id === courseId);
    const teach = this.teaching.find((current) => current.id === courseId);
    return (parti === undefined) ? teach : parti;
  }
  AddCourse(course) {
    this.courses[this.courses.length] = course;
  }
  GetAllCoursesForUser() {
    const promise = new Promise((resolve, reject) => {
      this.backendService.getMyCourses()
        .then(response => {
          console.log('getCoursesForUser', response);
         // getTeachCourses(response, this.backendService, this);
          updateCourses(response, this.backendService, this, this.assignmentService)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
    return promise;
  }
  GetAllTeachingCourses() {
    const promise = new Promise((resolve, reject) => {
      this.backendService.getMyTeachedCourses()
        .then( response => {
          console.log('getTeacherCourse:', response);
          getTeachCourses(response, this.backendService, this)
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
  UpdateCourse(courseId) {
    // Fetches the course with the given id from backend and replace the current version
    // Returns a promise

    const promise = new Promise((resolve, reject) => {
      updateCourseFeatures(courseId, this.backendService, this)
        .then(resolve)
        .catch(reject);
    });
    return promise;
  }
  GetProgress(courseId) {
    // Returns progress for a course
    const course = this.GetCourse(courseId);
    return  (course.progress.completed / course.progress.total) * 100;
  }
}

function getTeachCourses(response, backendService, courseService) {
  const courses = response.teaching;
  const promiseArray = [];
  console.log('Teachresponse:', response);
  for (let i = 0; i < courses.length; i++) {
    console.log('Course:', courses[i]._id)
    promiseArray.push(backendService.getCourse(courses[i]._id)
      .then(course => {
          const code = course.hasOwnProperty('course_code') ? course['course_code'] : '';
          courseService.teaching.push(newTeachCourse(course['_id'], course['name'], code, course['description'], course['hidden'], course['enabled_features'], course['students'], course['teachers'], course['autojoin'], course['assignments']));
        })
      .catch());
  }
  return Promise.all(promiseArray);
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

function updateCourseFeatures(courseId, backendService, courseService) {
  // Updates the features of the given course
  // Returns a promise

  const index = getCourseIndex(courseId, courseService);
  const currentCourse = courseService.GetCourse(courseId);
  return backendService.getFeaturesCourseMe(courseId)
    .then(featureResponse => {
      const rewards = handleFeatureResponse(featureResponse);
      const progress = newProgress(featureResponse.total_assignments, featureResponse.completed_assignments);
      const course = newCourse(currentCourse.id, currentCourse.name, currentCourse.code,
        currentCourse.course_info, rewards, progress);
      courseService.courses[index] = course;
    })
    .catch( err => {
      const rewards = newRewards(false, false, false, false);
      const progress = newProgress(0, 0);
      const course = newCourse(currentCourse.id, currentCourse.name, currentCourse.code,
        currentCourse.course_info, rewards, progress);
      courseService.courses[index] = course;
    });
}

function getCourseIndex(courseId, courseService) {
  // Returns the index of the given course
  let i;
  for (i = 0; i < courseService.courses.length; i++) {
    if (courseService.courses[i].id === courseId) {
      return i;
    }
  }
  return 0;
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

function newTeachCourse(id, name, code, course_desc, hidden, en_feat, students, teachers, autojoin, assigs) {
  return {
    id: id,
    name: name,
    code: code,
    desc: course_desc,
    hidden: hidden,
    enabled_features: en_feat,
    students: students,
    teachers: teachers,
    autojoin: autojoin,
    assignments: assigs,
  };
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
