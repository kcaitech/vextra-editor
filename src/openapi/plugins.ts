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
    'devmode.toolbar.tools';

export interface IPlugin {
    get locate(): PluginLocate,
    readonly align?: 'begin' | 'end',
    get params(): any,
    get component(): any
}

export interface IPluginsMgr {
    regist(...plugins: IPlugin[]): void;
    search(locate: PluginLocate): IPlugin[];
    search2(locate: PluginLocate): { begin: IPlugin[], end: IPlugin[] };
}