import { Injectable } from '@angular/core';
import {BackendService} from './backend.service';
import {AssignmentService} from './assignment.service';
import {assign} from 'rxjs/util/assign';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class CourseService {
  courses: Course[];
  teaching: Course[];
  teachCourses = new Subject<Course[]>();
  updated = false;
  constructor(private backendService: BackendService, private assignmentService: AssignmentService) {
    this.courses = [];
    this.teaching = [];
  }

  CreateCourse(id, name, code, course_info, progress, score, badges, leaderboard) {
    // Create a course and populate it/fill with some defaults

    // Setup values/defaults
    const progValue = progress ? 0 : false;
    const scoreValue = score ? 0 : false;
    const badgesArr = badges ? [] : false;
    const lbArr = leaderboard ? [{name: 'anonymous', score: 20}, {name: 'anonymous', score: 10}, {name: 'you', score: 10},
        {name: 'anonymous', score: 0}, {name: 'anonymous', score: 0}] : false;
    const progress_assignments = newProgress(0, 0);

    // TODO: this should probably be class?
    return newCourse(id, name, code, course_info, newRewards(progValue, scoreValue, badgesArr, lbArr), progress_assignments);
  }

  GetCourse(courseId) {
    // Find a course with some ID

    const parti = this.courses.find((current) => current.id === courseId);
    const teach = this.teaching.find((current) => current.id === courseId);

    return (parti === undefined) ? teach : parti;
  }

  AddCourse(course) {
    this.courses[this.courses.length] = course;
  }

  GetAllCoursesForUser() {
    // Find all courses belonging to a user
    // Basically a passthrough for updateCourses?

    const promise = new Promise((resolve, reject) => {
      this.backendService.getMyCourses()
        .then(response => {

          updateCourses(response, this.backendService, this, this.assignmentService)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });

    return promise;
  }

  GetAllTeachingCourses() {
    // Find all courses that a users teaches

    const promise = new Promise((resolve, reject) => {
      this.backendService.getMyTeachedCourses()
        .then( response => {

          getTeachCourses(response, this.backendService, this, this.assignmentService)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
    return promise;
  }

  addTeacherCourse(course) {
    // Add a teacher to a course

    // Add the course to the local list of courses teached
    this.teaching.push(newTeachCourse(course));

    // Add course to the list of courses in the database
    setAssignmentsForCourse(course._id, this.backendService, this.assignmentService)
      .then( done => {
        return this.teachCourses.next(this.teaching);
      })
      .catch(err => { console.log('err in', this.addTeacherCourse.name, err);
      });
  }

  updateTeacherCourse(id: string, name: string, content: string, hidden: boolean, code: string, en_feat: Object, autojoin: boolean) {
    // Update some properties of a course

    const course = this.GetCourse(id);
    course.name = name;
    course.course_info = content;
    course.hidden = hidden;
    course.code = code;
    course.enabled_features = en_feat;
    course.autojoin = autojoin;

    return this.teachCourses.next(this.teaching);
  }

  UpdateCourseProgress(courseId, progress) {
    // Updates the progress field of the course, not to be confused with reward.progress

    for (let i = 0; i < this.courses.length; i++) {
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

    const course: Course = this.GetCourse(courseId);
    return  (course.progress.completed / course.progress.total) * 100;
  }

  GetTeacherStudentViewHelper(course) {
    // TODO: is this used?

    return getTeacherStudentView(course, this.backendService, this, this.assignmentService).then(res => {
      return res;
    });
  }
}

function getTeachCourses(response, backendService, courseService, assignmentService) {
  // Get the courses that a user is teaching
  // TODO: fixthis

  const courses = response.courses;
  const promiseArray = [];

  for (const c of courses) {
    const cInner = c.course;

    // Grab courses from the backend
    promiseArray.push(backendService.getCourse(cInner._id)
      .then(course => {
          courseService.teaching.push(newTeachCourse(course));
      })
      .catch(err => {
        console.error('failed to push to courseservice in', this.getTeachCourses.name, err);
      }));

    promiseArray.push(setAssignmentsForCourse(cInner._id, backendService, assignmentService));
  }

  return Promise.all(promiseArray);
}

function setAssignmentsForCourse(course_id, backendService, assignmentService): Promise<any> {
  // Add assignments to a course

  return new Promise((resolve, reject) => {
    backendService.getCourseAssignments(course_id)
      .then(assignmentsResponse => {
        assignmentService.AddCourseAssignments(course_id, assignmentsResponse.assignments);
        resolve();
      })
      .catch(reject);
  });
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

function getTeacherStudentView(course, backendService, courseService, assignmentService) {
  const promise = new Promise((resolve, reject) => {
    backendService.getFeaturesCourseMe(course.id).then(resp => {
      const rewards = handleFeatureResponse(resp);
      const progress = newProgress(resp.total_assignments, resp.completed_assignments);
      const course2 = newCourse(course.id, course.name, course.code, course.desc, rewards, progress);
      resolve(course2);
    });
  });
  return promise;
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
  // TODO: why do we need the index again?

  let i;
  for (i = 0; i < courseService.courses.length; i++) {
    if (courseService.courses[i].id === courseId) {
      return i;
    }
  }
  return 0;
}

function handleFeatureResponse(response: any) {
  // TODO: is this used?

  const score = false;
  const leaderboard = false;
  let progress;
  let badges;
  if (response.progress !== undefined) {
    progress = response.progress;
  } else {
    progress = false;
  }
  if (response.badges !== undefined) {
    badges = [];

    // TODO: HARDCODED!
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

// TODO: interfaces are useful because they don't add any overhead, they're removed at compile-time
//   either keep interfaces and use them properly or replace them with classes

function newTeachCourse(course: Object) {
  const code = course.hasOwnProperty('course_code') ? course['course_code'] : '';
  return {
    id: course['_id'],
    name: course['name'],
    code: code,
    course_info: course['description'],
    hidden: course['hidden'],
    enabled_features: course['enabled_features'],
    students: course['students'],
    teachers: course['teachers'],
    autojoin: course['autojoin'],
    rewards: newRewards('', '', '', ''),
    progress: '',
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
  // Additional teacher course info
  hidden: boolean;
  enabled_features: Object;
  students: any[];
  teachers: any[];
  autojoin: boolean;
}

interface Rewards {
  progress: any;
  score: any;
  badges: any;
  leaderboard: any;
}
