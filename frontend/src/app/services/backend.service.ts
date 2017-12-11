import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

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

  constructor(private http: HttpClient, private toastService: ToastService) { }
/*
Http requests:
1. GET
2. POST
3. PUT
4. DELETE
*/
  private apiGet(endpoint: string) {
    // Send a get request to the endpoint

    return this.http.get(environment.backend_ip + endpoint)
      .toPromise()
      .then(response => response)
      .catch(err => {
        this.ToastError(err.error.error);
        throw err;
      });
  }

  private apiPost(endpoint, body) {
    // Send a post request to the endpoint

    return this.http.post(environment.backend_ip + endpoint, body, {responseType: 'json'})
      .toPromise()
      .then(response => response)
      .catch(err => {
        this.ToastError(err.error.error);
        throw err;
      });
  }

  private apiPut(endpoint, body) {
    // Send a put request to the endpoint

    return this.http.put(environment.backend_ip + endpoint, body, {responseType: 'json'})
      .toPromise()
      .then(response => response)
      .catch(err => {
        this.ToastError(err.error.error);
        throw err;
      });
  }

  private apiDelete(endpoint, body) {
    // Send a put request to the endpoint

    const options = { // Need to send a body
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: body,
    };

    return this.http.delete(environment.backend_ip + endpoint, options)
      .toPromise()
      .then(response => response)
      .catch(err => {
        this.ToastError(err.error.error);
        throw err;
      });
  }

  private ToastError(error) {
    // Process errors and display the appropriate toasts
    this.toastService.error(error.message, 'Oops');
    if (error.hasOwnProperty('badinput')) {
      for (const bad of error.badinput) {
        this.toastService.error(bad.msg,  bad.param);
      }
    }
  }

/*
------ API ENDPOINTS START --------
The structure below is the following:

1. Token (me) calls
2. User(s) calls
3. Course(s) calls
  - Create and update
  - Students and courses
4. Feature(s) calls
5. Assignment(s) calls
  - Create, update and submit
  - Assignment draft
  - Assignment test(s)
6. Invite/pending calls
  - Invite(s)
  - Pending
7. Other calls
  - Search
  - Login

*/

// ----- 1. TOKEN (me) calls ------- //

  getMe() {
    // Get information for the currently logged in user

    return this.apiGet('/api/users/me');
  }
  getMyCourses() {
    // Get courses that the logged in user is participating in as a 'student'

    return this.apiGet('/api/users/me/member?role=student');
  }

  getMyTeachedCourses() {
    // Get courses that the current user has write permissions for, i.e. as a 'teacher'

    return this.apiGet('/api/users/me/member?role=teacher');
  }

  getFeaturesCourseMe (course_id: string) {
    // Get feature state for a user in a course

    return this.apiGet('/api/courses/' + course_id + '/features/me');
  }

  getMyPendingReq() {
    // Get user's pending request invites to a course

    return this.apiGet('/api/users/me/invites?type=pending');
  }

  getMyInvites() {
    // Get user's invites to a course

    return this.apiGet('/api/users/me/invites?type=invite');
  }

// ---------- 2. USER(S) calls --------- //

  getUser(id: ObjectID) {
    // Get info for the user with some ID

    return this.apiGet('/api/users/' + id.get());
  }

  getUserCourses(user_id: string) {
    // Get courses for some user

    return this.apiGet('/api/users/' + user_id + '/courses');
  }

  getUserCourseStatus(course_id: string) {
    // Retrieves if you're an admin, a teacher or a student in a course

    return this.apiGet('/api/users/courses/' + course_id + '/status');
  }

// ----------- 3. COURSE(S) calls ----------- //

  getCourses() {
    // Get all courses for display on frontend
    // TODO: this route is completely untested

    return this.apiGet('/api/courses');
  }

  getCourse(id: string) {
    // Get details for a specific course

    return this.apiGet('/api/courses/' + id);
  }

  getCourseStudents(course_id: string) {
    // Get students in a course

    return this.apiGet('/api/courses/' + course_id + '/members');
  }

  deleteCourse(course_id: string) {
    // Delete course with certain id

    const body = {};
    return this.apiDelete('/api/courses/' + course_id, body);
  }

