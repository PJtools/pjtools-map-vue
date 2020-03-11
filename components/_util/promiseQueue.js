/**
 * @文件说明: 定义Promise同步执行队列
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-11 17:55:22
 */

import EventEmitter from 'eventemitter3';

const empty = () => {};

const pFinally = (promise, onFinally) => {
  onFinally = onFinally || (() => {});

  return promise.then(
    val =>
      new Promise(resolve => {
        resolve(onFinally());
      }).then(() => val),
    err =>
      new Promise(resolve => {
        resolve(onFinally());
      }).then(() => {
        throw err;
      }),
  );
};

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

const pTimeout = (promise, milliseconds, fallback) => {
  return new Promise((resolve, reject) => {
    if (typeof milliseconds !== 'number' || milliseconds < 0) {
      throw new TypeError('Expected `milliseconds` to be a positive number');
    }

    if (milliseconds === Infinity) {
      resolve(promise);
      return;
    }

    const timer = setTimeout(() => {
      if (typeof fallback === 'function') {
        try {
          resolve(fallback());
        } catch (error) {
          reject(error);
        }
        return;
      }

      const message = typeof fallback === 'string' ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
      const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);

      if (typeof promise.cancel === 'function') {
        promise.cancel();
      }

      reject(timeoutError);
    }, milliseconds);

    pFinally(promise.then(resolve, reject), () => {
      clearTimeout(timer);
    });
  });
};

function lowerBound(array, value, comparator) {
  let first = 0;
  let count = array.length;
  while (count > 0) {
    const step = (count / 2) | 0;
    let it = first + step;
    if (comparator(array[it], value) <= 0) {
      first = ++it;
      count -= step + 1;
    } else {
      count = step;
    }
  }
  return first;
}

class PriorityQueue {
  constructor() {
    this._queue = [];
  }
  enqueue(run, options) {
    options = Object.assign({ priority: 0 }, options);
    const element = {
      priority: options.priority,
      run,
    };
    if (this.size && this._queue[this.size - 1].priority >= options.priority) {
      this._queue.push(element);
      return;
    }
    const index = lowerBound(this._queue, element, (a, b) => b.priority - a.priority);
    this._queue.splice(index, 0, element);
  }
  dequeue() {
    const item = this._queue.shift();
    return item && item.run;
  }
  filter(options) {
    return this._queue.filter(element => element.priority === options.priority).map(element => element.run);
  }
  get size() {
    return this._queue.length;
  }
}

