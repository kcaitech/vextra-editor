import { ImageScaleMode } from "@kcdesign/data";

export type PatternFilter = {
    exposure: number;
    contrast: number;
    saturation: number;
    temperature: number;
    tint: number;
    shadow: number;
    hue: number;
}

export type PatternContext = {
    objectFit: ImageScaleMode;
    media: string;
    filter: PatternFilter;
}

export class PatternLinearEditor {
    constructor() {
    }
}