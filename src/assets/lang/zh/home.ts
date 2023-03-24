import { BorderPosition } from "@kcdesign/data/data/typesdefine"

export const system = {
    'illegal_input': '输入不合法！',
    select: '请选择！',
    space: '...',
    empty: '暂无数据'
}

export const home = {
    open_local_file: "打开文件",
    open_remote_file: "打开远程文件",
    new_file: "新建文档"
}

export const navi = {
    shape: '图层',
    comps: '组件',
    resource: '资源库',
    page: '页面'
}


export const attr: any = {
    design: '设计',
    prototype: '原型',
    inspect: '标注',
    constraints: '相对容器位置',
    border: '边框',
    fill: '填充',
    'follow_container_scaling': '跟随容器缩放',
    'advanced_stroke': '边框设置',
    position: '位置',
    'corner_smoothing': '平滑圆角',
    vertical: '垂直方向',
    horizontal:'水平方向',
    fixedLeft: '左部固定',
    fixedRight: '右部固定',
    withContainer: '跟随容器缩放',
    fixedTop: '顶部固定',
    fixedBottom: '底部固定',
    thickness: '厚度',
    borderStyle: '边框样式',
    dash: '虚线',
    solid: '实线',
    startMarkerType: '起点样式',
    endMarkerType: '终点样式',
    background: '画布背景',
    color: '颜色',
    alpha: '不透明度'
}

attr[BorderPosition.Inner] = '内部';
attr[BorderPosition.Center] = '居中';
attr[BorderPosition.Outer] = '外部';