import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})

export class ToolbarComponent implements OnInit {
  isVisible = false;
  constructor(private elementRef:ElementRef) { }
  
  ngOnInit() {
  }
  onClick(event){
   // d3.select(event.target).style('background-color', 'red');
    this.isVisible = true;
  }
  mouseLeave(){
    this.isVisible = false;
  }
}

class dropdownGenerator {
  constructor(
    public id: number,
    public name: string) { }
}
