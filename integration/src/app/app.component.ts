import { Component } from '@angular/core';
import { forEach, keyBy, mapValues, padStart } from 'micro-dash';
import { StoreObject } from 'ng-app-state';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { City, IntegrationState } from './integration-state';
import { IntegrationStore } from './integration-store';

@Component({
  selector: 'integration-app',
  templateUrl: './app.component.html',
})
export class AppComponent {
  cities: City[] = ['San Francisco', 'Nairobi', 'Gulu'];
  store: StoreObject<IntegrationState>;
  stateString$: Observable<string>;

  constructor(store: IntegrationStore) {
    this.store = store.withCaching();
    this.stateString$ = this.store.$.pipe(
      map((state) => JSON.stringify(state, null, 2)),
    );
  }

  chooseToCheck() {
    this.store('checkMany').set(
      mapValues(
        keyBy(this.store.state().chooseMany, (city) => city),
        () => true,
      ),
    );
  }

  checkToChoose() {
    const choices: City[] = [];
    forEach(this.store.state().checkMany, (selected, city) => {
      if (selected) {
        choices.push(city as any);
      }
    });
    this.store('chooseMany').set(choices);
  }

  propagateDatetime() {
    const time = this.dateFromDatetime().getTime();
    this.modDates((dest) => {
      dest.setTime(time);
    });
  }

  propagateDate() {
    const source = this.dateFromDate();
    this.modDates((dest) => {
      dest.setFullYear(source.getFullYear());
      dest.setMonth(source.getMonth());
      dest.setDate(source.getDate());
    });
  }

  propagateMonth() {
    const source = this.dateFromMonth();
    this.modDates((dest) => {
      dest.setFullYear(source.getFullYear());
      dest.setMonth(source.getMonth());
    });
  }

  propagateWeek() {
    const source = this.dateFromWeek();
    this.modDates((dest) => {
      const day = dest.getDay();
      dest.setFullYear(source.getFullYear());
      dest.setMonth(source.getMonth());
      dest.setDate(source.getDate() + day - 1);
    });
  }

  propagateTime() {
    const source = this.dateFromTime();
    this.modDates((dest) => {
      dest.setHours(source.getHours());
      dest.setMinutes(source.getMinutes());
    });
  }

  private modDates(fn: (dest: Date) => void) {
    this.store.setUsing((state) => {
      let d = dateParts(this.dateFromDatetime(), fn);
      const datetime = `${d.y}-${d.M}-${d.d}T${d.h}:${d.m}`;

      d = dateParts(this.dateFromDate(state), fn);
      const date = `${d.y}-${d.M}-${d.d}`;

      d = dateParts(this.dateFromMonth(state), fn);
      const month = `${d.y}-${d.M}`;

      const dateObj = this.dateFromWeek(state);
      fn(dateObj);
      const week = `${getWeekYear(dateObj)}-W${getWeek(dateObj)}`;

      d = dateParts(this.dateFromTime(state), fn);
      const time = `${d.h}:${d.m}`;

      return { ...state, datetime, date, month, week, time };
    });
  }

  private dateFromDatetime(state = this.store.state()) {
    return new Date(state.datetime);
  }

  private dateFromDate(state = this.store.state()) {
    return new Date(state.date + 'T00:00');
  }

  private dateFromMonth(state = this.store.state()) {
    return new Date(state.month + '-01T00:00');
  }

  private dateFromWeek(state = this.store.state()) {
    const [year, week] = state.week.split('-W').map(Number);
    return weekToDate(year, week);
  }

  private dateFromTime(state = this.store.state()) {
    return new Date('2000-01-01T' + state.time);
  }
}

function dateParts(date: Date, fn: (dest: Date) => void) {
  fn(date);
  return {
    y: pad(date.getFullYear(), 4),
    M: pad(date.getMonth() + 1),
    d: pad(date.getDate()),
    h: pad(date.getHours()),
    m: pad(date.getMinutes()),
  };
}

function pad(num: number, length = 2) {
  return padStart(num.toString(), length, '0');
}

// Returns the ISO week of the date.
// Source: https://weeknumber.net/how-to/javascript
function getWeek(date: Date) {
  date = new Date(date.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        (week1.getDay() + 6) % 7) /
        7,
    )
  );
}

// Returns the four-digit year corresponding to the ISO week of the date.
// Source: https://weeknumber.net/how-to/javascript
function getWeekYear(date: Date) {
  date = new Date(date.getTime());
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  return date.getFullYear();
}

// https://stackoverflow.com/a/16591175/1836506
function weekToDate(year: number, week: number) {
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  if (date.getDay() <= 4) {
    date.setDate(date.getDate() - date.getDay() + 1);
  } else {
    date.setDate(date.getDate() + 8 - date.getDay());
  }
  return date;
}
