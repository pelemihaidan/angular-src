import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule} from '@angular/http';



import { AppComponent } from './app.component';



import { ApiService } from './services/api.service';
import { ChartComponent } from './components/chart/chart.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { NewsComponent } from './components/news/news.component';
import { SearchPipe } from './search.pipe';





@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    CalendarComponent,
    NewsComponent,
    SearchPipe,
    
    
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
