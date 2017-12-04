import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';

@Injectable()
export class UserService {
  userInfo =  {
    id: '',
    userName: '',
    admin: false,
    access: '', // basic is student, advanced is teacher or assistant
    teaching: [],
  };
  updated = false;
  constructor(private backendService: BackendService) { }

  getMe() {
    this.backendService.getMe().then(data => {
      console.log('User data:', data);
      this.userInfo.id = data['_id'];
      this.userInfo.userName = data['username'];
      this.userInfo.admin = data['admin'];
      this.userInfo.access = data['access'];
      this.userInfo.teaching = data['teaching'];
    });
  }

}
