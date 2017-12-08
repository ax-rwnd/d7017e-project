import { ModAdventuremapComponent } from './mod-adventuremap.component';
import { Component, OnInit, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-mod-adventuremap-editor',
  templateUrl: './mod-adventuremap-editor.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModAdventuremapEditorComponent extends ModAdventuremapComponent implements OnInit, AfterViewInit {
  // private toEdit: any;

  /*
  ngOnInit() {
    this.width = 2 * this.baseWidth;
    this.height = 2 * this.baseHeight;
    this.sensitivity = this.radius = 8;

    // Make sure to get those assignments loaded right away
    this.loadAssignments();

    // Setup the viewport to reload once the image has loaded
    this.img.onload = () => {
      this.drawMap();
    };
    this.img.src = '/assets/images/map.png';

  }
   */

  setMapDimensions() {
    this.width = 2 * this.baseWidth;
    this.height = 2 * this.baseHeight;
    this.sensitivity = this.radius = 8;
  }

  colorPoint(selectedAssignment, lastAssignment, userProgress, ctx, current) {
    // Draw a simpler point for editing
    ctx.fillStyle = this.completedFill;

    // Select a border color according to the current active status
    if (this.selectedAssignment !== undefined && this.selectedAssignment.assignment !== undefined &&
      this.selectedAssignment.assignment._id === current.assignment._id) {
      ctx.strokeStyle = this.activeBorder;

    } else {
      ctx.strokeStyle = this.normalEdge;
    }
  }

  updateGroup(groupIndex: number) {
    // Send a request to update the state of the group with new coords, etc.
    // TODO: bunch together multiple requests?
    this.assignmentGroups[groupIndex].assignments = this.assignments;
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

      const toSelect = this.assignments.find( (el) => {
        const local = this.scaleToLocal(el.coords);
        const dx = x - local.x;
        const dy = y - local.y;
        return (Math.sqrt(dx * dx + dy * dy) < this.sensitivity);
      });

      // Determine what to do
      if (toSelect !== undefined) {
        this.selectedAssignment = toSelect;
      } else if (this.selectedAssignment !== undefined) {
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
