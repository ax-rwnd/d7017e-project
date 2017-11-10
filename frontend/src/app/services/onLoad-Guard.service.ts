import {Injectable} from '@angular/core';
import {CanLoad, Route, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './Auth/Auth.service';
import {CourseService} from './course.service';
import {UserService} from './user.service';

@Injectable()
export class CanLoadTeamSection implements CanLoad {
  constructor(public auth: AuthService, public router: Router,
              private  courseService: CourseService, private userService: UserService) {}

  canLoad(route: Route): Observable<boolean>|Promise<boolean>|boolean {
    this.courseService.GetAllCoursesForUser();
    this.userService.getMe();
    return true;
  }
}
