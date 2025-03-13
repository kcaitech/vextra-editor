/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { XYsBounding } from '@/utils/common';
import { ArtboardView, Matrix, ShapeType, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';

import layer_image_icon from '@/assets/icons/svg/layer-image.svg';
import layer_mask_icon from '@/assets/icons/svg/layer-mask.svg';
import layer_auto_box_icon from '@/assets/icons/svg/layer-auto-box.svg';
import layer_arrow_icon from '@/assets/icons/svg/layer-arrow.svg'
import layer_artboard_icon from '@/assets/icons/svg/layer-artboard.svg';
import layer_contact_icon from '@/assets/icons/svg/layer-contact.svg';
import layer_cutout_icon from '@/assets/icons/svg/layer-cutout.svg';
import layer_group_icon from '@/assets/icons/svg/layer-group.svg';
import layer_line_icon from '@/assets/icons/svg/layer-line.svg';
import layer_oval_icon from '@/assets/icons/svg/layer-oval.svg';
import layer_rectangle_icon from '@/assets/icons/svg/layer-rectangle.svg';
import layer_symbol_ref_icon from '@/assets/icons/svg/layer-symbol-ref.svg';
import layer_symbol_union_icon from '@/assets/icons/svg/layer-symbol-union.svg';
import layer_symbol_icon from '@/assets/icons/svg/layer-symbol.svg';
import layer_table_icon from '@/assets/icons/svg/layer-table.svg';
import layer_text_icon from '@/assets/icons/svg/layer-text.svg';
import SvgIcon from './SvgIcon.vue';


const icons: {[key: string]: string} = {}
icons[ShapeType.Text] = layer_text_icon;
icons[ShapeType.Rectangle] = layer_rectangle_icon;
icons[ShapeType.Oval] = layer_oval_icon;
icons[ShapeType.Line] = layer_line_icon;
icons[ShapeType.Group] = layer_group_icon;
icons[ShapeType.Path] = layer_arrow_icon;
icons[ShapeType.Symbol] = layer_symbol_icon;
icons[ShapeType.SymbolRef] = layer_symbol_ref_icon;
icons[ShapeType.SymbolUnion] = layer_symbol_union_icon;
icons[ShapeType.Symbol] = layer_symbol_icon;
icons[ShapeType.Table] = layer_table_icon;
icons[ShapeType.Table2] = layer_table_icon;
icons[ShapeType.Artboard] = layer_artboard_icon;
icons[ShapeType.Contact] = layer_contact_icon;
icons[ShapeType.Cutout] = layer_cutout_icon;
icons[ShapeType.Image] = layer_image_icon;

interface Props {
    view: number;
    shape: ShapeView;
    theme: string;
}

const props = defineProps<Props>();
const path = ref<string>('');
const is_image = ref(false);
const flex_abbr = ref<boolean>(true);
const icon_class = ref<string>('');

function updateIconClass() {
    const s = props.shape;
    if (s.data.mask) return icon_class.value = layer_mask_icon;
    if (s.isImageFill) return icon_class.value = layer_image_icon;
    const auto_layout = s.type === ShapeType.Artboard && !!(s as ArtboardView).autoLayout;
    if(auto_layout) return icon_class.value = layer_auto_box_icon;
    else return icon_class.value = icons[s.type]
}

function getPath() {
    const shape = props.shape;
    is_image.value = shape.isImageFill && !shape.mask;
    flex_abbr.value = shape.isPathIcon && !is_image.value && !shape.mask;
    if (!flex_abbr.value ) return updateIconClass();
    const f = shape.frame;
    const m = new Matrix();
    m.trans(-(f.x + f.width / 2), -(f.y + f.height / 2));
    if (!props.shape.isNoTransform()) {
        if (shape.rotation) m.rotate(shape.rotation / 180 * Math.PI);
    }
    const box = XYsBounding([
        {x: f.x, y: f.y},
        {x: f.x + f.width, y: f.y},
        {x: f.x + f.width, y: f.y + f.height},
        {x: f.x, y: f.y + f.height}
    ].map(p => m.computeCoord3(p)));

    const new_w = box.right - box.left;
    const new_h = box.bottom - box.top;
    let max_length = new_w;
    if (new_h > new_w) {
        max_length = new_h;
    }
    const ratio = 100 / max_length;
    m.scale(ratio);
    m.trans(50, 50);

    const _path = props.shape.getPath().clone();

    _path.transform(m);
    path.value = _path.toString();
}

const stop = watch(() => props.view, getPath);
onMounted(getPath);
onUnmounted(stop);
</script>
<template>
<div class="abbr-container">
    <svg v-if="flex_abbr" viewBox="-12 -12 124 124">
        <path :d="path" stroke-width="10" fill="none" :stroke="theme" stroke-linejoin="round"/>
    </svg>
    <SvgIcon v-else-if="is_image" :icon="layer_image_icon" :fill="theme" :stroke="theme"/>
    <SvgIcon v-else :icon="icon_class" :fill="theme"/>
</div>
</template>
<style scoped lang="scss">
.abbr-container {
    width: 13px;
    height: 13px;
    display: flex;
    align-items: center;

    > img {
        width: 13px;
        height: 13px;
    }
}
</style>