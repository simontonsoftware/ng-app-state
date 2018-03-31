/*
 * Adapted from https://github.com/angular/angular/blob/master/packages/forms/test/value_accessor_integration_spec.ts
 */

import {
  Component,
  Directive,
  EventEmitter,
  Injectable,
  Input,
  Output,
  Type,
} from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgForm,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Store, StoreModule } from '@ngrx/store';
import { AppStore } from '../app-store';
import { ngAppStateReducer } from '../meta-reducer';
import { NasModelModule } from './nas-model.module';

describe('value accessors', () => {
  function initTest<T>(
    component: Type<T>,
    ...directives: Type<any>[]
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({
      declarations: [component, ...directives],
      imports: [
        FormsModule,
        StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] }),
        NasModelModule,
      ],
      providers: [CityStore, MultipleCityStore],
    });
    return TestBed.createComponent(component);
  }

  describe('select controls', () => {
    describe('in template-driven forms', () => {
      it(
        'with option values that are objects',
        fakeAsync(() => {
          const fixture = initTest(NasModelSelectForm);
          const store: CityStore = TestBed.get(CityStore);

          const cities = [{ name: 'SF' }, { name: 'NYC' }, { name: 'Buffalo' }];
          store.set({
            cities,
            selectedCity: cities[1],
          });
          fixture.detectChanges();
          tick();

          const select = fixture.debugElement.query(By.css('select'));
          const nycOption = fixture.debugElement.queryAll(By.css('option'))[1];

          // model -> view
          expect(select.nativeElement.value).toEqual('1: Object');
          expect(nycOption.nativeElement.selected).toBe(true);

          select.nativeElement.value = '2: Object';
          dispatchEvent(select.nativeElement, 'change');
          fixture.detectChanges();
          tick();

          // view -> model
          expect(store.state().selectedCity['name']).toEqual('Buffalo');
        }),
      );

      it(
        'when new options are added',
        fakeAsync(() => {
          const fixture = initTest(NasModelSelectForm);
          const store: CityStore = TestBed.get(CityStore);

          const cities = [{ name: 'SF' }, { name: 'NYC' }];
          store.set({
            cities,
            selectedCity: cities[1],
          });
          fixture.detectChanges();
          tick();

          const newCity = { name: 'Buffalo' };
          store.set({
            cities: [...cities, newCity],
            selectedCity: newCity,
          });
          fixture.detectChanges();
          tick();

          const select = fixture.debugElement.query(By.css('select'));
          const buffalo = fixture.debugElement.queryAll(By.css('option'))[2];
          expect(select.nativeElement.value).toEqual('2: Object');
          expect(buffalo.nativeElement.selected).toBe(true);
        }),
      );

      it(
        'when options are removed',
        fakeAsync(() => {
          const fixture = initTest(NasModelSelectForm);
          const store: CityStore = TestBed.get(CityStore);

          const cities = [{ name: 'SF' }, { name: 'NYC' }];
          store.set({
            cities,
            selectedCity: cities[1],
          });
          fixture.detectChanges();
          tick();

          const select = fixture.debugElement.query(By.css('select'));
          expect(select.nativeElement.value).toEqual('1: Object');

          store('cities').mutateUsing((state) => {
            state.pop();
          });
          fixture.detectChanges();
          tick();

          expect(select.nativeElement.value).not.toEqual('1: Object');
        }),
      );

      it(
        'when option values have same content, but different identities',
        fakeAsync(() => {
          const fixture = initTest(NasModelSelectForm);
          const store: CityStore = TestBed.get(CityStore);

          const cities = [{ name: 'SF' }, { name: 'NYC' }, { name: 'NYC' }];
          store.set({
            cities,
            selectedCity: cities[0],
          });
          fixture.detectChanges();
          tick();

          store('selectedCity').set(cities[2]);
          fixture.detectChanges();
          tick();

          const select = fixture.debugElement.query(By.css('select'));
          const secondNYC = fixture.debugElement.queryAll(By.css('option'))[2];
          expect(select.nativeElement.value).toEqual('2: Object');
          expect(secondNYC.nativeElement.selected).toBe(true);
        }),
      );

      it(
        'should work with null option',
        fakeAsync(() => {
          const fixture = initTest(NasModelSelectWithNullForm);
          const store: CityStore = TestBed.get(CityStore);

          store.set({
            cities: [{ name: 'SF' }, { name: 'NYC' }],
            selectedCity: null,
          });
          fixture.detectChanges();
          tick();

          const select = fixture.debugElement.query(By.css('select'));

          select.nativeElement.value = '2: Object';
          dispatchEvent(select.nativeElement, 'change');
          fixture.detectChanges();
          tick();
          expect(store.state().selectedCity['name']).toEqual('NYC');

          select.nativeElement.value = '0: null';
          dispatchEvent(select.nativeElement, 'change');
          fixture.detectChanges();
          tick();
          expect(store.state().selectedCity).toEqual(null!);
        }),
      );

      it(
        'should compare options using provided compareWith function',
        fakeAsync(() => {
          const fixture = initTest(NgModelSelectWithCustomCompareFnForm);
          const store: CityStore = TestBed.get(CityStore);

          store.set({
            selectedCity: { id: 1, name: 'SF' },
            cities: [{ id: 1, name: 'SF' }, { id: 2, name: 'LA' }],
          });
          fixture.detectChanges();
          tick();

          const select = fixture.debugElement.query(By.css('select'));
          const sfOption = fixture.debugElement.query(By.css('option'));
          expect(select.nativeElement.value).toEqual('0: Object');
          expect(sfOption.nativeElement.selected).toBe(true);
        }),
      );

      it(
        'should support re-assigning the options array with compareWith',
        fakeAsync(() => {
          const fixture = initTest(NgModelSelectWithCustomCompareFnForm);
          const store: CityStore = TestBed.get(CityStore);

          store.set({
            selectedCity: { id: 1, name: 'SF' },
            cities: [{ id: 1, name: 'SF' }, { id: 2, name: 'NY' }],
          });
          fixture.detectChanges();
          tick();

          // Option IDs start out as 0 and 1, so setting the select value to "1: Object"
          // will select the second option (NY).
          const select = fixture.debugElement.query(By.css('select'));
          select.nativeElement.value = '1: Object';
          dispatchEvent(select.nativeElement, 'change');
          fixture.detectChanges();

          expect(store.state().selectedCity).toEqual({ id: 2, name: 'NY' });

          store('cities').set([{ id: 1, name: 'SF' }, { id: 2, name: 'NY' }]);
          fixture.detectChanges();
          tick();

          // Now that the options array has been re-assigned, new option instances will
          // be created by ngFor. These instances will have different option IDs, subsequent
          // to the first: 2 and 3. For the second option to stay selected, the select
          // value will need to have the ID of the current second option: 3.
          const nyOption = fixture.debugElement.queryAll(By.css('option'))[1];
          expect(select.nativeElement.value).toEqual('3: Object');
          expect(nyOption.nativeElement.selected).toBe(true);
        }),
      );
    });
  });

  describe('select multiple controls', () => {
    describe('in template-driven forms', () => {
      let fixture: ComponentFixture<NasModelSelectMultipleForm>;
      let store: MultipleCityStore;

      beforeEach(() => {
        fixture = initTest(NasModelSelectMultipleForm);
        store = TestBed.get(MultipleCityStore);
        store('cities').set([
          { name: 'SF' },
          { name: 'NYC' },
          { name: 'Buffalo' },
        ]);
      });

      const detectChangesAndTick = (): void => {
        fixture.detectChanges();
        tick();
      };

      const setSelectedCities = (selectedCities: any): void => {
        store('selectedCities').set(selectedCities);
        detectChangesAndTick();
      };

      const selectOptionViaUI = (valueString: string): void => {
        const select = fixture.debugElement.query(By.css('select'));
        select.nativeElement.value = valueString;
        dispatchEvent(select.nativeElement, 'change');
        detectChangesAndTick();
      };

      const assertOptionElementSelectedState = (
        selectedStates: boolean[],
      ): void => {
        const options = fixture.debugElement.queryAll(By.css('option'));
        if (options.length !== selectedStates.length) {
          throw 'the selected state values to assert does not match the number of options';
        }
        for (let i = 0; i < selectedStates.length; i++) {
          expect(options[i].nativeElement.selected).toBe(selectedStates[i]);
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

    it('should throw an error when compareWith is not a function', () => {
      const fixture = initTest(NasModelSelectMultipleWithCustomCompareFnForm);
      const comp = fixture.componentInstance;
      comp.compareFn = null!;
      expect(() => fixture.detectChanges()).toThrowError(
        /compareWith must be a function, but received null/,
      );
    });

    it(
      'should compare options using provided compareWith function',
      fakeAsync(() => {
        const fixture = initTest(NasModelSelectMultipleWithCustomCompareFnForm);
        const store: MultipleCityStore = TestBed.get(MultipleCityStore);

        const cities = [{ id: 1, name: 'SF' }, { id: 2, name: 'LA' }];
        store.assign({
          cities,
          selectedCities: [cities[0]],
        });
        fixture.detectChanges();
        tick();

        const select = fixture.debugElement.query(By.css('select'));
        const sfOption = fixture.debugElement.query(By.css('option'));
        expect(select.nativeElement.value).toEqual('0: Object');
        expect(sfOption.nativeElement.selected).toBe(true);
      }),
    );
  });

  describe('should support <type=radio>', () => {
    describe('in template-driven forms', () => {
      it(
        'should support basic functionality',
        fakeAsync(() => {
          const fixture = initTest(NgModelRadioForm);
          fixture.componentInstance.food = 'fish';
          fixture.detectChanges();
          tick();

          // model -> view
          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);

          dispatchEvent(inputs[0].nativeElement, 'change');
          tick();

          // view -> model
          expect(fixture.componentInstance.food).toEqual('chicken');
          expect(inputs[1].nativeElement.checked).toEqual(false);
        }),
      );

      it(
        'should support multiple named <type=radio> groups',
        fakeAsync(() => {
          const fixture = initTest(NgModelRadioForm);
          fixture.componentInstance.food = 'fish';
          fixture.componentInstance.drink = 'sprite';
          fixture.detectChanges();
          tick();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);

          dispatchEvent(inputs[0].nativeElement, 'change');
          tick();

          expect(fixture.componentInstance.food).toEqual('chicken');
          expect(fixture.componentInstance.drink).toEqual('sprite');
          expect(inputs[1].nativeElement.checked).toEqual(false);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);
        }),
      );

      it(
        'should support initial undefined value',
        fakeAsync(() => {
          const fixture = initTest(NgModelRadioForm);
          fixture.detectChanges();
          tick();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(false);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(false);
        }),
      );

      it(
        'should support resetting properly',
        fakeAsync(() => {
          const fixture = initTest(NgModelRadioForm);
          fixture.componentInstance.food = 'chicken';
          fixture.detectChanges();
          tick();

          const form = fixture.debugElement.query(By.css('form'));
          dispatchEvent(form.nativeElement, 'reset');
          fixture.detectChanges();
          tick();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(false);
        }),
      );

      it(
        'should support setting value to null and undefined',
        fakeAsync(() => {
          const fixture = initTest(NgModelRadioForm);
          fixture.componentInstance.food = 'chicken';
          fixture.detectChanges();
          tick();

          fixture.componentInstance.food = null!;
          fixture.detectChanges();
          tick();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(false);

          fixture.componentInstance.food = 'chicken';
          fixture.detectChanges();
          tick();

          fixture.componentInstance.food = undefined!;
          fixture.detectChanges();
          tick();
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(false);
        }),
      );

      it(
        'should disable radio controls properly with programmatic call',
        fakeAsync(() => {
          const fixture = initTest(NgModelRadioForm);
          fixture.componentInstance.food = 'fish';
          fixture.detectChanges();
          tick();

          const form = fixture.debugElement.children[0].injector.get(NgForm);
          form.control.get('food')!.disable();
          tick();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.disabled).toBe(true);
          expect(inputs[1].nativeElement.disabled).toBe(true);
          expect(inputs[2].nativeElement.disabled).toBe(false);
          expect(inputs[3].nativeElement.disabled).toBe(false);

          form.control.disable();
          tick();

          expect(inputs[0].nativeElement.disabled).toBe(true);
          expect(inputs[1].nativeElement.disabled).toBe(true);
          expect(inputs[2].nativeElement.disabled).toBe(true);
          expect(inputs[3].nativeElement.disabled).toBe(true);

          form.control.enable();
          tick();

          expect(inputs[0].nativeElement.disabled).toBe(false);
          expect(inputs[1].nativeElement.disabled).toBe(false);
          expect(inputs[2].nativeElement.disabled).toBe(false);
          expect(inputs[3].nativeElement.disabled).toBe(false);
        }),
      );
    });
  });

  describe('should support <type=range>', () => {
    describe('in template-driven forms', () => {
      it(
        'with basic use case',
        fakeAsync(() => {
          const fixture = initTest(NgModelRangeForm);
          // model -> view
          fixture.componentInstance.val = 4;
          fixture.detectChanges();
          tick();
          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.value).toBe('4');
          fixture.detectChanges();
          tick();
          const newVal = '4';
          input.triggerEventHandler('input', { target: { value: newVal } });
          tick();
          // view -> model
          fixture.detectChanges();
          expect(typeof fixture.componentInstance.val).toBe('number');
        }),
      );
    });
  });

  describe('custom value accessors', () => {
    describe('in template-driven forms', () => {
      it(
        'should support standard writing to view and model',
        async(() => {
          const fixture = initTest(NgModelCustomWrapper, NgModelCustomComp);
          fixture.componentInstance.name = 'Nancy';
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
              // model -> view
              const customInput = fixture.debugElement.query(
                By.css('[name="custom"]'),
              );
              expect(customInput.nativeElement.value).toEqual('Nancy');

              customInput.nativeElement.value = 'Carson';
              dispatchEvent(customInput.nativeElement, 'input');
              fixture.detectChanges();

              // view -> model
              expect(fixture.componentInstance.name).toEqual('Carson');
            });
          });
        }),
      );
    });
  });
});

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

