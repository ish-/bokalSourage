## bokalSourage · [![npm version](https://badge.fury.io/js/bokal-sourage.svg)](//npmjs.com/package/bokal-sourage)
It's `localStorage` manager with JSON parse/stringify serialization.  
get/set/watch/wipe values, subscribe/publish messages in scoped namespace from all `window`s.

### Usage
```
import BokalSourage from 'bokal-sourage';

const bs = new BokalSourage('prefix__'); // could leave prefix empty

const jsonSerializable = { // String, Number, null, Object, Array
  name: 'Flying Microtonal Banana',
  tracks: ['Billabong Valley'],
};

bs.set('album', jsonSerializable);
bs.get('album'); // => JSON.parse(JSON.stringify(jsonSerializable))

const onRateChange = (rate) => console.log(`Rate is changed: ${ rate }`);
const unwatch = bs.watch('rate', onRateChange);
bs.set('rate', 10); // any window
// 'Rate is changed: 10'

unwatch();
// or
bs.unwatch('rate', onRateChange);

bs.remove('something');

// clear keys in prefixed scope
bs.wipe(); // => [ ...wipedKeys ]

// publish() and subscribe() use watch/unwatch functionality above the `message:${ key }` storage keys
const onEggBoiled = dur => console.log(`Egg was boiled for ${ dur / 6e4 }m`);
bs.subscribe('egg:boiled', onEggBoiled)
bs.publish('egg:boiled', 18e4); // any window
// 'Egg was boiled for 3m'
```