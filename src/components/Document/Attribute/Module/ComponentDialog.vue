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
import {ref, onMounted, onUnmounted} from 'vue';
import {Context} from '@/context';
import ComponentListShift from "../../Navigation/Component/ComponentListShift.vue";

const props = defineProps<{
    currentInstanceFrom: string
    top?: string,
    right?: string,
    context: Context;
    comps_posi?: { x: number, y: number };
}>();

const emit = defineEmits<{
    (e: 'closeDialog'): void;
    (e: 'saveLayerShow', data: any, type: 'Text' | 'Show' | 'toggle' | ''): void;
}>()

function popoverClose() {
    emit('closeDialog');
}

function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') popoverClose();
    else e.stopPropagation();
}

const comps = ref<HTMLDivElement>()
const cur_top = ref(0)
const cur_p = ref(0)
onMounted(() => {
    if (comps.value) {
        const body_h = document.body.clientHeight;
        const {y, height} = comps.value.getBoundingClientRect();
        const su = body_h - y;
        const cur_t = su - height;
        cur_p.value = cur_t;
        if (cur_t > 0) {
            cur_top.value = props.comps_posi!.y;
        } else {
            cur_top.value = props.comps_posi!.y - Math.abs(cur_t - 10);
        }
        if (cur_top.value - 40 < 0) {
            cur_top.value = 40
        }
    }
    document.addEventListener('keyup', esc);
})
onUnmounted(() => {
    document.removeEventListener('keyup', esc);
})
</script>

<template>
    <div class="dialog_box" ref="comps" :style="{
        left: props.comps_posi!.x + 'px',
        top: cur_p === 0 ? props.comps_posi!.y + 10 + 'px' : cur_top + 'px'
    }">
        <ComponentListShift @close="popoverClose" :context="context"
                            :currentInstanceFrom="props.currentInstanceFrom">
        </ComponentListShift>
    </div>
    <div class="overlay" @click.stop="popoverClose" @mousedown.stop @wheel.stop></div>
</template>

<style scoped lang="scss">
.dialog_box {
    display: flex;
    flex-direction: column;
    position: fixed;
    outline: none;
    width: 240px;
    height: 480px;
    border: 1px solid #F0F0F0;
    box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.08);
    background-color: #ffffff;
    border-radius: 8px;
    box-sizing: border-box;
    z-index: 10004;

    .el-scrollbar {
        padding-right: 10px;

        .demo-collapse {
            box-sizing: border-box;
        }

        .el-collapse {
            --el-collapse-border-color: none;

            :deep(.el-collapse-item__content) {
                padding-bottom: 10px;
            }
        }

    }

    :deep(.el-collapse-item__header) {
        height: 35px;
        font-size: 12px;
        border-bottom-color: transparent;
        border-radius: 4px;
        padding-left: 4px;

        &:hover {
            background-color: var(--grey-light);
        }
    }
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10003;
    background-color: transparent;
}
</style>