<script lang="ts" setup>
import { Context } from '@/context';
import { ref, defineProps, defineEmits, computed } from 'vue';
import { CtrlElementType } from '@/context/workspace';
import { AbsolutePosition } from '@/context/selection';
import { Matrix } from '@/basic/matrix';
import { getAngle } from '@/utils/common';
import { CPoint } from '../CtrlRect/RectangleCtrl.vue'
import { CtrlRect } from '../SelectionView.vue';
interface Props {
  context: Context,
  axle: AbsolutePosition,
  point: CPoint,
  ctrlRect: CtrlRect
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'transform', type: CtrlElementType, delta: { x: number, y: number, deg: number },): void
}>();
const matrix = new Matrix();
const workspace = computed(() => props.context.workspace);
const dragActiveDis = 3;
const pointContainer = ref<HTMLElement>();
let isDragging = false;
let startPosition = { x: 0, y: 0 };
let systemPosition = { x: 0, y: 0 };
let root = { x: 0, y: 0 };
let scaling: boolean = false;
let rotating: boolean = false;
let clt: CtrlElementType;
const rotatePositon = computed(() => {
  const map = new Map([
    [CtrlElementType.RectLT, 'lt'],
    [CtrlElementType.RectRT, 'rt'],
    [CtrlElementType.RectRB, 'rb'],
    [CtrlElementType.RectLB, 'lb']
  ])
  return map.get(props.point[0]) || ''
})
const positionToCtrlElementType = new Map([
  ['rotate', props.point[0] + '-rotate'],
  ['scale', props.point[0]]
])
function setStatus(ct?: CtrlElementType) {
  if (!ct) {
    rotating = false;
    scaling = rotating;
  } else if (ct.endsWith('rotate')) {
    rotating = true;
    scaling = !rotating;
    props.context.selection.unHoverShape();
  } else {
    rotating = false;
    scaling = !rotating;
    props.context.selection.unHoverShape();
  }
  workspace.value.rotating(rotating);
  workspace.value.scaling(scaling);
}
function getCtrlElementType(event: MouseEvent) {
  const ele = (event.target as HTMLDivElement)?.dataset?.pointId || '';
  return positionToCtrlElementType.get(ele) as CtrlElementType;
}

// mouse event flow: down -> move -> up
function onMouseDown(event: MouseEvent) {
  if (workspace.value.transforming) return;
  const ct = getCtrlElementType(event);
  if (ct) {
    event.stopPropagation();
    if (!pointContainer.value || !props.context.repo) return;
    const { button, clientX, clientY } = event;
    if (button !== 0) return;
    setStatus(ct);
    clt = getCtrlElementType(event);
    matrix.reset(workspace.value.matrix);
    root = workspace.value.root;
    startPosition = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    systemPosition = { x: clientX, y: clientY };
    props.context.repo.start('transform', {});
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
function onMouseMove(event: MouseEvent) {
  const { clientX, clientY } = event;
  if (isDragging && props.context.repo) {
    const mouseOnPage = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const delta = { x: mouseOnPage.x - startPosition.x, y: mouseOnPage.y - startPosition.y, deg: 0 };
    if (rotating) {
      const { x: sx, y: sy } = startPosition;
      const { x: mx, y: my } = mouseOnPage;
      const { x: ax, y: ay } = props.axle;
      delta.deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
      workspace.value.setCursor(clt, props.ctrlRect.rotate);
    }
    emit('transform', props.point[0], delta);
    props.context.repo.transactCtx.fireNotify();
    startPosition = { x: mouseOnPage.x, y: mouseOnPage.y };
    systemPosition = { x: clientX, y: clientY };
  } else {
    if (Math.hypot(systemPosition.x - clientX, systemPosition.y - clientY) > dragActiveDis) {
      isDragging = true;
    }
  }
}
function onMouseUp(event: MouseEvent) {
  if (event.button) return;
  if (!isDragging) {
    props.context.repo?.rollback();
  } else {
    props.context.repo?.commit({});
  }
  isDragging = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  setStatus();
  workspace.value.resetCursor();
}
function mouseleave() {
  if (rotating || scaling) return;
  workspace.value.resetCursor();
}
function mousemove(event: MouseEvent) {
  if (rotating || scaling) return;
  const ct = getCtrlElementType(event);
  workspace.value.setCursor(ct, props.ctrlRect.rotate);
}
</script>
<template>
  <div ref="pointContainer" class="point-container" @mousedown="onMouseDown" @mousemove="mousemove"
    @mouseleave="mouseleave" :style="{ left: `${props.point[1]}px`, top: `${props.point[2]}px` }">
    <div data-point-id="rotate" :class="`rotate ${rotatePositon}`"></div>
    <div data-point-id="scale" class="scale">
      <div data-point-id="scale"></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.point-container {
  position: absolute;
  z-index: 1;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(43, 144, 226, 0.573);
  overflow: hidden;

  >.scale {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    background-color: rgba(255, 228, 196, 0.511);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;

    >div {
      width: 8px;
      height: 8px;
      box-sizing: border-box;
      border: 1px solid var(--active-color);
      background-color: var(--theme-color-anti);
    }
  }

  >.rotate {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: rgba(137, 43, 226, 0.673);
  }

  >.lt {
    top: 0px;
    left: 0px;
  }

  >.rt {
    right: 0px;
    top: 0px;
  }

  >.rb {
    right: 0px;
    bottom: 0px;
  }

  >.lb {
    left: 0px;
    bottom: 0px;
  }
}
</style>
