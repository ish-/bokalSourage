import BokalSourage from './bokalSourage';
import jest from 'jest-mock';
import E from 'tiny-emitter/instance';

const PREFIX = 'test_';
let bs;
const testData = { testData: ['testData'] };

describe('BokalSourage', () => {
  beforeEach(() => {
    mockWindow();
    if (bs)
      bs.dispose();
    bs = new BokalSourage(PREFIX);
  });

  it('should set()/get() JSON-serializable item and trigger', () => {
    bs.set('testData', testData);
    expect(bs.get('testData')).toStrictEqual(testData);
  });

  it('should remove() item and empty response to be "null"', () => {
    expect(bs.get('notExistent')).toBe(null);
    bs.set('testData', testData);
    bs.remove('testData');
    expect(bs.get('testData')).toBe(null);
  });

  it('should create ref() object with get()/set() of "key"', () => {
    const ref = bs.ref('testData');
    ref.set(testData);
    expect(ref.get()).toStrictEqual(testData);
  });

  it('should create proxy() reflecting localStorage properties', () => {
    const proxy = bs.proxy();
    proxy.testData = testData;
    expect(proxy.testData).toStrictEqual(testData);
  });

  it('should wipe() all keys in scope', () => {
    bs.set('testData', testData);
    bs.set('testData2', testData);
    window.localStorage.setItem('testData', 3);
    bs.wipe();
    expect(bs.get('testData')).toBe(null);
    expect(window.localStorage.getItem('testData')).toBe(3);
  });

  it('should trigger watching function on change', () => {
    const fn = jest.fn();
    bs.watch('testData', fn);
    bs.set('testData', testData);
    expect(fn).toHaveBeenLastCalledWith(testData);

    bs.remove('testData');
    expect(fn).toHaveBeenLastCalledWith(null);
  });

  it('should subscribe() and publish() messages', () => {
    const handler = jest.fn();
    bs.subscribe('scope:event', handler);
    bs.publish('scope:event', testData);
    expect(handler).toHaveBeenLastCalledWith(testData);
  });
});

function mockWindow () {
  const localStorage = Object.create({
    getItem (key) { return this[key] },
    setItem (key, newValue) {
        this[key] = newValue;
        E.emit('storage', { key, newValue });
    },
    clear () {
        Object.keys(this).forEach(key => delete this[key]);
    },
    removeItem (key) {
        this[key] = undefined;
        E.emit('storage', { key, newValue: null });
    },
  });

  const addEventListener = (e, fn) => E.on(e, fn);
  const removeEventListener = (e, fn) => E.off(e, fn);

  global.window = {
    localStorage,
    addEventListener,
    removeEventListener,
    console,
  };
}