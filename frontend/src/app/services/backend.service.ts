import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BackendService {
  constructor(private http: HttpClient) { }
  SubmitAssignment(code) { // Returns hardcoded response, remove later
    return new Promise(resolve => {
      resolve(
        {
          'results': {
            'io': [{'id': 0, 'time': 45, 'stderr': '', 'ok': true}, {'id': 0, 'time': 58, 'stderr': 'Wrong output', 'ok': false}],
            'lint': 'Lint error: Fix your indentation at ...',
            'prepare': ''
          }
        }
      );
    });
  }
  /*
  SubmitAssignment(code) {
    return new Promise(resolve => {
      const body = {
        lang: 'python3',
        code: code,
        assignment_id: '59e47512d6bcdd1110d20f40'
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
  */
  /*
  getAssignment() {
    return new Promise(resolve => {
        const body = {
          assignment_id: '59e47512d6bcdd1110d20f40',
          name: 'Assignment name',
          text: 'Assignment text',
          rewards: [{score: 0}]
        };
        // resolve([{'id': 0, 'time': 45, 'ok': true}]);
        this.http.get('http://130.240.5.119:8000/api/test/', body)
          .subscribe(data => {
            console.log(data);
            resolve(data['results']);
          });
      }
    );
  }
  */
  getAssignment() {
    return {
      name: 'Assignment 1',
      description: 'This is the first assignment', // Description should be markdown
      languages: ['python', 'javascript']
    };
  }
}
