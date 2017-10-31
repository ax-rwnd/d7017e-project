import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

import {RequestOptions, Headers} from '@angular/http';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any;
  constructor(private userService: UserService, public http: HttpClient) {

  }
  results: string[];


  ngOnInit() {
    this.user = this.userService.userInfo;
  }

  requestToken() {
    console.log('clicked');
    this.http.get('https://weblogon.ltu.se/cas/login?service=http://127.0.0.1:4200/auth').subscribe(
      data => {
        this.results = data['results'];
        console.log(this.results);
      },
      err => {
        localStorage.setItem('token', 'ERROR_TOKEN');
      }
    );
  }


}
