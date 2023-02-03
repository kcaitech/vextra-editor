<template>
    <div ref="sashEl" :style="style" :class="{ sash: true, draging: draging }" @mousedown="onMouseDown"></div>
</template>
<!-- 需要 parent relative/absolute 定位。 然后再指定 sash 的位置-->
<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue';

const emit = defineEmits<{
    (e: 'dragStart'): void;
    (e: 'offset', offset: number): void;
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
    downPt.x = event.screenX;
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

const sashEl = ref<HTMLElement>();

</script>
<style scoped>
.sash {
    position: absolute;
    /* background-color: red; */
}

.draging {
    background-color: gray;
}
</style>
