import { Component, AfterViewInit } from '@angular/core';
import { ApiService } from '..//..//services/api.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [ApiService]
})
export class CalendarComponent {

  constructor(private api : ApiService) { }
  public calendarData ;
  public sortedCalendarData;
  ngAfterViewInit() {
    this.getData(); 

  }

  getData() {
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
    
  }
  
}
