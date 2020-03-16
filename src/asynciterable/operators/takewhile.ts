import { AsyncIterableX } from '../asynciterablex';
import { OperatorAsyncFunction } from '../../interfaces';
import { wrapWithAbort } from './withabort';

export class TakeWhileAsyncIterable<TSource> extends AsyncIterableX<TSource> {
  private _source: AsyncIterable<TSource>;
  private _predicate: (value: TSource, index: number, signal?: AbortSignal) => boolean | Promise<boolean>;

  constructor(
    source: AsyncIterable<TSource>,
    predicate: (value: TSource, index: number, signal?: AbortSignal) => boolean | Promise<boolean>
  ) {
    super();
    this._source = source;
    this._predicate = predicate;
  }

  async *[Symbol.asyncIterator](signal?: AbortSignal) {
    let i = 0;
    for await (const item of wrapWithAbort(this._source, signal)) {
      if (!(await this._predicate(item, i++, signal))) {
        break;
      }
      yield item;
    }
  }
}

export function takeWhile<T, S extends T>(
  predicate: (value: T, index: number, signal?: AbortSignal) => value is S
): OperatorAsyncFunction<T, S>;
export function takeWhile<T>(
  predicate: (value: T, index: number, signal?: AbortSignal) => boolean | Promise<boolean>
): OperatorAsyncFunction<T, T>;
export function takeWhile<T>(
  predicate: (value: T, index: number, signal?: AbortSignal) => boolean | Promise<boolean>
): OperatorAsyncFunction<T, T> {
  return function takeWhileOperatorFunction(source: AsyncIterable<T>): AsyncIterableX<T> {
    return new TakeWhileAsyncIterable<T>(source, predicate);
  };
}
