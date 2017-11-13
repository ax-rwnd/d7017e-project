import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-mod-adventuremap',
  templateUrl: './mod-adventuremap.component.html',
  styleUrls: ['../gameelement/gameelement.component.css', './mod-adventuremap.component.css']
})
export class ModAdventuremapComponent implements OnInit {
	
	@Input() assignments: Assignment;

  ngOnInit() {
  	test();
  }
}

function getCourseElement(number) {
    //todo
    //fetch the correct assignment/lab from the course
    
   }

function test(){
	const a = [];
  	for (let i=0; i<4; i++){
  		a[i] = {id: i, name: 'name s', available: true}
  	}
  	this.assignments = a;
		//console.log('see amount', this.assignmentz);
}

interface Assignment {
	id: number;
	name: string;
	available: boolean;
}
