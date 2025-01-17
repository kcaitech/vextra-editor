<template>
    <div id="create-radius-panel" class="new-style">
        <div class="header">
            <div class="title">{{ t('stylelib.create_radius') }}</div>
            <div class="close" @click.stop="emits('close')">
                <SvgIcon :icon="close_icon" />
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">{{ t('stylelib.name') }}</label>
                <input v-focus type="text" id="name" v-model="name" @keydown.esc="props.context.escstack.execute()">
            </div>
            <div class="des">
                <label for="des">{{ t('stylelib.description') }}</label>
                <input type="text" id="des" v-model="des" @keydown.esc="props.context.escstack.execute()">
            </div>
        </div>
        <div class="radius">
            <div class="title">{{ t('stylelib.round') }}</div>
            <input type="text" v-model="value" @change="setRadius">
        </div>

        <div class="create-bnt" :class="{ 'invalid': invalid }" @click.stop="createStyles">{{ t('stylelib.add_style') }}
        </div>
    </div>

</template>
<script setup lang="ts">
import close_icon from '@/assets/icons/svg/close.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

import { Context } from '@/context';
import { ShapeView, ShapeType, PathShapeView, BasicArray, RadiusMask, TableView, TextShapeView, CutoutShapeView, RadiusType, SymbolView } from '@kcdesign/data';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selection } from "@/context/selection";
import { getShapesForStyle } from '@/utils/style';
import { v4 } from 'uuid';
import { fixedZero } from '@/utils/common';

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
}>();

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();
const value = ref<string>('')
const oldvalue = ref<string>('')
const name = ref<string>('')
const des = ref<string>('')
const mixed = props.context.workspace.t('attr.mixed');
const rect = ref<boolean>(localStorage.getItem('radius-corner-display') === "all");
const can_be_rect = ref<boolean>(false);
const radius = reactive<{ lt: number | string, rt: number | string, rb: number | string, lb: number | string }>({
    lt: 0,
    rt: 0,
    rb: 0,
    lb: 0
});

const invalid = computed(() => {
    return !name.value
})

const setRadius = () => {
    let arrs = value.value.replaceAll(/，/g, ',').replaceAll(/\s+/g, '').split(',').slice(0, 4).filter(Boolean);
    const b = arrs.every(i => isNaN(Number(i)) === false)
    if (!b) return value.value = oldvalue.value;
    if (arrs.length === 1) {
        arrs = arrs.concat(...arrs, ...arrs, ...arrs)
    }
    if (arrs.length === 2) {
        arrs = arrs.concat(arrs[0], arrs[1])
    }
    if (arrs.length === 3) {
        arrs = arrs.concat(arrs[1])
    }
    value.value = arrs.join(', ')

    const num = value.value.split(', ').map(i => Number(i))
    const shapes = noGroupShapesFrom(props.context.selection.selectedShapes);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.shapesModifyRadius(shapes, num);
}


const createStyles = () => {
    if (invalid.value) return
    const values = value.value.split(', ').map(i => Number(i))
    const _value = new BasicArray<number>
    _value.push(...values)
    const editor = props.context.editor4Doc()
    const style = new RadiusMask(new BasicArray(), props.context.data.id, v4(), name.value, des.value, _value)
    const page = props.context.selection.selectedPage!
    const selected = props.context.selection.selectedShapes;
    const shapes = getShapesForStyle(selected);
    editor.insertStyleLib(style, page, shapes);
    emits('close')
}


function noGroupShapesFrom(shapes: ShapeView[]) {
    const result: ShapeView[] = [];
    for (const shape of shapes) {
        if (shape instanceof TableView || shape instanceof TextShapeView || shape instanceof CutoutShapeView) continue;
        if (shape.type === ShapeType.Group) {
            result.push(...noGroupShapesFrom(shape.childs));
            continue;
        }
        result.push(shape);
    }
    return result;
}

const watchedShapes = new Map();

function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update);
        watchedShapes.delete(k);
    })
    const selectedShapes = noGroupShapesFrom(props.context.selection.selectedShapes);
    if (selectedShapes.length > 0) {
        const first = selectedShapes[0];
        watchedShapes.set(first.id, first);
        watchedShapes.forEach((v) => {
            v.watch(update);
        });
    }
}

function modify_can_be_rect() {
    can_be_rect.value = false;
    const origin = rect.value;
    rect.value = false;

    const selected = props.context.selection.selectedShapes;
    for (let i = 0, l = selected.length; i < l; i++) {
        if (selected[i].radiusType !== RadiusType.Rect) return;
    }

    can_be_rect.value = true;
    rect.value = origin;
}

function reset_radius_value() {
    radius.lt = 0;
    radius.rt = 0;
    radius.rb = 0;
    radius.lb = 0;
}

