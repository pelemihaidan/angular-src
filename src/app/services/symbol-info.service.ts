import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ArrayType } from '@angular/compiler/src/output/output_ast';

@Injectable()
export class SymbolInfoService {
  private p = ["EUR_USD", "M5", " "]
  private pSource = new BehaviorSubject<any>(this.p);
  currentP = this.pSource.asObservable();

  constructor() { }

  changeValueP(p) {
    this.pSource.next(p);
    console.log("Change Value P Executat");
  }

}
