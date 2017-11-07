import { GameelementComponent } from '../gameelement/gameelement.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mod-leaderboard',
  templateUrl: './mod-leaderboard.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModLeaderboardComponent extends GameelementComponent implements OnInit {
  public leaderList: any[];

  ngOnInit() {
    this.leaderList = [{name: 'asd', score: 10}];
    /*this.backendService.getMyCourses().then(data => {
      this.leaderList = data;
    });*/
  }
}
