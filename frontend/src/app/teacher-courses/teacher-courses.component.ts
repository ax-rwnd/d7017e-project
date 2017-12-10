import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { CourseService } from '../services/course.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { AssignmentService } from '../services/assignment.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { BackendService } from '../services/backend.service';
import { ToastService } from '../services/toast.service';
import {UserService} from '../services/user.service';
import { environment } from '../../environments/environment';
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'app-teacher-courses',
  templateUrl: './teacher-courses.component.html',
  styleUrls: ['./teacher-courses.component.css'],
  animations: [
  trigger('content', [
    state('inactive', style({marginLeft: '0%', width: '100%'})),
    state('active', style({marginLeft: '15%', width: '85%'})),
    transition('inactive => active', animate('300ms')),
    transition('active => inactive', animate('300ms'))
  ])
]
})
export class TeacherCoursesComponent implements OnInit {
  assignments: any[];
  teachCourses: any;
  sidebarState; // state of sidebar
  progress: any;
  students: any[] = [];
  teachers: any[] = [];
  currentCourse: any;
  possibleStudents: any[];
  form: FormGroup;
  modalRef: BsModalRef;
  pendingReqs: any;
  inviteReqs: any;
  defaultForm = {
    search: ''
  };
  groupName: string;
  selectedBadge: string;
  badges: Array<Object> = [
    {key: 'bronze_medal_badge', name: 'Bronze medal'},
    {key: 'silver_medal_badge', name: 'Silver medal'},
    {key: 'gold_medal_badge', name: 'Gold medal'},
    {key: 'cake_badge', name: 'Cake'},
    {key: 'computer_badge', name: 'Computer'},
    {key: 'bronze_trophy_badge', name: 'Bronze trophy'},
    {key: 'silver_trophy_badge', name: 'Silver trophy'},
    {key: 'gold_trophy_badge', name: 'Gold trophy'},
    {key: 'badge2', name: 'Silver trophy 2'},
    {key: 'goldbadge', name: 'Gold trophy 2'},
    {key: 'badge1', name: 'Smiley'},
    {key: 'badge3', name: 'Lightning'},
    {key: 'brainbadge', name: 'Brain'},
    {key: 'starbadge', name: 'Star'},
  ];
  selectedAssignments: any[];
  tests: any;
  badgeName: string;
  badgeDescription: string;
  inviteLink: string;
  inviteLinkExample: string;
  groups: any[];
  inviteList: any;
  createdBadges: any;

  constructor(private courseService: CourseService, private route: ActivatedRoute, private headService: HeadService,
              private fb: FormBuilder, private assignmentService: AssignmentService, private modalService: BsModalService,
              private backendService: BackendService, private toastService: ToastService, private userService: UserService,
              private router: Router, private dragulaService: DragulaService) {

    // Subscribe to the sidebar state
    this.headService.stateChange.subscribe(sidebarState => {
      this.sidebarState = sidebarState; });

    this.courseService.teachCourses.subscribe( teachCourses => {
      this.teachCourses = teachCourses;
    });

    this.assignmentService.assignmentsSub.subscribe( assignments => {
      this.assignments = assignments;
    });

    this.assignmentService.assignmentsSub.subscribe( groups => {
      this.groups = groups;
    });

    this.setDragula();

    this.route.params.subscribe( (params: any) => {
      // Grab the current course
      this.setCurrentCourse(params.course);
      // Assign groups for assignments
      this.setAssignments();
      // Get pending requests
      this.setPendingReqs();
      // Get invite requests
      this.setInviteReqs();

      this.createdBadges = {'badges': []};
      this.backendService.getAllBadges(this.currentCourse.id)
        .then(response => {
          this.createdBadges = response['badges'];
          console.log('badges', this.createdBadges);
        });
    });
  }

  setDragula() {
    const bag: any = this.dragulaService.find('bag-one');
    if (bag) { // If bag already exist, need to destroy it and create a new one
      this.dragulaService.destroy('bag-one');
    }
    this.dragulaService.setOptions('bag-one', {
      copy: function (el, source) {
        // To copy only elements in right container, the left container can still be sorted
        return source.id === 'right';
      },
      removeOnSpill: function (el, source) {
        // To copy only elements in right container, the left container can still be sorted
        return source.id !== 'right';
      },
      copySortSource: false,
      accepts: function(el, target, source, sibling) {
        // To avoid draggin from left to right container
        return target.id !== 'right';
      }
    });
  }

