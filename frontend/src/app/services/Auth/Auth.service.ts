
import { Http, Headers, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

  public token: string;
  // constructor(private http: Http) { }

  // ...
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    console.log('CheckingToken');
    if (localStorage.getItem('token')) {
      return true;
    }
      return false;
  }

  public getToken(): string {
    return localStorage.getItem('token');
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('token');
  }

}
