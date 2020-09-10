import { RootStore } from './root-store';

describe('AppStore', () => {
  it('uses the given constructor arguments', () => {
    const store = new RootStore({ initial: true });
    expect(store.state()).toEqual({ initial: true });
  });

  it('can have multiple instances', () => {
    const store1 = new RootStore({ firstValue: 1 });
    const store2 = new RootStore({ secondValue: 1 });
    expect(store1.state()).toEqual({ firstValue: 1 });
    expect(store2.state()).toEqual({ secondValue: 1 });

    store1('firstValue').set(2);
    store2('secondValue').set(3);
    expect(store1.state()).toEqual({ firstValue: 2 });
    expect(store2.state()).toEqual({ secondValue: 3 });
  });

  it('can be deleted', () => {
    const store = new RootStore({ initial: true });
    store.delete();
    expect(store.state() as any).toEqual(undefined);
  });
});
