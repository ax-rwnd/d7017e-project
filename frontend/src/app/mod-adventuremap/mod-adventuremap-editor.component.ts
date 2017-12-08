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

  colorPoint(selectedAssignment, lastAssignment, userProgress, ctx, current) {
    // Draw a simpler point for editing
    ctx.fillStyle = this.completedFill;

    // Select a border color according to the current active status
    ctx.strokeStyle = (selectedAssignment !== undefined &&
                       selectedAssignment.assignment !== undefined &&
                       selectedAssignment.assignment._id === current.assignment._id) ?
                         this.activeBorder :
                         this.normalEdge;
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
