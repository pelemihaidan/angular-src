import { Injectable } from '@angular/core';
import { Http , Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
 
const apiUrl = 'http://localhost:8080';
@Injectable()
export class ApiService {
  public api = apiUrl;
  constructor(private http : Http) { 
    
  }

  // getSymbolData():Observable<any>{
  //   return this.http.get(this.api)
  // }
  
  public getData(){
    return this.http
      .get(apiUrl)
      .map(response => {
        let data = response.json();
        console.log(data)
        return data; 
      });
     
  }

}
export class Data {

}
