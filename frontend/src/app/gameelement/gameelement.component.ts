// The base component for game elements.
// Any modular game component should inherit this and make use of its methods
//   instead of implementing its own.

import { Component, OnInit } from '@angular/core';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'app-gameelement',
  template: ''
})

export class GameelementComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  isEnabled(componentName: string) {
    // Check if the component is enabled
    // Stub
  }
}