  setPendingReqs() {
    this.backendService.getPendingUsers(this.currentCourse.id)
      .then(response => {
        console.log('pending', response);
        this.pendingReqs = response['invites'];
      })
      .catch(err => console.error('Get pending users failed', err));
  }

  setInviteReqs() {
    this.backendService.getInvitedUsers(this.currentCourse.id)
      .then(response => {
        console.log('invited', response);
        this.inviteReqs = response['invites'];
      })
      .catch(err => console.error('Get invited users failed', err));
  }

  setCurrentCourse(course) {
    this.currentCourse = this.courseService.GetCourse(course);

    // Grab enrolled students
    this.backendService.getCourseStudents(course).then((data: any) => {
      for (const member of data.members) {
        if (member.role === 'student') {
          this.students.push(member);
        } else if (member.role === 'teacher') {
          this.teachers.push(member);
        }
      }
      console.log('members', data.members);
    })
      .catch(err => console.error('failed to get members', err));

    console.log('course', this.currentCourse);
  }

  setAssignments() {
    if (this.assignmentService.courseAssignments[this.currentCourse.id] !== undefined) {
      this.assignments = this.assignmentService.courseAssignments[this.currentCourse.id]['assignments'];
      this.groups = this.assignmentService.courseAssignments[this.currentCourse.id]['groups'];
      // this.selectedAssignments = [{'assignment': this.flattenAssignments(), 'possible': this.flattenAssignments()}];
      // this.assignmentGroups = this.assignmentService.courseAssignments['default'];console.log('assignments', this.assignmentGroups);
    }
  }

  ngOnInit() {
    this.teachCourses = this.courseService.teaching;
    this.sidebarState = this.headService.getCurrentState();
    this.possibleStudents = [];
    this.selectedBadge = 'bronze_medal_badge';
    this.form = this.fb.group(this.defaultForm);
    this.selectedAssignments = [{'assignment': this.flattenAssignments(), 'possible': this.flattenAssignments()}];
    this.tests = {};
    console.log('teacher, groups', this.groups);
    console.log('teacher, assignments', this.assignments);
    this.getAllInviteLinks();
    this.inviteLinkExample = environment.frontend_ip + '/join/';
  }

  deleteCourse(course_id) {
    if (confirm('Are you sure to delete ' + this.currentCourse.name + '?')) {
      this.backendService.deleteCourse(course_id)
        .then(resp => {
          console.log('Response delete:', resp);
          this.router.navigate(['/user'])
            .then(done => {
              this.courseService.removeTeacherCourse(course_id);
            });
        })
        .catch(err => {
          console.log('Error deleting course:', err);
        });
    }
  }

  openModal(modal, type) {
    // Open a modal dialog box
    if (type === 'createBadge') {
      console.log('assignments', this.assignmentService.courseAssignments[this.currentCourse.id]);
      for (const a of this.assignmentService.courseAssignments[this.currentCourse.id]['assignments']) {
        console.log('ids ', this.currentCourse.id, a.id);
        this.backendService.getCourseAssignmentTests(this.currentCourse.id, a.id)
          .then(response => {
            let t = [];
            if (response['tests'] !== undefined) {
              t = t.concat(response['tests']['io']);
            }
            if (response['optional_tests'] !== undefined) {
              t = t.concat(response['optional_tests']['io']);
            }
            for (let i = 0; i < t.length; i++) {
              t[i]['checked'] = false;
            }
            this.tests[a.id] = t;
          });
      }
    } else if (type === 'createGroup') {
      this.groupName = '';
    }
    this.modalRef = this.modalService.show(modal);
  }

   createAssignmentGroup() {
    this.backendService.postAssignmentGroup(this.currentCourse.id, this.groupName)
      .then(response => {
        console.log('group', response);
        this.toastService.success('Group Created!');
        this.assignmentService.addAssignmentGroup(response, this.currentCourse.id);
        this.modalRef.hide();
      });
  }

  acceptAllReqs() { // iterate through pending list
    for (const req of this.pendingReqs) {
      this.acceptReq(req.user['_id']);
    }
  }

  acceptReq(student_id) {
    this.backendService.acceptInvite(this.currentCourse.id, student_id)
      .then( response => {
        this.toastService.success('Request accepted!');
        // console.log('Accepted req:', response); // Object error stuff, need to check, but works
      })
      .catch(err => console.error('Accept failed', err));
  }

