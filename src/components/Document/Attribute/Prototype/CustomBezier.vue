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
    <div class="interaction-bezier-drag">
        <canvas id="sbezier"></canvas>
    </div>
    <div class="default">
        <span>{{t('prototype.default')}}</span>
        <div class="items">
            <div class="item" v-for="(i, index) in easingFn" :key="i[0]" @click="defaultesfn(i[1])">
                <SvgIcon :icon="bezier_icons[index + 1]"/>
            </div>
        </div>
    </div>
    <div class="custom">
        <span>{{t('prototype.bezier')}}</span>
        <div class="values">
            <input v-select ref="inputs" class="value" v-for="(_, index) in 4" :key="index" v-model="customval[index]"
                @change="changevalue($event, index)" @keyup.enter="inputs![index].blur()" type="text">
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    BasicArray,
    PrototypeEasingType,
    PrototypeEasingBezier
} from '@kcdesign/data';
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import bezier1_icon from '@/assets/icons/svg/bezier1.svg';
import bezier2_icon from '@/assets/icons/svg/bezier2.svg';
import bezier3_icon from '@/assets/icons/svg/bezier3.svg';
import bezier4_icon from '@/assets/icons/svg/bezier4.svg';
import bezier5_icon from '@/assets/icons/svg/bezier5.svg';
import bezier6_icon from '@/assets/icons/svg/bezier6.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

const bezier_icons: {[key: number]: string} = {
    1: bezier1_icon,
    2: bezier2_icon,
    3: bezier3_icon,
    4: bezier4_icon,
    5: bezier5_icon,
    6: bezier6_icon,
}

interface Position {
    x: number
    y: number
}

const props = defineProps<{
    bezier: PrototypeEasingBezier | undefined
    trigger: any[],
    byshapes: number,
}>();
const emits = defineEmits<{
    (e: "setBezier", data: PrototypeEasingBezier): void;
}>();
const { t } = useI18n()
const inputs = ref<Array<HTMLInputElement> | null>()
const customval = ref<Array<string>>([])
const cp1 = ref<Position>({ x: 0, y: 0 })
const cp2 = ref<Position>({ x: 0, y: 0 })
let originalValue = [...customval.value];

const easingFn = new Map([
    [PrototypeEasingType.INCUBIC, [0.42, 0, 1, 1]],
    [PrototypeEasingType.OUTCUBIC, [0, 0, 0.58, 1]],
    [PrototypeEasingType.INOUTCUBIC, [0.42, 0, 0.58, 1]],
    [PrototypeEasingType.INBACKCUBIC, [0.3, -0.05, 0.7, -0.5]],
    [PrototypeEasingType.OUTBACKCUBIC, [0.45, 1.45, 0.8, 1]],
    [PrototypeEasingType.INOUTBACKCUBIC, [0.7, -0.4, 0.4, 1.4]],
]);


const point = computed(() => {
    return [(cp1.value.x - 40) * 0.01, (140 - cp1.value.y) * 0.01, (cp2.value.x - 40) * 0.01, (140 - cp2.value.y) * 0.01].map(i => i.toString())
})


const changevalue = (e: Event, index: number) => {
    if (isNaN(Number(customval.value[index]))) {
        customval.value[index] = originalValue[index]
    } else {
        if (index === 0 || index === 2) {
            customval.value[index] = (+customval.value[index] < 0 ? 0 : +customval.value[index] > 1 ? 1 : +customval.value[index]).toString()
        }
        if (index === 1 || index === 3) {
            customval.value[index] = (+customval.value[index] < -10000 ? -10000 : +customval.value[index] > 10000 ? 10000 : +customval.value[index]).toString()
        }
        customval.value = customval.value.map(i => i.length > 4 ? Number(i).toFixed(2) : i)
        originalValue = [...customval.value]
        cp1.value = { x: +customval.value[0] / 0.01 + 40, y: 140 - +customval.value[1] / 0.01 }
        cp2.value = { x: +customval.value[2] / 0.01 + 40, y: 140 - +customval.value[3] / 0.01 }
        const newval = point.value.map(i => parseFloat(Number(i).toFixed(2)))
        const bezier = new PrototypeEasingBezier(newval[0], newval[1], newval[2], newval[3])
        emits('setBezier', bezier)
    }
}

const defaultesfn = (val: number[]) => {
    if (customval.value.every((i, index) => i === val.map(i => i.toString())[index])) return
    customval.value = val.map(i => i.toString())
    cp1.value = { x: +customval.value[0] / 0.01 + 40, y: 140 - +customval.value[1] / 0.01 }
    cp2.value = { x: +customval.value[2] / 0.01 + 40, y: 140 - +customval.value[3] / 0.01 }
    const newval = point.value.map(i => parseFloat(Number(i).toFixed(2)))
    const bezier = new PrototypeEasingBezier(newval[0], newval[1], newval[2], newval[3]);
    emits('setBezier', bezier)
}

