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
    this.update();
  }
 
  update() {
    super.getElements(this.courseCode);
    this.updateList ();
  }

  updateList () {
    // Update the leaderboard

    this.backendService.getFeaturesCourse(this.courseCode).then((data: any) => {
      const students: any[] = data.features;

      // Get list of students
      let leaderList = students.map(student => {
        return {name: student._id, score: student.completed_assignments};
      });

      // Sort and filter out low-scoring students
      leaderList = leaderList.sort( (a: any, b: any) => a.score < b.scire ? -1 : a.score < b.score ? 1 : 0);
      this.leaderList = leaderList.slice(0, 5);
    })
      .catch(err => console.error('Leaderboard update failed', err));
  }

  isEnabled() {
    return this.queryEnabled('leaderboard');
  }
}
