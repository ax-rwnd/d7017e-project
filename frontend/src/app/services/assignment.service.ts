import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { Assignmentsgroup } from '../../assignmentsgroup';
import { Assignment } from '../../assignment';
import { Assignments } from '../../assignments';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AssignmentService {
  courseAssignments = {};
  assignmentsSub = new Subject<any>(); // used when change of assignments occur
  groupSub = new Subject<any>(); // used when a change of groups, ex creating group, occur

  constructor(private backendService: BackendService) {

  }

  getAssignmentsForCourse(course_id): Promise<any> {
    // Get assignments for a course from database, called from course service

    return new Promise((resolve, reject) => {
      this.backendService.getCourseAssignments(course_id) // Retrieve info from database
        .then(assignmentsResponse => {
          this.setAssignmentsForCourse(course_id, assignmentsResponse['assignments']);
          resolve();
        })
        .catch(reject);
    });
  }

  getAssignmentGroups(course_id, backendService) {
    /* Get groups with assignments for a course from the database.
       From the database, will get a list of groups which is set for
       the course in function 'setGroupsForCourse'.
    */

    return new Promise((resolve, reject) => {
      backendService.getAssignmentGroupsCourse(course_id) // Retrieve info from database
        .then(response => {
          const groups = response['assignmentgroups'];
          this.setGroupsForCourse(course_id, groups);
          resolve();
        })
        .catch(reject);
    });
  }

  setGroupsForCourse(course_id: string, groups: any[]) {
    // Sets a list of Assignmentsgroup, groupList, to a course.

    const groupList = getGroupList(groups);
    if (this.courseAssignments[course_id]) {
      // Assignments has already been 'created', only need to set groups
      this.courseAssignments[course_id]['groups'] = groupList;
    } else {
      // Assignments for course hasn't been set yet, set new Assignments object
      this.courseAssignments[course_id] = newAssignments(groupList, '');
    }
  }

  setAssignmentsForCourse(course_id: string, assignments: any[]) {
    // Works similar as setGroupsForCourse but with assignments for course instead

    const assignList = getAssignmentList(assignments);
    if (this.courseAssignments[course_id]) {
      this.courseAssignments[course_id]['assignments'] = assignList;
    } else {
      this.courseAssignments[course_id] = newAssignments('', assignList);
    }
  }

  addAssignment(assign: Object, course_id: string) {
    // Used when creating assignment, adds new assignment to course and push the
    // new value to components that has subscribed to assignmentSub

    const assignment = newAssignment(assign['_id'], assign['name'], assign['languages'], assign['description']);
    this.courseAssignments[course_id]['assignments'].push(assignment);
    return this.assignmentsSub.next(this.courseAssignments[course_id]['assignments']);
  }

  updateAssignment(course_id: string, assignment_id: string, name: string, content: string, languages: string[]) {
    // Update an assignment
    const assignment = this.getTeacherAssignment(course_id, assignment_id);
    assignment.name = name;
    assignment.languages = languages;
    assignment.description = content;
    this.updateAssignmentGroup(course_id, assignment_id, name, content, languages);
    return this.assignmentsSub.next(this.courseAssignments[course_id]['assignments']);
  }

  updateAssignmentGroup(course_id: string, assignment_id: string, name: string, content: string, languages: string[]) {
    const groups = this.courseAssignments[course_id]['groups'];
    for (const group of groups) {
      const assignment = group.assignments.find((current) => current.id === assignment_id);
      if (assignment) { // If found it in group, should be defined, update it
        assignment.name = name;
        assignment.languages = languages;
        assignment.description = content;
      }
    }
    return this.groupSub.next(this.courseAssignments[course_id]['groups']);
  }

  addAssignmentGroup(gr: Object, course_id: string) {
    // Works similar to addAssignment function with subscription etc

    const group = newAssignmentsgroup(gr['_id'], gr['name'], []);
    this.courseAssignments[course_id]['groups'].push(group);
    return this.groupSub.next(this.courseAssignments[course_id]['groups']);
  }

  removeAssignmentGroup(gr: Object, course_id: string) {
    // Works similar to addAssignmentGroup but instead of add new group a group is deleted

    const index = this.courseAssignments[course_id]['groups'].indexOf(gr);
    if (index !== -1) {
      this.courseAssignments[course_id]['groups'].splice(index, 1);
      return this.groupSub.next(this.courseAssignments[course_id]['groups']);
    }
  }

  getTeacherAssignment(course_id: string, assignment_id: string): Assignment {
    // Used when teacher update an assignment, need information

    const assignments = this.courseAssignments[course_id].assignments;
    return assignments.find((current) => current.id === assignment_id);
  }

  GetAssignment(course_id: string, group_id: string, assignment_id: string): Assignment {
    // Called whn a user (student) clicks on an assignment, search through groups and
    // assignments and then return assignment to be displayed

    const groups = this.courseAssignments[course_id].groups;
    const group = groups.find((current) => current.id === group_id); // find group matching group_id
    const assignments = group.assignments;
    return assignments.find((current) => current.id === assignment_id); // return assignment matching id in group
  }
}

function getGroupList(groups: any[]): Assignmentsgroup[] {
  // Goes through array of groups and returns an Assignmentsgroup, sets
  // id, name and a list of Assignment for each group

  const groupList: Assignmentsgroup[] = [];
  for (const group of groups) {
    const assignList = getAssignmentList(group.assignments); // array of assignments
    groupList.push(newAssignmentsgroup(group._id, group.name, assignList));
  }
  return groupList;
}

function getAssignmentList(assignments: any[]): Assignment[] {
  // Works similar to getGroupList but with Assignment instead, an Assignment has
  // id, name, languages and description.

  const assignmentsList: Assignment[] = [];
  for (const assign of assignments) {
    let assignment = assign;
    if (assign.assignment) {
      assignment = assign.assignment;
    }
    assignmentsList.push(newAssignment(assignment._id, assignment.name, assignment.languages, assignment.description));
  }
  return assignmentsList;
}

function newAssignments(groups, assignments): Assignments {
  return {
    groups: groups,
    assignments: assignments, // should only be visible to teacher
  };
}

function newAssignmentsgroup(id: string, name: string, assignments: Assignment[]): Assignmentsgroup {
  return {
    id: id,
    name: name,
    assignments: assignments,
  };
}

function newAssignment(id: string, name: string, languages: any[], desc: string) {
  return {
    id: id,
    name: name,
    languages: languages,
    description: desc,
  };
}

