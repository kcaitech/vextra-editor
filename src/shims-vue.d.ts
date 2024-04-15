/*
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 10:31:55
 * @FilePath: \kcdesign\src\shims-vue.d.ts
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module '*.md' {
  const content: string;
  export default content;
}

declare module "*/dom-to-image.js";
// 声明静态资源作为模块
declare module "*.png";
declare module "*.svg";
