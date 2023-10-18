let ls;

export default class BokalSourage {
  constructor (prefix) {
    if (!ls)
      ls = window.localStorage;
    this._cbs = {};
    this.prefix = prefix;
    this._watchingInited = false;
  }

  _initWatching () {
    if (this._watchingInited)
      return;

    this._watchingInited = true;
    this.onStorage = this.onStorage.bind(this);
    window.addEventListener('storage', this.onStorage);
  }

  onStorage (e) {
    const { key, newValue } = e;
    if (typeof key !== 'string' || !~key.indexOf(this.prefix))
      return;

    const name = key.replace(this.prefix, '');
    let data;
    try {
      data = JSON.parse(newValue);
    } catch (e) {
      console.warn(`bokalSourage: can't parse event data for "${ name }"="${ newValue }"`);
      return;
    }

    const cbs = this._cbs[name];
    if (!cbs) return;

    cbs.forEach(cb => cb(data));
  }

  has (key) {
    return ls.getItem(`${ this.prefix }${ key }`) !== null;
  }

  set (key, value) {
    ls.setItem(`${ this.prefix }${ key }`, JSON.stringify(value));
    return value;
  }

  get (key) {
    try {
      const str = ls.getItem(`${ this.prefix }${ key }`);
      if (str === 'undefined')
        return null;
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  ref (key) {
    return new BokalSourageRef(this, key);
  }

  proxy () {
    return new Proxy (this, {
      get (instance, prop, receiver) {
        return instance.get(prop);
      },
      set (instance, prop, value) {
        return instance.set(prop, value);
      }
    });
  }

  wipe () {
    const cleared = [];
    Object.keys(ls).forEach(key => {
      if (key.indexOf(this.prefix) === 0) {
        cleared.push(key);
        ls.removeItem(key);
      }
    });
    window.console.log('bokalSourage wiped out keys: ', cleared);
  }

  remove (key) {
    return ls.removeItem(`${ this.prefix }${ key }`);
  }

  watch (name, cb) {
    this._initWatching();

    const cbs = this._cbs[name];
    if (!cbs) this._cbs[name] = [cb];
    else cbs.push(cb);

    return () => this.unwatch(name, cb);
  }

  unwatch (name, cb) {
    const cbs = this._cbs[name];
    const i = cbs.indexOf(cb);
    if (i < 0) return false;
    cbs.splice(i, 1);
    return true;
  }

  subscribe (name, cb) {
    return this.watch(`message:${ name }`, cb);
  }

  publish (name, data) {
    return this.set(`message:${ name }`, data === undefined ? null : data);
  }

  dispose () {
    this._cbs = {};
    window.removeEventListener('storage', this.onStorage);
  }
}

class BokalSourageRef {
  constructor (instance, key) {
    this.instance = instance;
    this.key = key;
  }

  get () { return this.instance.get(this.key) }
  set (value) { return this.instance.set(this.key, value) }
}
