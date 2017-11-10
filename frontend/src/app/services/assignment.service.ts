import { Injectable } from '@angular/core';

@Injectable()
export class AssignmentService {
  courseAssignments = {};
  constructor() {
    const a = [{id: '1', name: 'Assignment 1', description: 'description', available: true},
      {id: '2', name: 'Assignment 2', description: 'description', available: true},
      {id: '3', name: 'Assignment 3', description: 'description', available: false},
      {id: '4', name: 'Assignment 4', description: 'description', available: false},
      {id: '5', name: 'Assignment 5', available: false}];
    const e = [{id: '1', name: 'Exercise 1', description: 'description', available: true},
      {id: '2', name: 'Exercise 2', description: 'description', available: true},
      {id: '3', name: 'Exercise 3', description: 'description', available: true},
      {id: '4', name: 'Exercise 4', description: 'description', available: true},
      {id: '5', name: 'Exercise 5', description: 'description', available: true}];
    const special = {name: 'Special exercises', collapse: true, availability: 'locked', assignments: e, groups: []};
    const aLvl1 = {name: 'Level 1', collapse: false, availability: false, assignments: a, groups: []};
    const aLvl2 = {name: 'Level 2', collapse: true, availability: 'unlocked', assignments: a, groups: []};
    const aLvl3 = {name: 'Level 3', collapse: true, availability: 'unlocked', assignments: a, groups: []};
    const eLvl1 = {name: 'Level 1', collapse: false, availability: false, assignments: e, groups: []};
    const eLvl2 = {name: 'Level 2', collapse: true, availability: 'unlocked', assignments: e, groups: []};
    const eLvl3 = {name: 'Level 3', collapse: true, availability: 'unlocked', assignments: e, groups: [special]};
    const assignmentGroups = [];
    assignmentGroups[0] = {name: 'Assignments', collapse: true, availability: false, assignments: [], groups: [aLvl1, aLvl2, aLvl3]};
    assignmentGroups[1] = {name: 'Exercises', collapse: true, availability: false, assignments: [], groups: [eLvl1, eLvl2, eLvl3]};
    this.courseAssignments['default'] = assignmentGroups;
  }
  AddCourseAssignments(course_id: string, assignments: any[]) {
    const a = [];
    for (let i = 0; i < assignments.length; i++) {
      a[i] = {id: assignments[i]._id, name: assignments[i].name, description: assignments[i].description, available: true};
    }
    this.courseAssignments[course_id] = [{name: 'Assignments', collapse: true, availability: false, assignments: a, groups: []}];
  }
  GetAssignment(course: string, assignment_id: string) {
    if (this.courseAssignments[course] === undefined) {
      course = 'default';
    }
    for (let i = 0; i < this.courseAssignments[course].length; i++) {
      const a = getAssignmentHelper(this.courseAssignments[course][i], assignment_id);
      if (a !== false) {
        return a;
      }
    }
    return false;
  }
}

function getAssignmentHelper(group: AssignmentGroup, assignment_id: string) {
  console.log('group', group);
  console.log('length', group.assignments.length);
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
  name: string;
  description: string;
  available: boolean;
}
