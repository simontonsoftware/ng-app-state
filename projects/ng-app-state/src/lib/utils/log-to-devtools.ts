import { noop } from 'micro-dash';
import { Store } from '../index';

interface ReduxDevtoolsExtensionConnection {
  subscribe(listener: (change: any) => void): void;
  unsubscribe(): void;
  send(action: any, state: any): void;
  init(state?: any): void;
  error(anyErr: any): void;
}

export type SerializationOptions = {
  options?: boolean | any;
  replacer?: (key: any, value: any) => {};
  reviver?: (key: any, value: any) => {};
  immutable?: any;
  refs?: Array<any>;
};

interface ReduxDevtoolsExtensionConfig {
  features?: object | boolean;
  name: string | undefined;
  maxAge?: number;
  serialize?: boolean | SerializationOptions;
}

interface ReduxDevtoolsExtension {
  connect(
    options: ReduxDevtoolsExtensionConfig,
  ): ReduxDevtoolsExtensionConnection;
  send(action: any, state: any, options: ReduxDevtoolsExtensionConfig): void;
}

export function logToDevtools(
  store: Store<any>,
  config: ReduxDevtoolsExtensionConfig,
): () => void {
  const extension: ReduxDevtoolsExtension | undefined = (window as any)
    .__REDUX_DEVTOOLS_EXTENSION__;
  if (!extension) {
    console.warn('No devtools extension found');
    return noop;
  }

  const connection = extension.connect(config);
  const subscription = store.$.subscribe((state) => {
    connection.send({}, state);
  });
  return () => {
    subscription.unsubscribe();
  };
}
