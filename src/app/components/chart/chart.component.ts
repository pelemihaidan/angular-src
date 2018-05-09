import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { DataConstructor } from './data';
import * as d3 from 'd3';
import { ApiService } from '..//..//services/api.service';
import { Observable } from 'rxjs';
import { ArrayType } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  providers: [ApiService]
})
export class ChartComponent {
  
/** Setting Reference for canvas and declaring context
 * 
 */
  @ViewChild('myCanvas') myCanvas: ElementRef;
  @ViewChild('yAxisCanvas') yAxisCanvas: ElementRef;
  @ViewChild('xAxisCanvas') xAxisCanvas: ElementRef;
  public contextMain: CanvasRenderingContext2D;
  public contextX: CanvasRenderingContext2D;
  public contextY: CanvasRenderingContext2D;
  public mockupdata = [];
  public yAxisValues = [];
  public yAxisIndex = 0;
  public tempx = 0;
  public tempy = 0;
  public calculating = false;
  constructor(private api : ApiService) {}

  
/** Variable Initialization 
  * 
  */
  /* Variables for data storage and looping */
  public symbolData ;
  public count = 0;
  /* Variables for canvas x/y Ratio Normalization  */
  public canvasWidth = window.innerWidth - 50;
  public canvasHeight = window.innerHeight - 80;
  public normalizedWidthRatio = 1;
  public normalizedHeightRatio = 1;
  /* Variables for drawing and saving draw starting coordonates  */
  public drawStartX = 0; public drawStartY = 1000;
  public currentX = 0; public currentY = 1000;
  /* Variables for mouse postition and offset */
  public panning = false;
  public mStartX = 0; public mStartY = 0;
  public mTempX  = 0; public mTempY  = 0;
  public offsetX = 0; public offsetY = 0;
  /* Variables for candle height and width */
  public rectDefHeight = 10; public rectDefWidth = 10;
  public rectHeight = 0; public rectWidth = 0;
  /* Variable for scaling */
  public scale = [5, 5];
  /* Variables for yAxis */
  public pips ; public firstPriceLoop = true;
  public pMin ; public pMax ; public pRange = 0;
   

