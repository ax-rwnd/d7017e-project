import { GameelementComponent } from '../gameelement/gameelement.component';
import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-mod-progressbar',
  templateUrl: './mod-progressbar.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})
export class ModProgressbarComponent extends GameelementComponent implements OnInit, OnChanges {
  // Defines a progress bar, suitable for use in courses
  @Input() courseCode: string;
  private maxAssignments: number;
  private currentAssignments: number;

  ngOnInit() {
    this.currentAssignments = 0;
    this.maxAssignments = 0;
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  update() {
    // Grab updates from backend

    this.backendService.getFeaturesCourseMe(this.courseCode).then((data: any) => {
      this.currentAssignments = data.completed_assignments;
      this.maxAssignments = data.total_assignments;
    });
  }

  isEnabled() {
    return this.queryEnabled('progressbar');
  }
}
