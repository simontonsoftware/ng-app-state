import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { CounterStore } from './counter-store';
import { MyAppComponent } from './my-app.component';

@NgModule({
  declarations: [
    MyAppComponent,
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({}),
  ],
  providers: [
    CounterStore,
  ],
  bootstrap: [MyAppComponent],
})
export class AppModule {}
