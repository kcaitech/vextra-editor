<script lang="ts" setup>
import { Context } from '@/context';
import { ref, defineProps, defineEmits, computed, onMounted, onUnmounted } from 'vue';
import { CtrlElementType } from '@/context/workspace';
import { XY } from '@/context/selection';
import { Matrix } from '@kcdesign/data/basic/matrix';
import { getAngle } from '@/utils/common';
import { Point } from '../../SelectionView.vue';
interface Props {
  context: Context,
  axle: XY,
  point: Point,
  rotate: number
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'transform', type: CtrlElementType, p1: XY, p2: XY, deg: number, aType: 'rotate' | 'scale'): void
}>();
const matrix = new Matrix();
const workspace = computed(() => props.context.workspace);
const dragActiveDis = 3;
const pointContainer = ref<HTMLElement>();
let isDragging = false;
let startPosition = { x: 0, y: 0 };
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
  return map.get(props.point.type) || ''
})
const positionToCtrlElementType = new Map([
  ['rotate', props.point.type + '-rotate'],
  ['scale', props.point.type]
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
  if (event.button === 0) {
    const ct = getCtrlElementType(event);
    if (ct) {
      event.stopPropagation();
      workspace.value.setCtrl('controller');
      if (!pointContainer.value) return;
      const { clientX, clientY } = event;
      setStatus(ct);
      clt = getCtrlElementType(event);
      matrix.reset(workspace.value.matrix);
      root = workspace.value.root;
      startPosition = { x: clientX - root.x, y: clientY - root.y }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  }
}
function onMouseMove(event: MouseEvent) {
  const { clientX, clientY } = event;
  const mouseOnPage = { x: clientX - root.x, y: clientY - root.y };
  let aType: 'rotate' | 'scale' = 'scale';
  if (isDragging) {
    let deg = 0;
    if (rotating) {
      const { x: sx, y: sy } = startPosition;
      const { x: mx, y: my } = mouseOnPage;
      const { x: ax, y: ay } = props.axle;
      deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
      workspace.value.setCursor(clt, props.rotate);
      aType = 'rotate';
    }
    emit('transform', props.point.type, startPosition, mouseOnPage, deg, aType);
    props.context.repo.transactCtx.fireNotify();
    startPosition = { ...mouseOnPage };
  } else {
    if (Math.hypot(mouseOnPage.x - startPosition.x, mouseOnPage.y - startPosition.y) > dragActiveDis) {
      isDragging = true;
      props.context.repo.start('transform', {});
    }
  }
}
function onMouseUp(event: MouseEvent) {
  if (event.button === 0) {
    if (isDragging) {
      props.context.repo.commit({});
    }
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    setStatus();
    workspace.value.setCtrl('page');
    workspace.value.resetCursor();
  }
}
function mouseleave() {
  if (rotating || scaling) return;
  workspace.value.resetCursor();
}
function mousemove(event: MouseEvent) {
  if (rotating || scaling) return;
  const ct = getCtrlElementType(event);
  workspace.value.setCursor(ct, props.rotate);
}
function windowBlur() {
  if (isDragging) {
    setStatus();
    props.context.repo.commit({});
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    workspace.value.resetCursor();
    isDragging = false;
  }
}
onMounted(() => {
  window.addEventListener('blur', windowBlur);
})
onUnmounted(() => {
  window.removeEventListener('blur', windowBlur);
})
</script>
<template>
  <div ref="pointContainer" class="point-container" @mousedown="onMouseDown" @mousemove="mousemove"
    @mouseleave="mouseleave" :style="{ left: `${props.point.x}px`, top: `${props.point.y}px` }">
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
  overflow: hidden;

  >.scale {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;

    >div {
      width: 8px;
      height: 8px;
      box-sizing: border-box;
      border: 1px solid #2561D9;
      background-color: var(--theme-color-anti);
      border-radius: 2px;
    }
  }

  >.rotate {
    position: absolute;
    width: 20px;
    height: 20px;
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
