import { 
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  OnDestroy, 
  OnInit 
} from '@angular/core';
import { DataConstructor } from "./data";
import { ApiService } from "..//..//services/api.service";
import { SymbolInfoService } from "..//..//services/symbol-info.service";
import { Observable, Subscription, Subject } from "rxjs";
import "rxjs/add/operator/takeUntil";

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  providers: [ApiService, SymbolInfoService]
})
export class ChartComponent implements OnDestroy, OnInit {

  //#region TOOLBAR Variable Initialization
  isVisible = false;
  public symbolList = [];
  public p = ["EUR_USD", "M5", " "];
  public query ='';

  public trendlineActive = false;
  public timeFrame = "";
  public timeFrameOptions = ["S5","M5","M15","M30","H1","D"];
  //#endregion TOOLBAR Variable Initialization

  //#region CHART Variable Initialization

  //References
  @ViewChild("myCanvas") myCanvas: ElementRef;
  @ViewChild("myCanvasTop") myCanvasTop: ElementRef;
  @ViewChild("yAxisCanvas") yAxisCanvas: ElementRef;
  @ViewChild("xAxisCanvas") xAxisCanvas: ElementRef;
  public contextMain: CanvasRenderingContext2D;
  public contextMainTop: CanvasRenderingContext2D;
  public contextX: CanvasRenderingContext2D;
  public contextY: CanvasRenderingContext2D;


  //Variables 
  /* Variables for data storage and looping */
  public symbolData;
  public imgData;
  private lastCandle = "";
  public mockupdata = [];
  private hasNewElements = true;
  private interval;
  private interval2;
  /* Variables for drawing and saving draw starting coordonates  */
  public currentX = 0;
  public currentY = 1000;
  public firstX = 0;
  public firstY = 1000;
  private firstDraw = true; 
  /* Variables for mouse postition and offset */
  public panning = false;
  public mStartX = 0;
  public mStartY = 0;
  public mTempX = 0;
  public mTempY = 0;
  /* Variables for candle height and width */
  public rectHeight = 10;
  public rectWidth = 10;
  /* Variable for scaling */
  public scale = [5, 5];
  public scaleNr = 0 ;
  /* Variables for yAxis */
  public pips = {
    prices: [],
    priceMin: {
      value: 0,
      yCoord: 0
    },
    priceMax: {
      value: 0,
      yCoord: 0
    },
    range: 0,
    extremesSet: false
  };
  //#endregion CHART Variable Initialization

  constructor(private api: ApiService, private pData: SymbolInfoService) { 

  }
  
  ngOnInit() {
    // Toolbar --------------------------------------------------------------------------
    this.getDataToolbar("/list");
  
    // Chart ----------------------------------------------------------------------------
    this.interval = setInterval(() => this.getData(), 200);
    setTimeout(() => {
      clearInterval(this.interval);
    }, 300);
    this.interval2 = setInterval(() => this.getData(), 5000);
    this.pData.currentP.subscribe(res => {
      this.p = res;
      console.log("chartSub Exec ... new P = "+this.p);
    });
      
    
  }
  ngOnDestroy(): void {
    console.log("destroyed");
    clearInterval(this.interval2);
  }
  ngAfterViewInit(): void {
    this.contextX = (this.xAxisCanvas
      .nativeElement as HTMLCanvasElement).getContext("2d");
    this.contextY = (this.yAxisCanvas
      .nativeElement as HTMLCanvasElement).getContext("2d");
    this.contextMain = (this.myCanvas
      .nativeElement as HTMLCanvasElement).getContext("2d");
    this.contextMainTop = (this.myCanvasTop
      .nativeElement as HTMLCanvasElement).getContext("2d");

    this.updateDataObject(false, true, this.firstDraw);
  }
  //#region TOOLBAR Methods
  onClick(event){
    this.isVisible = true;
  }
  mouseLeave(){
    this.isVisible = false;
  }
  addSymbol(){
    console.log(this.query);
    this.p[0] = this.query;
    this.p[1] = this.timeFrame;
    this.p[2] = " ";
    this.resetCoords();
    

    this.mockupdata = [];
    
  }
  getDataToolbar(value: string) {
    let url = value;
    this.api.getData(url, this.p).subscribe(data => {
      this.symbolList = data['instruments'];
    });
    console.log("Got Sybmol List");
  }
  fillInput(value){
    this.query = value;
  }
  triggerTrendline(){
    this.trendlineActive = true;
  }
  setTempTf(value){
    this.timeFrame = value;
  }
  //#endregion TOOLBAR Methods


