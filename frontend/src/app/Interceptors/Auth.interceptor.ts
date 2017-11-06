import {Injectable} from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../services/Auth/Auth.service';

@Injectable()
export class NoopInterceptor implements HttpInterceptor {

  constructor(public auth: AuthService) {}


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('interceptor running');
    const authHeader = this.auth.getToken();
    // kräver en fking localstorage för att fungera.......
    const authReq = req.clone({headers: req.headers.set('Authorization', authHeader)});
    console.log(authReq);
    return next.handle(authReq);
  }

/*
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authHeader = this.auth.getToken();
    const authReq = req.clone({headers: req.headers.set('Authorization', 'Bearer ' + authHeader)});
    return next.handle(authReq).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse {
        if (err.status === 401) {
          this.auth.collectFailedRequest(request);
        }
      }
    });
  }
  */
}
