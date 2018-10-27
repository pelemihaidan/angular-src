import { Component, AfterViewInit } from '@angular/core';
import { ApiService } from '..//..//services/api.service';
import { data } from './newsData';
@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  providers: [ApiService]
})
export class NewsComponent {

  // constructor(private api : ApiService) { }
  public mockupdata = data;
  public newsData ;
  public sortedNewsData;
  public isVisible = false;
  public buttonText = "Read More";
  /* ngAfterViewInit() {
    this.getData();
  } */
  ngOnInit(): void {
    this.getMockupData();
  }
  getMockupData(){
    this.newsData=this.mockupdata['returnData'];
    this.sortedNewsData = this.newsData.sort((a,b)=> b.time - a.time);
  }
  /* getData() {
    let p = ['news'];
    let url = '/news';
    this.api.getData(url,p).subscribe(
      data => {
        //console.log(data);
        this.newsData=data['returnData'];
        this.sortedNewsData = this.newsData.sort((a,b)=> b.time - a.time);
        console.log(this.newsData);
      }
    )
  } */
  onClick(event){
    if(!this.isVisible){
      this.buttonText = "Close";
      this.isVisible = true;
      
    }
    else {
      this.buttonText = "Read More";
      this.isVisible = false;
      
    }
  }
  onMouseLeave(event){
    if(this.isVisible){
      this.isVisible = false;
    } 
    this.buttonText = "Read More";
  }
}
