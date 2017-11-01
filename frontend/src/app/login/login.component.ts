import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

import {RequestOptions, Http, Headers} from '@angular/http';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any;
  constructor(private userService: UserService, private http: Http) {

  }
  results: string[];


  ngOnInit() {
    this.user = this.userService.userInfo;
  }

  requestToken() {
    console.log('clicked');
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', 'https://weblogon.ltu.se');
    const options = new RequestOptions({headers: headers});

    this.http.get('https://weblogon.ltu.se/cas/login?service=http://130.240.5.119:8000/api/login/ltu', options ).subscribe(
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
