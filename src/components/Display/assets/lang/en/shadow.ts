import { BlurType, ShadowPosition } from "@kcdesign/data";

export const shadow: any = {
    shadow_stting: "Shadow",
    only_used: 'Only rectangles, circles and containers can be used',
    shadow_setting: 'Shadow setting',
    position: 'position',
    color: 'colour',
    effect:'effect',
    blur: 'Blur',
    extend: 'spread',
    fill_is_visible: "Used when the container's fill is visible"
}

shadow[ShadowPosition.Inner] = 'Inner shadow';
shadow[ShadowPosition.Outer] = 'Outer shadow';

export const blur: any = {
    blur: 'Blur',
    blur_setting: 'Blur setting'
}

blur[BlurType.Gaussian] = 'Gaussian blur';
blur[BlurType.Background] = 'Background blur';
blur[BlurType.Zoom] = 'Zoom blur';
blur[BlurType.Motion] = 'Motion blur';