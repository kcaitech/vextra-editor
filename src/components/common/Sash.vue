/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
    <div ref="sashEl" :style="style" :class="{ sash: true }" @mousedown="onMouseDown">
        <div class="line" :style="lineStyle" :class="{ draging: draging }" />
    </div>
</template>
<!-- 需要 parent relative/absolute 定位。 然后再指定 sash 的位置-->

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
    (e: 'dragStart'): void;
    (e: 'offset', offset: number): void;
    (e: 'dragEnd'): void;
}>();

const props = defineProps<{ side: 'right' | 'bottom' | 'top' | 'left' }>();

const draging = ref(false);
// 拖动 3px 后开始触发移动
const dragActiveDis = 3;
const downPt: { x: number, y: number } = { x: 0, y: 0 };
let isDown = false;

function onMouseDown(event: MouseEvent) {
    isDown = true;
    draging.value = false;
    downPt.x = event.screenX;  //当前鼠标的位置
    downPt.y = event.screenY;
    event.preventDefault();
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}
function onMouseUp(event: MouseEvent) {
    draging.value = false;
    isDown = false;
    event.preventDefault();
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    emit('dragEnd');
}
function onMouseMove(event: MouseEvent) {
    // console.log('mouse move', 'isDown:' + isDown, 'draging:' + draging)
    event.preventDefault();
    if (draging.value && isDown) {
        emitOffset(event);
    }
    else if (isDown) {
        const dx = event.screenX - downPt.x;
        const dy = event.screenY - downPt.y;
        const diff = Math.hypot(dx, dy);
        if (diff > dragActiveDis) {
            draging.value = true;
            emit('dragStart');
            emitOffset(event);
        }
    }
}
function emitOffset(event: MouseEvent) {
    const dx = event.screenX - downPt.x;
    const dy = event.screenY - downPt.y;
    const _offset = _isHor ? dy : dx;
    if (_offset !== 0) emit('offset', _offset);
}

const _isHor = props.side === 'bottom' || props.side === 'top';

const style = {
    width: _isHor ? '100%' : '6px',
    height: _isHor ? '6px' : '100%',
    cursor: _isHor ? 'ns-resize' : 'ew-resize',
    top: _isHor ? undefined : '0px',
    left: _isHor ? '0px' : undefined,
    [props.side]: '-3px',
};

const lineStyle = {
    width: _isHor ? '100%' : '1px',
    height: _isHor ? '1px' : '100%',
    top: _isHor ? undefined : '0px',
    left: _isHor ? '0px' : undefined,
    [props.side]: '2px',
}

const sashEl = ref<HTMLElement>();

</script>

<style lang="scss" scoped>
.sash {
    position: absolute;
    z-index: 1;
}

.draging {
    // background-color: darkgrey;
    background-color: transparent;
}

.line {
    // background-color: var(--theme-color-line);
    background-color: transparent;
    position: inherit;
}
</style>
