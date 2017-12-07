import { Injectable } from '@angular/core';
import {BackendService} from './backend.service';
import {AssignmentService} from './assignment.service';
import {assign} from 'rxjs/util/assign';
import { Subject } from 'rxjs/Subject';
import {Course} from '../../course';
import {Reward} from '../../reward';

@Injectable()
export class CourseService {
  courses: Course[];
  teaching: Course[];
  teachCourses = new Subject<Course[]>(); // to subscribe on the teaching array, will only change when create course
  updated = false;
  constructor(private backendService: BackendService, private assignmentService: AssignmentService) {
    this.courses = [];
    this.teaching = [];
  }

  GetCourse(courseId: string): Course {
    // Find a course with some ID from the either courses (student) or teaching array
    // Used for ex get the current course in course component

    const parti = this.courses.find((current) => current.id === courseId);
    const teach = this.teaching.find((current) => current.id === courseId);

    return (parti === undefined) ? teach : parti;
  }

  GetAllCoursesForUser() {
    // Will fetch all courses for user from backend

    const promise = new Promise((resolve, reject) => {
      this.backendService.getMyCourses() // student, array with courses
        .then(response => {
          console.log('getCoursesForUser', response['courses']);
          updateCourses(response, this.backendService, this, this.assignmentService)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
    return promise;
  }

  GetAllTeachingCourses() {
    // Page won't show if this fail, check in Auth map. Fetch all courses that a user is teacher in

    const promise = new Promise((resolve, reject) => {
      this.backendService.getMyTeachedCourses()
        .then( response => {
          console.log('getTeacherCourse:', response['courses']);
          getTeachCourses(response, this.backendService, this, this.assignmentService)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
    return promise;
  }

  addTeacherCourse(course: Object) {
    // Add a teacher to a course

    // Add the course to the local list of courses teached
    // this.teaching.push(newTeachCourse(course));
    const code = course.hasOwnProperty('course_code') ? course['course_code'] : '';
    const rewards = newRewards('', '', '', '');
    const nCourse = newCourse(course['_id'], course['name'], code, course['description'], rewards, '', course['hidden'],
      course['enabled_features'], course['stundents'], course['teachers'], course['autojoin']);
    this.teaching.push(nCourse);

    // Add assignments to the course that have been created
    this.assignmentService.getAssignmentsForCourse(course['_id'])
      .then( done => {
        return this.teachCourses.next(this.teaching);
      })
      .catch(err => { console.log('err in', this.addTeacherCourse.name, err);
      });
  }

  updateTeacherCourse(course_id: string, name: string, info: string, hidden: boolean, code: string, en_feat: Object, autojoin: boolean) {
    // Update some properties of a course

    const course = this.GetCourse(course_id);
    course.name = name;
    course.course_info = info;
    course.hidden = hidden;
    course.code = code;
    course.enabled_features = en_feat;
    course.autojoin = autojoin;
    return this.teachCourses.next(this.teaching);
  }

  removeTeacherCourse(course_id) {
    const course = this.GetCourse(course_id);
    const index = this.teaching.indexOf(course);
    if (index !== -1) {
      this.teaching.splice(index, 1);
    }
    return this.teachCourses.next(this.teaching);
  }

  UpdateCourse(courseId) {
    // Fetches the features from course with the given id from backend and replace the current version
    // Returns a promise

    const promise = new Promise((resolve, reject) => {
      updateCourseFeatures(courseId, this.backendService, this)
        .then(resolve)
        .catch(reject);
    });
    return promise;
  }

  GetTeacherStudentViewHelper(course) {
    // TODO: is this used?

    return getTeacherStudentView(course, this.backendService, this, this.assignmentService).then(res => {
      return res;
    });
  }
}

function getTeachCourses(response: Object, backendService, courseService, assignmentService): Promise<any> {
  // Get all info for each teach course the user has

  const courses = response['courses']; // Array of courses
  const promiseArray = [];
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i].course;
    promiseArray.push(backendService.getCourse(course._id) // Fetch info for each course from database
      .then(info => {
        const code = course.hasOwnProperty('course_code') ? info['course_code'] : '';
        const rewards = newRewards('', '', '', '');
        const nCourse = newCourse(info['_id'], info['name'], code, info['description'], rewards, '', info['hidden'],
          info['enabled_features'], info['stundents'], info['teachers'], info['autojoin']);
        courseService.teaching.push(nCourse);
      })
      .catch());
    promiseArray.push(assignmentService.getAssignmentsForCourse(course._id)); // Set assignments for assignments
    promiseArray.push(assignmentService.getAssignmentGroups(course._id, backendService));
  }
  return Promise.all(promiseArray);
}


function updateCourses(response, backendService, courseService, assignmentService) {
  // Updates the courses with input from backend, some course service a´nd an assignment service

  const courses = response.courses;
  console.log('response', response);
  const promiseArray = [];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i].course;
    promiseArray.push(backendService.getFeaturesCourseMe(course._id)
      .then(featureResponse => {
        const rewards = handleFeatureResponse(featureResponse);
        const progress = newProgress(featureResponse.total_assignments, featureResponse.completed_assignments);
        const nCourse = newCourse(course._id, course.name, course.course_code, course.description, rewards, progress,
          '', '', '', '', ''); // Since not a teacher course
        courseService.courses.push(nCourse);
      })
      .catch( err => { console.log('Error fetching features:', err);
      }));
    promiseArray.push(assignmentService.getAssignmentGroups(course._id, backendService));
    /*
    promiseArray.push(backendService.getAssignmentGroupsCourse(course._id)
      .then(assignmentsResponse => {
        assignmentService.groupHelper(assignmentsResponse, course._id, backendService);
        //assignmentService.AddCourseAssignments(course._id, assignmentsResponse.assignments);
      }));
      */
  }
  return Promise.all(promiseArray);
}

function getTeacherStudentView(course, backendService, courseService, assignmentService) {
  const promise = new Promise((resolve, reject) => {
    backendService.getFeaturesCourseMe(course.id).then(resp => {
      const rewards = handleFeatureResponse(resp);
      const progress = newProgress(resp.total_assignments, resp.completed_assignments);
      const course2 = newCourse(course.id, course.name, course.code, course.desc, rewards, progress,
        '', '', '', '', '');
      resolve(course2);
    });
  });
  return promise;
}

function updateCourseFeatures(courseId, backendService, courseService) {
  // Updates the features of the given course
  // Returns a promise

  const currentCourse = courseService.GetCourse(courseId);
  const index = getCourseIndex(courseId, courseService);
 // TODO: courses.indexOf(currentCourse) === -1, course don't exist

  return backendService.getFeaturesCourseMe(courseId)
    .then(featureResponse => {
      const rewards = handleFeatureResponse(featureResponse);
      const progress = newProgress(featureResponse.total_assignments, featureResponse.completed_assignments);
      const course = newCourse(currentCourse.id, currentCourse.name, currentCourse.code,
        currentCourse.course_info, rewards, progress, '', '', '', '', '');
      courseService.courses[index] = course;
    })
    .catch( err => { console.log('Error getting features:', err);
    });
}

function getCourseIndex(courseId: string, courseService): number {
  // Returns the index of the given course
  // TODO: needs testing

  const index: number = courseService.courses.findIndex((c: any) => c.id === courseId);
  if (index === -1) {
    throw new Error('failed to find the course');
  }
  return index;
}

function handleFeatureResponse(response: any): Reward {
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

function newCourse(id, name, code, course_info, rewards, progress, hidden, en_feat, students, teachers, autojoin): Course {
  return {
    id: id,
    name: name,
    code: code,
    course_info: course_info,
    rewards: rewards,
    progress: progress,
    hidden: hidden,
    enabled_features: en_feat,
    students: students,
    teachers: teachers,
    autojoin: autojoin
  };
}

function newRewards(progress, score, badges, leaderboard): Reward {
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
