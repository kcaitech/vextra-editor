import { ImageScaleMode } from "@kcdesign/data";
import Crop from './Crop.vue';
import Tile from './Tile.vue'
export const image_mode_map = new Map<ImageScaleMode, any>([
    [ImageScaleMode.Tile, Tile],
    [ImageScaleMode.Crop, Crop],
])