import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mod-progressbar',
  templateUrl: './mod-progressbar.component.html',
  styleUrls: ['../gameelement/gameelement.component.css']
})
export class ModProgressbarComponent implements OnInit {
  // Defines a progress bar, suitable for use in courses
  @Input() progress: number;
  assignmentz: {};

  ngOnInit() {
  	test();
  }

}

function test(){
  	for (let i=0; i<4; i++){
  		assignmentz{i} = {id: i, name: 'name s', available: true}
  	}
		console.log('see amount', this.assignmentz);
}
interface assignmentz {
	id: number;
	name: string;
	available: boolean;
}
