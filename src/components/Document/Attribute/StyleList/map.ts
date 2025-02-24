import FillMaskView from "./FillMask.vue";
import ShadowMaskView from "./ShadowMask.vue";
import BlurMaskView from "./BlurMask.vue";
import RadiusMaskView from "./RadiusMask.vue";
import BorderMaskView from "./BorderMask.vue";

export const mask_map = new Map<string, any>([
    ['fill-mask-living', FillMaskView],
    ['shadow-mask-living', ShadowMaskView],
    ['blur-mask-living', BlurMaskView],
    ['radius-mask-living', RadiusMaskView],
    ['border-mask-living', BorderMaskView],
])