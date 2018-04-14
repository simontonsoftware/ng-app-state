/*
 * Adapted from https://github.com/angular/angular/blob/master/packages/forms/test/value_accessor_integration_spec.ts
 */

import { Component, Injectable, Input, Type } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Store, StoreModule } from '@ngrx/store';
import { AppStore } from '../app-store';
import { ngAppStateReducer } from '../meta-reducer';
import { NasModelModule } from './nas-model.module';

describe('value accessors', () => {
  let fixture: ComponentFixture<any>;

  function detectChanges() {
    fixture.detectChanges();
  }

  function query(css: string) {
    return queryAll(css)[0];
  }

  function queryAll(css: string) {
    return fixture.debugElement
      .queryAll(By.css(css))
      .map((el) => el.nativeElement);
  }

  function initTest<C, S>(
    component: Type<C>,
    storeType: Type<S>,
    {
      extraDirectives = [] as Array<Type<any>>,
      template = '',
      beforeCreate = () => {},
    } = {},
  ) {
    if (template) {
      TestBed.overrideComponent(component, { set: { template } });
    }
    TestBed.configureTestingModule({
      declarations: [component, ...extraDirectives],
      imports: [
        FormsModule,
        StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] }),
        NasModelModule,
      ],
      providers: [storeType],
    });

    beforeCreate();
    fixture = TestBed.createComponent<C>(component);
    return TestBed.get(storeType) as S;
  }

  describe('select controls', () => {
    describe('in template-driven forms', () => {
      it(
        'with option values that are objects',
        fakeAsync(() => {
          const store = initTest(CityComponent, CityStore);
          const cities = [{ name: 'SF' }, { name: 'NYC' }, { name: 'Buffalo' }];
          store.set({ cities, selectedCity: cities[1] });
          detectChanges();
          tick();

          const select = query('select');
          const nycOption = queryAll('option')[1];

          // model -> view
          expect(select.value).toEqual('1: Object');
          expect(nycOption.selected).toBe(true);

          select.value = '2: Object';
          dispatchEvent(select, 'change');
          detectChanges();
          tick();

          // view -> model
          expect(store.state().selectedCity['name']).toEqual('Buffalo');
        }),
      );

      it(
        'when new options are added',
        fakeAsync(() => {
          const store = initTest(CityComponent, CityStore);
          const cities = [{ name: 'SF' }, { name: 'NYC' }];
          store.set({
            cities,
            selectedCity: cities[1],
          });
          detectChanges();
          tick();

          const newCity = { name: 'Buffalo' };
          store.set({
            cities: [...cities, newCity],
            selectedCity: newCity,
          });
          detectChanges();
          tick();

          const select = query('select');
          const buffalo = queryAll('option')[2];
          expect(select.value).toEqual('2: Object');
          expect(buffalo.selected).toBe(true);
        }),
      );

      it(
        'when options are removed',
        fakeAsync(() => {
          const store = initTest(CityComponent, CityStore);
          const cities = [{ name: 'SF' }, { name: 'NYC' }];
          store.set({
            cities,
            selectedCity: cities[1],
          });
          detectChanges();
          tick();

          const select = query('select');
          expect(select.value).toEqual('1: Object');

          store('cities').mutateUsing((state) => {
            state.pop();
          });
          detectChanges();
          tick();

          expect(select.value).not.toEqual('1: Object');
        }),
      );

      it(
        'when option values have same content, but different identities',
        fakeAsync(() => {
          const store = initTest(CityComponent, CityStore);
          const cities = [{ name: 'SF' }, { name: 'NYC' }, { name: 'NYC' }];
          store.set({
            cities,
            selectedCity: cities[0],
          });
          detectChanges();
          tick();

          store('selectedCity').set(cities[2]);
          detectChanges();
          tick();

          const select = query('select');
          const secondNYC = queryAll('option')[2];
          expect(select.value).toEqual('2: Object');
          expect(secondNYC.selected).toBe(true);
        }),
      );

      it(
        'should work with null option',
        fakeAsync(() => {
          const store = initTest(CityComponent, CityStore, {
            template: citySelectWithNullTemplate,
          });
          store.set({
            cities: [{ name: 'SF' }, { name: 'NYC' }],
            selectedCity: null,
          });
          detectChanges();
          tick();

          const select = query('select');

          select.value = '2: Object';
          dispatchEvent(select, 'change');
          detectChanges();
          tick();
          expect(store.state().selectedCity['name']).toEqual('NYC');

          select.value = '0: null';
          dispatchEvent(select, 'change');
          detectChanges();
          tick();
          expect(store.state().selectedCity).toEqual(null!);
        }),
      );

      it(
        'should compare options using provided compareWith function',
        fakeAsync(() => {
          const store = initTest(CityComponent, CityStore, {
            template: citySelectWithCustomCompareFnTemplate,
          });
          store.set({
            selectedCity: { id: 1, name: 'SF' },
            cities: [{ id: 1, name: 'SF' }, { id: 2, name: 'LA' }],
          });
          detectChanges();
          tick();

          const select = query('select');
          const sfOption = query('option');
          expect(select.value).toEqual('0: Object');
          expect(sfOption.selected).toBe(true);
        }),
      );

      it(
        'should support re-assigning the options array with compareWith',
        fakeAsync(() => {
          const store = initTest(CityComponent, CityStore, {
            template: citySelectWithCustomCompareFnTemplate,
          });
          store.set({
            selectedCity: { id: 1, name: 'SF' },
            cities: [{ id: 1, name: 'SF' }, { id: 2, name: 'NY' }],
          });
          detectChanges();
          tick();

          // Option IDs start out as 0 and 1, so setting the select value to "1: Object"
          // will select the second option (NY).
          const select = query('select');
          select.value = '1: Object';
          dispatchEvent(select, 'change');
          detectChanges();

          expect(store.state().selectedCity).toEqual({ id: 2, name: 'NY' });

          store('cities').set([{ id: 1, name: 'SF' }, { id: 2, name: 'NY' }]);
          detectChanges();
          tick();

          // Now that the options array has been re-assigned, new option instances will
          // be created by ngFor. These instances will have different option IDs, subsequent
          // to the first: 2 and 3. For the second option to stay selected, the select
          // value will need to have the ID of the current second option: 3.
          const nyOption = queryAll('option')[1];
          expect(select.value).toEqual('3: Object');
          expect(nyOption.selected).toBe(true);
        }),
      );
    });
  });

  describe('select multiple controls', () => {
    describe('in template-driven forms', () => {
      let store: MultipleCityStore;

      beforeEach(() => {
        store = initTest(MultipleCityComponent, MultipleCityStore);
        store('cities').set([
          { name: 'SF' },
          { name: 'NYC' },
          { name: 'Buffalo' },
        ]);
      });

      const detectChangesAndTick = (): void => {
        detectChanges();
        tick();
      };

      const setSelectedCities = (selectedCities: any): void => {
        store('selectedCities').set(selectedCities);
        detectChangesAndTick();
      };

      const selectOptionViaUI = (valueString: string): void => {
        const select = query('select');
        select.value = valueString;
        dispatchEvent(select, 'change');
        detectChangesAndTick();
      };

      const assertOptionElementSelectedState = (
        selectedStates: boolean[],
      ): void => {
        const options = queryAll('option');
        if (options.length !== selectedStates.length) {
          throw 'the selected state values to assert does not match the number of options';
        }
        for (let i = 0; i < selectedStates.length; i++) {
          expect(options[i].selected).toBe(selectedStates[i]);
        }
      };

      it(
        'should reflect state of model after option selected and new options subsequently added',
        fakeAsync(() => {
          setSelectedCities([]);

          selectOptionViaUI('1: Object');
          assertOptionElementSelectedState([false, true, false]);

          store('cities').mutateUsing((cities) => {
            cities.push({ name: 'Chicago' });
          });
          detectChangesAndTick();

          assertOptionElementSelectedState([false, true, false, false]);
        }),
      );

      it(
        'should reflect state of model after option selected and then other options removed',
        fakeAsync(() => {
          setSelectedCities([]);

          selectOptionViaUI('1: Object');
          assertOptionElementSelectedState([false, true, false]);

          store('cities').mutateUsing((cities) => {
            cities.pop();
          });
          detectChangesAndTick();

          assertOptionElementSelectedState([false, true]);
        }),
      );
    });

    it(
      'should compare options using provided compareWith function',
      fakeAsync(() => {
        const store = initTest(MultipleCityComponent, MultipleCityStore, {
          template: multipleCityWithCustomCompareFnTemplate,
        });
        const cities = [{ id: 1, name: 'SF' }, { id: 2, name: 'LA' }];
        store.assign({
          cities,
          selectedCities: [cities[0]],
        });
        detectChanges();
        tick();

        const select = query('select');
        const sfOption = query('option');
        expect(select.value).toEqual('0: Object');
        expect(sfOption.selected).toBe(true);
      }),
    );
  });

  describe('should support <type=radio>', () => {
    describe('in template-driven forms', () => {
      it(
        'should support basic functionality',
        fakeAsync(() => {
          const store = initTest(MenuComponent, MenuStore);
          store('food').set('fish');
          detectChanges();
          tick();

          // model -> view
          const inputs = queryAll('input');
          expect(inputs[0].checked).toEqual(false);
          expect(inputs[1].checked).toEqual(true);

          dispatchEvent(inputs[0], 'change');
          tick();

          // view -> model
          expect(store.state().food).toEqual('chicken');
          expect(inputs[1].checked).toEqual(false);
        }),
      );

      it(
        'should support multiple named <type=radio> groups',
        fakeAsync(() => {
          const store = initTest(MenuComponent, MenuStore);
          store.assign({ food: 'fish', drink: 'sprite' });
          detectChanges();
          tick();

          const inputs = queryAll('input');
          expect(inputs[0].checked).toEqual(false);
          expect(inputs[1].checked).toEqual(true);
          expect(inputs[2].checked).toEqual(false);
          expect(inputs[3].checked).toEqual(true);

          dispatchEvent(inputs[0], 'change');
          tick();

          expect(store.state().food).toEqual('chicken');
          expect(store.state().drink).toEqual('sprite');
          expect(inputs[1].checked).toEqual(false);
          expect(inputs[2].checked).toEqual(false);
          expect(inputs[3].checked).toEqual(true);
        }),
      );

      it(
        'should support initial undefined value',
        fakeAsync(() => {
          initTest(MenuComponent, MenuStore);
          detectChanges();
          tick();

          const inputs = queryAll('input');
          expect(inputs[0].checked).toEqual(false);
          expect(inputs[1].checked).toEqual(false);
          expect(inputs[2].checked).toEqual(false);
          expect(inputs[3].checked).toEqual(false);
        }),
      );

      it(
        'should support resetting properly',
        fakeAsync(() => {
          const store = initTest(MenuComponent, MenuStore);
          store('food').set('chicken');
          detectChanges();
          tick();

          const form = query('form');
          form.reset();
          detectChanges();
          tick();

          const inputs = queryAll('input');
          expect(inputs[0].checked).toEqual(false);
          expect(inputs[1].checked).toEqual(false);
        }),
      );

      it(
        'should support setting value to null and undefined',
        fakeAsync(() => {
          const store = initTest(MenuComponent, MenuStore);
          store('food').set('chicken');
          detectChanges();
          tick();

          store('food').set(null!);
          detectChanges();
          tick();

          const inputs = queryAll('input');
          expect(inputs[0].checked).toEqual(false);
          expect(inputs[1].checked).toEqual(false);

          store('food').set('chicken');
          detectChanges();
          tick();

          store('food').set(undefined!);
          detectChanges();
          tick();
          expect(inputs[0].checked).toEqual(false);
          expect(inputs[1].checked).toEqual(false);
        }),
      );

      // TODO: find a way to make this fail when there is no delay in `RadioValueAccessor.writeValue`
      // it(
      //   'starts with the correct value',
      //   fakeAsync(() => {
      //     initModule(NasModelRadioForm);
      //     const store: MenuStore = TestBed.get(MenuStore);
      //     store('food').set('chicken');
      //     tick();
      //
      //     const fixture = initComponent(NasModelRadioForm);
      //     detectChanges();
      //     tick();
      //
      //     const inputs = queryAll('input');
      //     expect(inputs[0].checked).toEqual(true);
      //     expect(inputs[1].checked).toEqual(false);
      //     expect(inputs[2].checked).toEqual(false);
      //     expect(inputs[3].checked).toEqual(false);
      //   }),
      // );
    });
  });

  describe('should support <type=range>', () => {
    describe('in template-driven forms', () => {
      it(
        'with basic use case',
        fakeAsync(() => {
          const store = initTest(AnyComponent, AnyStore);

          // model -> view
          store.set(4);
          detectChanges();
          tick();
          const input = query('input');
          expect(input.value).toBe('4');
          detectChanges();
          tick();
          const newVal = '4';
          fixture.debugElement
            .query(By.css('input'))
            .triggerEventHandler('input', { target: { value: newVal } });
          tick();

          // view -> model
          detectChanges();
          expect(typeof store.state()).toBe('number');
        }),
      );
    });
  });

  describe('custom value accessors', () => {
    describe('in template-driven forms', () => {
      it(
        'should support standard writing to view and model',
        async(() => {
          const store = initTest(NameComponent, NameStore, {
            extraDirectives: [InnerNameComponent],
          });

          store('name').set('Nancy');
          detectChanges();
          fixture.whenStable().then(() => {
            detectChanges();
            fixture.whenStable().then(() => {
              // model -> view
              const customInput = query('[name="custom"]');
              expect(customInput.value).toEqual('Nancy');

              customInput.value = 'Carson';
              dispatchEvent(customInput, 'input');
              detectChanges();

              // view -> model
              expect(store.state().name).toEqual('Carson');
            });
          });
        }),
      );
    });
  });
});

