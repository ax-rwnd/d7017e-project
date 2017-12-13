import { GameelementComponent } from '../../gameelement/gameelement.component';
import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

@Component({
  selector: 'app-mod-badges-teacher',
  templateUrl: './mod-badges-teacher.component.html',
  styleUrls: ['../../gameelement/gameelement.component.css', './mod-badges-teacher.component.css']
})


export class ModBadgesTeacherComponent extends GameelementComponent implements OnInit, OnChanges {
  // Implements badges that are earned by completing objectives

  @Input() public courseId: string;
  protected badges: any[];
  modalRef: BsModalRef;
  selectedAssignments: any[];
  selectedBadges: any[];
  //createdBadges: any;
  tests: any;
  selectedBadge: any;
  badgeName: string;
  badgeDescription: string;
  assignments: any;
  badgeIcons: Array<Object> = [
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

  ngOnInit() {
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  update() {
    super.getElements(this.courseId);
    this.backendService.getAllBadges(this.courseId)
      .then(response => {
        console.log('badges', response);
        this.badges = response['badges'];
      })
      .catch(err => console.error('Update badge component failed', err));
    this.assignments = this.assignmentService.courseAssignments[this.courseId]['assignments'];
    this.selectedBadge = 'bronze_medal_badge';
  }

  isEnabled() {
    return this.queryEnabled('badges');
  }

  deleteBadge(badge, index) {
    if (confirm('Are you sure to delete ' + badge['title'] + '?')) {
      console.log('delete ', badge);
      this.backendService.deleteBadge(this.courseId, badge['_id'])
        .then(response => {
          this.toastService.success(badge['title'] + ' deleted!');
          this.badges.splice(index, 1);
        });
    }
  }
  openModal(modal) {
    // Open a modal dialog box
    this.tests = [];
    this.selectedAssignments = [{'assignment': this.assignments[0], 'possible': this.assignments}];
    this.selectedBadges = [];
    for (const a of this.assignments) {
      console.log('ids ', this.courseId, a.id);
      this.backendService.getCourseAssignmentTests(this.courseId, a.id)
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
    this.modalRef = this.modalService.show(modal);
  }
  submitBadge() {
    const assignments = [];
    const goalBadges = [];
    for (const a of this.selectedAssignments) {
      console.log('a', a);
      const assignmentTests = [];
      for (const t in this.tests[a['assignment'].id]) {
        const test = this.tests[a['assignment'].id][t];
        if (test['checked'] === true) {
          assignmentTests.push(test._id);
        }
      }
      if (Number(a['code_size']) && Number(a['code_size']) !== 0) {
        assignments.push({'assignment': a['assignment'].id, 'tests': assignmentTests, 'code_size': a['code_size']});
      } else {
        assignments.push({'assignment': a['assignment'].id, 'tests': assignmentTests});
      }
    }
    for (const b of this.selectedBadges) {
      console.log('b', b);
      goalBadges.push(b['badge']._id);
    }
    console.log('submit', assignments);
    console.log('submit', goalBadges);
    this.modalRef.hide();
    this.backendService.postNewBadge(this.selectedBadge, this.badgeName, this.badgeDescription, this.courseId,
      goalBadges, assignments)
      .then(response => {
        this.toastService.success('Badge created');
        this.badges.push(response);
        console.log('badge', response);
      });
  }
  removeGoal(index, type) {
    if (type === 'badge') {
      this.selectedBadges.splice(index, 1);
    } else {
      this.selectedAssignments.splice(index, 1);
    }
  }

  addGoal(type) {
    if (type === 'badge') {
      this.selectedBadges.push({'badge': this.badges[0], 'possible': this.badges});
    } else {
      this.selectedAssignments.push({'assignment': this.assignments[0], 'code_size': '', 'possible': this.assignments});
    }
  }
}

