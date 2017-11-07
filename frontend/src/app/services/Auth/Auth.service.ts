

import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Http, RequestOptions, Headers} from '@angular/http';


@Injectable()
export class AuthService {
  access_token: string;

  constructor(private http: Http) { }

  public isAuthenticated(): boolean {
    console.log('CheckingToken');
    if (localStorage.getItem('token')) {
      return true;
    }
      return false;
  }

  public getToken(): string {
    if (localStorage.getItem('token') !== null) {
      return localStorage.getItem('token');
    } else {
      return 'unohavetoken';
    }
  }

  public getRefreshToken(): string {
    if (localStorage.getItem('refresh_token') !== null) {
      return localStorage.getItem('refresh_token');
    } else {
      return 'unohaverefreshtokentoken';
    }
  }

  public logout(): void {
    // kill token in backend
    console.log('logout log token:' + this.getToken());
    this.http.get(environment.backend_ip + '/auth/logout').subscribe(
      data => {
        console.log(data);
      },
      err => {
        console.log(err);
        console.log('something went shit logging out');
      }
    );
    // clear token remove user from local storage to log user out
    // localStorage.clear();
  }

  public requestNewToken(): boolean {
    // set refresh token header
    const headers = new Headers();
    headers.append('Authorization', this.getRefreshToken());
    console.log(this.getRefreshToken());
    const options = new RequestOptions({ headers: headers });

    this.http.get(environment.backend_ip + '/auth/accesstoken', options).subscribe(
      data => {
        console.log('THIS IS DATA');
        console.log(data);
        this.access_token = data['access_token'];
        console.log('access_token: ' + this.access_token);
        localStorage.setItem('token', this.access_token);
        return true;
      },
      err => {
        console.log(err);
        return false;
      }
    );
    return false;
  }



}
