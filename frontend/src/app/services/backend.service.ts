import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
                .subscribe();
  }

  getMe() {
    // Get information for the currently logged in user

    return this.apiGet('/api/users/me');
  }

  getUser(id: string) {
    // Get info for the user with some ID

    return this.apiGet('/api/users/' + id);
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

  submitAssignment(assignment_id: number, lang: string, code: string) {
    // Submis code for testing

    // stub
  }

  createAssignment(description: string, tests: any) {
    // Creates an assignment with some tests

    // stub
  }

  getAssignment(course_id: string, assignment_id: string) {
    // Get an assignment with name desc., langs.

    return this.apiGet('/api/courses/' + course_id + '/assignments/' + assignment_id);
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
