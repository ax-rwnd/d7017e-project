import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';

@Injectable()
export class UserService {
  userInfo =  {
    userName: '',
    id: ''
  };
  constructor(private backendService: BackendService) { }

  getMe() {
    this.backendService.getMe().then(data => {this.userInfo.id = data['_id']; this.userInfo.userName = data['username']; });
  }

}
