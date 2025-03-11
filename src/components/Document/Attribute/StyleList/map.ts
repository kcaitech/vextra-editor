/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import FillMaskView from "./FillMask.vue";
import ShadowMaskView from "./ShadowMask.vue";
import BlurMaskView from "./BlurMask.vue";
import RadiusMaskView from "./RadiusMask.vue";
import BorderMaskView from "./BorderMask.vue";

export const mask_map = new Map<string, any>([
    ['fill-mask', FillMaskView],
    ['shadow-mask', ShadowMaskView],
    ['blur-mask', BlurMaskView],
    ['radius-mask', RadiusMaskView],
    ['border-mask', BorderMaskView],
])