@Component({
  selector: 'ng-model-select-form',
  template: `
    <select [nasModel]="store('selectedCity')">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{c.name}}
      </option>
    </select>
  `,
})
class NasModelSelectForm {
  store: CityStore;

  constructor(store: CityStore) {
    this.store = store.withCaching();
  }
}

@Component({
  selector: 'ng-model-select-null-form',
  template: `
    <select [nasModel]="store('selectedCity')">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{c.name}}
      </option>
      <option [ngValue]="null">Unspecified</option>
    </select>
  `,
})
class NasModelSelectWithNullForm {
  store: CityStore;

  constructor(store: CityStore) {
    this.store = store.withCaching();
  }
}

@Component({
  selector: 'ng-model-select-compare-with',
  template: `
    <select [nasModel]="store('selectedCity')" [compareWith]="compareFn">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{c.name}}
      </option>
    </select>
  `,
})
class NgModelSelectWithCustomCompareFnForm {
  store: CityStore;
  compareFn: (o1: any, o2: any) => boolean = (o1: any, o2: any) =>
    o1 && o2 ? o1.id === o2.id : o1 === o2;

  constructor(store: CityStore) {
    this.store = store.withCaching();
  }
}

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

@Component({
  selector: 'ng-model-select-multiple-compare-with',
  template: `
    <select
      multiple
      [nasModel]="store('selectedCities')"
      [compareWith]="compareFn"
    >
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{c.name}}
      </option>
    </select>
  `,
})
class NasModelSelectMultipleWithCustomCompareFnForm {
  store: MultipleCityStore;
  compareFn: (o1: any, o2: any) => boolean = (o1: any, o2: any) =>
    o1 && o2 ? o1.id === o2.id : o1 === o2;

