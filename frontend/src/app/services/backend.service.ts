import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export class ObjectID {
  // Defines a controlled type for mongoose object ids
  // Usage: new ObjectID('59f84c545747361ba848b38'
  // getSample(ObjectID: sample) {
  //  this.sampleBackendEndpoint(sample.get());
  // }

  constructor(private input: string) {
    const re = new RegExp(/[0-9A-Fa-f]{24}/g);
    if (!re.test(input)) {
      throw new TypeError('Object ' + input + ' is not a valid mongoose ObjectID');
    }
  }

  get(): string {
    // Retrieves the primitive string

    return this.input;
  }
}

@Injectable()
export class BackendService {
  // Defines the endpoints for backend integration

  // USAGE
  // `
  // this.backendService.getMyCourses().then(data => {
  //   this.leaderList = data;
  //  });
  // `

  constructor(private http: HttpClient) { }

  private apiGet(endpoint: string) {
    // Send a get request to the endpoint

    return this.http.get(environment.backend_ip + endpoint)
      .toPromise()
      .then(response => response)
      .catch(err => console.error('API Get failed in ' + endpoint + ' error', err));
  }

  private apiPost(endpoint, body) {
    // Send a post request to the endpoint

    return this.http.post(environment.backend_ip + endpoint, body, {responseType: 'json'})
      .toPromise()
      .then(response => response)
      .catch(err => console.error('API Post failed in ' + endpoint + ' error ', err));
  }

  private apiPut(endpoint, body) {
    // Send a put request to the endpoint

    return this.http.put(environment.backend_ip + endpoint, body, {responseType: 'json'})
      .toPromise()
      .then(response => response)
      .catch(err => console.error('API Put failed in ' + endpoint + ' error ', err));
  }

  private apiDelete(endpoint) {
    // Send a put request to the endpoint

    return this.http.delete(environment.backend_ip + endpoint)
      .toPromise()
      .then(response => response)
      .catch(err => console.error('API Delete failed in ' + endpoint + ' error ', err));
  }

  addUserToCourse(course_id: ObjectID, student_id: ObjectID) {
  // Add a student to a course.

    const body = {student_id: student_id.get()};
    return this.apiPut('/api/courses/' + course_id.get() + '/students', body);
  }

  getMe() {
    // Get information for the currently logged in user

    return this.apiGet('/api/users/me');
  }

  getUser(id: ObjectID) {
    // Get info for the user with some ID

    return this.apiGet('/api/users/' + id.get());
  }

  getCourses() {
    // Get all courses for display on frontend
    // TODO: this route is completely untested

    return this.apiGet('/api/courses');
  }

  getMyCourses() {
    // Get courses that the logged in user is participating in as a 'student'

    return this.apiGet('/api/users/me/courses');
  }

  getMyTeachedCourses() {
    // Get courses that the current user has write permissions for, i.e. as a 'teacher'

    return this.apiGet('/api/users/me/teaching');
  }

  getUserCourses(id: string) {
    // Get courses for some user

    return this.apiGet('/api/users/' + id + '/courses');
  }

  getCourse(id: string) {
    // Get details for a specific course

    return this.apiGet('/api/courses/' + id);
  }

  getCourseUsers(id: string) {
    // Get users studying a course

    return this.apiGet('/api/courses/' + id + '/students');
  }

  submitAssignment(user_id: ObjectID, course_id: ObjectID, assignment_id: ObjectID, lang: string, code: string) {
    // Submits code for testing

    const body = {'lang': lang, 'code': code};
    return this.apiPost('/api/courses/' + course_id.get() + '/assignments/' + assignment_id.get() + '/submit', body);
  }

  postDraft(course_id: ObjectID, assignment_id: ObjectID, code: string, lang: string) {
    // Saves a draft of the editors content on backend

    const body = {'code': code, 'lang': lang};
    return this.apiPost('/api/courses/' + course_id.get() + '/assignments/' + assignment_id.get() + '/save', body);
  }

  getDraft(course_id: ObjectID, assignment_id: ObjectID) {
    // Gets a draft of the editors content from backend

    return this.apiGet('/api/courses/' + course_id.get() + '/assignments/' + assignment_id.get() + '/draft');
  }

