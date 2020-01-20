import moment from 'moment';
import MockDate from 'mockdate';
import Vue from 'vue';

export function setMockDate(dateString = '2020-01-01T09:00:00.000') {
  MockDate.set(moment(dateString));
}

export function resetMockDate() {
  MockDate.reset();
}

export function asyncExpect(fn, timeout) {
  return new Promise(resolve => {
    if (typeof timeout === 'number') {
      setTimeout(() => {
        fn();
        resolve();
      }, timeout);
    } else {
      Vue.nextTick(() => {
        fn();
        resolve();
      });
    }
  });
}
