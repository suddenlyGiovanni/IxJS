import { hasNext, noNext } from '../asynciterablehelpers.js';
import { generate } from 'ix/asynciterable/index.js';

test('AsyncIterable#generate generates normal sequence', async () => {
  const xs = generate(
    0,
    async (x) => x < 5,
    async (x) => x + 1,
    async (x) => x * x
  );

  const it = xs[Symbol.asyncIterator]();
  await hasNext(it, 0);
  await hasNext(it, 1);
  await hasNext(it, 4);
  await hasNext(it, 9);
  await hasNext(it, 16);
  await noNext(it);
});

test('AsyncIterable#generate condition throws', async () => {
  const err = new Error();
  const xs = generate(
    0,
    async (_) => {
      throw err;
    },
    async (x) => x + 1,
    async (x) => x * x
  );

  const it = xs[Symbol.asyncIterator]();

  await expect(it.next()).rejects.toThrow(err);
});

test('AsyncIterable#generate increment throws', async () => {
  const err = new Error();
  const xs = generate(
    0,
    async (x) => x < 5,
    async (_) => {
      throw err;
    },
    async (x) => x * x
  );

  const it = xs[Symbol.asyncIterator]();
  await expect(it.next()).resolves.toBeDefined();
  await expect(it.next()).rejects.toThrow(err);
});

test('AsyncIterable#generate result selector throws', async () => {
  const err = new Error();
  const xs = generate(
    0,
    async (x) => x < 5,
    async (x) => x + 1,
    async (_) => {
      throw err;
    }
  );

  const it = xs[Symbol.asyncIterator]();

  await expect(it.next()).rejects.toThrow(err);
});
