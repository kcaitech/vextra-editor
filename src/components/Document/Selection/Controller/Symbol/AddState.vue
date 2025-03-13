/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { Context } from '@/context';
import { find_space_for_state, make_default_state, make_state, SymbolType } from '@/utils/symbol';
import {
    ColVector3D, 
    Shape,
    ShapeView,
    SymbolView, 
    Transform
} from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Point } from "@/components/Document/Selection/SelectionView.vue";

interface Props {
    context: Context;
    shape: ShapeView;

    symbolType: SymbolType;
    cFrame: Point[];
}

const props = defineProps<Props>();
const { t } = useI18n();
const transform = ref<string>('');

function update() {
    transform.value = gen_add_button_transform();
}

function gen_add_button_transform() {
    const shape = props.shape;
    const { x, y, width, height } = shape.frame;

    const fromRoot = (shape.matrix2Root());
    const clientMatrix = (props.context.workspace.matrix);

    const transform = new Transform()
        .setTranslate(props.symbolType === SymbolType.Union
            ? ColVector3D.FromXY(x + width / 2, y + height)
            : ColVector3D.FromXY(x + width, y + height / 2))
        .addTransform(fromRoot)
        .addTransform(clientMatrix)
        transform.clearSkew()
        transform.clearScaleSize();
    const translateVector = props.symbolType === SymbolType.Union ? ColVector3D.FromXY(-8, 8) : ColVector3D.FromXY(8, -8);
    return (transform.translateInLocal(translateVector)).toString();
}

function down(e: MouseEvent) {
    if (e.button !== 0) return;

    props.context.menu.menuMount();

    e.stopPropagation();

    let make_result: Shape | undefined;
    if (props.symbolType === SymbolType.Union) {
        make_default_state(props.context, t);
    } else if (props.symbolType === SymbolType.State) {
        const state = props.context.selection.symbolstate;
        if (!state) return;
        const symbol = state.parent as SymbolView;
        if (!symbol) return;

        const result = find_space_for_state(symbol, state);

        make_result = make_state(props.context, t, result?.x);
        if (!make_result) {
            return;
        }

        const page = props.context.selection.selectedPage!;
        props.context.nextTick(page, () => {
            const s = make_result && page.getShape(make_result.id);
            props.context.selection.selectShape(s);
        })
    }
}

const stop = watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);

    update();
});
const uninstallFrameWatcher = watch(() => props.cFrame, update);
onMounted(() => {
    props.shape.watch(update);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    stop();
    uninstallFrameWatcher();
})
</script>
<template>
<g :style="{ transform }" @mousedown="down">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        fill="none"
        width="16"
        height="16"
        viewBox="0 0 16 16"
    >
        <defs>
            <clipPath id="master_svg0_747_01860">
                <rect x="0" y="0" width="16" height="16" rx="4"/>
            </clipPath>
            <clipPath id="master_svg1_747_02667">
                <rect x="2" y="2" width="12" height="12" rx="0"/>
            </clipPath>
        </defs>
        <g clip-path="url(#master_svg0_747_01860)">
            <rect x="0" y="0" width="16" height="16" rx="4" fill="#7F58F9" fill-opacity="1"/>
            <g clip-path="url(#master_svg1_747_02667)">
                <g>
                    <path
                        d="M8.6,7.4L8.6,4.4375Q8.6,4.3784051999999996,8.588470000000001,4.320446Q8.57694,4.262486,8.55433,4.20789Q8.53171,4.153293,8.49888,4.104158Q8.46605,4.055022,8.42426,4.013236Q8.382480000000001,3.97145,8.33334,3.938618Q8.28421,3.905787,8.229610000000001,3.883172Q8.17501,3.860558,8.117049999999999,3.849029Q8.05909,3.8375,8,3.8375Q7.940910000000001,3.8375,7.88295,3.849029Q7.82499,3.860558,7.77039,3.883172Q7.71579,3.905787,7.66666,3.938618Q7.61752,3.97145,7.57574,4.013236Q7.53395,4.055022,7.50112,4.104158Q7.46829,4.153293,7.44567,4.20789Q7.4230599999999995,4.262486,7.41153,4.320446Q7.4,4.3784051999999996,7.4,4.4375L7.4,7.4L4.4375,7.4Q4.3784051999999996,7.4,4.320446,7.41153Q4.262486,7.4230599999999995,4.20789,7.44567Q4.153293,7.46829,4.104158,7.50112Q4.055022,7.53395,4.013236,7.57574Q3.97145,7.61752,3.938618,7.66666Q3.905787,7.71579,3.883172,7.77039Q3.860558,7.82499,3.849029,7.88295Q3.8375,7.940910000000001,3.8375,8Q3.8375,8.05909,3.849029,8.117049999999999Q3.860558,8.17501,3.883172,8.229610000000001Q3.905787,8.28421,3.938618,8.33334Q3.97145,8.382480000000001,4.013236,8.42426Q4.055022,8.46605,4.104158,8.49888Q4.153293,8.53171,4.20789,8.55433Q4.262486,8.57694,4.320446,8.588470000000001Q4.3784051999999996,8.6,4.4375,8.6L7.4,8.6L7.4,11.5625Q7.4,11.6216,7.41153,11.679549999999999Q7.4230599999999995,11.73751,7.44567,11.792110000000001Q7.46829,11.84671,7.50112,11.89584Q7.53395,11.944980000000001,7.57574,11.98676Q7.61752,12.02855,7.66666,12.06138Q7.71579,12.09421,7.77039,12.11683Q7.82499,12.13944,7.88295,12.150970000000001Q7.940910000000001,12.1625,8,12.1625Q8.05909,12.1625,8.117049999999999,12.150970000000001Q8.17501,12.13944,8.229610000000001,12.11683Q8.28421,12.09421,8.33334,12.06138Q8.382480000000001,12.02855,8.42426,11.98676Q8.46605,11.944980000000001,8.49888,11.89584Q8.53171,11.84671,8.55433,11.792110000000001Q8.57694,11.73751,8.588470000000001,11.679549999999999Q8.6,11.6216,8.6,11.5625L8.6,8.6L11.5625,8.6Q11.6216,8.6,11.679549999999999,8.588470000000001Q11.73751,8.57694,11.792110000000001,8.55433Q11.84671,8.53171,11.89584,8.49888Q11.944980000000001,8.46605,11.98676,8.42426Q12.02855,8.382480000000001,12.06138,8.33334Q12.09421,8.28421,12.11683,8.229610000000001Q12.13944,8.17501,12.150970000000001,8.117049999999999Q12.1625,8.05909,12.1625,8Q12.1625,7.940910000000001,12.150970000000001,7.88295Q12.13944,7.82499,12.11683,7.77039Q12.09421,7.71579,12.06138,7.66666Q12.02855,7.61752,11.98676,7.57574Q11.944980000000001,7.53395,11.89584,7.50112Q11.84671,7.46829,11.792110000000001,7.44567Q11.73751,7.4230599999999995,11.679549999999999,7.41153Q11.6216,7.4,11.5625,7.4L8.6,7.4Z"
                        fill-rule="evenodd" fill="#FFFFFF" fill-opacity="1"/>
                </g>
            </g>
        </g>
    </svg>
</g>
</template>