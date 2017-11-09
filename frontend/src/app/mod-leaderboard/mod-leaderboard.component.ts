import { GameelementComponent } from '../gameelement/gameelement.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mod-leaderboard',
  templateUrl: './mod-leaderboard.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModLeaderboardComponent extends GameelementComponent implements OnInit {
  @Input() courseCode: string;

  public leaderList: any[];

  ngOnInit() {
    this.backendService.getCourseUsers(this.courseCode).then(data => {
      // TODO: the call will look something like this once
      //  backend implements the API endpoint, however, the coursecode needs
      //  to be switched for the object ID and then it needs to be parsed.
      this.leaderList = [{name: this.courseCode, score: 10}];
    });
  }
}
