import { ExportFormatNameingScheme } from "@kcdesign/data"

export const cutoutExport: any = {
    cutoutNotBool: "The Cutout layer does not support Boolean operations",
    cutout: "Cutout",
    create_cut_chart_and_export: "Create cutout and export",
    trim_transparent_pixels: "Trim transparent pixels",
    canvas_background_color: "Canvas background color",
    export: "Export",
    preview: "Preview",
    default: "Default",
    ios_presets: "IOS presets",
    android_presets: "Android presets",
    export_cutout: "Export",
    repeat: "The same name as the other Cutout"
}

cutoutExport[ExportFormatNameingScheme.Prefix] = "Prefix";
cutoutExport[ExportFormatNameingScheme.Suffix] = "Suffix";
