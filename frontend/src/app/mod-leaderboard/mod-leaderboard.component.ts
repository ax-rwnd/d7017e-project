import { GameelementComponent } from '../gameelement/gameelement.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mod-leaderboard',
  templateUrl: './mod-leaderboard.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModLeaderboardComponent extends GameelementComponent {
  constructor() {
    super();
  }

  generateBoard() {
    // TODO: replace this with a call to the backend
    return [{name: 'asd', score: 0}, {name: 'asd', score: 1}, {name: 'asd', score: 2}, {name: 'asd', score: 3}, {name: 'asd', score: 4}];
  }
}
