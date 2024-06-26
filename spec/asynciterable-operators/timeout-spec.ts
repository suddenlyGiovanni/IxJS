import { hasNext, hasErr, noNext, delayValue } from '../asynciterablehelpers.js';
import { timeout, finalize } from 'ix/asynciterable/operators/index.js';
import { as } from 'ix/asynciterable/index.js';
import { TimeoutError } from 'ix/asynciterable/operators/timeout.js';

test('AsyncIterable#timeout drops none', async () => {
  const xs = async function* () {
    yield await delayValue(1, 500);
    yield await delayValue(2, 500);
    yield await delayValue(3, 500);
  };
  const ys = as(xs()).pipe(timeout(1000));

  const it = ys[Symbol.asyncIterator]();
  await hasNext(it, 1);
  await hasNext(it, 2);
  await hasNext(it, 3);
  await noNext(it);
});

test('AsyncIterable#timeout throws when delayed', async () => {
  const xs = async function* () {
    yield await delayValue(1, 500);
    yield await delayValue(2, 2000);
  };
  const ys = as(xs()).pipe(timeout(1000));

  const it = ys[Symbol.asyncIterator]();
  await hasNext(it, 1);
  await hasErr(it, TimeoutError);
  await noNext(it);
});

test('AsyncIterable#timeout triggers finalize', async () => {
  let done = false;
  const xs = async function* () {
    yield await delayValue(1, 500);
    yield await delayValue(2, 2000);
  };
  const ys = as(xs()).pipe(
    finalize(() => {
      done = true;
    }),
    timeout(1000)
  );

  const it = ys[Symbol.asyncIterator]();
  await hasNext(it, 1);
  await hasErr(it, TimeoutError);
  await noNext(it);
  expect(done).toBeTruthy();
});
