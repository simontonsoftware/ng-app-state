import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { ngAppStateReducer } from 'ng-app-state';
import { CounterStore } from './counter-store';
import { MyAppComponent } from './my-app.component';

@NgModule({
  declarations: [
    MyAppComponent,
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({}, {metaReducers: [ngAppStateReducer]}),
  ],
  providers: [CounterStore],
  bootstrap: [MyAppComponent],
})
export class AppModule {}
