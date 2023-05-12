<script setup lang="ts">
import { defineProps, computed, onMounted, onUnmounted, watchEffect, ref } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Action, CtrlElementType, WorkSpace } from "@/context/workspace";
import { XY, ClientXY, PageXY } from "@/context/selection";
import { translate, adjustLT2, adjustLB2, adjustRT2, adjustRB2, translateTo } from "@kcdesign/data/editor/frame";
import CtrlBar from "./Bars/CtrlBar.vue";
import CtrlPoint from "./Points/CtrlPoint.vue";
import { Point, Bar } from "../SelectionView.vue";
import { GroupShape, Shape, ShapeType } from "@kcdesign/data/data/shape";
import { createRect, getAxle, getRectWH } from "@/utils/common";
import { fourWayWheel, Wheel, forCtrlRect } from "@/utils/contentFn";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { groupPassthrough, forGroupHover } from "@/utils/scout";
interface Props {
    context: Context,
    isController: boolean
    controllerFrame: Point[],
    rotate: number
}
const props = defineProps<Props>();
const editing = ref<boolean>(false); // 是否进入路径编辑状态
const visible = ref<boolean>(true);

export function useController() {
    const editing = ref<boolean>(false); // 是否进入路径编辑状态
    const visible = ref<boolean>(true);
    const dragActiveDis = 3;
    let timer: any;
    const duration: number = 350; // 双击判定时长 ms
    let isDragging = false;



}
</script>