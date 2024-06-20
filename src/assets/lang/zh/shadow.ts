import { ShadowPosition, BlurType } from "@kcdesign/data"

export const shadow: any = {
    shadow_stting: '阴影',
    only_used: '仅矩形、圆形以及容器可以使用',
    shadow_setting: '阴影设置',
    position: '位置',
    color: '颜色',
    effect:'效果',
    blur: '模糊',
    extend: '扩展',
    fill_is_visible: "容器的填充可见时可使用"
}


shadow[ShadowPosition.Inner] = '内阴影';
shadow[ShadowPosition.Outer] = '外阴影';

export const blur: any = {
    blur: '模糊',
    blur_setting: '模糊设置'
}

blur[BlurType.Gaussian] = '高斯模糊';
blur[BlurType.Background] = '背景模糊';
blur[BlurType.Zoom] = '缩放模糊';
blur[BlurType.Motion] = '动感模糊';
