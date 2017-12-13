import {Reward} from './reward';

export class Course {
  id: string;
  name: string;
  code: string;
  course_info: string;
  rewards: Reward;
  progress: any;
  // Additional teacher course info
  hidden: boolean;
  enabled_features: Object;
  students: any[];
  teachers: any[];
  autojoin: boolean;
}
