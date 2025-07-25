
import { ImageScaleMode } from "@kcaitech/vextra-core";

export const pattern: any = {
    image: 'image'
}

pattern[ImageScaleMode.Fill] = 'Fill';
pattern[ImageScaleMode.Stretch] = 'Stretch';
pattern[ImageScaleMode.Fit] = 'Fit';
pattern[ImageScaleMode.Tile] = 'Tile';