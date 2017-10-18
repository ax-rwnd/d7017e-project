import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class HeadService {
  public stateChange = new Subject<any>();

  setState(sidebarState) {
    return this.stateChange.next(sidebarState);
  }
}
