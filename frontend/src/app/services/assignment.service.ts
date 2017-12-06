import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';

@Injectable()
export class AssignmentService {
  courseAssignments = {};
  constructor(private backendService: BackendService) {
    const a = [{id: '1', name: 'Assignment 1', description: 'description', available: true},
      {id: '2', name: 'Assignment 2', description: 'description', available: true},
      {id: '3', name: 'Assignment 3', description: 'description', available: false},
      {id: '4', name: 'Assignment 4', description: 'description', available: false},
      {id: '5', name: 'Assignment 5', available: false}];
    const assignmentGroups = [];
    assignmentGroups[0] = {name: 'Assignments', collapse: true, availability: false, assignments: a, groups: []};
    this.courseAssignments['default'] = assignmentGroups;
  }

  getAssignmentsForCourse(course_id): Promise<any> {
    // Set assignments to a course

    return new Promise((resolve, reject) => {
      this.backendService.getCourseAssignments(course_id)
        .then(assignmentsResponse => {
          console.log('AssignmentsResp:', assignmentsResponse);
          this.AddCourseAssignments(course_id, assignmentsResponse['assignments']);
          resolve();
        })
        .catch(reject);
    });
  }

  AddCourseAssignments(course_id: string, assignments: any[]) {
    const a = [];
    for (let i = 0; i < assignments.length; i++) {
      a[i] = {id: assignments[i]._id, course_id: course_id, name: assignments[i].name, languages: assignments[i].languages,
        description: assignments[i].description, available: true};
    }
    this.courseAssignments[course_id] = [{name: 'Assignments', collapse: false, availability: false, assignments: a, groups: []}];
  }
  GetAssignment(course_id: string, assignment_id: string) {
    if (this.courseAssignments[course_id] === undefined) {
      course_id = 'default';
    }
    console.log('course id ', course_id);
    for (let i = 0; i < this.courseAssignments[course_id].length; i++) {
      const a = getAssignmentHelper(this.courseAssignments[course_id][i], assignment_id);
      if (a !== false) {
        return a;
      }
    }
    return false;
  }
  numberOfAssignments(course: string) {
    if (this.courseAssignments[course] === undefined) {
      course = 'default';
    }
    return numberOfAssignmentsHelper(this.courseAssignments[course]);
  }
}

function numberOfAssignmentsHelper(groups: AssignmentGroup[]) {
  let number = 0;
  if (groups === []) {
    return number;
  } else {
    for (let i = 0; i < groups.length; i++) {
      number += groups[i].assignments.length + numberOfAssignmentsHelper(groups[i].groups);
    }
  }
  return number;
}

function getAssignmentHelper(group: AssignmentGroup, assignment_id: string) {
  for (let i = 0; i < group.assignments.length; i++) {
    if (group.assignments[i].id === assignment_id) {
      return group.assignments[i];
    }
  }
  for (let i = 0; i < group.groups.length; i++) {
    const a = getAssignmentHelper(group.groups[i], assignment_id);
    if (a !== false) {
      return a;
    }
  }
  return false;
}

interface AssignmentGroup {
  name: string;
  collapse: boolean;
  availability: any;
  assignments: Assignment[];
  groups: AssignmentGroup[];
}

interface Assignment {
  id: string;
  course_id;
  name: string;
  languages: string[];
  description: string;
  available: boolean;
}