function dispatchEvent(domElement: EventTarget, type: string) {
  domElement.dispatchEvent(new Event(type));
}

class StoreComponent<T extends object> {
  store: AppStore<T>;
  compareFn: (o1: any, o2: any) => boolean = (o1: any, o2: any) =>
    o1 && o2 ? o1.id === o2.id : o1 === o2;

  constructor(store: AppStore<T>) {
    this.store = store.withCaching();
  }
}

//
// Select City
//

class CityState {
  selectedCity: any = {};
  cities: any[] = [];
}

@Injectable()
class CityStore extends AppStore<CityState> {
  constructor(store: Store<any>) {
    super(store, 'cityStore', new CityState());
  }
}

const citySelectWithNullTemplate = `
  <select [nasModel]="store('selectedCity')">
    <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
      {{c.name}}
    </option>
    <option [ngValue]="null">Unspecified</option>
  </select>
`;
const citySelectWithCustomCompareFnTemplate = `
  <select [nasModel]="store('selectedCity')" [compareWith]="compareFn">
    <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
      {{c.name}}
    </option>
  </select>
`;

@Component({
  selector: 'city',
  template: `
    <select [nasModel]="store('selectedCity')">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{c.name}}
      </option>
    </select>
  `,
})
class CityComponent extends StoreComponent<CityState> {
  constructor(store: CityStore) {
    super(store);
  }
}

