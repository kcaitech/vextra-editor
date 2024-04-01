<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import IconText from '@/components/common/IconText.vue';
import { PathShapeView, RadiusType, ShapeType, ShapeView, SymbolView } from '@kcdesign/data';
import { get_indexes2 } from '@/utils/attri_setting';
import { hidden_selection } from "@/utils/content";

interface Props {
    context: Context
    disabled: boolean
}

const props = defineProps<Props>();
const rect = ref<boolean>(false);
const can_be_rect = ref<boolean>(false);
const is_multi_values = ref<boolean>(true);
const radius = reactive<{ lt: number | string, rt: number | string, rb: number | string, lb: number | string }>({
    lt: 0,
    rt: 0,
    rb: 0,
    lb: 0
});
const mixed = props.context.workspace.t('attr.mixed');

function get_value_from_input(val: any) {
    let value = Number.parseFloat(val);
    value = (value > 0 && !isNaN(value)) ? value : 0;
    return Number(value.toFixed(0));
}

function change(val: any, shapes: ShapeView[], type: string) {
    val = get_value_from_input(val);

    if (rect.value) {
        setting_for_extend(val, type, shapes);
        return;
    }
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    // editor.shapesModifyFixedRadius(shapes.map(s => adapt2Shape(s)), val);
    editor.shapesModifyRadius(shapes, [val]);

    hidden_selection(props.context);
}

function setting_for_extend(val: number, type: string, shapes: ShapeView[]) {
    const indexes = get_indexes2(type as 'rt' | 'lt' | 'rb' | 'lb');
    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    // editor.shapesModifyPointRadius(shapes.map(s => adapt2Shape(s)), indexes, val);

    const values = [-1, -1, -1, -1];
    values[indexes[0]] = val;
    editor.shapesModifyRadius(shapes, values);
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

    const need_reset = rect.value;

    rect.value = false;

    const selected = props.context.selection.selectedShapes;

    for (let i = 0, l = selected.length; i < l; i++) {
        if (!(selected[i].radiusType === RadiusType.Rect)) {
            return
        }
    }

    if (need_reset) {
        rect.value = true;
    }

    can_be_rect.value = true;
}

function reset_radius_value() {
    radius.lt = 0;
    radius.rt = 0;
    radius.rb = 0;
    radius.lb = 0;
}

function get_radius_for_shape(shape: ShapeView) {
    if (shape.radiusType === RadiusType.Rect) {
        if (shape instanceof PathShapeView) {
            const s = shape as PathShapeView;
            const points = s.points;

            if (!points?.length) {
                return 0;
            }

            let _r = points[0].radius || s.fixedRadius || 0;

            for (let i = 1, l = points.length; i < l; i++) {
                if ((points[i].radius || s.fixedRadius || 0) !== _r) {
                    return mixed;
                }
            }
            return _r;
        } else {
            const cornerRadius = (shape as SymbolView).cornerRadius;
            if (!cornerRadius) {
                return 0;
            }
            if (cornerRadius.lt === cornerRadius.rt
                && cornerRadius.rt === cornerRadius.rb
                && cornerRadius.rb === cornerRadius.lb) {
                return cornerRadius.lt;
            }
            return mixed;
        }
    }
    if (shape instanceof PathShapeView) {
        const s = shape as PathShapeView;
        const points = s.points;

        if (!points?.length) {
            return 0;
        }

        let _r = points[0].radius || s.fixedRadius || 0;

        for (let i = 1, l = points.length; i < l; i++) {
            if ((points[i].radius || s.fixedRadius || 0) !== _r) {
                return mixed;
            }
        }
        return _r;
    } else {
        return shape.fixedRadius || 0;
    }
}

function get_all_values(shapes: ShapeView[]) {
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

function get_rect_shape_all_value(shape: ShapeView) {
    const rs = { lt: 0, rt: 0, rb: 0, lb: 0 };
    if (shape instanceof PathShapeView) {
        const s = shape as PathShapeView;
        rs.lt = s.points[0]?.radius || s.fixedRadius || 0;
        rs.rt = s.points[1]?.radius || s.fixedRadius || 0;
        rs.rb = s.points[2]?.radius || s.fixedRadius || 0;
        rs.lb = s.points[3]?.radius || s.fixedRadius || 0;
    } else {
        const cornerRadius = (shape as SymbolView).cornerRadius;
        if (cornerRadius) {
            rs.lt = cornerRadius.lt;
            rs.rt = cornerRadius.rt;
            rs.rb = cornerRadius.rb;
            rs.lb = cornerRadius.lb;
        }
    }
    return rs;
}

function modify_radius_value() {
    reset_radius_value();

    const selected = props.context.selection.selectedShapes;
    if (!selected.length) {
        return;
    }

    if (rect.value) {
        get_all_values(selected);
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
        watchedShapes.forEach((v) => {
            v.watch(update);
        });
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
                  :frame="{ width: 12, height: 12 }" @onchange="(value, shapes) => change(value, shapes, 'lt')"
                  :disabled="disabled" :context="context"/>
        <div class="frame" v-if="!rect"></div>
        <IconText v-if="rect" class="frame" svgicon="radius" :text="radius.rt" :disabled="disabled"
                  :frame="{ width: 12, height: 12, rotate: 90 }"
                  @onchange="(value, shapes) => change(value, shapes, 'rt')" :context="context"/>
        <div class="more-for-radius" @click="rectToggle" v-if="can_be_rect" :class="{ 'active': rect }">
            <svg-icon :icon-class="rect ? 'white-for-radius' : 'more-for-radius'"
                      :class="{ 'active': rect }"></svg-icon>
        </div>
    </div>
    <div class="tr" v-if="rect">
        <IconText class="frame" svgicon="radius" :text="radius.lb" :frame="{ width: 12, height: 12, rotate: 270 }"
                  :disabled="disabled"
                  @onchange="(value, shapes) => change(value, shapes, 'lb')" :context="context"/>
        <IconText class="frame" svgicon="radius" :text="radius.rb" :frame="{ width: 12, height: 12, rotate: 180 }"
                  :disabled="disabled"
                  @onchange="(value, shapes) => change(value, shapes, 'rb')" :context="context"/>
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

    > .icontext {
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

        > svg {
            transition: 0.3s;
            color: #808080;
            width: 14px;
            height: 14px;
        }

        > svg.active {
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