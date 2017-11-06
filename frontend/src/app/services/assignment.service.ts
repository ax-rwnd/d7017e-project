import { Injectable } from '@angular/core';

@Injectable()
export class AssignmentService {
  assignmentGroups: AssignmentGroup[];
  constructor() {
    const a = [{id: 1, name: 'Assignment 1'}, {id: 2, name: 'Assignment 2'}, {id: 3, name: 'Assignment 3'},
      {id: 4, name: 'Assignment 4'}, {id: 5, name: 'Assignment 5'}];
    const e = [{id: 1, name: 'Exercise 1'}, {id: 2, name: 'Exercise 2'}, {id: 3, name: 'Exercise 3'},
      {id: 4, name: 'Exercise 4'}, {id: 5, name: 'Exercise 5'}];
    const special = {name: 'Special exercises', collapse: true, availability: 'locked', assignments: e, groups: []};
    const aLvl1 = {name: 'Level 1', collapse: false, availability: false, assignments: a, groups: []};
    const aLvl2 = {name: 'Level 2', collapse: true, availability: 'unlocked', assignments: a, groups: []};
    const aLvl3 = {name: 'Level 3', collapse: true, availability: 'unlocked', assignments: a, groups: []};
    const eLvl1 = {name: 'Level 1', collapse: false, availability: false, assignments: e, groups: []};
    const eLvl2 = {name: 'Level 2', collapse: true, availability: 'unlocked', assignments: e, groups: []};
    const eLvl3 = {name: 'Level 3', collapse: true, availability: 'unlocked', assignments: e, groups: [special]};
    this.assignmentGroups = [];
    this.assignmentGroups[0] = {name: 'Assignments', collapse: true, availability: false, assignments: [], groups: [aLvl1, aLvl2, aLvl3]};
    this.assignmentGroups[1] = {name: 'Exercises', collapse: true, availability: false, assignments: [], groups: [eLvl1, eLvl2, eLvl3]};
  }
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
