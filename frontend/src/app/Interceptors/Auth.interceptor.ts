import {Injectable} from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../services/Auth/Auth.service';
import {Router} from '@angular/router';
import 'rxjs/add/operator/do';
import { environment } from '../../environments/environment';
import {Http, RequestOptions, Headers} from '@angular/http';

@Injectable()
export class NoopInterceptor implements HttpInterceptor {
  access_token: string;

  constructor(public auth: AuthService, private router: Router, private http: Http) {}


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('interceptor running');
    const authHeader = this.auth.getToken();
    console.log('this is authHeader: ' + authHeader);
    // kräver en fking localstorage för att fungera.......
    const authReq = req.clone({headers: req.headers.set('Authorization', authHeader)});
    return next.handle(authReq);
  }


  /*
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const authHeader = this.auth.getToken();
      console.log('interceptet token: ' + authHeader);
      const authReq = request.clone({headers: request.headers.set('Authorization', authHeader)});
      return next.handle(authReq).do((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            // set refresh token header

            const headers = new Headers();
            headers.append('Authorization', this.auth.getRefreshToken());
            console.log(this.auth.getRefreshToken());
            const options = new RequestOptions({ headers: headers });

            this.http.get(environment.backend_ip + '/auth/accesstoken', options).subscribe(
              data => {
                console.log('THIS IS DATA');
                console.log(data);
                this.access_token = data['access_token'];
                console.log('access_token: ' + this.access_token);
                localStorage.setItem('token', this.access_token);

              },
              err => {
                console.log(err);

              }

            );

        }
      }
    });
  }
  */

}
