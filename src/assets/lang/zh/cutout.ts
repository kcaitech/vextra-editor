import { ExportFormatNameingScheme } from "@kcaitech/vextra-core"

export const cutoutExport: any = {
    cutoutNotBool: '切图图层不支持布尔操作',
    cutout: '切图',
    create_cut_chart_and_export: '创建切图与导出',
    trim_transparent_pixels: '修剪透明像素',
    canvas_background_color: '画布背景色',
    export: '导出',
    preview: '预览',
    default: '默认',
    ios_presets: 'iOS预设',
    android_presets:'Android预设',
    export_cutout: '导出切图',
    repeat: '与其他切图重名'
}


cutoutExport[ExportFormatNameingScheme.Prefix] = '前缀';
cutoutExport[ExportFormatNameingScheme.Suffix] = '后缀';
