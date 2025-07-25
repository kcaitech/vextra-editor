/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { ImageScaleMode, ShapeType } from '@kcaitech/vextra-core';
import { onMounted, ref } from 'vue';
import { image_mode_map } from "./map";
import { dbl_action } from '@/utils/mouse_interactive';
import { Selection } from '@/context/selection';
import { onUnmounted } from 'vue';
import { ColorCtx } from '@/context/color';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const mode = ref<ImageScaleMode>();
function init() {
    const selected = props.context.selection.selectedShapes;
    if (selected.length && selected[0].type !== ShapeType.Group) {
        mode.value = props.context.color.imageScaleMode;
    }
    if (props.context.color.imageScaleMode === ImageScaleMode.Tile) {
        props.context.color.notify(ColorCtx.HIDDEN_SELECTED, true);
    } else {
        props.context.color.notify(ColorCtx.HIDDEN_SELECTED, false);
    }
}
function down(e: MouseEvent) {
    e.stopPropagation();
    if (dbl_action()) {
        props.context.color.setImageScale();
        props.context.color.setImageScaleMode(undefined);
        props.context.color.notify(ColorCtx.HIDDEN_SELECTED, false);
    }
}
function move(e: MouseEvent) {
    if (e.buttons !== 1) {
        e.stopPropagation();
    }
}
const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) init();
}
const color_watcher = (t: number) => {
    if (t === ColorCtx.CHANGE_IMAGE_MODE) init();
}
onMounted(() => {
    init();
    props.context.selection.watch(selected_watcher);
    props.context.color.watch(color_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
    props.context.color.unwatch(color_watcher);
})
</script>
<template>
    <div v-if="mode" class="image-mode" @mousedown.stop="down" @mousemove="move">
        <component :is="image_mode_map.get(mode)" :context="props.context" />
    </div>
</template>
<style scoped lang="scss">
.image-mode {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 9;
}
</style>