import { ImageScaleMode } from "@kcdesign/data";

export const pattern: any = {
    image: '图片'
}

pattern[ImageScaleMode.Fill] = '填充';
pattern[ImageScaleMode.Stretch] = '拉伸';
pattern[ImageScaleMode.Fit] = '适应';
pattern[ImageScaleMode.Tile] = '平铺';