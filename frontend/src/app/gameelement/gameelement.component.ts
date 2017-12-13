// The base component for game elements.
// Any modular game component should inherit this and make use of its methods
//   instead of implementing its own.

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BackendService } from '../services/backend.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService} from '../services/toast.service';
import { AssignmentService } from '../services/assignment.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-gameelement',
  template: ''
})

export class GameelementComponent implements OnInit {
  constructor(protected backendService: BackendService, protected route: ActivatedRoute, protected toastService: ToastService,
  protected assignmentService: AssignmentService, protected modalService: BsModalService) {
    this.route.params.subscribe( (data: any) => {
      this.sidebarUpdate(data);
    });
  }
  public elements: any;

  ngOnInit() {
  }

  sidebarUpdate(data: any) {
    // Implement this to trigger when sidebar is used for changing
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
        console.error('Failed to get enabled status in modular game component', err);
        this.elements = {};
      });
  }
}
