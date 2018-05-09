export class DataConstructor {
    constructor(
      public bullish: boolean,
      public xCoord: number,
      public yCoord: number,
      public rectWidth: number,
      public time: string,
      public open: number,
      public close: number,
      public high: number,
      public low: number
      ) { }
  }