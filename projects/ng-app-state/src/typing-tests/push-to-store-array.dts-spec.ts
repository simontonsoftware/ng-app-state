import { pushToStoreArray, StoreObject } from '../public-api';

const store = (null as unknown) as StoreObject<Array<Date>>;

// $ExpectType StoreObject<Date>
pushToStoreArray(store, new Date());
