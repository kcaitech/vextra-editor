import { ExportFormatNameingScheme } from "@kcdesign/data"

export const cutoutExport: any = {
    cutoutNotBool: 'The cutmap layer does not support Boolean operations'
}


cutoutExport[ExportFormatNameingScheme.Prefix] = 'Prefix';
cutoutExport[ExportFormatNameingScheme.Suffix] = 'Suffix';
