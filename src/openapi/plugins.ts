/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

// 插件定位

/*
toolbar
    .tools
        .select
        .shapes
        .efficient
            .plugins
        .group
    .home
        .menu
    .cooperation
navigation
    .shapes
    .components
content
    .menu
attributes
    .design
*/

// export type PluginPos = {
//     node: string,
//     pos?: 'begin' | 'end'
// }[]

// import type { DefineComponent } from 'vue'
// export type PluginComponent = InstanceType<DefineComponent<{}, {}, any>>

// 正常PC模式
// PC开发模式
// 移动端

export type PluginLocate =
    'toolbar.home' |
    'toolbar.home.menu' |
    'toolbar.others' |
    'toolbar.tools' |
    'toolbar.tools.efficient' |
    'navigation' |
    'content' |
    'attributes' | 
    'devmode.toolbar.tools' | 
    'preview.toolbar.home' |
    'preview.toolbar.others' |
    'content.menu';

export interface IPlugin {
    get locate(): PluginLocate,
    /**
     * default end
     */
    readonly align?: 'begin' | 'end',
    /**
     * pass to component
     */
    get params(): any,
    /**
     * vue component
     */
    get component(): any
}

export interface IPluginsMgr {
    regist(...plugins: IPlugin[]): void;
    search(locate: PluginLocate): IPlugin[];
    search2(locate: PluginLocate): { begin: IPlugin[], end: IPlugin[] };
}