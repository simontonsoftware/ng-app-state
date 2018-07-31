import { Component, Injectable, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppStore } from './app-store';
import { StoreObject } from './store-object';

class StoreComponent<T extends object> {
  store: StoreObject<T>;
  compareFn: (o1: any, o2: any) => boolean = (o1: any, o2: any) =>
    o1 && o2 ? o1.id === o2.id : o1 === o2;

  constructor(store: AppStore<T>) {
    this.store = store.withCaching();
  }
}

//
// Single Value
//

@Injectable()
export class SingleValueStore extends AppStore<any> {
  constructor(store: Store<any>) {
    super(store, 'singleValueStore', 'old');
  }
}

@Component({ selector: 'nas-single-value' })
export class SingleValueComponent extends StoreComponent<any> {
  constructor(store: SingleValueStore) {
    super(store);
  }
}

//
// Select City
//

export class CityState {
  selectedCity: any = {};
  cities: any[] = [];
}

@Injectable()
export class CityStore extends AppStore<CityState> {
  constructor(store: Store<any>) {
    super(store, 'cityStore', new CityState());
  }
}

export const citySelectWithNullTemplate = `
  <select [nasModel]="store('selectedCity')">
    <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
      {{c.name}}
    </option>
    <option [ngValue]="null">Unspecified</option>
  </select>
`;
export const citySelectWithCustomCompareFnTemplate = `
  <select [nasModel]="store('selectedCity')" [compareWith]="compareFn">
    <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
      {{c.name}}
    </option>
  </select>
`;

@Component({
  selector: 'nas-city',
  template: `
    <select [nasModel]="store('selectedCity')">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{c.name}}
      </option>
    </select>
  `,
})
export class CityComponent extends StoreComponent<CityState> {
  constructor(store: CityStore) {
    super(store);
  }
}

//
// Select Multiple Cities
//

export class MultipleCityState {
  selectedCities: any[] = [];
  cities: any[] = [];
}

@Injectable()
export class MultipleCityStore extends AppStore<MultipleCityState> {
  constructor(store: Store<any>) {
    super(store, 'mulitpleCityStore', new MultipleCityState());
  }
}

export const multipleCityWithCustomCompareFnTemplate = `
  <select
    multiple
    [nasModel]="store('selectedCities')"
    [compareWith]="compareFn"
  >
    <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
      {{c.name}}
    </option>
  </select>
`;

@Component({
  selector: 'nas-multiple-city',
  template: `
    <select multiple [nasModel]="store('selectedCities')">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{c.name}}
      </option>
    </select>
  `,
})
export class MultipleCityComponent extends StoreComponent<MultipleCityState> {
  constructor(store: MultipleCityStore) {
    super(store);
  }
}

//
// Radio Button Menu
//

export class MenuState {
  // prettier-ignore
  food!: string;
  // prettier-ignore
  drink!: string;
}

@Injectable()
export class MenuStore extends AppStore<MenuState> {
  constructor(store: Store<any>) {
    super(store, 'menuStore', new MenuState());
  }
}

@Component({
  selector: 'nas-menu',
  template: `
    <form>
      <input type="radio" [nasModel]="store('food')" value="chicken">
      <input type="radio" [nasModel]="store('food')" value="fish">
      <input type="radio" [nasModel]="store('drink')" value="cola">
      <input type="radio" [nasModel]="store('drink')" value="sprite">
    </form>
  `,
})
export class MenuComponent extends StoreComponent<MenuState> {
  constructor(store: MenuStore) {
    super(store);
  }
}

//
// Name
//

export class NameState {
  // prettier-ignore
  name!: string;
  isDisabled = false;
}

@Injectable()
export class NameStore extends AppStore<NameState> {
  constructor(store: Store<any>) {
    super(store, 'nameStore', new NameState());
  }
}

@Component({
  selector: 'nas-ng-model-custom-wrapper',
  template: `
    <nas-inner-name [nasModel]="store('name')" [disabled]="isDisabled">
    </nas-inner-name>
  `,
})
export class NameComponent extends StoreComponent<NameState> {
  isDisabled = false;

  constructor(store: NameStore) {
    super(store);
  }
}

@Component({
  selector: 'nas-inner-name',
  template: `
    <input
      name="custom"
      [(ngModel)]="model"
      (ngModelChange)="changeFn($event)"
      [disabled]="disabled"
    >
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InnerNameComponent,
    },
  ],
})
export class InnerNameComponent implements ControlValueAccessor {
  // prettier-ignore
  model!: string;
  @Input()
  disabled = false;
  // prettier-ignore
  changeFn!: (value: any) => void;

  writeValue(value: any) {
    this.model = value;
  }

  registerOnChange(fn: (value: any) => void) {
    this.changeFn = fn;
  }

  registerOnTouched() {}

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }
}
