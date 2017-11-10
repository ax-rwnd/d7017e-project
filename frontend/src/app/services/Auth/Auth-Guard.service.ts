import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './Auth.service';
import {CourseService} from '../course.service';
import {UserService} from '../user.service';


@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router,
              private  courseService: CourseService, private userService: UserService) {}
  canActivate(): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }

  canLoad(): boolean {
    if (this.auth.isAuthenticated()) {
      console.log('auth-guard');
      this.courseService.GetAllCoursesForUser();
      this.userService.getMe();
      return true;
    }
    return false;
  }
}