const dragcanvas = () => {
    const canvas = document.getElementById("sbezier") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    const dragA = ref<boolean>(false);
    const dragB = ref<boolean>(false);
    const dragLineA = ref<boolean>(false);
    const dragLineB = ref<boolean>(false);
    const lineA = ref<Path2D>();
    const lineB = ref<Path2D>();
    const pointA = ref<Path2D>();
    const pointB = ref<Path2D>();
    let minX = 40;
    let maxX = 140;
    let minY = 40;
    let maxY = 140;

    let drag = false;
    let width = 180; // Canvas的目标显示宽度
    let height = 180; // Canvas的目标显示高度

    if (window.devicePixelRatio && window.devicePixelRatio > 1) {
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
    } else {
        canvas.width = width;
        canvas.height = height;
    }


    const drawXY = () => {
        //x轴
        ctx?.beginPath();
        ctx!.strokeStyle = '#c8c8c8';
        ctx?.moveTo(minX, maxY); // 将笔移到左下角
        ctx?.lineTo(maxX, maxY); // 连线到顶角
        ctx?.closePath(); // 连线到左下角
        ctx?.stroke();

        //y轴
        ctx?.beginPath();
        ctx?.moveTo(minX, maxY); // 将笔移到左下角
        ctx?.lineTo(minX, minY); // 连线到顶角
        ctx?.closePath(); // 连线到左下角
        ctx?.stroke();

        //斜线
        ctx?.beginPath();
        ctx?.moveTo(minX, maxY); // 将笔移到左下角
        ctx?.lineTo(maxX, minY); // 连线到顶角
        ctx?.closePath(); // 连线到左下角
        ctx?.stroke();

        ctx?.setLineDash([8, 4]);

        // 偏移量20 虚线
        ctx?.beginPath();
        ctx!.lineDashOffset = 20;
        ctx?.moveTo(minX, minY);
        ctx?.lineTo(maxX, minY);
        ctx?.moveTo(maxX, minY);
        ctx?.lineTo(maxX, maxY);
        ctx?.stroke()

        ctx?.setLineDash([]);

        // 起始点和结束点
        ctx?.beginPath();
        ctx?.arc(minX, maxY, 3, 0, 2 * Math.PI); // 起始点
        ctx?.arc(maxX, minY, 3, 0, 2 * Math.PI); // 结束点
        ctx?.fill();

    }

    const drawbezier = (cp1: Position, cp2: Position) => {
        // 三次贝塞尔曲线
        ctx?.beginPath();
        ctx!.strokeStyle = 'black';
        ctx?.moveTo(minX, maxY);
        ctx?.bezierCurveTo(cp1.x < minX ? minX : cp1.x < maxX ? cp1.x : maxX, cp1.y, cp2.x < minX ? minX : cp2.x < maxX ? cp2.x : maxX, cp2.y, maxX, minY);
        ctx?.stroke();

        //起始点与控点A的连接线
        lineA.value = new Path2D()
        lineA.value.moveTo(minX, maxY);
        lineA.value.lineTo(cp1.x < minX ? minX : cp1.x < maxX ? cp1.x : maxX, cp1.y)
        ctx?.stroke(lineA.value);

        //结束点与控点B的连接线
        lineB.value = new Path2D()
        lineB.value.moveTo(maxX, minY);
        lineB.value.lineTo(cp2.x < minX ? minX : cp2.x < maxX ? cp2.x : maxX, cp2.y)
        ctx?.stroke(lineB.value);

        // 控制点 A
        pointA.value = new Path2D()
        pointA.value.arc(cp1.x < minX ? minX : cp1.x < maxX ? cp1.x : maxX, cp1.y, 5, 0, 2 * Math.PI)
        ctx!.fillStyle = (dragA.value || dragLineA.value) ? 'blue' : 'black';
        ctx!.strokeStyle = (dragA.value || dragLineA.value) ? '#fff' : 'transparent';
        ctx!.lineWidth = (dragA.value || dragLineA.value) ? 2 : 0;
        if (dragA.value || dragLineA.value) ctx?.stroke(pointA.value);
        ctx?.fill(pointA.value);


        // 控制点 B
        pointB.value = new Path2D()
        pointB.value.arc(cp2.x < minX ? minX : cp2.x < maxX ? cp2.x : maxX, cp2.y, 5, 0, 2 * Math.PI)
        ctx!.fillStyle = (dragB.value || dragLineB.value) ? 'blue' : 'black';
        ctx!.strokeStyle = (dragB.value || dragLineB.value) ? '#fff' : 'transparent';
        ctx!.lineWidth = (dragB.value || dragLineB.value) ? 2 : 0;
        if (dragB.value || dragLineB.value) ctx?.stroke(pointB.value);
        ctx?.fill(pointB.value);
    }

    drawXY()
    drawbezier(cp1.value, cp2.value)

    const down = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const canvasX = Math.round(e.clientX - rect.left) * (canvas.width / rect.width);
        const canvasY = Math.round(e.clientY - rect.top) * (canvas.height / rect.height);
        ctx!.lineWidth = 6;
        const isInsideA = ctx!.isPointInPath(pointA.value!, canvasX, canvasY);
        const isInsideB = ctx!.isPointInPath(pointB.value!, canvasX, canvasY);
        const isInsidelineA = ctx!.isPointInStroke(lineA.value!, canvasX, canvasY)
        const isInsidelineB = ctx!.isPointInStroke(lineB.value!, canvasX, canvasY)
        let arr = [isInsideA, isInsideB, isInsidelineA, isInsidelineB]
        for (let index = 0; index < arr.length; index++) {
            if (arr[index]) {
                if (index === 0) {
                    drag = true
                    dragA.value = true
                    break
                }
                if (index === 1) {
                    drag = true
                    dragB.value = true
                    break
                }
                if (index === 2) {
                    drag = true
                    dragLineA.value = true
                    break
                }
                if (index === 3) {
                    drag = true
                    dragLineB.value = true
                    break
                }
            }
        }
        ctx!.lineWidth = 1;
        ctx?.reset()
        ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
        drawXY()
        drawbezier(cp1.value, cp2.value)
        if (dragA.value || dragB.value || dragLineA.value || dragLineB.value) {
            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        }
    }

    watchEffect(() => {
        ctx?.reset();
        ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
        drawXY()
        drawbezier(cp1.value, cp2.value)
    })

    watch(() => props.byshapes, () => {
        if (!props.bezier) return
        customval.value = [props.bezier.x1.toString(), props.bezier.y1.toString(), props.bezier.x2.toString(), props.bezier.y2.toString()]
        cp1.value = { x: +customval.value[0] / 0.01 + 40, y: 140 - +customval.value[1] / 0.01 }
        cp2.value = { x: +customval.value[2] / 0.01 + 40, y: 140 - +customval.value[3] / 0.01 }

    })

    const move = (e: MouseEvent) => {
        if (!drag) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        //保存控制点A和B
        if (dragA.value) {
            cp1.value.x = x < minX ? minX : x < maxX ? x : maxX;
            cp1.value.y = y;
        }
        if (dragB.value) {
            cp2.value.x = x < minX ? minX : x < maxX ? x : maxX;
            cp2.value.y = y;
        }

        if (dragLineA.value) {
            cp1.value.x = (cp1.value.x + e.movementX) < minX ? minX : (cp1.value.x + e.movementX) < maxX ? (cp1.value.x + e.movementX) : maxX;
            cp1.value.y = cp1.value.y + e.movementY
        }

        if (dragLineB.value) {
            cp2.value.x = (cp2.value.x + e.movementX) < minX ? minX : (cp2.value.x + e.movementX) < maxX ? (cp2.value.x + e.movementX) : maxX;
            cp2.value.y = cp2.value.y + e.movementY
        }

        const val = point.value.map(i => i.length >= 4 ? Number(i).toFixed(2) : i)

        customval.value = val

    }

    const up = (e: MouseEvent) => {
        document.removeEventListener('mouseup', up)
        document.removeEventListener('mousemove', move)
        if (!drag) return;
        drag = dragA.value = dragB.value = dragLineA.value = dragLineB.value = false
        ctx?.reset();
        ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
        drawXY()
        drawbezier(cp1.value, cp2.value)
        const bezier = new PrototypeEasingBezier(+customval.value[0], +customval.value[1], +customval.value[2], +customval.value[3])
        emits('setBezier', bezier)
    }

    canvas.removeEventListener('mousedown', down);
    canvas.addEventListener('mousedown', down);
}

