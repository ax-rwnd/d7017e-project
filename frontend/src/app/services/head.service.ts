import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class HeadService {
  public stateChange = new Subject<any>();

  setState(state) {
    return this.stateChange.next(state);
  }
}
