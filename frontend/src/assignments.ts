import {Assignmentsgroup} from './assignmentsgroup';
import {Assignment} from './assignment';

export class Assignments {
  groups: Assignmentsgroup[];
  assignments: Assignment[]; // this should only be visible for teachers
}
