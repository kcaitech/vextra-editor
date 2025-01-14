import { Fill } from "@kcdesign/data";

export type SheetCatch = {
    name: string;
    id: string;
    variables: any[];
}

export type FillMaskCatch = {
    id: string;
    name: string;
    desc: string;
    sheet: string;
    fills: Fill[];
}