class PromiseQueue extends EventEmitter {
  constructor(options) {
    super();

    this._carryoverConcurrencyCount = void 0;
    this._isIntervalIgnored = void 0;
    this._intervalCount = 0;
    this._intervalCap = void 0;
    this._interval = void 0;
    this._intervalEnd = 0;
    this._intervalId = void 0;
    this._timeoutId = void 0;
    this._queue = void 0;
    this._queueClass = void 0;
    this._pendingCount = 0;
    this._concurrency = void 0;
    this._isPaused = void 0;
    this._resolveEmpty = empty;
    this._resolveIdle = empty;
    this._timeout = void 0;
    this._throwOnTimeout = void 0;

    options = Object.assign(
      {
        carryoverConcurrencyCount: false,
        intervalCap: Infinity,
        interval: 0,
        concurrency: Infinity,
        autoStart: true,
        queueClass: PriorityQueue,
      },
      options,
    );
    if (!(typeof options.intervalCap === 'number' && options.intervalCap >= 1)) {
      throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${options.intervalCap}\` (${typeof options.intervalCap})`);
    }
    if (options.interval === undefined || !(Number.isFinite(options.interval) && options.interval >= 0)) {
      throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${options.interval}\` (${typeof options.interval})`);
    }
    this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
    this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
    this._intervalCap = options.intervalCap;
    this._interval = options.interval;
    this._queue = new options.queueClass();
    this._queueClass = options.queueClass;
    this.concurrency = options.concurrency;
    this._timeout = options.timeout;
    this._throwOnTimeout = options.throwOnTimeout === true;
    this._isPaused = options.autoStart === false;
  }
  get _doesIntervalAllowAnother() {
    return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
  }
  get _doesConcurrentAllowAnother() {
    return this._pendingCount < this._concurrency;
  }
  _next() {
    this._pendingCount--;
    this._tryToStartAnother();
  }
  _resolvePromises() {
    this._resolveEmpty();
    this._resolveEmpty = empty;
    if (this._pendingCount === 0) {
      this._resolveIdle();
      this._resolveIdle = empty;
    }
  }
  _onResumeInterval() {
    this._onInterval();
    this._initializeIntervalIfNeeded();
    this._timeoutId = undefined;
  }

  _isIntervalPaused() {
    const now = Date.now();
    if (this._intervalId === undefined) {
      const delay = this._intervalEnd - now;
      if (delay < 0) {
        this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
      } else {
        if (this._timeoutId === undefined) {
          this._timeoutId = setTimeout(() => {
            this._onResumeInterval();
          }, delay);
        }
        return true;
      }
    }
    return false;
  }
  _tryToStartAnother() {
    if (this._queue.size === 0) {
      if (this._intervalId) {
        clearInterval(this._intervalId);
      }
      this._intervalId = undefined;
      this._resolvePromises();
      return false;
    }
    if (!this._isPaused) {
      const canInitializeInterval = !this._isIntervalPaused();
      if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
        this.emit('active');
        this._queue.dequeue()();
        if (canInitializeInterval) {
          this._initializeIntervalIfNeeded();
        }
        return true;
      }
    }
    return false;
  }
  _initializeIntervalIfNeeded() {
    if (this._isIntervalIgnored || this._intervalId !== undefined) {
      return;
    }
    this._intervalId = setInterval(() => {
      this._onInterval();
    }, this._interval);
    this._intervalEnd = Date.now() + this._interval;
  }
  _onInterval() {
    if (this._intervalCount === 0 && this._pendingCount === 0 && this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = undefined;
    }
    this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
    this._processQueue();
  }
  _processQueue() {
    while (this._tryToStartAnother()) {}
  }
  get concurrency() {
    return this._concurrency;
  }
  set concurrency(newConcurrency) {
    if (!(typeof newConcurrency === 'number' && newConcurrency >= 1)) {
      throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
    }
    this._concurrency = newConcurrency;
    this._processQueue();
  }
  // 添加异步Promise到队列
  async add(fn, options = {}) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this._pendingCount++;
        this._intervalCount++;
        try {
          const operation =
            this._timeout === undefined && options.timeout === undefined
              ? fn()
              : pTimeout(Promise.resolve(fn()), options.timeout === undefined ? this._timeout : options.timeout, () => {
                  if (options.throwOnTimeout === undefined ? this._throwOnTimeout : options.throwOnTimeout) {
                    reject(timeoutError);
                  }
                  return undefined;
                });
          resolve(await operation);
        } catch (error) {
          reject(error);
        }
        this._next();
      };
      this._queue.enqueue(run, options);
      this._tryToStartAnother();
    });
  }
  // 添加一组异步Promise到队列
  async addAll(functions, options) {
    return Promise.all(functions.map(async function_ => this.add(function_, options)));
  }
  // 开始执行队列
  start() {
    if (!this._isPaused) {
      return this;
    }
    this._isPaused = false;
    this._processQueue();
    return this;
  }
  // 暂停当前队列
  pause() {
    this._isPaused = true;
  }
  // 清空当前队列
  clear() {
    this._queue = new this._queueClass();
  }
  // 当前队列执行空后进行响应
  async onEmpty() {
    if (this._queue.size === 0) {
      return;
    }
    return new Promise(resolve => {
      const existingResolve = this._resolveEmpty;
      this._resolveEmpty = () => {
        existingResolve();
        resolve();
      };
    });
  }
  // 当前队列执行完毕（包括数据响应处理完毕）后进行响应
  async onIdle() {
    if (this._pendingCount === 0 && this._queue.size === 0) {
      return;
    }
    return new Promise(resolve => {
      const existingResolve = this._resolveIdle;
      this._resolveIdle = () => {
        existingResolve();
        resolve();
      };
    });
  }
  get size() {
    return this._queue.size;
  }
  sizeBy(options) {
    return this._queue.filter(options).length;
  }
  get pending() {
    return this._pendingCount;
  }
  get isPaused() {
    return this._isPaused;
  }
  set timeout(milliseconds) {
    this._timeout = milliseconds;
  }
  get timeout() {
    return this._timeout;
  }
}

export default PromiseQueue;
