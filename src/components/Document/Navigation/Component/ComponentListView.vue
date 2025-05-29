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
import ComponentCardAlpha from './ComponentCardAlpha.vue';
import ComponentCardBeta from './ComponentCardBeta.vue';
import { computed, nextTick, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import { GroupShape, Shape, SymbolShape, SymbolUnionShape } from '@kcdesign/data';
import { shape_track } from '@/utils/content';
import { ClientXY } from '@/context/selection';
import { is_dbl_action } from '@/utils/action';
import {
    add_blur_for_window, add_move_and_up_for_document, check_drag_action,
    get_current_position_client, modify_down_position_client, remove_blur_from_window,
    remove_move_and_up_from_document
} from '@/utils/mouse_interactive';
import { Component } from '@/context/component';
import { is_state } from "@/utils/symbol";
// import { Perm } from '@/context/workspace';

interface Props {
    context: Context
    data: SymbolShape[]
    container: Element | null
    isAttri: boolean
    cardType: 'alpha' | 'beta'
}

const props = defineProps<Props>();
let compo: Shape;
let down_position: ClientXY = { x: 0, y: 0 };
let is_drag: boolean = false;
const reflush = ref<number>(0);
const list_container_beta = ref<HTMLDivElement>();
let observer = new ResizeObserver(() => {
    reflush.value++;
});
const render_alpha = computed<boolean>(() => props.cardType === 'alpha');

function down(e: MouseEvent, shape: Shape) {
    if (shape instanceof SymbolUnionShape) {
        const c1 = shape.childs[0];
        if (!c1) {
            return;
        }
        compo = c1;
    } else {
        compo = shape;
    }

    if (props.isAttri) { // 选择一个实例进行切换
        props.context.component.notify(Component.SELECTED_VAL, compo);
        return;
    }

    const target = is_state(compo) ? compo.parent! : compo;

    if (e.button === 2) {
        props.context.component.compMenuMount(target, e);
        return;
    }

    if (is_dbl_action()) {
        shape_track(props.context, shape);
        return;
    }

    modify_down_position_client(props.context, e, down_position);
    add_move_and_up_for_document(move, up);
}

function move(e: MouseEvent) {
    if (
        props.context.readonly
        || props.context.tool.isLabel
    ) {
        return;
    }
    const curr_position = get_current_position_client(props.context, e);
    if (is_drag) {
        return;
    }
    if (check_drag_action(down_position, curr_position)) {
        is_drag = true;
        props.context.component.set_brige_status(true);
        props.context.component.register_wonder(compo);
    }
}

function up() {
    if (is_drag) {
        is_drag = false;
    }
    remove_move_and_up_from_document(move, up);
}

function gen_columns() {
    const repeat = Math.floor(((props.context.workspace.root.x - 16) / 106));
    return `repeat(${repeat}, 104px)`;
}

function init() {
    if (!render_alpha.value) {
        nextTick(() => {
            if (list_container_beta.value) observer.observe(list_container_beta.value);
        })
    }
}

watch(() => render_alpha.value, (v) => {
    if (v) {
        if (list_container_beta.value) observer.disconnect();
    } else {
        nextTick(() => {
            if (list_container_beta.value) observer.observe(list_container_beta.value);
        })
        reflush.value = 0;
    }
})

function window_blur() {
    is_drag = false;
    remove_move_and_up_from_document(move, up);
}
onMounted(() => {
    init();
    add_blur_for_window(window_blur);
})
onUnmounted(() => {
    observer && observer.disconnect();
    remove_blur_from_window(window_blur);
})
</script>
<template>
    <div v-if="render_alpha" class="list-container-alpha">
        <ComponentCardAlpha v-for="item in props.data" :key="item.id" :data="toRaw(item as GroupShape)" :context="props.context"
            @mousedown="(e: MouseEvent) => down(e, item as Shape)" :container="props.container" :is-attri="props.isAttri">
        </ComponentCardAlpha>
    </div>
    <div v-else class="list-container-beta" ref="list_container_beta" :style="{ 'grid-template-columns': gen_columns() }"
        :reflush="reflush">
        <ComponentCardBeta v-for="item in props.data" :key="item.id" :data="toRaw(item as GroupShape)" :context="props.context"
            @mousedown="(e: MouseEvent) => down(e, item as Shape)" :container="props.container" :is-attri="props.isAttri">
        </ComponentCardBeta>
    </div>
</template>
<style scoped lang="scss">
.list-container-beta {
    width: 100%;
    display: grid;
    grid-gap: 8px;
    grid-auto-rows: 104px;
    box-sizing: border-box;
    margin-bottom: 8px;
}
</style>