import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule} from '@angular/http';



import { AppComponent } from './app.component';

import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SymbolbarComponent } from './components/symbolbar/symbolbar.component';
import { ChartComponent } from './components/chart/chart.component';

import { ApiService } from './services/api.service';




@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    SymbolbarComponent,
    ChartComponent
    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
