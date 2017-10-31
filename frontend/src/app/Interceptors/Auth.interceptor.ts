import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import {Injectable} from '@angular/core';
import {AuthService} from '../services/Auth/Auth.service';

@Injectable()
// https://www.youtube.com/watch?v=x0ZTcTy097I
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    // Clone the request to add the new header.
    const authReq = req.clone({setHeaders: {Authorization: '12345'}});
    // Pass on the cloned request instead of the original request.

    return next
      .handle(authReq)
      .do((ev: HttpEvent<any>) => {
      /* om den här kommer tillbaka med en parameter vi kan kontrollera från cas så kan vi redirecta till vår backend
      * 1. https://weblogon.ltu.se/cas/login?service=localhost:4200
      * 2. cas authenticering och redirect tillbaka till vår frontend
      * 3. interceptor letar efter paramterern ticket och gör anrop till backend? */

        if (ev instanceof HttpResponse) {
          console.log('processing response', ev);
        }
      });
  }
}
