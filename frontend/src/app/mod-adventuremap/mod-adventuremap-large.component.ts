import { ModAdventuremapComponent } from './mod-adventuremap.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mod-adventuremap-large',
  templateUrl: './mod-adventuremap.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModAdventuremapLargeComponent extends ModAdventuremapComponent implements OnInit {
  ngOnInit() {
    this.width = 2 * this.baseWidth;
    this.height = 2 * this.baseHeight;

    // Setup the viewport to reload once the image has loaded
    this.img.onload = () => {
      this.drawMap();
    };
    this.img.src = '/assets/images/map.png';
  }
}
