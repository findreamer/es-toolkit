# join

::: info
이 함수는 호환성을 위한 `es-toolkit/compat` 에서만 가져올 수 있어요. 대체할 수 있는 네이티브 JavaScript API가 있거나, 아직 충분히 최적화되지 않았기 때문이에요.

`es-toolkit/compat`에서 이 함수를 가져오면, [lodash와 완전히 똑같이 동작](../../../compatibility.md)해요.
:::

배열의 요소를 문자열로 결합해요.

## 인터페이스

```typescript
function join<T>(array: T[], separator?: string): string;
```

### 파라미터

- `array` (`T[]`) - 결합할 배열이에요.

::: info `array`는 `ArrayLike<T>`이거나 `null` 또는 `undefined`일 수 있어요

lodash와 완전히 호환되도록 `join` 함수는 `array`를 다음과 같이 처리해요.

- `array`가 `ArrayLike<T>`인 경우, 배열로 변환하기 위해 `Array.from(...)`을 사용해요.
- `array`가 `null` 또는 `undefined`인 경우, 빈 배열로 간주돼요.

:::

- `separator` (`string`) - 요소를 결합하는 데 사용하는 구분자. 기본값은 쉼표(,)에요.

### 반환 값

(`string`): 지정된 구분자로 배열의 모든 요소가 결합된 문자열을 반환해요.

## 예시

```typescript
const arr = ['a', 'b', 'c'];
const result = join(arr, '~');
console.log(result); // Output: "a~b~c"
```
