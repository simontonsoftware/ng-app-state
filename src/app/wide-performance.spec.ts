import { TestBed } from "@angular/core/testing";
import { StoreModule } from "@ngrx/store";
import { ngAppStateReducer } from "../../projects/ng-app-state/src/lib/meta-reducer";
import { WidePerformanceComponent } from "./wide-performance.component";

describe("WidePerformanceComponent", () => {
  it("runs within the expected time", async () => {
    await TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] })],
      declarations: [WidePerformanceComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(WidePerformanceComponent);

    const start = new Date().getTime();
    fixture.componentInstance.run();
    expect(new Date().getTime() - start).toBeLessThan(50);
  });
});
