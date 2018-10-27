import { Component, AfterViewInit } from '@angular/core';
import { ApiService } from '..//..//services/api.service';
import { data } from './calendarData';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [ApiService]
})
export class CalendarComponent {
  public mockupdata = data;
  //constructor(private api : ApiService) { }
  public calendarData ;
  public sortedCalendarData = [];
  ngOnInit(): void {

    this.getMockupData();

  }

  /* ngAfterViewInit() {
    this.getData(); 
  } */

  getMockupData(){
    this.calendarData = this.mockupdata['returnData'];
    console.log(this.calendarData);
    this.sortedCalendarData = this.calendarData.sort((a,b)=> a.time - b.time);
    console.log(this.sortedCalendarData[0]);
  }

  /* getData() {
    let p = ['calendar'];
    let url = '/calendar';
    this.api.getData(url,p).subscribe(
      data => {
        //console.log(data);
        this.calendarData=data['returnData'];
        console.log(this.calendarData);
        this.sortedCalendarData = this.calendarData.sort((a,b)=> a.time - b.time);
        console.log(this.sortedCalendarData);
        
      }
    )
    
  } */
  
}