  constructor(store: MultipleCityStore) {
    this.store = store.withCaching();
  }
}

@Component({
  selector: 'ng-model-select-multiple-form',
  template: `
    <select multiple [nasModel]="store('selectedCities')">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{c.name}}
      </option>
    </select>
  `,
})
class NasModelSelectMultipleForm {
  store: MultipleCityStore;

  constructor(store: MultipleCityStore) {
    this.store = store.withCaching();
  }
}

@Component({
  selector: 'form-control-range-input',
  template: `<input type="range" [formControl]="control">`,
})
class FormControlRangeInput {
  control: FormControl;
}

@Component({
  selector: 'ng-model-range-form',
  template: '<input type="range" [(ngModel)]="val">',
})
class NgModelRangeForm {
  val: any;
}

@Component({
  selector: 'form-control-radio-buttons',
  template: `
    <form [formGroup]="form" *ngIf="showRadio.value === 'yes'">
      <input type="radio" formControlName="food" value="chicken">
      <input type="radio" formControlName="food" value="fish">
      <input type="radio" formControlName="drink" value="cola">
      <input type="radio" formControlName="drink" value="sprite">
    </form>
    <input type="radio" [formControl]="showRadio" value="yes">
    <input type="radio" [formControl]="showRadio" value="no">`,
})
export class FormControlRadioButtons {
  form: FormGroup;
  showRadio = new FormControl('yes');
}

