import { ModBadgesComponent } from './mod-badges.component';
import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-mod-badges-single',
  templateUrl: './mod-badges.component.html',
  styleUrls: ['../gameelement/gameelement.component.css', './mod-badges.component.css']
})
export class ModBadgesSingleComponent extends ModBadgesComponent implements OnInit {
  // Implements badges that are earned by completing objectives

  update() {
    super.getElements(this.courseCode);
    this.backendService.getFeaturesCourseMe(this.courseCode)
      .then( (data: any) => {
        // this.badges = data.badges.slice(0, 1);
        this.badges = [1, 2].slice(0, 1);
      })
      .catch(err => console.error('Update single badge component failed'));
  }

  isEnabled() {
    return this.queryEnabled('badges');
  }
}
