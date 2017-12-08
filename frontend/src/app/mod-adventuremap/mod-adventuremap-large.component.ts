import { ModAdventuremapComponent } from './mod-adventuremap.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mod-adventuremap-large',
  templateUrl: './mod-adventuremap.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModAdventuremapLargeComponent extends ModAdventuremapComponent implements OnInit {
  setMapDimensions() {
    this.width = 2 * this.baseWidth;
    this.height = 2 * this.baseHeight;
    this.radius = this.sensitivity = 8;
  }
}
