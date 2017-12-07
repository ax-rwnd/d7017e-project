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
  protected width = 200;
  protected height = 200;
  private readonly borderThickness = 2;
  private readonly lineThickness = 1;
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

  ngOnInit() {
    // Setup the viewport to reload once the image has loaded
    this.img.onload = () => {
      this.drawMap();
    };

    this.img.src = '/assets/images/ck4.gif';
  }

  ngAfterViewInit() {
    this.canvas = this.mapCanvas.nativeElement;
    this.context = this.canvas.getContext('2d');
    this.update();

    // Allow users to select assignments
    this.canvas.addEventListener('click',
      this.handleClick(), false);

    // Don't do stuff that relies on state until the component is initialized
    this.initialized = true;
  }

  sidebarUpdate(data: any) {
    // If the sidebar is clicked, update the map

    if (this.initialized) {
      this.update();
    }
  }

  handleClick() {
    return (ev: any) => {
      // Handle click for this kind of event

      const rect: any = (this as any).canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      // Hittest the nodes
      this.selectedAssignment = this.assignments.find( (el) => {
        const dx = x - el.coords.x;
        const dy = y - el.coords.y;
        return (Math.sqrt(dx * dx + dy * dy) < this.sensitivity);
      });

      this.setTextValues();
      this.drawMap();
    };
  }

  setTextValues() {
    // Set the assignment text and url

    this.assignmentText = (this.selectedAssignment === undefined) ?
                          'Pick an assignment' : this.selectedAssignment.name;
    this.assignmentId = (this.selectedAssignment === undefined) ?
                        '' : this.selectedAssignment._id;
  }

  update() {
    // Update the model with all the latest and greatest state

    this.loadAssignments()
      .then( () => {
        this.selectedAssignment = this.assignments[this.userProgress.completed_assignments];
        this.lastAssignment = this.assignments[this.userProgress.completed_assignments];
        this.setTextValues();

        this.drawMap();
      })
      .catch(err => {
        console.error('adventuremap failed to update', err);
      });
  }

  loadAssignments() {
    // Load assingments- and assignment groups from map

    return new Promise ((resolve: any, reject: any) => {
      this.backendService.getAssignmentGroupsCourse(this.courseCode).then((data: any) => {
        // Grab the available groups
        this.assignmentGroups = data.assignmentgroups;

        if (this.assignmentGroups && this.assignmentGroups.length <= 0) {
          console.warn('no groups...');
          return;
        } else {
        }

        // Grab details about the specific group
        this.backendService.getAssignmentGroup(this.courseCode, this.assignmentGroups[this.groupIndex]._id).then((nestdata: any) => {
          this.assignments = nestdata.assignments;

          // Make sure that progress is loaded
          this.loadProgress().then((progress: any) => {
            console.warn('loaded progress', progress);
            resolve(this.assignments);
          })
          .catch( (err) => {
            console.error('could not load progress', err);
          });

        })
        .catch((err) => console.error('could not load assignments from group', err));

      })
      .catch((err) => {
        console.error('could not get groups in adventuremap', err);
        reject(err);
      });
    });
  }

    /*
    return new Promise( (resolve: any, reject: any) => {
      this.loadProgress()
        .then( () => {
          this.backendService.getCourseAssignments(this.courseCode).then((data: any) => {
            // TODO: temporary shim to implement coords
            this.assignments = data.assignments;

            for (let i = 0; i < data.assignments.length; i++) {
              this.assignments[i].x = i * 10;
              this.assignments[i].y = 10;
            }

            resolve(this.assignments);
          });
        })
        .catch( (err) => {
          console.error('adventuremap failed to load assignments ', err);
        });
    });*/

  loadProgress() {
    // Load the user's course progress

    return new Promise((resolve: any, reject: any) => {
      this.backendService.getFeaturesCourseMe(this.courseCode).then( (data: any) => {
        this.userProgress = data;
        resolve(this.userProgress);
      })
        .catch(err => {
          console.error('adventuremap failed to load progress', err);
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

    // Clear previous
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);

    if (this.assignments !== undefined) {

      for (let i = 0; i < this.assignments.length; i++) {
        const current = this.assignments[i];
        this.drawAssignment(ctx, current, i);
      }
    } else {
      console.warn('assignments were undefined during drawMap()');
    }
  }

  strokePath(ctx: CanvasRenderingContext2D, current: any, index: number) {
    // Stroke path between assignments

    if (index < this.assignments.length - 1) {
      const next = this.assignments[index + 1];

      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.moveTo(current.coords.x, current.coords.y);
      ctx.lineTo(next.coords.x, next.coords.y);
      ctx.stroke();
    }
  }

  drawPoint(ctx: CanvasRenderingContext2D, current: any, index: number) {
    // Draw dot
    ctx.beginPath();
    ctx.arc(current.coords.x, current.coords.y, this.radius, 0, 2 * Math.PI, false);

    // TODO: this is dependent on the linearity of the responses
    // perhaps it could be done better with cooperation from backend
    ctx.strokeStyle = 'black';

    // Set fill stule
    if (this.lastAssignment !== undefined &&
        this.lastAssignment.assignment._id === current.assignment_id) {
      ctx.fillStyle = 'blue';
    } else if (this.userProgress.completed_assignments >= index) {
      ctx.fillStyle = 'red';
    } else {
      ctx.fillStyle = 'gray';
    }
    ctx.fill();

    // Set stroke style
    if (this.selectedAssignment !== undefined &&
      this.selectedAssignment.assignment_id === current.assignment_id) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#5f5';
    } else {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
    }

    ctx.stroke();
  }

  drawAssignment(ctx: CanvasRenderingContext2D, current: any, index: number) {
    // Draw information for one assignment


    this.strokePath(ctx, current, index);
    this.drawPoint(ctx, current, index);
  }
}
