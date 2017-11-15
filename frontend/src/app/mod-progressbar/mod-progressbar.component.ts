import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mod-progressbar',
  templateUrl: './mod-progressbar.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})
export class ModProgressbarComponent implements OnInit {
  // Defines a progress bar, suitable for use in courses
  @Input() progress: number;

  ngOnInit() {
  }
}
