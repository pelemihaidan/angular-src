import { Injectable } from '@angular/core';
import { Http , Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
 
const apiUrl = 'http://localhost:8080';
@Injectable()
export class ApiService {
  public api = apiUrl;
  constructor(private http: Http) {

  }
  
  public getData(url,p) {
    const params = {
      'symbol': p[0],
      'granularity': p[1],
      'from': p[2]
    }
    return this.http
      .get(url, { params: params })
      .map(response => {
        let data = response.json();
        //console.log(data)
        return data;
      });
  }

}
export class Data {

}