onMounted(() => {
    dragcanvas();
    if (!props.bezier) return;
    customval.value = [props.bezier.x1.toString(), props.bezier.y1.toString(), props.bezier.x2.toString(), props.bezier.y2.toString()]
    cp1.value = { x: +customval.value[0] / 0.01 + 40, y: 140 - +customval.value[1] / 0.01 }
    cp2.value = { x: +customval.value[2] / 0.01 + 40, y: 140 - +customval.value[3] / 0.01 }
})


</script>

<style lang="scss" scoped>
.interaction-bezier-drag {
    width: 100%;
    height: 100%;
    margin: 8px auto 0 auto;
    background-color: #F5F5F5;
    border-radius: 6px;
}

.default {
    display: flex;
    height: 32px;
    margin-top: 8px;

    span {
        flex: 0.2;
        font-size: 12px;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .items {
        flex: 0.8;
        display: flex;
        align-items: center;

        .item {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 22px;
            width: 22px;
            border-radius: 6px;

            svg {
                margin: auto;
                width: 100%;
                height: 100%;
            }

            &:hover {
                background-color: #F5F5F5;
            }
        }
    }
}

.custom {
    display: flex;
    height: 32px;
    margin-top: 8px;

    span {
        flex: 0.2;
        font-size: 12px;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .values {
        flex: 0.8;
        display: flex;
        align-items: center;
        background-color: #F5F5F5;
        border: 1px solid transparent;
        border-radius: 6px;
        box-sizing: border-box;

        .value {
            flex: 1;
            font-size: 12px;
            outline: none;
            border: none;
            width: 100%;
            background-color: transparent;
            text-align: center;

        }

        &:has(.value:focus) {
            border: 1px solid #1878F5;
        }
    }
}
</style>
