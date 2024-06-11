// 插件定位

/*

editor // 默认不写
    .toolbar
        :begin
        :end
        .tools
            .select
            .shapes
            .efficient
                .plugins
            .group
            :begin
            :end
            .xxx^begin // 新增加分组
        .documentmenu
            :begin
            :end
    .navigation
        .shapes
        .components
        :begin
        :end
    .content
        .menu
    .attributes
        .design
*/

import Plugin from "./Plugin.vue"

export type PluginPos = {
    node: string,
    pos?: 'begin' | 'end'
}[]

export type PluginComponent = InstanceType<typeof Plugin>

export interface IPlugin {
    get pos(): PluginPos,
    get params(): any,
    get component(): PluginComponent
}