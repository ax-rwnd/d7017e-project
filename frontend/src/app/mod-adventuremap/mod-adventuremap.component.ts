import { GameelementComponent } from '../gameelement/gameelement.component';
import { Component, OnInit, OnChanges, ViewChild, AfterViewInit, Input } from '@angular/core';


@Component({
  selector: 'app-mod-adventuremap',
  templateUrl: './mod-adventuremap.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})
export class ModAdventuremapComponent extends GameelementComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('mapCanvas') mapCanvas;
  @Input() courseCode: string;

  private userProgress: any;

  private assignments: any[];
  private selectedAssignment: any;
  private assignmentText: string;

  private canvas: any;
  private context: CanvasRenderingContext2D;

  ngOnInit() {
  }

  ngOnChanges() {
    this.update();
  }

  ngAfterViewInit() {
    this.canvas = this.mapCanvas.nativeElement;
    this.context = this.canvas.getContext('2d');
    this.update();
  }

  update() {
    this.loadAssignments()
      .then( () => {
        this.selectedAssignment = this.assignments[this.userProgress.completed_assignments];
        this.assignmentText = (this.selectedAssignment === undefined) ?
                              'Pick an assignment' : this.selectedAssignment.name;

        this.drawMap();
      });
  }

  loadAssignments() {
    // Load assingments for the map

    return new Promise( (resolve: any, reject: any) => {
      this.loadProgress()
        .then( () => {
          this.backendService.getCourseAssignments(this.courseCode).then((data: any) => {
            this.assignments = data.assignments;
            resolve(data.assignments);
          });
        })
        .catch( (err) => {
          console.error('failed loading progress in adventuremap', err);
          reject(err);
        });
    });
  }

  loadProgress() {
    // Load the user's course progress

    return new Promise((resolve: any, reject: any) => {
      this.backendService.getFeaturesCourseMe(this.courseCode).then( (data: any) => {
        this.userProgress = data;
        resolve(this.userProgress);
      });
    });
  }

drawMap() {
    // Render one frame of the game map

    if (this.context === undefined) {
      console.warn('drawMap was called before initialization.');
      return;
    }
    const ctx = this.context;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.assignments !== undefined) {

      for (let i = 0; i < this.assignments.length; i++) {
        const current = this.assignments[i];

        // Connect dots
        if (i < this.assignments.length - 1) {
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.fillStyle = 'black';
          ctx.moveTo(10 + 20 * i, 10);
          ctx.lineTo(10 + 20 * (i + 1), 10);
          ctx.stroke();
        }

        // Draw dot
        ctx.beginPath();
        ctx.arc(10 + 20 * i, 10, 4, 0, 2 * Math.PI, false);

        // TODO: this is dependent on the linearity of the responses
        // perhaps it could be done better with cooperation from backend
        if (this.selectedAssignment !== undefined &&
            this.selectedAssignment._id === current._id) {
          ctx.fillStyle = 'blue';
        } else if (this.userProgress.completed_assignments >= i) {
          ctx.fillStyle = 'red';
        } else {
          ctx.fillStyle = 'gray';
        }
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}