@Component({
  selector: 'ng-model-radio-form',
  template: `
    <form>
      <input type="radio" name="food" [(ngModel)]="food" value="chicken">
      <input type="radio" name="food"  [(ngModel)]="food" value="fish">
      <input type="radio" name="drink" [(ngModel)]="drink" value="cola">
      <input type="radio" name="drink" [(ngModel)]="drink" value="sprite">
    </form>
  `,
})
class NgModelRadioForm {
  food: string;
  drink: string;
}

@Directive({
  selector: '[wrapped-value]',
  host: { '(input)': 'handleOnInput($event.target.value)', '[value]': 'value' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: WrappedValue },
    { provide: NG_VALIDATORS, multi: true, useExisting: WrappedValue },
  ],
})
class WrappedValue implements ControlValueAccessor {
  value: any;
  onChange: Function;

  writeValue(value: any) {
    this.value = `!${value}!`;
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }
  registerOnTouched(fn: any) {}

  handleOnInput(value: any) {
    this.onChange(value.substring(1, value.length - 1));
  }

  validate(c: AbstractControl) {
    return c.value === 'expected' ? null : { err: true };
  }
}

@Component({ selector: 'my-input', template: '' })
export class MyInput implements ControlValueAccessor {
  @Output('input') onInput = new EventEmitter();
  value: string;

