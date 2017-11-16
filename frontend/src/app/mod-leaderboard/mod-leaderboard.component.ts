import { GameelementComponent } from '../gameelement/gameelement.component';
import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-mod-leaderboard',
  templateUrl: './mod-leaderboard.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModLeaderboardComponent extends GameelementComponent implements OnChanges, OnInit {
  @Input() courseCode: string;
  public leaderList: any[];

  ngOnInit() {
    this.update();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes: ', changes);
    this.update();
  }
  update() {
    this.backendService.getCourseUsers(this.courseCode).then(data => {
      // TODO: the call will look something like this once
      //  backend implements the API endpoint, however, the coursecode needs
      //  to be switched for the object ID and then it needs to be parsed.
      this.leaderList = [{name: this.courseCode, score: 10}];
    });

    super.getElements(this.courseCode);
  }

  isEnabled() {
    return this.queryEnabled('leaderboard');
  }

}
