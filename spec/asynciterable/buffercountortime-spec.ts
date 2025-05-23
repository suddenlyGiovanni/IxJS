import '../asynciterablehelpers.js';
import { of, concat, toArray, interval } from 'ix/asynciterable/index.js';
import { bufferCountOrTime, delay, take } from 'ix/asynciterable/operators/index.js';

test('buffer count behaviour', async () => {
  const source = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 0);

  const res = source.pipe(bufferCountOrTime(5, 10));

  expect(await toArray(res)).toEqual([
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 0],
  ]);
});

test('buffer time behaviour', async () => {
  const source = concat(of(1, 2, 3, 4, 5), of(6, 7, 8, 9), of(0).pipe(delay(11)));

  const res = source.pipe(bufferCountOrTime(5, 10));

  expect(await toArray(res)).toEqual([[1, 2, 3, 4, 5], [6, 7, 8, 9], [0]]);
});

test('continues the timer in the background', async () => {
  const source = interval(10);

  const res = source.pipe(bufferCountOrTime(3, 45));

  expect(await toArray(res.pipe(take(2)))).toEqual([[0, 1, 2], [3]]);
});
