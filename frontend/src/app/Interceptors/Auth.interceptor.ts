import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../services/Auth/Auth.service';

@Injectable()
export class NoopInterceptor implements HttpInterceptor {

  constructor(public auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('interceptor running');
    const authHeader = this.auth.getToken();
    const authReq = req.clone({headers: req.headers.set('Authorization', 'Bearer ' + authHeader)});
    console.log(authReq);
    return next.handle(authReq);
  }
}
