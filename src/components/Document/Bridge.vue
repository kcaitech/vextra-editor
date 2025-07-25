/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { Context } from '@/context';
import ComponentWonderCard from '@/components/Document/Navigation/Component/ComponentWonderCard.vue'
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { GroupShape, GroupShapeView, Shape, ShapeView, SymbolShape, adapt2Shape } from '@kcaitech/vextra-core';
import { Component } from '@/context/component';
import { is_content, ref_symbol } from '@/utils/content';
interface Props {
    context: Context
}

const props = defineProps<Props>();
const wonder = shallowRef<Shape>();
const wonder_card_x = ref<number>();
const wonder_card_y = ref<number>();
let wonder_stash: Shape;
function component_watcher(t: number) {
    if (t === Component.WONDER_CHANGE) wonder.value = props.context.component.wonder;
}
function check_status() {
    const w = props.context.component.wonder;
    if (w) {
        wonder_stash = w;
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    }
}
function move(e: MouseEvent) {
    if (!wonder.value && wonder_stash) wonder.value = wonder_stash;
    modify_wonder_xy(e);
}
function up(e: MouseEvent) {
    if (is_content(props.context, e) && wonder.value) {
        const locate = get_position_on_page(e);
        ref_symbol(props.context, locate, wonder.value);
    }
    props.context.component.set_brige_status(false);
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}
function modify_wonder_xy(e: MouseEvent) {
    wonder_card_x.value = e.clientX - 50;
    wonder_card_y.value = e.clientY - 50;
}
function get_position_on_page(e: MouseEvent) {
    const workspace =  props.context.workspace;
    return workspace.matrix.inverseCoord(workspace.getContentXY(e));
}

onMounted(() => {
    props.context.component.watch(component_watcher);
    check_status();
})
onUnmounted(() => {
    props.context.component.unwatch(component_watcher);
})

</script>
<template>
    <div class="bridge">
        <div class="wonder-wrap" :style="{ left: wonder_card_x + 'px', top: wonder_card_y + 'px' }">
            <ComponentWonderCard v-if="wonder" :data="(wonder as SymbolShape)"></ComponentWonderCard>
        </div>
    </div>
</template>
<style scoped lang="scss">
.bridge {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1005;
    left: 0;
    top: 0;
    cursor: grabbing;

    .wonder-wrap {
        position: absolute;
    }
}
</style>