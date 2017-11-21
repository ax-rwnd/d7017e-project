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
    // TODO: this is not yet implemented according to wiki

    return this.apiGet('/api/courses');
  }

  getMyCourses() {
    // Get courses for the logged in user

    return this.apiGet('/api/courses/me');
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

  createTest(course_id: any, test: any, assignment_id: any) {
    // add tests to assignment
    const body = {'test': test};
    return this.apiPost('/api/courses/' + course_id + '/assignments/' + assignment_id + '/tests', body);
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

  inviteStudentToCourse(course_id: ObjectID, student_id: ObjectID) {
    // Send an invitation for a student to join a course

    const body = {'student_id': student_id};
    return this.apiPost('/api/courses/' + course_id + '/students/invite', body);
  }

  requestJoinCourse(course_id: ObjectID, student_id: ObjectID) {
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
