import { ModAdventuremapComponent } from './mod-adventuremap.component';
import { Component, OnInit, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-mod-adventuremap-editor',
  templateUrl: './mod-adventuremap-editor.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})

export class ModAdventuremapEditorComponent extends ModAdventuremapComponent implements OnInit, AfterViewInit {
  private toEdit: any;

  ngOnInit() {
    this.width = 512;
    this.height = 512;

    // Make sure to get those assignments loaded right away
    this.loadAssignments();

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
  }

  handleClick() {
    return (ev: any) => {
      if (this.toEdit !== undefined) {
        // TODO: initially selected element isn't defined

        const rect: any = (this as any).canvas.getBoundingClientRect();
        this.toEdit.x = ev.clientX - rect.left;
        this.toEdit.y = ev.clientY - rect.top;

        this.drawMap();
      }
    };
  }
}
