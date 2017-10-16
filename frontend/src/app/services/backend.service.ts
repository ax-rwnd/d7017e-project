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
        assignment_id: '59e46c453867bc21d4ca69ed'
      };
      // resolve([{'id': 0, 'time': 45, 'ok': true}]);
      this.http.post('http://130.240.5.119:8000/api/test/', body)
        .subscribe(data => {
          console.log(data);
          resolve(data['results']);
        });
      }
    );
  }
}
