import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';


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
  userMe: User[];
  observableUser: Observable<User[]>;
  errorMessage: String;


  ngOnInit() {
    this.user = this.userService.userInfo;
  }

  requestToken() {
    console.log('clicked');
    // this.http.get('http://130.240.5.119:8000/api/users/me').subscribe(
    this.http.get<User>('http://130.240.5.119:8000/api/users/me', {observe: 'response'}).subscribe(
      data => {

        this.data = data;
        console.log(this.data);
      },
      err => {
        localStorage.setItem('token', 'ERROR_TOKEN');
      }
    );
  }


  getToken() {
    this.http.get<User>('http://130.240.5.119:8000/api/login/ltu', {observe: 'response'}).subscribe(
      data => {

        this.data = data;
        console.log(this.data);
      },
      err => {
        localStorage.setItem('token', 'ERROR_TOKEN');
      }
    );
      }


}



/*

 */
