
import { ImageScaleMode } from "@kcdesign/data";

export const pattern: any = {
    image: 'image'
}

pattern[ImageScaleMode.Fill] = 'Fill';
pattern[ImageScaleMode.Stretch] = 'Stretch';
pattern[ImageScaleMode.Fit] = 'Fit';
pattern[ImageScaleMode.Tile] = 'Tile';