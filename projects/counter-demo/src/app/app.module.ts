import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { counterReducer } from './counter';
import { MyAppComponent } from './my-app.component';

@NgModule({
  imports: [BrowserModule, StoreModule.forRoot({ count: counterReducer })],
  declarations: [MyAppComponent],
  bootstrap: [MyAppComponent],
})
export class AppModule {}
