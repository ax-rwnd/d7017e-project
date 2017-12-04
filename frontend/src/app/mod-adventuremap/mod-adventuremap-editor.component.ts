import { ModAdventuremapComponent } from './mod-adventuremap.component';
import { Component, OnInit, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-mod-adventuremap-editor',
  templateUrl: './mod-adventuremap-editor.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModAdventuremapEditorComponent extends ModAdventuremapComponent implements OnInit, AfterViewInit {
  // private toEdit: any;

  ngOnInit() {
    this.width = 512;
    this.height = 512;
    this.sensitivity = this.radius *= ((this.width + this.height) / 2) / 128;

    // Make sure to get those assignments loaded right away
    this.loadAssignments();

    // Setup the viewport to reload once the image has loaded
    this.img.onload = () => {
      this.drawMap();
    };
    this.img.src = '/assets/images/ck4.gif';

  }

    /*  ngAfterViewInit() {
    this.canvas = this.mapCanvas.nativeElement;
    this.context = this.canvas.getContext('2d');
    this.update();

    // Allow users to select assignments
    this.canvas.addEventListener('click',
      this.handleClick(), false);
  }*/

  drawPoint(ctx: CanvasRenderingContext2D, current: any, index: number) {
    // Draw the points in a manner relevant to the subclass

    // Fill the point
    ctx.beginPath();
    ctx.arc(current.x, current.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();

    // Stroke the border
    if (this.selectedAssignment !== undefined &&
      this.selectedAssignment._id === current._id) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#5f5';
    } else {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
    }
    ctx.stroke();

  }

  handleClick() {
    return (ev: any) => {
      // Hittest the nodes
      const rect: any = (this as any).canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      const toSelect = this.assignments.find( (el) => {
        const dx = x - el.x;
        const dy = y - el.y;
        return (Math.sqrt(dx * dx + dy * dy) < this.sensitivity);
      });

      // Determine what to do
      if (toSelect !== undefined) {
        this.selectedAssignment = toSelect;
      } else if (this.selectedAssignment !== undefined) {
        this.selectedAssignment.x = x;
        this.selectedAssignment.y = y;
      } else {
        console.warn('Warning: undefined elements.');
      }

      this.drawMap();
    };
  }
}
