import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BackendService {
  constructor(private http: HttpClient) { }
  SubmitAssignment(code) {
    return new Promise(resolve => {
      const body = {
        lang: 'python3',
        code: code,
        test_id: 1
      };
      resolve([{'id': 0, 'time': 45, 'ok': true}]);
      /*this.http.post('130.240.5.119:2223/api/test', body)
        .subscribe(data => {
          resolve(data['results']);
        });*/
      }
    );
  }
}
