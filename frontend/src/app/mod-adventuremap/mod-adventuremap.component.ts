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

  private assignments: any[];
  private context: CanvasRenderingContext2D;

  ngOnInit() {
  }

  ngOnChanges() {
    this.drawMap();
  }

  ngAfterViewInit() {
    this.loadAssignments();
    const canvas = this.mapCanvas.nativeElement;
    this.context = canvas.getContext('2d');
    this.drawMap();
  }

  drawMap() {
    // Render one frame of the game map

    if (this.context === undefined) {
      console.warn('drawMap was called before initialization.');
      return;
    }
    const ctx = this.context;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 200, 200);

    if (this.assignments !== undefined) {
      console.error('loading assignments');

      for (let i = 0; i < this.assignments.length; i++) {

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
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  loadAssignments() {
    this.backendService.getCourseAssignments(this.courseCode).then((data: any) => {
      this.assignments = data.assignments;
      this.drawMap();
    });
  }
}