  //#region CHART Methods
  resetCoords(){
    this.contextX.clearRect(0, 0, 20000, 500);
    this.contextY.clearRect(0, 0, 500, 10000);
    this.contextMain.clearRect(0, 0, 20000, 10000);

    this.currentX = 0;
    this.currentY = 1000;
    this.firstX = 0;
    this.firstY = 1000;
    this.firstDraw = true; 
    this.scale = [5,5];

    this.contextMain.setTransform(1,0,0,1,0,0);
    this.contextX.setTransform(1,0,0,1,0,0);
    while (this.scaleNr != 0 ){
      if (this.scaleNr > 0){
        this.contextMain.scale(0.5, 1);
        this.contextX.scale(0.5, 1);
        this.scaleNr--;
      }
      else {
        this.contextMain.scale(2, 1);
        this.contextX.scale(2, 1);
        this.scaleNr++;
      }
    }

    this.hasNewElements = true;
    this.lastCandle = "";

    this.pips = {
      prices: [],
      priceMin: {
        value: 0,
        yCoord: 0
      },
      priceMax: {
        value: 0,
        yCoord: 0
      },
      range: 0,
      extremesSet: false
    };
  }
  /** Getting Data from server
   *
   */
   getData() {
    let url = "/chart";
    this.api.getData(url, this.p).subscribe(data => {
      this.symbolData = data;
      console.log(this.symbolData);
      let a = this.symbolData["candles"][this.symbolData["candles"].length - 1][
        "time"
      ];
      this.p[2] = a;
      console.log(this.lastCandle);
      if (a !== this.lastCandle) {
        console.log("newElement = true");
        //this.hasNewElements = true;
      } else {
        console.log("newElement = false");
        this.hasNewElements = false;
      }
      this.currentX = 0 + this.mTempX;
      this.currentY = 1000 + this.mTempY;
      this.setDataObject(this.hasNewElements);
    });
  }
  /** Test Draw Method
   *
   */
  testDraw() {
    this.updateDataObject(false, true, this.firstDraw);
  }
  /** Populating mockupdata object with data from the Api for the first time
   *
   */
  setDataObject(hasNewElements) {
    if (hasNewElements) {
      this.contextX.clearRect(0, 0, 20000, 500);
      this.contextY.clearRect(0, 0, 500, 10000);
      this.contextMain.clearRect(0, 0, 20000, 10000);

      this.symbolData["candles"].forEach(element => {
        let x = this.currentX;
        let y = this.currentY;
        let bullish = false;
        let em = element["mid"];
        let e = element;
        if (em["o"] - em["c"] <= 0) {
          bullish = true;
        } else {
          bullish = false;
        }
        this.mockupdata.push(
          new DataConstructor(
            bullish,
            x,
            y,
            this.rectWidth,
            e["time"],
            em["o"],
            em["c"],
            em["h"],
            em["l"]
          )
        );
        this.lastCandle = e["time"];
        this.currentY += Math.round((em["o"] - em["c"]) * 100000);
        this.currentX += this.rectWidth;
      });

      
      this.updateDataObject(false, true, this.firstDraw);
    } else {
      return;
    }
  }
  /** Updating mockupdata object Function
   *
   */

  updateDataObject(hasNewElements, isMouseDown, firstDraw) {
    // Logic if updateDataObject() was called from a scaling or panning function.
    if (firstDraw === true) {
      //this.firstDraw = false;
    }
    if (hasNewElements === false) {
      // Updating x and y coordonates for each element in mockupdata object
      this.draw();
      this.mockupdata.forEach(element => {
        element["xCoord"] += this.mTempX;
        element["yCoord"] += this.mTempY;
      });

    }
    if (hasNewElements === true) {
      // Exec if there is a new candle in mockupData
    }
  }
  
