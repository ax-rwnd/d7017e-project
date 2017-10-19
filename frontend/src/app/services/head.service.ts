import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class HeadService {
  public stateChange = new Subject<any>();
  sidebarState: any;

  setState(sidebarState) {
    this.sidebarState = sidebarState;
    return this.stateChange.next(sidebarState);
  }

  getCurrentState() {
    return this.sidebarState;
  }

}
