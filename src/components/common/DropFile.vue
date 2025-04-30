/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
    <div class="dropfile" :class="{ active: active }" @mouseover="onMouseOver" @dragenter="onDragEnter"
        @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
        <div class="layout">
            <div class="content" @click="picker.invoke()">
                <SvgIcon :icon="drop_here_icon" class-name="drop-icon" />
                <!-- <DropHereIcon /> -->
                <p class="tip">Click or Drop Sketch/Fig/Vext Files Here</p>
            </div>
            <slot />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { FilePicker } from './filepicker';
import SvgIcon from '@/components/common/SvgIcon.vue';
import drop_here_icon from '@/assets/icons/svg/drop-here.svg';
const active = ref(false);

const emit = defineEmits<{
    (e: 'pick', value: File): void;
}>();

const picker = new FilePicker('.sketch,.fig,.vext,.moss', (file) => {
    emit('pick', file)
});

function onDrop(event: any) {
    if (isDropFile(event)) {
        const file = getDropFile(event);
        if (file) {
            emit('pick', file);
        }
    }
}

function isDropFile(event: DragEvent): boolean {
    const dropItems = Array.from(event.dataTransfer?.items || []);
    return dropItems.some((item) => item.kind === 'file')
}

function getDropFile(event: DragEvent): File | null {
    const dropItems = Array.from(event.dataTransfer?.items || []);
    for (let i = 0, len = dropItems.length; i < len; i++) {
        const item = dropItems[i];
        if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) return file;
        }
    }
    return null;
}

function onDragLeave() {
    active.value = false;
}

function onDragOver(event: DragEvent) {
    event.preventDefault();
    if (isDropFile(event)) {
        // const file = getDropFile(event)
        active.value = true;
    }
}

function onDragEnter(event: DragEvent) {
    event.preventDefault();
    if (isDropFile(event)) {
        // const file = getDropFile(event)
        active.value = true;
    }
}
function onMouseOver() {
    active.value = false;
}

onUnmounted(() => {
    picker.unmount();
})
</script>
<style scoped>
.dropfile {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909096;
}

.layout {
    width: auto;
    height: auto;
    display: flex;
    flex-direction: row;
}

.content {
    margin-bottom: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.content:hover {
    color: #1c7dff;
    cursor: pointer;
}

.empty.active {
    color: #1c7dff;
}

.tip {
    font-size: 20px;
    margin-top: 20px;
}
</style>
