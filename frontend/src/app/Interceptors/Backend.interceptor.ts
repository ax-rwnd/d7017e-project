import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpErrorResponse, HttpResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EmptyResponseBodyErrorInterceptor implements HttpInterceptor {
  // A bug in angular causes parsing of valid json objects to fail. More specifically "ok" which is valid json.
  // This is bad and we shouldn't need to do this, but until the bug is fixed this solution will have to do.
  // This interceptor intercepts any errors resulting from a successful request (status 2xx) and sets the responsebody to null
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .catch((err: HttpErrorResponse) => {
        if (err.status >= 200 && err.status < 300) {
          const res = new HttpResponse({
            body: null,
            headers: err.headers,
            status: err.status,
            statusText: err.statusText,
            url: err.url
          });

          return Observable.of(res);
        } else {
          return Observable.throw(err);
        }
      });
  }
}