  constructor(cd: NgControl) {
    cd.valueAccessor = this;
  }

  writeValue(value: any) {
    this.value = `!${value}!`;
  }

  registerOnChange(fn: (value: any) => void) {
    this.onInput.subscribe({ next: fn });
  }

  registerOnTouched(fn: any) {}

  dispatchChangeEvent() {
    this.onInput.emit(this.value.substring(1, this.value.length - 1));
  }
}

@Component({
  selector: 'my-input-form',
  template: `
    <div [formGroup]="form">
      <my-input formControlName="login"></my-input>
    </div>`,
})
export class MyInputForm {
  form: FormGroup;
}

@Component({
  selector: 'wrapped-value-form',
  template: `
    <div [formGroup]="form">
      <input type="text" formControlName="login" wrapped-value>
    </div>`,
})
class WrappedValueForm {
  form: FormGroup;
}

@Component({
  selector: 'ng-model-custom-comp',
  template: `
    <input name="custom" [(ngModel)]="model" (ngModelChange)="changeFn($event)" [disabled]="isDisabled">
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: NgModelCustomComp },
  ],
})
export class NgModelCustomComp implements ControlValueAccessor {
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

@Component({
  selector: 'ng-model-custom-wrapper',
  template: `
    <form>
      <ng-model-custom-comp name="name" [(ngModel)]="name" [disabled]="isDisabled"></ng-model-custom-comp>
    </form>
  `,
})
export class NgModelCustomWrapper {
  name: string;
  isDisabled = false;
}

function dispatchEvent(domElement: EventTarget, type: string) {
  domElement.dispatchEvent(new Event(type));
}
