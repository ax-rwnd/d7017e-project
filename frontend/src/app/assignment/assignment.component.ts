import { Component, OnInit } from '@angular/core';
import 'codemirror/mode/go/go';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css']
})
export class AssignmentComponent implements OnInit {
  assignment: string;
  content: string;
  constructor() { }

  ngOnInit() {
    this.assignment = 'print(\'Detta är ett program som räknar hur mycket kaffe du dricker.\')\n' +
      'namn = \'Anna andersson\'\n' +
      'print(\'Jag heter\' + namn)\n' +
      'n = 2\n' +
      'print(\'Jag har druckit \' + str(n) + \'\' koppar kaffe idag.\')';
    this.content = "";
  }

}