function get_rect_shape_all_value(shape: ShapeView) {
    const rs = { lt: 0, rt: 0, rb: 0, lb: 0 };
    if (shape instanceof PathShapeView) {
        const s = shape as PathShapeView;
        const points = s?.segments[0]?.points;
        if (!points?.length) return rs;
        rs.lt = points[0]?.radius || s.fixedRadius || 0;
        rs.rt = points[1]?.radius || s.fixedRadius || 0;
        rs.rb = points[2]?.radius || s.fixedRadius || 0;
        rs.lb = points[3]?.radius || s.fixedRadius || 0;
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

function get_all_values(shapes: ShapeView[]) {
    reset_radius_value();
    const first_shape = shapes[0];
    if (!first_shape) return;
    const f_r = get_rect_shape_all_value(first_shape);
    radius.lt = fixedZero(f_r.lt);
    radius.rt = fixedZero(f_r.rt);
    radius.rb = fixedZero(f_r.rb);
    radius.lb = fixedZero(f_r.lb);

    value.value = radius.lt + ', ' + radius.rt + ', ' + radius.rb + ', ' + radius.lb;

    oldvalue.value = value.value;

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

function get_radius_for_shape(shape: ShapeView) {
    if (shape.radiusType === RadiusType.Rect) {
        if (shape instanceof PathShapeView) {
            const s = shape as PathShapeView;

            const points = s?.segments[0]?.points;

            if (!points?.length) return 0;

            let _r = points[0].radius || s.fixedRadius || 0;

            value.value = points.map(i => i.radius ?? 0).join(', ')
            oldvalue.value = value.value

            for (let i = 1, l = points.length; i < l; i++) {
                if ((points[i].radius || s.fixedRadius || 0) !== _r) return mixed;
            }
            return _r;
        } else {
            const cornerRadius = (shape as SymbolView).cornerRadius;
            if (!cornerRadius) return 0;
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
        const segments = s.segments;
        if (!segments.length) return 0;
        const firstPoint = segments[0].points[0];
        if (!firstPoint) {
            value.value = '0';
            return 0;
        }

        let _r = firstPoint.radius || s.fixedRadius || 0;

        value.value = _r + '';

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const points = segment.points;

            if (!points?.length) continue;

            for (let j = 0; j < points.length; j++) {
                if ((points[j].radius || s.fixedRadius || 0) !== _r) return mixed;
            }
        }

        return _r;
    } else {
        value.value = (shape.fixedRadius || 0) + '';
        return shape.fixedRadius || 0;
    }
}

function modify_radius_value() {
    reset_radius_value();
    value.value = '';

    const selected = noGroupShapesFrom(props.context.selection.selectedShapes);
    if (!selected.length) return;

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

    radius.lt = fixedZero(init);

}


function selection_watcher(t: Number | string) {
    if (t !== Selection.CHANGE_SHAPE) return;
    update();
    watch_shapes();
}

function update() {
    modify_can_be_rect();
    modify_radius_value();
}

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    update();
    watch_shapes();
})

onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
})

</script>
<style lang="scss" scoped>
.new-style {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid #f0f0f0;
        box-sizing: border-box;

        .close {
            width: 28px;
            height: 28px;
            display: flex;
            border-radius: 4px;

            &:hover {
                background-color: #F5F5F5;
            }

            img {
                width: 16px;
                height: 16px;
                margin: auto;
                padding: 2px;
                /* margin-top: 1px; */
                box-sizing: border-box;
            }
        }
    }

    .detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .name,
        .des {
            display: flex;
            align-items: center;
            height: 32px;
            gap: 8px;

            input {
                flex: 1;
                outline: none;
                font-size: 12px;
                padding: 10px 8px;
                height: 32px;
                border-radius: 6px;
                border: 1px solid transparent;
                background-color: #F5F5F5;
                box-sizing: border-box;

                &:focus {
                    border: 1px solid #1878f5;
                }
            }
        }
    }

    .radius {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .title {}

        input {
            flex: 1;
            width: 100%;
            outline: none;
            border: none;
            padding: 10px 8px;
            background-color: #F5F5F5;
            border: 1px solid transparent;
            height: 32px;
            border-radius: 6px;
            box-sizing: border-box;

            &:focus {
                border: 1px solid #1878f5;
            }
        }
    }


    .create-bnt {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: auto;
        margin-bottom: 12px;
        font-size: 12px;
        width: 100px;
        height: 40px;
        border-radius: 6px;
        background-color: #1878f5;
        color: #fff;

        &:hover {
            background-color: #429AFF;
        }

        &:active {
            background-color: #0A59CF;
        }
    }

    .invalid {
        opacity: 0.5;
        pointer-events: none;
    }
}
</style>
