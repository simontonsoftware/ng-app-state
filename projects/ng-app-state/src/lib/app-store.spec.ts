describe('AppStore', () => {
  it('uses the given constructor arguments', () => {
    fail('revisit this test');
    // // tslint:disable-next-line:no-unused-expression
    // new AppStore({ initial: true });
    // expect(getGlobalState()).toEqual({ s: { initial: true } });
  });

  it('can have multiple instances', () => {
    fail('revisit this test');
    // const store1 = new AppStore({ firstValue: 1 });
    // const store2 = new AppStore({ secondValue: 1 });
    // expect(getGlobalState()).toEqual({
    //   s1: { firstValue: 1 },
    //   s2: { secondValue: 1 },
    // });
    //
    // store1('firstValue').set(2);
    // store2('secondValue').set(3);
    // expect(getGlobalState()).toEqual({
    //   s1: { firstValue: 2 },
    //   s2: { secondValue: 3 },
    // });
  });

  it('can be deleted', () => {
    fail('revisit this test');
    // const store = new AppStore({ initial: true });
    // expect(getGlobalState()).toEqual({ s: { initial: true } });
    //
    // store.delete();
    // const globalState = getGlobalState();
    // expect(globalState).toEqual({});
  });

  describe('.dispatch()', () => {
    it('forwards actions on to ngrx', () => {
      fail('revisit this test');
      //   const store = new AppStore(backingStore, 's', {});
      //
      //   let callCount = 0;
      //   backingStore.addReducer('testKey', (state = {}, action) => {
      //     if (action.type === 'the action') {
      //       ++callCount;
      //     }
      //     return state;
      //   });
      //   store.dispatch({ type: 'the action' });
      //   expect(callCount).toBe(1);
    });
  });
});
