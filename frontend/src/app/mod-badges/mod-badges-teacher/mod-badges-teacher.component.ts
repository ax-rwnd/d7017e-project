import { GameelementComponent } from '../../gameelement/gameelement.component';
import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-mod-badges-teacher',
  templateUrl: './mod-badges-teacher.component.html',
  styleUrls: ['../../gameelement/gameelement.component.css', './mod-badges-teacher.component.css']
})


export class ModBadgesTeacherComponent extends GameelementComponent implements OnInit, OnChanges {
  // Implements badges that are earned by completing objectives

  @Input() public courseId: string;
  protected badges: any[];

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
  }

  isEnabled() {
    return this.queryEnabled('badges');
  }

  deleteBadge(badge) {
    if (confirm('Are you sure to delete ' + badge['title'] + '?')) {
      console.log('delete ', badge);
      this.backendService.deleteBadge(this.courseId, badge['_id'])
        .then(response => this.toastService.success(badge['title'] + 'deleted!'));
    }
  }
}

