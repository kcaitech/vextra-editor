/*
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 16:35:35
 * @FilePath: \kcdesign\src\components\common\localstorage.ts
 */
import { Ref, watchEffect, ref } from 'vue';

export function localStorageRef<T>(key: string, initValue: T): Ref<T> {
  const pre = localStorage.getItem(key);
  const ret = ref(initValue);
  if (pre) {
    ret.value = JSON.parse(pre);
  }
  watchEffect(() => {
    ret.value && localStorage.setItem(key, JSON.stringify(ret.value));
  });
  return ret as Ref<T>;
}