// -- Create and update -- //

  postNewCourse(name: string, desc: string, hidden: boolean, course_code: string,
                en_feat: Object, autojoin: boolean) {
    // Post a new course to database

    const body = {'name': name, 'description': desc, 'hidden': hidden,
      'course_code': course_code, 'enabled_features': en_feat, 'autojoin': autojoin};
    return this.apiPost('/api/courses', body);
  }

  updateCourse(id: string, name: string, desc: string, hidden: boolean, course_code: string,
               en_feat: Object, autojoin: boolean) {
    // Put, update course in database

    const body = {'name': name, 'description': desc, 'hidden': hidden,
      'course_code': course_code, 'enabled_features': en_feat, 'autojoin': autojoin};
    return this.apiPut('/api/courses/' + id, body);
  }

  postAssignmentGroup(course_id: ObjectID, name: string) {
    const body = {'name': name};
    return this.apiPost('/api/courses/' + course_id + '/assignmentgroups', body);
  }

  putAssignmentGroup(course_id: string, assignmentgroup_id: any, assignmentGroup: any) {
    // Update an assignment group

    return this.apiPut('/api/courses/' + course_id + '/assignmentgroups/' + assignmentgroup_id, assignmentGroup);
  }

  deleteAssignmentGroup(course_id: string, group_id: string) {
    const body = {'course_id': course_id, 'assignmentgroup_id': group_id};
    return this.apiDelete('/api/courses/' + course_id + '/assignmentgroups/' + group_id, body);
  }

// -- Students and courses -- //

  getCourseUsers(id: string) {
    // Get users studying a course

    return this.apiGet('/api/courses/' + id + '/students');
  }

  addUserToCourse(course_id: ObjectID, student_id: ObjectID) {
  // Add a student to a course.

    const body = {student_id: student_id.get()};
    return this.apiPut('/api/courses/' + course_id.get() + '/students', body);
  }

// ----------- 4. FEATURES(S) calls ----------- //

  getFeaturesCourse (course_id: string) {
    // Get features for all users in a course

    return this.apiGet('/api/courses/' + course_id + '/features');
  }

  postNewBadge(icon: string, title: string, description: string, course_id: ObjectID, badges: any[], assignments: any[]) {
    const goals = {'badges': badges, 'assignments': assignments};
    const body = {'icon': icon, 'title': title, 'description': description, 'course_id': course_id, 'goals': goals};
    console.log('post body', body);
    return this.apiPost('/api/courses/' + course_id + '/badges', body);
  }

  deleteBadge(course_id: string, badge_id: string) {
    const body = {'course_id': course_id, 'badge_id': badge_id};
    return this.apiDelete('/api/courses/' + course_id + '/badges/' + badge_id, body);
  }

  getAllBadges(course_id: string) {
    return this.apiGet('/api/courses/' + course_id + '/badges');
  }

  getEnabledFeaturesCourse (course_id: string) {
    // Get enabled features for a course

    return this.apiGet('/api/courses/' + course_id + '/enabled_features');
  }


// ----------- 5. ASSIGNMENT(S) calls ----------- //

  getCourseAssignments(course_id: string) {
    return this.apiGet('/api/courses/' + course_id + '/assignments');
  }

  getAssignment(course_id: string, assignment_id: string) {
    return this.apiGet('/api/courses/' + course_id + '/assignments/' + assignment_id);
  }

  getAssignmentGroupsCourse(course_id: string) {
    // Find the assignment groups for the course

    return this.apiGet('/api/courses/' + course_id + '/assignmentgroups');
  }

  getAssignmentGroup(course_id: string, assignmentgroup_id: string) {
    // Retrieve an assignment group

    return this.apiGet('/api/courses/' + course_id + '/assignmentgroups/' + assignmentgroup_id);
  }

// -- Create, update and submit -- //

  createAssignment(course_id: any, assignmentName: string, description: string, languages: string[]) {
    // Creates an assignment
    // Get an assignment with name desc., langs.
    // course_id
    // lang
    const body = {'name': assignmentName, 'description': description, 'languages': ['python3'], 'hidden': 'false'};
    return this.apiPost('/api/courses/' + course_id + '/assignments/', body);
  }

  deleteAssignment(course_id: string, assignment_id: string) {
    // Delete assignment

    const body = {};
    return this.apiDelete('/api/courses/' + course_id + '/assignments/' + assignment_id, body);
  }

  updateAssignment(course_id: any, assignment_id: string, assignmentName: string, description: string, languages: string[]) {

    const body = {'name': assignmentName, 'description': description, 'languages': ['python3'], 'hidden': 'false'}; // languages should change
    return this.apiPut('/api/courses/' + course_id + '/assignments/' + assignment_id, body);
  }

  submitAssignment(user_id: ObjectID, course_id: ObjectID, assignment_id: ObjectID, lang: string, code: string) {
    // Submits code for testing

    const body = {'lang': lang, 'code': code};
    return this.apiPost('/api/courses/' + course_id.get() + '/assignments/' + assignment_id.get() + '/submit', body);
  }

