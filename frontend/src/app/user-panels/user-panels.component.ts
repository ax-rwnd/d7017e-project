import {Component, OnInit, Input, ViewChild, ElementRef, TemplateRef} from '@angular/core';

@Component({
  selector: 'app-user-panels',
  templateUrl: './user-panels.component.html',
  styleUrls: ['./user-panels.component.css']
})
export class UserPanelsComponent implements OnInit {
  @Input() course: any;
  collapsed: boolean;

  @ViewChild('body') body: ElementRef;

  constructor() { }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  ngOnInit() {
    this.collapsed = true; // body should be collapsed on creation
  }

}