  public pMinYCoord; public pMaxYCoord;
  public priceMin; public priceMax;
  public extremesSet = false;
  ////
  public hasNewElements = false;
  public isMouseDown = false;
  public isMouseUp = false;  
 
/** AfterViewInit Method
 * 
 */
  ngAfterViewInit(): void {
    this.getData();
    this.contextX = (this.xAxisCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    this.contextY = (this.yAxisCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    this.contextMain = (this.myCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    this.normalizeCanvas();
    
  }
/** Getting Data from server 
  * 
  */
  getData() {
    this.api.getData().subscribe(
      data => {
        this.symbolData = data;
        this.setDataObject();
        this.updateDataObject(false, true);
      }
    )
    console.log("Got Data");
    
  }
/** Test Draw Method
  * 
  */
  testDraw() {
    this.updateDataObject(false, true);
  }

/** Function for scaling elements on canvas based on Width and Height ratio
  * 
  */
  public normalizeCanvas() {
    if (this.canvasWidth > this.canvasHeight) {
      this.normalizedHeightRatio = this.canvasWidth / this.canvasHeight;
      this.normalizedWidthRatio = 1;
    } else if (this.canvasWidth < this.canvasHeight) {
      this.normalizedWidthRatio = this.canvasHeight / this.canvasWidth;
      this.normalizedHeightRatio = 1;
    } else {
      this.normalizedWidthRatio = this.normalizedHeightRatio = 1
    }
  }
/** Populating mockupdata object with data from the Api for the first time 
  * 
  */
  setDataObject() {
    this.normalizeCanvas();
    this.rectHeight = this.rectDefHeight * this.normalizedHeightRatio;
    this.rectWidth = this.rectDefWidth * this.normalizedWidthRatio;
    this.symbolData['candles'].forEach(element => {
      let x = this.currentX;
      let y = this.currentY;
      let bullish = false;
      let em = element['mid'];
      let e = element;
      if (em['o'] - em['c'] <= 0) {
        bullish = true;
      } else { 
        bullish = false; 
      }
      this.mockupdata.push(new DataConstructor(
        bullish, x, y, this.rectWidth, e['time'],
        em['o'], em['c'], em['h'], em['l'])
      );
      this.currentY += Math.round((em['o'] - em['c']) * 100000);
      this.currentX += this.rectWidth;
    });
  }
/** Updating mockupdata object Function 
  * 
  */  
  updateDataObject(hasNewElements, isMouseDown) {
   // Logic if updateDataObject() was called from a scaling or panning function.
    if (hasNewElements === false) {
     // Updating x and y coordonates for each element in mockupdata object
      this.mockupdata.forEach(element => {
        element['xCoord'] += this.mTempX;
        element['yCoord'] += this.mTempY;
      });
     // Redrawing on Main and yAxis chart
      this.mockupdata.forEach(element => {
        let e = element;
        this.drawChart(
          e['bullish'], e['xCoord'], e['yCoord'], e['rectWidth'],
          e['time'], e['open'], e['close'], e['high'], e['low']);
      });
      this.drawYChart();
     // Drawing line on X axis 
      this.contextX.beginPath();
      this.contextX.moveTo(-1000 + this.mTempX, 0);
      this.contextX.lineWidth = 2;
      this.contextX.strokeStyle = "white";
      this.contextX.lineTo(2000*this.scale[1] + this.mTempX , 0);  
      this.contextX.closePath();
      this.contextX.stroke();
      
    }
  }
/** Drawing Functions
  * 
  */
  drawChart(bullish, x, y, rectWidth, time, open, close, high, low) {
    let tHigh = Math.round((open - high) * 100000);
    let range = Math.round((high - low) * 100000);
    let t = Math.round(high * 100000);
    let posHigh = y + tHigh;
    let drawn = false;
    let tHeight = Math.round((open - close) * 100000);
   // Drawing High->Low Line on contextMain
    this.contextMain.beginPath();
    this.contextMain.lineWidth = 1;
    this.contextMain.strokeStyle = "white";
    this.contextMain.moveTo(x + this.mTempX + rectWidth / 2, posHigh + this.mTempY);
    this.contextMain.lineTo(x + this.mTempX + rectWidth / 2, posHigh + this.mTempY + range);
    this.contextMain.closePath();
    this.contextMain.stroke();
   // Setting Max/Min Coordonates of maxHigh/minLow price
    if (this.extremesSet === false) {
      this.priceMax = high;
      this.priceMin = low
      this.extremesSet = true;
    }
    else {
      if (this.priceMax < high) {
        this.priceMax = high;
        this.pMaxYCoord = posHigh + this.mTempY;
      }
      if (this.priceMin > low) {
        this.priceMin = low;
        this.pMinYCoord = posHigh + this.mTempY + range;
      }
    } 
   // Drawing Rectangles on contextMain
    if (tHeight === 0) {
      this.contextMain.fillStyle = "white";
      this.contextMain.fillRect(x + this.mTempX, y + this.mTempY, rectWidth, 1);
    }
    else {
      if (bullish) {
        this.contextMain.fillStyle = "green";
      } else {
        this.contextMain.fillStyle = "red";
      }
      this.contextMain.fillRect(x + this.mTempX, y + this.mTempY, rectWidth, tHeight);
    }
   // Drawing date on contextX
    let date = new Date(time);
    this.drawXChart(date, x, rectWidth);

  }
 // Drawing on Y axis
  drawYChart() {
    this.getPips();
    let tpMinCoord = this.pMinYCoord;
    this.pips.forEach(price => {
      let tLogic = Math.round(price * 100000);
      if (tLogic % 100 === 0) {
        this.contextY.beginPath();
        this.contextY.moveTo(0, tpMinCoord);
        this.contextY.lineWidth = 0.5;
        this.contextY.strokeStyle = "white";
        this.contextY.lineTo(5, tpMinCoord);
        this.contextY.font = "10px Comic Sans MS";
        this.contextY.fillStyle = "white";
        this.contextY.textAlign = "center";
        this.contextY.fillText(price, 25, tpMinCoord + 4);
        this.contextY.closePath();
        this.contextY.stroke();
      }
      tpMinCoord--;
    });
    this.contextY.beginPath();
    this.contextY.moveTo(0, -1000 + this.mTempX );
    this.contextY.lineWidth = 0.3;
    this.contextY.strokeStyle = "white";
    this.contextY.lineTo(0, 2000 + this.mTempX);
    this.contextY.closePath();
    this.contextY.stroke();
  }
 // Drawing on X axis
  drawXChart(date, x, rectWidth){
    if((date.getMinutes() === 0) && (date.getSeconds() === 0) ){
     // Preparing date strings
      let i = 0;
      let addZero = function(i){
        if(i < 10){
          i = "0" + i;
        }
        return i;
      }
      let hh = addZero(date.getHours().toString());
      let mm = addZero(date.getMinutes().toString());
      let ss = addZero(date.getSeconds().toString());
      let time = hh+":"+mm;
     // Drawing Line
      this.contextX.beginPath();
      this.contextX.moveTo(x + this.mTempX + rectWidth/2, 0);
      this.contextX.lineWidth = 1;
      this.contextX.strokeStyle = "white";
      this.contextX.lineTo(x + this.mTempX + rectWidth/2, 10);
      this.contextX.closePath();
      this.contextX.stroke();
     // Drawing Text
      this.contextX.font = "20px Comic Sans MS";
      this.contextX.fillStyle = "white";
      this.contextX.textAlign = "center";
      this.contextX.fillText(time , x + this.mTempX + rectWidth/2, 40);
     // Drawing Line between dates
      
     // 
      this.contextX.closePath();
      this.contextX.stroke();
    
    }

  }
/** Functions for panning the canvas
  *  
  */
  onMouseDown(event) {
    this.panning = true;
    this.mStartX = event.clientX - 40;
    this.mStartY = event.clientY - 40;
  }
  onMouseMove(event) {
    if (this.panning) {
      this.extremesSet = false;
      let scrollSpdX = 1;
      let scrollSpdY = 1;
      if (this.scale[0] < 1.25) { scrollSpdX = 12 }
      else if (this.scale[0] < 2.5) { scrollSpdX = 6 }
      else if (this.scale[0] < 5) { scrollSpdX = 3 }
      else if (this.scale[0] >= 5 && this.scale[0] < 10) { scrollSpdX = 1.5 }
      else if(this.scale[0] >= 10){ scrollSpdX = 0.7}
      this.mTempX = (event.clientX - 40 - this.mStartX) * scrollSpdX;
      this.mTempY = (event.clientY - 40 - this.mStartY) * scrollSpdY;
      this.contextMain.clearRect(0, 0, 20000, 10000);
      this.contextX.clearRect(0, 0, 20000, 500);
      this.contextY.clearRect(0, 0, 500, 10000);

      this.updateDataObject(false, true);
      this.mStartX = event.clientX - 40;
      this.mStartY = event.clientY - 40;
      
    }
  }
  onMouseLeave(event) {
    this.panning = false;
  }
  onMouseUp(event) {
    this.panning = false;
  }
/** Scaling on mousewheel function
  *   
  */
  onMouseWheel(event) {
    this.contextX.clearRect(0, 0, 20000, 500);
    this.contextY.clearRect(0, 0, 500, 10000);
    this.contextMain.clearRect(0, 0, 20000, 10000);
    if (event.deltaY > 0) {
      //Zoom Out
      if (this.scale[0] > 0.625) {
        this.scale[0] /= 2;
        this.scale[1] *= 2;
        this.rectWidth /= 2;
        this.contextMain.scale(0.5, 1);
        this.contextX.scale(0.5, 1);
        this.contextY.scale(1, 1);
      } 
    } else {
      //Zoom In
      if (this.scale[0] < 10) {
        this.scale[0] *= 2;
        this.scale[1] /= 2;
        this.rectWidth *= 2;
        this.contextMain.scale(2, 1);
        this.contextX.scale(2, 1);
        this.contextY.scale(1, 1);
      }
    }
    this.testDraw();
  }
/** Preparing pips Array 
  * 
  */
 // Getting all pip values without repeating price in array
  getPips() {
    this.pRange = Math.round((this.priceMax - this.priceMin) * 100000);
    this.pips = [this.pRange];
    this.pips[0] = this.priceMin;
    let x = this.priceMax * 100000;
    for (let index = 1; index < this.pRange; index++) {
      if ((this.pips[index - 1]) * 100000 < x) {
        let tx = this.pips[index - 1];
        let ty = ((tx * 100000 + 1) / 100000);
        this.pips[index] = ty.toFixed(5);
      }
    }
  }





}
