

import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {Http, RequestOptions, Headers} from '@angular/http';
import {observable} from 'rxjs/symbol/observable';


@Injectable()
export class AuthService {
  access_token: string;
  cachedRequests: Array<HttpRequest<any>> = [];

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
    const headers = new Headers();
    headers.append('Authorization', this.getRefreshToken());
    const options = new RequestOptions({ headers: headers });
    this.http.get(environment.backend_ip + '/auth/logout', options).subscribe(
      data => {
        console.log(data);
      },
      err => {
        console.log(err);
        console.log('something went shit logging out');
      }
    );
    // clear token remove user from local storage to log user out
    localStorage.clear();
  }

  public requestNewToken() {
    // set refresh token header
    const headers = new Headers();
    headers.append('Authorization', this.getRefreshToken());
    const options = new RequestOptions({ headers: headers });

    return this.http.get(environment.backend_ip + '/auth/accesstoken', options).do(
      data => {
        if (data) {
          this.access_token = ('bearer ' + data.json().access_token);
          console.log(this.access_token);
          console.log(this.getRefreshToken());
          localStorage.setItem('token', this.access_token);
        }
      },
      err => {
        console.log(err);

      }).catch ( error => {
      return observable.of( false );
    });
  }

  public collectFailedRequest(request): void {
    this.cachedRequests.push(request);
  }

  public retryFailedRequests(): void {
    // retry the requests. this method can
    // be called after the token is refreshed
    this.cachedRequests.forEach( request => {
      const authHeader = this.getToken();
      const authReq = request.clone({headers: request.headers.set('Authorization', authHeader)});
      this.http.request(authReq).subscribe((response) => {
        // You need to subscribe to observer in order to "retry" your request
      });
    } );

  }



}
