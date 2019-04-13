import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { ActionReducer, StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { NasModelModule, ngAppStateReducer } from "ng-app-state";
import { storeLogger } from "ngrx-store-logger";
import { environment } from "../environments/environment";
import { AppComponent } from "./app.component";
import { DeepPerformanceComponent } from "./deep-performance/deep-performance.component";
import { IntegrationStore } from "./integration-store";
import { WidePerformanceComponent } from "./wide-performance/wide-performance.component";

export function logger(reducer: ActionReducer<any>): any {
  return storeLogger({ collapsed: true })(reducer);
}

export const metaReducers = [ngAppStateReducer];
if (!environment.production) {
  metaReducers.push(logger);
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    StoreModule.forRoot({}, { metaReducers }),
    StoreDevtoolsModule.instrument(),
    NasModelModule,
  ],
  declarations: [
    AppComponent,
    WidePerformanceComponent,
    DeepPerformanceComponent,
  ],
  providers: [IntegrationStore],
  bootstrap: [AppComponent],
})
export class AppModule {}
