import { ModAdventuremapComponent } from './mod-adventuremap.component';
import { Component, OnInit, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-mod-adventuremap-editor',
  templateUrl: './mod-adventuremap-editor.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModAdventuremapEditorComponent extends ModAdventuremapComponent implements OnInit, AfterViewInit {

  setMapDimensions() {
    this.width = 2 * this.baseWidth;
    this.height = 2 * this.baseHeight;
    this.sensitivity = this.radius = 8;
  }

  updateGroup(groupIndex: number) {
    // Send a request to update the state of the group with new coords, etc.
    // TODO: bunch together multiple requests?
    // this.assignmentGroups[groupIndex].assignments = this.assignments;
    const group = this.assignmentGroups[groupIndex];

    if (group !== undefined) {
      return this.backendService.putAssignmentGroup(this.courseCode, group._id, group);
    } else {
      console.error('failed to update positions, undefined group');
    }
  }

  strokePath(ctx: CanvasRenderingContext2D, current: any, next: any) {
    // Stroke path between assignments
    // TODO: this is overriden because courseService returns bogus
    // data in the teacher view, this should be rewritten to fix said issue!

    const local = this.scaleToLocal(current.coords);
    const localNext = this.scaleToLocal(next.coords);

    ctx.beginPath();
    ctx.lineWidth = this.lineThickness;
    ctx.strokeStyle = this.normalEdge;
    ctx.moveTo(local.x, local.y);
    ctx.lineTo(localNext.x, localNext.y);
    ctx.stroke();
  }

  handleClick() {
    // Handle the event that the user clicks the map

    return (ev: any) => {
      // Hittest the nodes
      const rect: any = (this as any).canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      const toSelect = this.hitTest(x, y);

      if (toSelect !== undefined) {
        // Hittest success, select assignment

        this.selectedAssignment = toSelect;
      } else if (this.selectedAssignment !== undefined) {
        // Something was already selected, move it

        const baseCoords = this.scaleToBase({x: x, y: y});
        this.selectedAssignment.coords.x = baseCoords.x;
        this.selectedAssignment.coords.y = baseCoords.y;
        this.updateGroup(this.groupIndex);
      } else {
        console.warn('Warning: undefined elements.');
      }

      this.drawMap();
    };
  }
}
