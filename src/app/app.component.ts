import { Component, OnInit, Output } from '@angular/core';
import { Http } from '@angular/http';
import { ApiService } from './services/api.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ApiService]
})
export class AppComponent {
  public chartViewBool : boolean = true;
  public calendarViewBool : boolean = false;
  public newsViewBool : boolean = false;
  public symbolData;

  //public api : ApiService;
  // getData func BETTER than getSymbolData ---------
  constructor(private api : ApiService){}
  getSymbolData(){
    this.api.getSymbolData().subscribe(
      data => {
        this.symbolData = data;
        console.log(this.symbolData);
      }
    )
    
  }
  changeView(value){
    if(value === 1){
      this.chartViewBool = true;
      this.calendarViewBool = false;
      this.newsViewBool = false;
    }
    else if(value === 2){
      this.chartViewBool = false;
      this.calendarViewBool = true;
      this.newsViewBool = false;
    }
    else{
      this.chartViewBool = false;
      this.calendarViewBool = false;
      this.newsViewBool = true;
    }
  }
  
}
