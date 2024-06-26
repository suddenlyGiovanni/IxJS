import { IterableX } from '../../iterable/iterablex.js';
import { memoize } from '../../iterable/operators/memoize.js';

export function memoizeProto<TSource>(
  this: IterableX<TSource>,
  readerCount?: number
): IterableX<TSource>;
export function memoizeProto<TSource, TResult>(
  this: IterableX<TSource>,
  readerCount?: number,
  selector?: (value: Iterable<TSource>) => Iterable<TResult>
): IterableX<TResult>;
/**
 * @ignore
 */
export function memoizeProto<TSource, TResult = TSource>(
  this: IterableX<TSource>,
  readerCount = -1,
  selector?: (value: Iterable<TSource>) => Iterable<TResult>
): IterableX<TSource | TResult> {
  return memoize(readerCount, selector)(this);
}

IterableX.prototype.memoize = memoizeProto;

declare module '../../iterable/iterablex' {
  interface IterableX<T> {
    memoize: typeof memoizeProto;
  }
}
