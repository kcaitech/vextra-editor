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
import SvgIcon from "@/components/common/SvgIcon.vue";
import editor_icon from "@/assets/icons/svg/export-menu.svg";
import RemoveEntrance from "@/components/Document/Attribute/StyleLib/RemoveEntrance.vue";
import { onUnmounted, reactive, ref } from "vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { Context } from "@/context";

const props = defineProps<{
    context: Context;
    selected: boolean;
    extend: boolean;
}>()
const emits = defineEmits<{
    (e: 'modify', trigger: MouseEvent | Element): void;
    (e: 'disable'): void;
}>();
const modifyMenuStatus = reactive<ElementStatus>({ id: '#remove-entrance', visible: false });
const modifyMenuStatusMgr = new ElementManager(
    props.context,
    modifyMenuStatus,
    { whiteList: ['#remove-entrance'] }
);
const trigger = ref<HTMLDivElement | null>(null);

function mouseup(event: MouseEvent) {
    if (event.button !== 2) return;
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('preview-container')) {
            const box = e.getBoundingClientRect();

            modifyMenuStatusMgr.showBy(e, {
                once: {
                    offsetLeft: event.clientX - box.x,
                    offsetTop: event.clientY - box.y
                }
            });
            break;
        }
        e = e.parentElement;
    }
}

function remove() {
    emits('disable');
    modifyMenuStatusMgr.close();
}

function modify() {
    emits('modify', trigger.value!)
    modifyMenuStatusMgr.close();
}

onUnmounted(() => {
    modifyMenuStatusMgr.unmounted();
})
</script>
<template>
    <div :class="{'mask-catch-wrapper': true, extend, selected }">
        <div class="preview-container" @mouseup="mouseup">
            <slot name="preview"/>
        </div>
        <div ref="trigger" class="modify" @click.stop="event => emits('modify', event)">
            <SvgIcon :icon="editor_icon"/>
        </div>
        <slot name="modal"/>
        <RemoveEntrance v-if="modifyMenuStatus.visible" @remove="remove" @modify="modify"/>
    </div>
</template>
<style scoped lang="scss">
.mask-catch-wrapper {
    position: relative;
    width: 100%;
    height: 32px;
    border-radius: var(--default-radius);
    display: flex;
    align-items: center;
    overflow: hidden;

    .preview-container {
        flex: 1;
        width: 50px;
        height: 100%;
    }

    .modify {
        flex: 0 0 32px;
        display: flex;
        width: 32px;
        height: 100%;
        visibility: hidden;

        &:hover {
            background-color: rgba(0, 0, 0, 0.06);
        }

        img {
            outline: none;
            margin: auto;
            width: 16px;
            height: 16px;
        }
    }

    &:hover {
        background-color: var(--input-background);

        .modify {
            visibility: visible;
        }
    }
}

.extend {
    background-color: var(--input-background) !important;

    .modify {
        visibility: visible;
        background-color: rgba(0, 0, 0, 0.06) !important;
    }
}

.selected {
    background-color: rgba(24, 120, 245, 0.2) !important;
}
</style>