// -- Assignment draft -- //

  postDraft(course_id: ObjectID, assignment_id: ObjectID, code: string, lang: string) {
    // Saves a draft of the editors content on backend

    const body = {'code': code, 'lang': lang};
    return this.apiPost('/api/courses/' + course_id.get() + '/assignments/' + assignment_id.get() + '/save', body);
  }

  getDraft(course_id: ObjectID, assignment_id: ObjectID) {
    // Gets a draft of the editors content from backend

    return this.apiGet('/api/courses/' + course_id.get() + '/assignments/' + assignment_id.get() + '/draft');
  }

// -- Assignment test(s) -- //

  getCourseAssignmentTests(course_id: string, assignment_id: string) {
    // Get all tests of a specific assignment

    return this.apiGet('/api/courses/' + course_id + '/assignments/' + assignment_id + '/tests');
  }

  // add tests to assignment
  createTest(course_id: any, test: string[], assignment_id: any, lint: boolean) {
    // create io test
    const stdin = test[1];
    const stdout = test[2];
    const body = {'stdout': stdout, 'stdin': stdin, 'args': [], 'lint': lint};
    return this.apiPost('/api/courses/' + course_id + '/assignments/' + assignment_id + '/tests', body);
  }

  updateTest(course_id: string, test: string[], assignment_id: any, lint: boolean) {

    const stdin = test[1];
    const stdout = test[2];
    const test_id = test[3];
    const body = {'stdout': stdout, 'stdin': stdin, 'args': [], 'lint': lint};
    return this.apiPut('/api/courses/' + course_id + '/assignments/' + assignment_id + '/tests/' + test_id, body);
  }

// ----------- 6. INVITE/PENDING calls ----------- //

// -- Invite(s) -- //

  /*
 getMyInvites() {
   // Find invites for me

   return this.apiGet('/api/users/courses/invite');
 }
 */

  postInvitationToCourse(course_id: string, student_id: string) {
    // Send an invitation for a student to join a course, if user sends its id it's a join request to a course

    const body = {'user_id': student_id};
    return this.apiPost('/api/courses/' + course_id + '/members/invite', body);
  }

  acceptInvite(course_id: string, student_id: string) {
    const body = {'user_id': student_id};
    return this.apiPut('/api/courses/' + course_id + '/members/invite', body);
  }

  declineInvite(course_id: string, student_id: string) {
    const body = {'user_id': student_id};
    return this.apiDelete('/api/courses/' + course_id + '/members/invite', body);
  }

// -- Pending -- //

  /*
getMyPendingRequests() {
  return this.apiGet('/api/users/courses/pending');
}
*/

  getPendingUsers(course_id) {
    // Get the users waiting to join a course

    // return this.apiGet('/api/courses/' + course_id + '/students/pending');
    return this.apiGet('/api/courses/' + course_id + '/members/invite?type=pending');
  }

  getInvitedUsers(course_id) {
    // Get the users invited to join a course

    return this.apiGet('/api/courses/' + course_id + '/members/invite?type=invite');
  }

// ----------- 7. OTHER calls ----------- //

// -- Search -- //

  getSearch (query: string) {
    // Search the database.

    return this.apiGet('/api/search?query=' + query);
  }

// -- Login -- //

  login(ticket: string, service: string) {
    // TODO: is this still relevant?

    return this.apiGet('/auth/login/ltu?ticket=' + ticket + '&service=' + service);
  }

// -- Invite link -- //
  getInviteLink(course: string) {
    const body = {expires: true};
    return this.apiPost('/api/courses/' + course + '/invitecodes', body);
  }

// -- Join invite link -- //
  joinInviteLink(hash: string) {
    const body = {};
    return this.apiPost('/api/courses/invitecodes/' + hash + '/join', body);
  }

// -- Get all invite links for course -- //
  getAllInviteLinks(course: string) {
    return this.apiGet('/api/courses/' + course + '/invitecodes');
  }

// -- Delete an invite link -- //
  deleteInviteLink(link: string) {
    const body = {};
    return this.apiDelete('/api/courses/invitecodes/' + link, body);
  }
}
