import { Injectable } from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import { AuthService } from './Auth.service';
import {CourseService} from '../course.service';
import {UserService} from '../user.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router, private courseService: CourseService,
              private userService: UserService) {}

  canActivate() {
    return new Promise(resolve => {
      if (!this.auth.isAuthenticated()) {
        // NOT AUTHENTICATED
        const redirect = 'https://weblogon.ltu.se/cas/login?service=' + environment.frontend_ip + '/auth?urlPath=' + window.location.href;
        window.location.href = redirect;
        resolve(false);
      } else if (!this.courseService.updated || !this.userService.updated) {
        // AUTHENTICATED
        this.courseService.updated = true;
        this.userService.updated = true;
        activateHelper(this.courseService, this.userService)
          .then(response => {
            resolve(true);
          })
          .catch(err => resolve(false));
      } else {
        resolve(true);
      }
    });
  }
}

function activateHelper(courseService, userService) {
  const promiseArray = [];
  promiseArray.push(courseService.GetAllCoursesForUser());
  promiseArray.push(courseService.GetAllTeachingCourses());
  promiseArray.push(userService.getMe());
  return Promise.all(promiseArray);
}
