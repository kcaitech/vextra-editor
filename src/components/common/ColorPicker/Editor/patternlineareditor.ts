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

export type PatternCatch = {
    objectFit: ImageScaleMode;
    media: string;
    filter: PatternFilter;
    transform: string;
}