  createAssignment(course_id: any, assignmentName: string, description: string, languages: string[]) {
    // Creates an assignment
    // Get an assignment with name desc., langs.
    // course_id
    // lang
    const body = {'name': assignmentName, 'description': description, 'languages': ['python3'], 'hidden': 'false'};
    return this.apiPost('/api/courses/' + course_id + '/assignments/', body);
  }
  // add tests to assignment
  createTest(course_id: any, test: string[], assignment_id: any) {
    // check if io test, create io test
    if (test[0] === 'io') {
      const stdin = test[1];
      const stdout = test[2];
      const body = {'stdout': stdout, 'stdin': stdin, 'args': []};
      return this.apiPost('/api/courses/' + course_id + '/assignments/' + assignment_id + '/tests', body);
    }
    // other tests
    if (test[0] === 'lint') {
      const body = {'stdout': '', 'stdin': '', 'args': [], 'lint': true};
      return this.apiPost('/api/courses/' + course_id + '/assignments/' + assignment_id + '/tests', body);
    }
  }

  getAssignment(course_id: string, assignment_id: string) {
    return this.apiGet('/api/courses/' + course_id + '/assignments/' + assignment_id);
  }
  getCourseAssignments(course_id: string) {
    return this.apiGet('/api/courses/' + course_id + '/assignments');
  }

  getCourseAssignmentTests(course_id: ObjectID, assignment_id: ObjectID) {
    // Get all tests of a specific assignment

    return this.apiGet('/api/courses/' + course_id.get() + '/assignments/' + assignment_id.get() + '/tests/');
  }

  postNewBadge(icon: string, title: string, description: string) {
    const body = {'icon': icon, 'title': title, 'description': description};
    return this.apiPost('/api/features/badge', body);
  }

  getEnabledFeaturesCourse (course_id: string) {
    // Get enabled features for a course

    return this.apiGet('/api/courses/' + course_id + '/enabled_features');
  }

  getFeaturesCourseMe (course_id: string) {
    // Get feature state for a user in a course

    return this.apiGet('/api/features/feature/' + course_id + '/me');
  }

  getFeaturesCourse (course_id: string) {
    // Get features for all users in a course

    return this.apiGet('/api/features/features/' + course_id);
  }

  getSearch (query: string) {
    // Search the database.

    return this.apiGet('/api/search?query=' + query);
  }

  postNewCourse(name: string, desc: string, hidden: boolean, course_code: string,
    en_feat: Object, autojoin: boolean) {
    // Post a new course to database

    const body = {'name': name, 'description': desc, 'hidden': hidden,
      'course_code': course_code, 'enabled_features': en_feat, 'autojoin': autojoin};
    return this.apiPost('/api/courses', body);
  }

  postInvitationToCourse(course_id: ObjectID, student_id: ObjectID) {
    // Send an invitation for a student to join a course

    const body = {'student_id': student_id};
    return this.apiPost('/api/courses/' + course_id + '/students/invite', body);
  }

  postJoinRequest(course_id: ObjectID, student_id: ObjectID) {
    // Send a request to join a course

    const body = {'student_id': student_id};
    return this.apiPost('/api/courses/' + course_id + '/students/pending', body);
  }

  getMyInvites() {
    // Find invites for me

    return this.apiGet('/api/users/courses/invite');
  }

  getPendingUsers(course_id) {
    // Get the users waiting to join a course

    return this.apiGet('/api/courses/' + course_id + '/students/pending');
  }

  getMyPendingRequests() {
    return this.apiGet('/api/users/courses/pending');
  }

  cancelPendingJoin(course_id: ObjectID) {
    return this.apiDelete('/api/courses/' + course_id + '/students/pending');
  }
  acceptInvite(course_id: ObjectID, student_id: ObjectID) {
    return this.apiPut('/api/courses/' + course_id + '/students/invite', {'student_id': student_id});
  }
  declineInvite(course_id: ObjectID) {
    return this.apiDelete('/api/courses' + course_id + '/students/invite');
  }

  getCoursesById(user_id: string) {
    // Get the courses that a student i taking

    return this.apiGet('/api/users/' + user_id + '/courses');
  }

  getUserCourseStatus(course_id: string) {
    // Retrieves if you're an admin, a teacher or a student in a course

    return this.apiGet('/api/users/courses/' + course_id + '/status');
  }

  login(ticket: string, service: string) {
    // TODO: is this still relevant?

    return this.apiGet('/auth/login/ltu?ticket=' + ticket + '&service=' + service);
  }
}
