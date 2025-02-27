import { ImageScaleMode } from "@kcdesign/data";
import Crop from './Crop.vue';
import TileCtrl from './TileCtrl.vue'
export const image_mode_map = new Map<ImageScaleMode, any>([
    [ImageScaleMode.Tile, TileCtrl],
    [ImageScaleMode.Crop, Crop],
])