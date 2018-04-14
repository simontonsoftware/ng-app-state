import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { NasModelModule, ngAppStateReducer } from 'ng-app-state';
import { AppComponent } from './app.component';
import { IntegrationStore } from './integration-store';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] }),
    NasModelModule,
  ],
  declarations: [AppComponent],
  providers: [IntegrationStore],
  bootstrap: [AppComponent],
})
export class AppModule {}
