import { BorderPosition } from "@kcdesign/data/data/typesdefine"

export const system = {
    'illegal_input': '输入不合法！',
    select: '请选择！',
    space: '...',
    empty: '暂无数据',
    paste: '粘贴',
    copy: '复制',
    'select_layer': '图层选择',
    'bring_forward': '上移一层',
    'send_backward': '下移一层',
    'bring_to_top': '置于顶层',
    'send_to_bottom': '置于底层',
    'visible': '显示/隐藏',
    'Lock': '锁定/解锁',
    'select_all': '选择全部',
    'fit_canvas': '适应画布',
    'show_many_cursor': '显示多人光标',
    'show_comment': '显示评论',
    'show_ruler': '显示标尺',
    'show_pixel_network': '显示像素网络',
    'hide_operation_interface': '隐藏操作界面',
    'creating_groups': '创建编组',
    'create_container': '创建容器',
    'un_group': '取消编组',
    'create_component': '创建组件',
    'unbind_instance': '解绑实例',
    'reset_instance_roperties': '重置实例属性',
    'edit_component': '编辑组件'
}

export const home = {
    open_local_file: "打开文件",
    open_remote_file: "打开远程文件",
    new_file: "新建文档",
    object_selector: '选择对象',
    scale: '等比缩放',
    automatically_open: '自动打开',
    search_file: '搜索文件',
    about: '关于',
    help_manual: '帮助手册',
    about_software: '关于软件',
    New_file: '新建文件',
    recently_opened: '最近打开',
    star_file: '标星文件',
    file_shared: '我共享的文件',
    shared_file_received: '收到的共享文件',
    file_shared_with_me: '共享给我的文件',
    recycling_station: '回收站',
    file_name: '文件名称',
    modification_time: '修改时间',
    size: '大小',
    operation: '操作',
    star_marking: '标星',
    share: '分享',
    delete: '删除',
    test: '测试',
    file_star_marking: '文件已被标星，可在标星列表中查看！',
    rect: '矩形',
    picture: '图片',
    comment: '评论',
    groups: '编组',
    search_layer: '搜索图层'
}

export const navi = {
    shape: '图层',
    comps: '组件',
    resource: '资源库',
    page: '页面',
    add_page: '添加新页面',
    copy: '副本'
}

export const frame = {
    custom: '自定义',
    phone: '手机',
    tablet: '平板',
    deskdop: '桌面',
    presentation: '预览',
    watch: '手表',
    paper: '纸张',
    social_media : '社交媒体'
}

export const pageMenu = {
    copy_link: '复制页面链接',
    duplicate: '创建页面副本',
    rename: '重命名',
    delete: '删除页面'
}

export const attr: any = {
    design: '设计',
    prototype: '原型',
    inspect: '标注',
    constraints: '相对容器位置',
    border: '边框',
    fill: '填充',
    text: '文本',
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
    alpha: '不透明度',
    'fixed_left': '靠左固定',
    'fixed_right': '靠右固定',
    'fixed_left_right': '左右固定',
    'center': '居中',
    'follow_container': '跟随容器缩放',
    'fixed_bottom': '底部固定',
    'fixed_top': '顶部固定',
    'fixed_top_bottom': '上下固定',
    'adapt': '适应容器大小'
}

attr[BorderPosition.Inner] = '内部';
attr[BorderPosition.Center] = '居中';
attr[BorderPosition.Outer] = '外部';