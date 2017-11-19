import {Injectable} from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../services/Auth/Auth.service';
import 'rxjs/add/operator/do';



@Injectable()
export class NoopInterceptor implements HttpInterceptor {
  access_token: string;
  newRequest: HttpRequest<any>;

  constructor(private auth: AuthService) {}


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Fix Auth header field
    if (this.auth.isAuthenticated()) {
      // User logged on, update Authorization header field with access token
      const authHeader = this.auth.getToken();
      this.newRequest = request.clone({headers: request.headers.set('Authorization', authHeader)});
    } else {
      // Not logged on, no need to change the auth header.
      this.newRequest = request;
    }
    return next.handle(this.newRequest).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          // caching 401 request
          this.auth.collectFailedRequest(this.newRequest);
          // requesting new token from backend
          this.auth.requestNewToken().subscribe( resp => {
            if (!resp) {
              console.log('no response');
            } else {
              this.auth.retryFailedRequests();
            }
          });
        }
      }
    });
  }


}