//
// Select Multiple Cities
//

class MultipleCityState {
  selectedCities: any[] = [];
  cities: any[] = [];
}

@Injectable()
class MultipleCityStore extends AppStore<MultipleCityState> {
  constructor(store: Store<any>) {
    super(store, 'mulitpleCityStore', new MultipleCityState());
  }
}

const multipleCityWithCustomCompareFnTemplate = `
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
  selector: 'multiple-city',
  template: `
    <select multiple [nasModel]="store('selectedCities')">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{c.name}}
      </option>
    </select>
  `,
})
class MultipleCityComponent extends StoreComponent<MultipleCityState> {
  constructor(store: MultipleCityStore) {
    super(store);
  }
}

//
// Radio Button Menu
//

class MenuState {
  food: string;
  drink: string;
}

@Injectable()
class MenuStore extends AppStore<MenuState> {
  constructor(store: Store<any>) {
    super(store, 'menuStore', new MenuState());
  }
}

@Component({
  selector: 'menu',
  template: `
    <form>
      <input type="radio" [nasModel]="store('food')" value="chicken">
      <input type="radio" [nasModel]="store('food')" value="fish">
      <input type="radio" [nasModel]="store('drink')" value="cola">
      <input type="radio" [nasModel]="store('drink')" value="sprite">
    </form>
  `,
})
class MenuComponent extends StoreComponent<MenuState> {
  constructor(store: MenuStore) {
    super(store);
  }
}

//
// Any
//

@Injectable()
class AnyStore extends AppStore<any> {
  constructor(store: Store<any>) {
    super(store, 'anyStore', undefined);
  }
}

@Component({
  selector: 'any',
  template: '<input type="range" [nasModel]="store">',
})
class AnyComponent extends StoreComponent<any> {
  constructor(store: AnyStore) {
    super(store);
  }
}

//
// Name
//

class NameState {
  name: string;
  isDisabled = false;
}

@Injectable()
class NameStore extends AppStore<NameState> {
  constructor(store: Store<any>) {
    super(store, 'nameStore', new NameState());
  }
}

@Component({
  selector: 'ng-model-custom-wrapper',
  template: `
    <inner-name [nasModel]="store('name')" [disabled]="isDisabled"></inner-name>
  `,
})
export class NameComponent extends StoreComponent<NameState> {
  isDisabled = false;

  constructor(store: NameStore) {
    super(store);
  }
}

@Component({
  selector: 'inner-name',
  template: `
    <input
      name="custom"
      [(ngModel)]="model"
      (ngModelChange)="changeFn($event)"
      [disabled]="isDisabled"
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
  model: string;
  @Input('disabled') isDisabled = false;
  changeFn: (value: any) => void;

  writeValue(value: any) {
    this.model = value;
  }

  registerOnChange(fn: (value: any) => void) {
    this.changeFn = fn;
  }

  registerOnTouched() {}

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }
}
