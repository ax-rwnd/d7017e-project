import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
  userInfo =  {
    firstName: 'First',
    lastName: 'LastName',
    id: ''
  };
  constructor() { }

}
