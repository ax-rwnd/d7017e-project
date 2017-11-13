import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-mod-adventuremap',
  templateUrl: './mod-adventuremap.component.html',
  styleUrls: ['../gameelement/gameelement.component.css', './mod-adventuremap.component.css']
})
export class ModAdventuremapComponent implements OnInit {

	@Input() assignments: any[];
  assignmentz: {};

  ngOnInit() {
  	test();
  }

getCourseElement(number) {
    //todo
    //fetch the correct assignment/lab from the course
    
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
