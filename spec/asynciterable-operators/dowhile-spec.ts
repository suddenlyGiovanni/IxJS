import '../asynciterablehelpers.js';
import { defer, of, toArray } from 'ix/asynciterable/index.js';
import { doWhile, tap } from 'ix/asynciterable/operators/index.js';
import { sequenceEqual } from 'ix/iterable/index.js';

test('AsyncIterable#doWhile some', async () => {
  let x = 5;

  const res = await toArray(
    defer(() => of(x)).pipe(
      tap({ next: async () => x-- }),
      doWhile(() => x > 0)
    )
  );

  expect(sequenceEqual(res, [5, 4, 3, 2, 1])).toBeTruthy();
});

test('AsyncIterable#doWhile one', async () => {
  let x = 0;
  const res = await toArray(
    defer(() => of(x)).pipe(
      tap({ next: async () => x-- }),
      doWhile(() => x > 0)
    )
  );

  expect(sequenceEqual(res, [0])).toBeTruthy();
});
