import { GameelementComponent } from '../gameelement/gameelement.component';
import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-mod-badges',
  templateUrl: './mod-badges.component.html',
  styleUrls: ['../gameelement/gameelement.component.css', './mod-badges.component.css']
})
export class ModBadgesComponent extends GameelementComponent implements OnInit, OnChanges {
  // Implements badges that are earned by completing objectives

  @Input() courseCode: string;
  private badges: any[];

  ngOnInit() {
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  update() {
    super.getElements(this.courseCode);
    console.log('elements', this.elements);
  }

  isEnabled() {
    return true; // this.queryEnabled('badges');
  }
}
