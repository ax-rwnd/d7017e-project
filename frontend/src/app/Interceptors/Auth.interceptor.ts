import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class NoopInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('interceptor running');
    const authReq = req.clone({headers: req.headers.set('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5Zjg0MzA1YjU3OWY1MWIwMDk4M2U4YyIsImlhdCI6MTUwOTQ3NjI2NSwiZXhwIjoxNTA5NDc3MTY1fQ.MwqdFYOlYYDgBFfOQUONL8o6wdw3mvnOKCI2Wr208Lw')});
    console.log(authReq);
    return next.handle(authReq);
  }
}
