## Setup
Define the shape of your application state using typescript classes. By convention, calling `new` with no arguments should result in the initial state. There should only be instance variables defined in these classes, no methods. For example:

`state/my-state.ts`
```ts
import {User} from './user';

export class MyState {
  public loading = true;
  public currentUser?: User;
}
```

`state/user.ts`
```ts
export class User {
  public id: string;
  public name: string;
} 
```

`app.module.ts`
```ts
import {StoreModule} from "@ngrx/store";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {AppState, reducer} from "ng-app-state";
import {MyState} from "./state/my-state";

@NgModule({
  imports: [
    StoreModule.provideStore(reducer, new MyState()),
    StoreDevtoolsModule.instrumentOnlyWithExtension(), // after provideStore()
  ],
  providers: [
    AppState,
  ],
})
export class AppModule {}
```

## Credits
This project's configuration came from the excellent [Angular QuickStart Lib](https://github.com/filipesilva/angular-quickstart-lib) (on [Jul 21, 2017](https://github.com/filipesilva/angular-quickstart-lib/commit/c687d9a3c00c8db5c290f0dfb243172f8dbfdf40)).