  private draw() {
    this.mockupdata.forEach(element => {
      let e = element;
      this.drawChart(
        e["bullish"],
        e["xCoord"],
        e["yCoord"],
        e["rectWidth"],
        e["time"],
        e["open"],
        e["close"],
        e["high"],
        e["low"]
      );
    });
    this.drawXChart();
    this.drawYChart();
    // Drawing line on X axis
    this.contextX.beginPath();
    this.contextX.moveTo(-1000 + this.mTempX, 0);
    this.contextX.lineWidth = 2;
    this.contextX.strokeStyle = "white";
    this.contextX.lineTo(2000 * this.scale[1] + this.mTempX, 0);
    this.contextX.closePath();
    this.contextX.stroke();
  }
  drawImage() {
    this.imgData = this.contextMain.getImageData(
      this.firstX,
      this.firstY,
      this.currentX,
      this.currentY
    );
    this.contextMain.putImageData(this.imgData, this.firstX, this.firstY);
  }
  /** Drawing Functions
   *
   */
  drawChart(bullish, x, y, rectWidth, time, open, close, high, low) {
    let tHigh = Math.round((open - high) * 100000);
    let range = Math.round((high - low) * 100000);
    let posHigh = y + tHigh;
    let tHeight = Math.round((open - close) * 100000);
    // Drawing High->Low Line on contextMain
    this.contextMain.beginPath();
    this.contextMain.lineWidth = 1;
    this.contextMain.strokeStyle = "white";
    this.contextMain.moveTo(
      x + this.mTempX + rectWidth / 2,
      posHigh + this.mTempY
    );
    this.contextMain.lineTo(
      x + this.mTempX + rectWidth / 2,
      posHigh + this.mTempY + range
    );
    this.contextMain.closePath();
    this.contextMain.stroke();
    // Setting Max/Min Coordonates of maxHigh/minLow price
    if (this.pips.extremesSet === false) {
      this.pips.priceMax.value = high;
      this.pips.priceMin.value = low;
      this.pips.extremesSet = true;
    } else {
      if (this.pips.priceMax.value < high) {
        this.pips.priceMax.value = high;
        this.pips.priceMax.yCoord = posHigh + this.mTempY;
      }
      if (this.pips.priceMin.value > low) {
        this.pips.priceMin.value = low;
        this.pips.priceMin.yCoord = posHigh + this.mTempY + range;
      }
    }
    // Drawing Rectangles on contextMain
    if (tHeight === 0) {
      this.contextMain.fillStyle = "white";
      this.contextMain.fillRect(x + this.mTempX, y + this.mTempY, rectWidth, 1);
    } else {
      if (bullish) {
        this.contextMain.fillStyle = "green";
      } else {
        this.contextMain.fillStyle = "red";
      }
      this.contextMain.fillRect(
        x + this.mTempX,
        y + this.mTempY,
        rectWidth,
        tHeight
      );
    }
  }

