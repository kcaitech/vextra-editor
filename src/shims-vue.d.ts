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

// 声明静态资源作为模块
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";