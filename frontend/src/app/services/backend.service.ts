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
  //  }
  // `

  constructor(private http: HttpClient) { }

  getMe() {
    // Get information for the currently logged in user

    return this.http.get(environment.backend_ip + '/api/users/me')
                .toPromise()
                .then(response => response);
  }

  getUser(id: string) {
    // Get info for the user with some ID

    return this.http.get(environment.backend_ip + '/api/users/' + id)
                .toPromise()
                .then(response => response);
  }

  getCourses() {
    // Get all courses for display on frontend
    // TODO: this is not yet implemented according to wiki

    return this.http.get(environment.backend_ip + '/api/courses')
                .toPromise()
                .then(response => response);
  }

  getMyCourses() {
    // Get courses for the logged in user

    return this.http.get(environment.backend_ip + '/api/courses/me')
                .toPromise()
                .then(response => response);
  }

  getUserCourses(id: string) {
    // Get courses for some user

    return this.http.get(environment.backend_ip + '/api/users/' + id + '/courses')
                .toPromise()
                .then(response => response);
  }

  getCourse(id: string) {
    // Get details for a specific course

    return this.http.get(environment.backend_ip + '/api/courses/' + id)
                .toPromise()
                .then(response => response);
  }

  submitAssignment(assignment_id: number, lang: string, code: string) {
    // Submis code for testing

    // stub
  }

  createAssignment(description: string, tests: any) {
    // Creates an assignment with some tests

    // stub
  }

  getAssignment(id: string) {
    // Get an assignment with name desc., langs.

    // stub
  }
}
