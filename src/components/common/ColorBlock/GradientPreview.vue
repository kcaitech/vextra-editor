/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Gradient, GradientType } from "@kcdesign/data";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { getHorizontalAngle } from "@/utils/common";
import { toRGBA } from "@/components/common/ColorPicker/utils";

const props = defineProps<{ params: { data: Gradient } }>();
const style = ref<any>({});

function get_linear_gradient(gradient: Gradient) {
    const {from, to, stops} = gradient;
    const rotate = getHorizontalAngle({x: from.x * 10, y: from.y * 10}, {x: to.x * 10, y: to.y * 10});
    const colors = [];
    if (stops.length === 1) {
        return {'background': toRGBA(stops[0].color)};
    }
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const c = toRGBA(stop.color);
        colors.push(`${c} ${stop.position * 100}%`)
    }
    const linear = `linear-gradient(${rotate + 90}deg, ${colors.join(', ')})`
    return {'background': linear};
}

function get_radial_gradient(gradient: Gradient) {
    const {stops} = gradient;
    const colors = [];
    if (stops.length === 1) {
        return {'background': toRGBA(stops[0].color)};
    }
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const c = toRGBA(stop.color);
        colors.push(`${c} ${stop.position * 100}%`)
    }
    const radial = `radial-gradient(circle closest-side, ${colors.join(', ')})`
    return {'background-image': radial};
}

function get_angular_gradient(gradient: Gradient) {
    const {from, to, stops} = gradient;
    let angular_gradient = "";
    const sc = stops.length;
    const calcSmoothColor = () => {
        const firstStop = stops[0];
        const lastStop = stops[sc - 1];
        const lastDistance = 1 - lastStop.position;
        const firstDistance = firstStop.position;
        const fColor = firstStop.color || 'white';
        const lColor = lastStop.color || 'white';
        const ratio = 1 / (firstDistance + lastDistance);
        const fRatio = lastDistance * ratio;
        const lRatio = firstDistance * ratio;
        let r = (fColor.red * fRatio + lColor.red * lRatio);
        let g = (fColor.green * fRatio + lColor.green * lRatio);
        let b = (fColor.blue * fRatio + lColor.blue * lRatio);
        let a = (fColor.alpha * fRatio + lColor.alpha * lRatio);
        r = Math.min(Math.max(Math.round(r), 0), 255);
        g = Math.min(Math.max(Math.round(g), 0), 255);
        b = Math.min(Math.max(Math.round(b), 0), 255);
        a = Math.min(Math.max(a, 0), 1);
        return {r, g, b, a};
    }
    if (sc > 0 && stops[0].position > 0) {
        const {r, g, b, a} = calcSmoothColor();
        angular_gradient = "rgba(" + r + "," + g + "," + b + "," + a + ")" + " 0deg";
    }
    for (let i = 0; i < sc; i++) {
        const stop = stops[i];
        const color = stop.color || 'white';
        const rgbColor = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
        const deg = Math.round(stop.position * 360)// % 360;
        angular_gradient.length > 0 && (angular_gradient = angular_gradient + ",")
        angular_gradient = angular_gradient + rgbColor + " " + deg + "deg";
    }
    if (sc > 0 && stops[sc - 1].position < 1) {
        const {r, g, b, a} = calcSmoothColor();
        angular_gradient = angular_gradient + "," + "rgba(" + r + "," + g + "," + b + "," + a + ")" + " 360deg";
    }
    const rotate = Math.atan2((to.y * 10 - from.y * 10), (to.x * 10 - from.x * 10)) / Math.PI * 180 + 90;
    const f = "from " + rotate + "deg at " + from.x * 100 + "% " + from.y * 100 + "%";
    const angular = "conic-gradient(" + f + "," + angular_gradient + ")"
    return {'background': angular, width: '-webkit-fill-available'};
}

function draw() {
    const gradient = props.params.data;
    if (gradient.gradientType === GradientType.Linear) {
        style.value = get_linear_gradient(gradient);
    } else if (gradient.gradientType === GradientType.Radial) {
        style.value = get_radial_gradient(gradient);
    } else {
        style.value = get_angular_gradient(gradient);
    }

    style.value['width'] = "100%";
    style.value['height'] = "100%";
    style.value['position'] = "absolute";
}

onMounted(draw);
onUnmounted(watch(() => props.params, draw));
</script>
<template>
    <div :style="style"/>
</template>