  // Drawing on Y axis
  drawYChart() {
    this.getPips();
    let tpMinCoord = this.pips.priceMin.yCoord;
    this.pips.prices.forEach(price => {
      let tLogic = Math.round(price * 100000);
      if (tLogic % 100 === 0) {
        this.contextY.beginPath();
        this.contextY.moveTo(0, tpMinCoord);
        this.contextY.lineWidth = 1;
        this.contextY.strokeStyle = "white";
        this.contextY.lineTo(10, tpMinCoord);
        this.contextY.font = "15px Comic Sans MS";
        this.contextY.fillStyle = "white";
        this.contextY.textAlign = "center";
        this.contextY.fillText(price, 50, tpMinCoord + 4);
        this.contextY.closePath();
        this.contextY.stroke();
      }
      tpMinCoord--;
    });
    this.contextY.beginPath();
    this.contextY.moveTo(0, -1000 + this.mTempX);
    this.contextY.lineWidth = 0.3;
    this.contextY.strokeStyle = "white";
    this.contextY.lineTo(0, 2000 + this.mTempX);
    this.contextY.closePath();
    this.contextY.stroke();
  }
  // Drawing on X axis
  drawXChart() {
    this.mockupdata.forEach(element => {
      let x = element["xCoord"];
      let rectWidth = element["rectWidth"];
      let date = new Date(element["time"]);
      if (date.getMinutes() === 0 && date.getSeconds() === 0) {
        // Preparing date strings
        let i = 0;
        let addZero = function(i) {
          if (i < 10) {
            i = "0" + i;
          }
          return i;
        };
        let hh = addZero(date.getHours().toString());
        let mm = addZero(date.getMinutes().toString());
        let ss = addZero(date.getSeconds().toString());
        let time = hh + ":" + mm;
        // Drawing Line
        this.contextX.beginPath();
        this.contextX.moveTo(x + this.mTempX + rectWidth / 2, 0);
        this.contextX.lineWidth = 1;
        this.contextX.strokeStyle = "white";
        this.contextX.lineTo(x + this.mTempX + rectWidth / 2, 10);
        // Drawing Text
        this.contextX.font = "20px Comic Sans MS";
        this.contextX.fillStyle = "white";
        this.contextX.textAlign = "center";
        this.contextX.fillText(time, x + this.mTempX + rectWidth / 2, 40);
        this.contextX.closePath();
        this.contextX.stroke();
      }
    });
  }
  /** Functions for panning the canvas
   *
   */
  onMouseDown(event) {
    console.log(this.p);
    
    this.mStartX = event.clientX - 40;
    this.mStartY = event.clientY - 40;
    if(!this.trendlineActive){
      this.panning = true;
    }
    
  }
  onMouseMove(event) {
    if (this.panning) {
      this.pips.extremesSet = false;
      let clientW = window.innerWidth;
      let clientH = window.innerHeight;
      let scrollSpdX = 50;
      let setSpdX = (value: number) => {
        scrollSpdX = (value + clientW) / clientW;
        return scrollSpdX;
      };
      let scrollSpdY = 1;
      if (this.scale[0] < 1.25) {
        setSpdX(12 * 1000);
      } else if (this.scale[0] < 2.5) {
        setSpdX(6 * 1000);
      } else if (this.scale[0] < 5) {
        setSpdX(3 * 1000);
      } else if (this.scale[0] >= 5 && this.scale[0] < 10) {
        setSpdX(1.5 * 1000);
      } else if (this.scale[0] >= 10) {
        setSpdX(0.7 * 500);
      }
      this.mTempX = (event.clientX - 40 - this.mStartX) * scrollSpdX;
      this.mTempY = (event.clientY - 40 - this.mStartY) * scrollSpdY;
      this.contextMain.clearRect(0, 0, 20000, 10000);
      this.contextX.clearRect(0, 0, 20000, 500);
      this.contextY.clearRect(0, 0, 500, 10000);

      this.updateDataObject(false, true, this.firstDraw);
      this.mStartX = event.clientX - 40;
      this.mStartY = event.clientY - 40;
      //console.log(scrollSpdX);
    }
  }
  onMouseLeave(event) {
    this.panning = false;
    this.trendlineActive = false;
  }
  onMouseUp(event) {
    this.panning = false;
    this.trendlineActive = false;
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
        this.scaleNr--;
        //console.log(window.innerHeight, window.innerWidth);
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
        this.scaleNr++;
      }
    }
    this.testDraw();
  }
  /** Preparing pips Array
   *
   */
  // Getting all pip values without repeating price in array
  getPips() {
    let pips = this.pips;
    pips.range = Math.round(
      (pips.priceMax.value - pips.priceMin.value) * 100000
    );
    pips.prices = [pips.range];
    pips.prices[0] = pips.priceMin.value;
    let x = pips.priceMax.value * 100000;
    for (let index = 1; index < pips.range; index++) {
      if (pips.prices[index - 1] * 100000 < x) {
        let tx = pips.prices[index - 1];
        let ty = (tx * 100000 + 1) / 100000;
        pips.prices[index] = ty.toFixed(5);
      }
    }
  }
  //#endregion CHART Methods
}

