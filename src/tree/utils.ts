import { isNumber } from '../compat/predicate/isNumber';
import { isString } from '../predicate/isString';

export const isValidKey = (value: unknown): value is string | number =>
  value !== '' && (isString(value) || isNumber(value));

export const isIterable = (value: unknown): boolean => {
  return value !== null && typeof value === 'object' && typeof (value as any)[Symbol.iterator] === 'function';
};
