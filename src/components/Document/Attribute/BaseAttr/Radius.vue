<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { ref } from 'vue';
import IconText from '@/components/common/IconText.vue';
import { onMounted } from 'vue';
import { onUnmounted } from 'vue';
import { PathShape, Shape, ShapeType } from '@kcdesign/data';
import { reactive } from 'vue';
import { get_indexes2, is_rect } from '@/utils/attri_setting';

interface Props {
    context: Context
    disabled: boolean
}
const props = defineProps<Props>();
const rect = ref<boolean>(false);
const can_be_rect = ref<boolean>(false);
const is_multi_values = ref<boolean>(true);
const radius = reactive<{ lt: number | string, rt: number | string, rb: number | string, lb: number | string }>({ lt: 0, rt: 0, rb: 0, lb: 0 });
const mixed = props.context.workspace.t('attr.mixed');
function get_value_from_input(val: any) {
    let value = Number.parseFloat(val);
    value = (value > 0 && !isNaN(value)) ? value : 0;
    value = Number(value.toFixed(0));
    return value;
}
function change(val: any, type: string) {
    val = get_value_from_input(val);
    if (rect.value) {
        setting_for_extend(val, type);
        return;
    }
    const page = props.context.selection.selectedPage!;
    const selected = props.context.selection.selectedShapes;
    const editor = props.context.editor4Page(page);

    editor.shapesModifyFixedRadius(selected, val);
}
function setting_for_extend(val: number, type: string) {
    const indexes = get_indexes2(type as 'rt' | 'lt' | 'rb' | 'lb');

    const page = props.context.selection.selectedPage!;
    const selected = props.context.selection.selectedShapes;

    const editor = props.context.editor4Page(page);
    editor.shapesModifyPointRadius(selected, indexes, val);
}
function rectToggle() {
    rect.value = !rect.value;
    modify_radius_value();
}
function update() {
    modify_can_be_rect();
    modify_radius_value();
}
function selection_wather(t: Number) {
    if (t !== Selection.CHANGE_SHAPE) {
        return;
    }
    update();
    watch_shapes();
}
function modify_can_be_rect() {
    can_be_rect.value = false;
    const selected = props.context.selection.selectedShapes;
    for (let i = 0, l = selected.length; i < l; i++) {
        const s = selected[i];
        if (!is_rect(s)) {
            return
        }
    }
    can_be_rect.value = true;
}

function reset_radius_value() {
    radius.lt = 0;
    radius.rt = 0;
    radius.rb = 0;
    radius.lb = 0;
}
function get_radius_for_shape(shape: Shape) {
    if (!(shape instanceof PathShape)) {
        return 0;
    }

    const points = shape.points;
    if (!points.length) {
        return 0;
    }

    let _r = points[0].radius || shape.fixedRadius || 0;

    for (let i = 1, l = points.length; i < l; i++) {
        if ((points[i].radius || shape.fixedRadius || 0) !== _r) {
            return mixed;
        }
    }
    return _r;
}
function get_all_values(shapes: PathShape[]) {
    reset_radius_value();
    const first_shape = shapes[0];
    if (!first_shape) {
        return;
    }
    const f_r = get_rect_shape_all_value(first_shape);
    radius.lt = f_r.lt;
    radius.rt = f_r.rt;
    radius.rb = f_r.rb;
    radius.lb = f_r.lb;

    for (let i = 1, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        const rs = get_rect_shape_all_value(shape);
        if (rs.lt !== radius.lt) {
            radius.lt = mixed;
        }
        if (rs.rt !== radius.rt) {
            radius.rt = mixed;
        }
        if (rs.rb !== radius.rb) {
            radius.rb = mixed;
        }
        if (rs.lb !== radius.lb) {
            radius.lb = mixed;
        }
    }
}
function get_rect_shape_all_value(shape: PathShape) {
    const rs = { lt: 0, rt: 0, rb: 0, lb: 0 };
    rs.lt = shape.points[0]?.radius || shape.fixedRadius || 0;
    rs.rt = shape.points[1]?.radius || shape.fixedRadius || 0;
    rs.rb = shape.points[2]?.radius || shape.fixedRadius || 0;
    rs.lb = shape.points[3]?.radius || shape.fixedRadius || 0;
    return rs;
}
function modify_radius_value() {
    reset_radius_value();

    const selected = props.context.selection.selectedShapes;
    if (!selected.length) {
        return;
    }

    if (rect.value) {
        get_all_values(selected as PathShape[]);
        return;
    }

    let init = get_radius_for_shape(selected[0]);

    if (typeof init === 'string') {
        radius.lt = init;
        return;
    }

    for (let i = 1, l = selected.length; i < l; i++) {
        const __r = get_radius_for_shape(selected[i]);
        if (__r !== init) {
            radius.lt = mixed;
            return;
        }
    }

    radius.lt = init;
    return;
}
const watchedShapes = new Map();

function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update);
        watchedShapes.delete(k);
    })
    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        const first = selectedShapes[0];
        watchedShapes.set(first.id, first);
        watchedShapes.forEach((v) => { v.watch(update); });
    }
}
onMounted(() => {
    props.context.selection.watch(selection_wather);
    update();
    watch_shapes();
});
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})
</script>
<template>
    <div class="tr">
        <IconText class="frame" svgicon="radius" :multipleValues="is_multi_values" :text="radius.lt"
            :frame="{ width: 12, height: 12 }" @onchange="e => change(e, 'lt')" :disabled="disabled" :context="context" />
        <div class="frame" v-if="!rect"></div>
        <IconText v-if="rect" class="frame" svgicon="radius" :text="radius.rt"
            :frame="{ width: 12, height: 12, rotate: 90 }" @onchange="e => change(e, 'rt')" :context="context" />
        <div class="more-for-radius" @click="rectToggle" v-if="can_be_rect" :class="{ 'active': rect }">
            <svg-icon :icon-class="rect ? 'more-for-radius' : 'more-for-radius'" :class="{ 'active': rect }"></svg-icon>
        </div>
    </div>
    <div class="tr" v-if="rect">
        <IconText class="frame" svgicon="radius" :text="radius.lb" :frame="{ width: 12, height: 12, rotate: 270 }"
            @onchange="e => change(e, 'lb')" :context="context" />
        <IconText class="frame" svgicon="radius" :text="radius.rb" :frame="{ width: 12, height: 12, rotate: 180 }"
            @onchange="e => change(e, 'rb')" :context="context" />
        <div style="width: 32px;height: 32px;"></div>
    </div>
</template>
<style scoped lang="scss">
.tr {
    position: relative;
    width: 100%;
    height: 30px;
    align-items: center;
    justify-content: space-between;
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;

    >.icontext {
        background-color: var(--input-background);
    }

    .frame {
        width: 88px;
        height: 32px;
        margin: 0 0;
        border-radius: var(--default-radius);
    }


    .more-for-radius {
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        box-sizing: border-box;
        border: 1px solid #F0F0F0;
        padding: 9px;

        >svg {
            transition: 0.3s;
            color: #808080;
            width: 14px;
            height: 14px;
        }

        >svg.active {
            color: #FFFFFF;
        }
    }

    .more-for-radius:hover {
        background: #F4F5F5;
    }

    .more-for-radius.active {
        background-color: var(--active-color);
        border: 1px solid var(--active-color);
    }
}
</style>