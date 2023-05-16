<script lang="ts" setup>
import { Context } from '@/context';
import { ref, defineProps, computed, onMounted, onUnmounted } from 'vue';
import { CtrlElementType } from '@/context/workspace';
import { XY } from '@/context/selection';
import { Matrix } from '@kcdesign/data/basic/matrix';
import { getAngle } from '@/utils/common';
import { AsyncLineAction } from '@kcdesign/data/editor/controller';
interface Props {
  context: Context,
  axle: XY,
  rotate: number
  pointType: CtrlElementType
}
const props = defineProps<Props>();

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
let asyncLineEditor: AsyncLineAction | undefined = undefined;
const rotatePositon = computed(() => {
  const map = new Map([
    [CtrlElementType.LineStart, 'lt'],
    [CtrlElementType.RectRT, 'rt'],
    [CtrlElementType.LineEnd, 'rb'],
    [CtrlElementType.RectLB, 'lb']
  ])
  return map.get(props.pointType) || ''
})
const positionToCtrlElementType = new Map([
  ['rotate', props.pointType + '-rotate'],
  ['scale', props.pointType]
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
    workspace.value.setCtrl('controller');
    const ct = getCtrlElementType(event);
    if (ct) {
      event.stopPropagation();
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
    if (asyncLineEditor) {
      matrix.reset(workspace.value.matrix);
      const end = matrix.inverseCoord(mouseOnPage.x, mouseOnPage.y);
      asyncLineEditor.execute(props.pointType, end, deg, aType);
    }
    startPosition = { ...mouseOnPage };
  } else {
    if (Math.hypot(mouseOnPage.x - startPosition.x, mouseOnPage.y - startPosition.y) > dragActiveDis) {
      const shape = props.context.selection.selectedShapes[0];
      if (shape) {
        asyncLineEditor = props.context.editor.controller().asyncLineEditor(shape);
        isDragging = true;
      }
    }
  }
}
function onMouseUp(event: MouseEvent) {
  if (event.button === 0) {
    workspace.value.setCtrl('page');
    if (isDragging) {
      if (asyncLineEditor) {
        asyncLineEditor = asyncLineEditor.close();
      }
      isDragging = false;
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    setStatus();
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
    if (asyncLineEditor) {
      asyncLineEditor = asyncLineEditor.close();
    }
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
  <div ref="pointContainer" class="point-container"
    :style="`top: -9px; ${props.pointType === CtrlElementType.LineStart ? 'left: -16px' : 'right: -16px'}`"
    @mousedown="onMouseDown" @mousemove="mousemove" @mouseleave="mouseleave">
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
    transform-origin: bottom right;
    transform: rotate(335deg);
  }

  >.rb {
    right: 0px;
    bottom: 0px;
    transform-origin: left top;
    transform: rotate(315deg);
  }
}
</style>
