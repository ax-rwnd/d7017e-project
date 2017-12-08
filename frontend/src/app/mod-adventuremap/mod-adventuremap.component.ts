import { GameelementComponent } from '../gameelement/gameelement.component';
import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';


@Component({
  selector: 'app-mod-adventuremap',
  templateUrl: './mod-adventuremap.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})
export class ModAdventuremapComponent extends GameelementComponent implements OnInit, AfterViewInit {
  @ViewChild('mapCanvas') mapCanvas;
  @Input() courseCode: string;

  // Style constants
  protected readonly baseWidth = 200;
  protected readonly baseHeight = 200;
  protected readonly borderThickness = 2;
  protected readonly lineThickness = 3;

  // Color constants
  protected readonly normalFill = 'black';
  protected readonly lockedFill = 'gray';
  protected readonly completedFill = 'yellow';
  protected readonly currentFill = 'red';

  protected readonly activeBorder = '#5e5';
  protected readonly lastEdge = 'yellow';
  protected readonly normalEdge = 'red';


  protected width = this.baseWidth;
  protected height = this.baseHeight;
  protected radius = 4;
  protected sensitivity = this.radius;
  protected img = new Image(this.width, this.height);

  // Backend state
  private userProgress: any;
  protected assignments: any[];
  protected assignmentGroups: any[];
  protected groupIndex = 0;

  // Frontend state
  protected lastAssignment: any;
  protected selectedAssignment: any;
  private assignmentText: string;
  private assignmentId: string;
  protected initialized = false;

  // Shadow-DOM elements
  protected canvas: any;
  protected context: CanvasRenderingContext2D;

  setMapDimensions() {
    // Modify the canvas size related elements here
  }

  ngOnInit() {
    this.setMapDimensions();

    // Setup the viewport to reload once the image has loaded
    this.update();
    this.img.src = '/assets/images/map.png';
  }

  ngAfterViewInit() {
    this.canvas = this.mapCanvas.nativeElement;
    this.context = this.canvas.getContext('2d');

    // Allow users to select assignments
    this.canvas.addEventListener('click',
        this.handleClick(), false);

    this.initialized = true;
  }

    sidebarUpdate(data: any) {
      // If the sidebar is clicked, update the map

      if (this.initialized) {
        this.update();
      }
    }

    hitTest(x: number, y: number) {
        // Hittest the nodes
        return this.assignmentGroups[this.groupIndex].assignments.find( (el) => {
          const local = this.scaleToLocal(el.coords);
          const dx = x - local.x;
          const dy = y - local.y;
          return (Math.sqrt(dx * dx + dy * dy) < this.sensitivity);
        });
    }

    handleClick() {

      return (ev: any) => {
        // Handle click for this kind of event

        const rect: any = (this as any).canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;

        this.selectedAssignment = this.hitTest(x, y);

        this.setTextValues();
        this.drawMap();
      };
    }

    setTextValues() {
      // Set the assignment text and url

      if (this.selectedAssignment !== undefined) {
        this.assignmentText = this.selectedAssignment.assignment.name;
        this.assignmentId = this.selectedAssignment.assignment._id;
      } else {
        this.assignmentText = 'Pick an assignment';
        this.assignmentId = '';
      }

    }

    update() {
      // Update the model with all the latest and greatest state

      this.backendService.getAssignmentGroupsCourse(this.courseCode).then((data: any) => {
        this.assignmentGroups = data.assignmentgroups;
        this.drawMap();
      });
    }

    drawMap() {
      // Render one frame of the game map

      if (this.context === undefined) {
        console.warn('drawMap was called before initialization.');
        return;
      }
      const ctx = this.context;

      // Clear previous
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw background
      ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);

      // Iterate over the groups
      if (this.assignmentGroups === undefined) {
        console.warn('no groups yet!');
        return;
      }

      pairwise(this.assignmentGroups[this.groupIndex].assignments, (current, next) => {
        this.drawPoint(ctx, current);
        this.strokePath(ctx, current, next);

        if (next !== undefined) {
          this.drawPoint(ctx, next);
        }
      },
      1);
    }

    drawPoint(ctx: CanvasRenderingContext2D, current: any) {
        const local = this.scaleToLocal(current.coords);

        ctx.beginPath();
        this.colorPoint(this.selectedAssignment, this.lastAssignment,
                        this.userProgress, ctx, current);
        ctx.lineWidth = this.borderThickness;
        ctx.arc(local.x, local.y, this.radius, 0, 2 * Math.PI, false);

        ctx.fill();
        ctx.stroke();
    }

    strokePath(ctx: CanvasRenderingContext2D, current: any, next: any) {
      // Stroke path between assignments

        const local = this.scaleToLocal(current.coords);
        const localNext = this.scaleToLocal(next.coords);

        ctx.beginPath();
        ctx.lineWidth = this.lineThickness;
        ctx.strokeStyle = this.normalEdge;
        ctx.moveTo(local.x, local.y);
        ctx.lineTo(localNext.x, localNext.y);
        ctx.stroke();
    }

    scaleToLocal(coord: any) {
      // Grab base cords from db etc. and scale to our local resolution

      return {x: coord.x * (this.width / this.baseWidth),
        y: coord.y * (this.height / this.baseHeight)};
    }

    scaleToBase(coord: any) {
      // Grab local cords from screen and scale them for the db

      return {x: coord.x * (this.baseWidth / this.width),
        y: coord.y * (this.baseHeight / this.height)};
    }

    colorPoint(selectedAssignment, lastAssignment, userProgress, ctx, current) {
      // Set styles for the current point
      // TODO: replace index with the new, smarter way

      // Set the filling style to its appropriate colior
      if (lastAssignment !== undefined && lastAssignment.assignment !== undefined &&
        lastAssignment.assignment._id === current.assignment._id) {
      ctx.fillStyle = this.currentFill;

    } else if (userProgress !== undefined &&
      userProgress.completed_assignments >= 4) {
      ctx.fillStyle = this.completedFill;

    } else {
      ctx.fillStyle = this.lockedFill;
    }

    // Set stroke style according to the selection status
    ctx.strokeStyle = (selectedAssignment !== undefined &&
                      selectedAssignment.assignment !== undefined &&
                      selectedAssignment.assignment._id === current.assignment._id) ?
                        ctx.strokeStyle = this.activeBorder :
                        ctx.strokeStyle = this.normalEdge;
  }
}

function pairwise(arr, func, skips) {
    skips = skips || 1;
    for (let i = 0; i < arr.length - skips; i++) {
        func(arr[i], arr[i + skips]);
    }
}
