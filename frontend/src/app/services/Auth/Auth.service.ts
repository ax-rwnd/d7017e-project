

import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import {HttpRequest} from '@angular/common/http';
import {Http, RequestOptions, Headers} from '@angular/http';
import {observable} from 'rxjs/symbol/observable';


@Injectable()
export class AuthService {
  access_token: string;
  cachedRequests: Array<HttpRequest<any>> = [];

  constructor(private http: Http) { }

  public isAuthenticated(): boolean {
    if (this.getToken() !== null) {
      return true;
    } else if (this.getRefreshToken() !== null) {
      // We've got a refresh token but no token, am I really authenticated?
      this.requestNewToken().subscribe(resp => {
        if (!resp) {
          return false;
        }
      },
        err => {
          console.log(err);
          console.log('something went shit in isAuthenticated');
          return false;
        });
      return true;
    }
    return false;
  }

  public getToken(): string {
    if (localStorage.getItem('token') !== null) {
      return localStorage.getItem('token');
    } else {
      return null;
    }
  }

  public getRefreshToken(): string {
    if (localStorage.getItem('refresh_token') !== null) {
      return localStorage.getItem('refresh_token');
    } else {
      return null;
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
          console.log('Success, got new token from backend.');
          this.access_token = ('bearer ' + data.json().access_token);
          localStorage.setItem('token', this.access_token);
          // this.retryFailedRequests();
        }
      },
      err => {
        console.log(err);

      }).catch ( error => {
        console.log(error);
        return observable.of( false );
    });
  }

  public collectFailedRequest(request): void {
    this.cachedRequests.push(request);
  }

  public retryFailedRequests() {
    // retry the requests. this method can
    // be called after the token is refreshed
    this.cachedRequests.forEach( request => {
      // set token header
      const headers = new Headers();
      headers.append('Authorization', this.getToken());
      const options = new RequestOptions({ headers: headers });
      this.http.request(request.url, options).subscribe(resp => {
        if (resp) {
          console.log('successfully retried request');
          console.log(resp);
          // --TODO vad ska hända här? ingenting? vad för typ av request kan ha blivit retried?
        } else {
          console.log('something went shit in retryFailedRequests');
        }
      });
    } );
  }
}
