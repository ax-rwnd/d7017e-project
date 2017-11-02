import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import { environment } from '../../environments/environment';


class User {
  id: string;
  username: string;
  email: string;
  admin: boolean;
  courses: [string];
  constructor() {}
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any;
  data;
  constructor(private userService: UserService, public http: HttpClient) {
  }
  results: string;
  frontend_ip: string;
  userMe: User[];
  observableUser: Observable<User[]>;
  errorMessage: String;


  ngOnInit() {
    this.user = this.userService.userInfo;
    this.frontend_ip = environment.frontend_ip;
  }


}



/*

 */
