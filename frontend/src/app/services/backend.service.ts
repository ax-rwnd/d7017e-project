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
                .catch(err => console.error('API Get failed in ' + endpoint + ' error ' + err));
  }

  private apiPost(endpoint, body) {
    // Send a post request to the endpoint

    return this.http.post(environment.backend_ip + endpoint, body, {responseType: 'text'})
                .toPromise()
                .then(response => response)
                .catch(err => console.error('API Post failed in ' + endpoint + ' error ' + err));
  }

  private apiPut(endpoint, body) {
    // Send a put request to the endpoint

    return this.http.put(environment.backend_ip + endpoint, body, {responseType: 'text'})
                .toPromise()
                .then(response => response)
                .catch(err => console.error('API Put failed in ' + endpoint + ' error ' + err));
  }

  // Add a student to a course.
  addUserToCourse(course_id: ObjectID, student_id: ObjectID) {
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

    return this.apiGet('/api/courses/' + id + '/users');
  }

  submitAssignment(user_id: ObjectID, course_id: ObjectID, assignment_id: number, lang: string, code: string) {
    // Submis code for testing
    const body = {'user_id': user_id.get(), 'assignment_id': assignment_id, 'lang': lang, 'code': code};
    return this.apiPost('/api/courses/' + course_id.get() + '/assignments/' + assignment_id + '/submit', body);
  }

  createAssignment(description: string, tests: any) {
    // Creates an assignment with some tests

    // stub
  }

  getAssignment(course_id: string, assignment_id: string) {
    // Get an assignment with name desc., langs.
    return this.apiGet('/api/courses/' + course_id + '/assignments/' + assignment_id);
  }
  getCourseAssignments(course_id: string) {
    return this.apiGet('/api/courses/' + course_id + '/assignments');
  }

  postNewBadge(icon: string, title: string, description: string) {
    const body = {'icon': icon, 'title': title, 'description': description};
    return this.apiPost('/api/features/badge', body);
  }
  getFeaturesCourseUser (course_id: string, user_id: string) {
    console.log('course ', course_id);
    console.log('user ', user_id);
    return this.apiGet('/api/features/feature/' + course_id + '/' + user_id);
  }
  getFeaturesCourse (course_id: string) {
    return this.apiGet('/api/features/features/' + course_id);
  }
}
