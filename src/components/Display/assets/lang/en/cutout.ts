import { ExportFormatNameingScheme } from "@kcdesign/data"

export const cutoutExport: any = {
    cutoutNotBool: 'The cutmap layer does not support Boolean operations',
    cutout: 'Cutout',
    create_cut_chart_and_export: 'Create cut chart and export',
    trim_transparent_pixels: 'Trim transparent pixels',
    canvas_background_color: 'Canvas background color',
    export: 'Export',
    preview: 'Preview',
    default: 'Default',
    ios_presets: 'iOS presets',
    android_presets:'Android presets',
    export_cutout: 'Export cutout',
    repeat: 'Same name as other slices'
}


cutoutExport[ExportFormatNameingScheme.Prefix] = 'Prefix';
cutoutExport[ExportFormatNameingScheme.Suffix] = 'Suffix';
