import { AppStore } from './app-store';

describe('AppStore', () => {
  it('uses the given constructor arguments', () => {
    const store = new AppStore({ initial: true });
    expect(store.state()).toEqual({ initial: true });
  });

  it('can have multiple instances', () => {
    const store1 = new AppStore({ firstValue: 1 });
    const store2 = new AppStore({ secondValue: 1 });
    expect(store1.state()).toEqual({ firstValue: 1 });
    expect(store2.state()).toEqual({ secondValue: 1 });

    store1('firstValue').set(2);
    store2('secondValue').set(3);
    expect(store1.state()).toEqual({ firstValue: 2 });
    expect(store2.state()).toEqual({ secondValue: 3 });
  });

  it('can be deleted', () => {
    const store = new AppStore({ initial: true });
    store.delete();
    expect(store.state() as any).toEqual(undefined);
  });
});
