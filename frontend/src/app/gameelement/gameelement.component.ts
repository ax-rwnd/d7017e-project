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
  constructor(public backendService: BackendService) {}
  public elements: any;

  ngOnInit() {
  }

  queryEnabled(componentName: string) {
    // Check if some component is enabled

    if (this.elements === undefined) {
      return false;
    } else {
      return this.elements[componentName] === true;
    }
  }

  protected getElements(courseId: string) {
    // Retrieve elements from the backend

    this.backendService.getEnabledFeaturesCourse(courseId)
      .then(data => {
        this.elements = data;
      })
      .catch(err => {
        console.error('Failed to get enabled status in modular gmae component', err);
        this.elements = {};
      });
  }
}
