<script lang="ts" setup>
import { Context } from '@/context';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { CtrlElementType } from '@/context/workspace';
import { XY, ClientXY, PageXY } from '@/context/selection';
import { Matrix } from '@kcdesign/data';
import { getAngle } from '@/utils/common';
import { Point } from '../../SelectionView.vue';
import { AsyncBaseAction, ControllerFrame } from "@kcdesign/data";
import { Shape } from '@kcdesign/data';
interface Props {
  context: Context,
  axle: XY,
  point: Point,
  rotate: number,
  controllerFrame: Point[]
}
const props = defineProps<Props>();
const matrix = new Matrix();
const workspace = computed(() => props.context.workspace);
const dragActiveDis = 3;
const pointContainer = ref<HTMLElement>();
let isDragging = false;
let startPosition: ClientXY = { x: 0, y: 0 };
let root = { x: 0, y: 0 };
let scaling: boolean = false;
let rotating: boolean = false;
let clt: CtrlElementType;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let origin_frame: { x: number, y: number, width: number, height: number } = { x: 0, y: 0, width: 0, height: 0 };
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
  const selection = props.context.selection;
  const workspace = props.context.workspace;
  if (!ct) {
    rotating = false;
    scaling = rotating;
  } else if (ct.endsWith('rotate')) {
    rotating = true;
    scaling = !rotating;
    selection.unHoverShape();
  } else {
    rotating = false;
    scaling = !rotating;
    selection.unHoverShape();
  }
  workspace.rotating(rotating);
  workspace.scaling(scaling);
}
function getCtrlElementType(event: MouseEvent) {
  const ele = (event.target as HTMLDivElement)?.dataset?.pointId || '';
  return positionToCtrlElementType.get(ele) as CtrlElementType;
}
function calcOrigin() {
  const [p1, _, p3, __] = props.controllerFrame;
  const p1OnPage = matrix.inverseCoord({ x: p1.x, y: p1.y });
  const p3OnPage = matrix.inverseCoord({ x: p3.x, y: p3.y });
  origin_frame = {
    x: p1OnPage.x,
    y: p1OnPage.y,
    width: p3OnPage.x - p1OnPage.x,
    height: p3OnPage.y - p1OnPage.y
  };
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
      startPosition = { x: clientX - root.x, y: clientY - root.y };
      calcOrigin();
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  }
}
function onMouseMove(event: MouseEvent) {
  const { clientX, clientY } = event;
  const mouseOnClient: ClientXY = { x: clientX - root.x, y: clientY - root.y };
  let aType: 'rotate' | 'scale' = 'scale';
  if (isDragging) {
    let deg = 0;
    if (rotating) {
      const { x: sx, y: sy } = startPosition;
      const { x: mx, y: my } = mouseOnClient;
      const { x: ax, y: ay } = props.axle;
      deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
      workspace.value.setCursorStyle(clt, props.rotate);
      aType = 'rotate';
    }
    if (asyncBaseAction) {
      workspace.value.scaling(true);
      matrix.reset(workspace.value.matrix);
      const selection = props.context.selection;
      const shapes = selection.selectedShapes;
      const len = shapes.length;
      if (len === 1) {
        const p1OnPage: PageXY = matrix.inverseCoord(startPosition.x, startPosition.y);
        const p2Onpage: PageXY = matrix.inverseCoord(mouseOnClient.x, mouseOnClient.y);
        asyncBaseAction.execute(props.point.type, p1OnPage, p2Onpage, deg, aType);
      } else if (len > 1) {
        props.context.workspace.setSelectionViewUpdater(false);
        const [p1, p2, p3, p4] = props.controllerFrame;
        if (props.point.type === CtrlElementType.RectLT) {
          // todo
        } else if (props.point.type === CtrlElementType.RectRT) {
          // todo
        } else if (props.point.type === CtrlElementType.RectRB) {
          // todo
        } else if (props.point.type === CtrlElementType.RectLB) {
          // todo
        }
      }
    }
    props.context.workspace.setSelectionViewUpdater(true);
    props.context.workspace.selectionViewUpdate();
    startPosition = { ...mouseOnClient };
  } else {
    if (Math.hypot(mouseOnClient.x - startPosition.x, mouseOnClient.y - startPosition.y) > dragActiveDis) {
      isDragging = true;
      const shapes: Shape[] = props.context.selection.selectedShapes;
      asyncBaseAction = props.context.editor.controller().asyncRectEditor(shapes, props.context.selection.selectedPage!);
    }
  }
}
function onMouseUp(event: MouseEvent) {
  if (event.button === 0) {
    if (isDragging) {
      if (asyncBaseAction) {
        asyncBaseAction = asyncBaseAction.close();
      }
      isDragging = false;
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    setStatus();
    workspace.value.scaling(false);
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
  workspace.value.setCursorStyle(ct, props.rotate);
}
function windowBlur() {
  if (isDragging) {
    setStatus();
    if (asyncBaseAction) {
      asyncBaseAction = asyncBaseAction.close();
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