  declineAllReqs() { // iterate through invited list
    for (const req of this.inviteReqs) {
      this.declineReq(req.user['_id']);
    }
  }

  declineReq(student_id) { // need to rewrite delete in backend.service
    this.backendService.declineInvite(this.currentCourse.id, student_id)
    .then( response => {
      this.toastService.success('Invitation removed!');
    })
    .catch(err => console.error('Invitation remove failed', err));
  }

  invite(student_id) {
    // Invite a student to this course

    this.backendService.postInvitationToCourse(this.currentCourse.id, student_id)
      .then(response => this.toastService.success('Student invited!'))
      .catch(err => console.error('Invitation failed', err));
  }

  search() {
    // Perform a search for students through the backend

    this.possibleStudents = [];
    this.backendService.getSearch(this.form.value.search)
      .then((response: any) => {

        // Populate matches
        for (const user of response.users as any[]) {
          this.possibleStudents.push({name: user.username, id: user._id});
        }
      })
      .catch(err => console.error('Search failed', err));
  }

  flattenAssignments() {
    const ass = [];
    for (const a of this.assignments) {
      ass.push(a);
    }
    return ass;
  }

  flattenInviteLinks() {
    const links = [];
    for (const a of this.inviteList.codes) {
      links.push(a);
    }
    return links;
  }

  removeGoal(index) {
    this.selectedAssignments.splice(index, 1);
  }

  addGoal() {
    this.selectedAssignments.push({'assignment': this.flattenAssignments(), 'possible': this.flattenAssignments()});
  }

  submitBadge() {
    const assignments = [];

    for (const a of this.selectedAssignments) {
      console.log('a', a);
      const assignmentTests = [];
      console.log(this.tests[a['assignment'].id]);
      for (const t in this.tests[a['assignment'].id]) {
        const test = this.tests[a['assignment'].id][t];
        if (test['checked'] === true) {
          assignmentTests.push(test._id);
        }
      }
      assignments.push({'assignment': a['assignment'].id, 'tests': assignmentTests, 'code_size': 100});
    }
    console.log('submit', assignments);
    this.modalRef.hide();
    this.backendService.postNewBadge(this.selectedBadge, this.badgeName, this.badgeDescription, this.currentCourse.id,
      [], assignments)
      .then(response => {
        this.toastService.success('Badge created');
        this.createdBadges['badges'].push(response);
        console.log('badge', response);
      });
  }
  submitGroups() {
    for (const group in this.groups) {
      const body = Object.assign({}, this.groups[group]);
      body['assignments'] = [];
      for (const i in this.groups[group]['assignments']) {
        body['assignments'].push({assignment: this.groups[group]['assignments'][i].id});
      }
      this.backendService.putAssignmentGroup(this.currentCourse.id, this.groups[group].id, body)
        .then(response => console.log('group put', response))
        .catch(err => console.log('error', err));
    }
  }

  deleteGroup(group) {
    if (confirm('Are you sure to delete ' + group['name'] + '?')) {
      console.log('delete ', group);
      this.backendService.deleteAssignmentGroup(this.currentCourse.id, group['id'])
        .then(response => {
          this.toastService.success(group['name'] + 'deleted!');
          this.assignmentService.removeAssignmentGroup(group, this.currentCourse.id);
        });
    }
  }

  getAllInviteLinks() {
    // fel id?
    console.log('is this the correct course id: ', this.currentCourse.id);
    this.backendService.getAllInviteLinks(this.currentCourse.id).then((resp: any) => {
      this.inviteList = resp;
      this.inviteList = this.flattenInviteLinks();
    });
  }

  generateInviteLink() {
    this.backendService.getInviteLink(this.currentCourse.id).then((resp: any) => {
      this.inviteLink = environment.frontend_ip + '/join/' + resp.code;
      this.getAllInviteLinks();
    });
  }

  deleteInviteLink(link: string) {
    this.backendService.deleteInviteLink(link).then( (resp: any) => {
      console.log('success, deleted: ' + link, resp);
      this.getAllInviteLinks();
    });
  }
}

/*
interface AssignmentGroup {
  name: string;
  collapse: boolean;
  assignments: Assignment[];
  groups: AssignmentGroup[];
}

interface Assignment {
  id: number;
  name: string;
  available: boolean;
}

*/
