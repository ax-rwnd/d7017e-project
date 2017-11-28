import { ModAdventuremapComponent } from './mod-adventuremap.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mod-adventuremap-large',
  templateUrl: './mod-adventuremap.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModAdventuremapLargeComponent extends ModAdventuremapComponent implements OnInit {
  ngOnInit() {
    this.width = 512;
    this.height = 512;
  }
}
