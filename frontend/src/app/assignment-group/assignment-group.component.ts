import {Component, Input, OnInit} from '@angular/core';
import {forEach} from "@angular/router/src/utils/collection";

@Component({
  selector: 'app-assignment-group',
  templateUrl: './assignment-group.component.html',
  styleUrls: ['./assignment-group.component.css']
})
export class AssignmentGroupComponent implements OnInit {
  @Input() assignmentGroup: AssignmentGroup;
  @Input() courseCode: string;

  constructor() {
  }

  ngOnInit() {
  }

  groupCollapse() {
    if (this.assignmentGroup.availability !== 'locked') {
      this.assignmentGroup.collapse = !this.assignmentGroup.collapse;
      if (this.assignmentGroup.collapse) {
        collapseChildren(this.assignmentGroup.groups);
      }
    }
  }
}

function collapseChildren(children: AssignmentGroup[]) {
  children.forEach(child => {
    child.collapse = true;
    collapseChildren(child.groups);
  });
}

interface AssignmentGroup {
  name: string;
  collapse: boolean;
  availability: any;
  assignments: Assignment[];
  groups: AssignmentGroup[];
}

interface Assignment {
  id: number;
  name: string;
}
