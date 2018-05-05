import { TestBed, inject } from '@angular/core/testing';

import { NgAppStateService } from './ng-app-state.service';

describe('NgAppStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgAppStateService]
    });
  });

  it('should be created', inject([NgAppStateService], (service: NgAppStateService) => {
    expect(service).toBeTruthy();
  }));
});
