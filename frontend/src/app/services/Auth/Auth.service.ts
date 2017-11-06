

import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Http} from '@angular/http';

@Injectable()
export class AuthService {
  constructor(private http: Http) { }

  public isAuthenticated(): boolean {
    console.log('CheckingToken');
    if (localStorage.getItem('token')) {
      return true;
    }
      return false;
  }

  public getToken(): string {
    if (localStorage.token !== null) {
      return localStorage.getItem('token');
    } else {
      return 'unohavetoken';
    }
  }

  public logout(): void {
    // clear token remove user from local storage to log user out
    localStorage.clear();
    // kill token in backend
    this.http.get(environment.backend_ip + '/auth/logout').subscribe(
      data => {
        console.log(data);
      },
      err => {
        console.log(err);
        console.log('something went shit logging out');
      }
    );
  }



}
