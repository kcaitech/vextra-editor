<script setup lang="ts">
import IconText from "@/components/common/IconText.vue";
import {ref, reactive, onMounted, onUnmounted} from "vue";
import {Context} from "@/context";
import {useI18n} from 'vue-i18n';
import SvgIcon from "@/components/common/SvgIcon.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import {Path, PointEditType} from "@/context/path";
import {get_action_for_key_change, get_value_from_point, get_value_from_points} from "@/utils/pathedit";
import {PathShape} from "@kcdesign/data";
import {Selection} from "@/context/selection";

interface Props {
    context: Context
}

interface ModelState {
    x: boolean
    y: boolean
    r: boolean
    tool: boolean
}

const props = defineProps<Props>();
const x = ref<number | string>('');
const y = ref<number | string>('');
const r = ref<number | string>(0);
const point_type = ref<PointEditType>('INVALID');
const model_state: ModelState = reactive({x: true, y: true, r: true, tool: true});
const t = useI18n().t;
let path_shape: PathShape | undefined = undefined;

function execute_change_xy(key: 'x' | 'y', val: any) {
    val = Number(val);
    if (!path_shape || isNaN(val)) return;
    const editor = props.context.editor4Shape(path_shape);
    const actions = get_action_for_key_change(props.context, val, key);
    if (!actions) return;
    editor.modifyPointsXY(actions)
}

function onChangeX(_val: any) {
    execute_change_xy('x', _val);
}

function onChangeY(_val: any) {
    execute_change_xy('y', _val);
}

function onChangeR() {
}

function exit() {
    props.context.workspace.setPathEditMode(false);
}

function calc() {
    const selected_points = props.context.path.selectedPoints;
    const l = selected_points.length;
    if (l) {
        if (l === 1) {
            const state = get_value_from_point(props.context, selected_points[0]);
            if (!state) return;
            x.value = state.x;
            y.value = state.y;
            r.value = state.r;
        } else {
            const state = get_value_from_points(props.context, selected_points);
            if (!state) return;
            x.value = state.x === 'mix' ? t('attr.more_value') : state.x;
            y.value = state.y === 'mix' ? t('attr.more_value') : state.y;
            r.value = state.r;
        }
    } else {
        x.value = '';
        y.value = '';
        r.value = 0;
    }
}

function modify_model_state() {
    const selected_points = props.context.path.selectedPoints;
    const l = selected_points.length;
    if (l) {
        model_state.x = false;
        model_state.y = false;
        model_state.r = false;
        model_state.tool = false;
    } else {
        model_state.x = true;
        model_state.y = true;
        model_state.r = true;
        model_state.tool = true;
    }
}

function modify_point_type() {
    const selected_points = props.context.path.selectedPoints;
    const l = selected_points.length;
    if (l === 0) {
        point_type.value = 'INVALID';
    } else {
        // todo
        if (l === 1) {
            point_type.value = 'RA';
        } else {
            point_type.value = 'RA';
        }
    }
    props.context.path.setPointType(point_type.value);
}

function update() {
    modify_point_type();
    modify_model_state();
    calc();
}

function path_watcher(t: number) {
    if (t === Path.SELECTION_CHANGE) {
        update();
    } else if (Path.POINT_TYPE_CHANGE) {
        point_type.value = props.context.path.pointType;
    }
}

function init_path_shape() {
    path_shape = props.context.selection.pathshape;
    if (path_shape) {
        path_shape.watch(calc);
    }
}

function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) {
        const t = props.context.selection.pathshape;
        if (path_shape) {
            path_shape.unwatch(calc);
        }
        if (t) {
            path_shape = t;
            path_shape.watch(calc);
        }
    }
}

onMounted(() => {
    props.context.path.watch(path_watcher);
    props.context.selection.watch(selection_watcher);
    init_path_shape();
})
onUnmounted(() => {
    props.context.path.unwatch(path_watcher);
    props.context.selection.unwatch(selection_watcher);
    if (path_shape) {
        path_shape.unwatch(calc);
    }
})
</script>
<template>
    <div class="table">
        <div class="tr">
            <IconText class="td position" ticon="X" :text="typeof (x) === 'number' ? x.toFixed(2) : x"
                      @onchange="onChangeX" :disabled="model_state.x" :context="context"/>
            <div class="space"></div>
            <IconText class="td position" ticon="Y" :text="typeof (y) === 'number' ? y.toFixed(2) : y"
                      @onchange="onChangeY" :disabled="model_state.y" :context="context"/>
            <div class="space"></div>
        </div>
        <div class="tr">
            <IconText class="td position" ticon="R" :text="typeof (r) === 'number' ? r.toFixed(2) : r"
                      @onchange="onChangeR" :disabled="model_state.r" :context="context"/>
        </div>
        <div class="tr">
            <div :class="{tool: true, tool_disabled: model_state.tool}">
                <Tooltip :content="t('attr.right_angle')">
                    <div :class="{item: true, active: point_type === 'RA'}">
                        <svg-icon icon-class="unknown"></svg-icon>
                    </div>
                </Tooltip>
                <Tooltip :content="t('attr.completely_symmetrical')">
                    <div :class="{item: true, active: point_type === 'CS'}">
                        <svg-icon icon-class="unknown"></svg-icon>
                    </div>
                </Tooltip>
                <Tooltip :content="t('attr.angular_symmetry')">
                    <div :class="{item: true, active: point_type === 'AS'}">
                        <svg-icon icon-class="unknown"></svg-icon>
                    </div>
                </Tooltip>
                <Tooltip :content="t('attr.asymmetric')">
                    <div :class="{item: true, active: point_type === 'A'}">
                        <svg-icon icon-class="unknown"></svg-icon>
                    </div>
                </Tooltip>
            </div>
        </div>
        <div class="tr">
            <div class="btn" @click="exit">
                {{ t('attr.exit_path_edit') }}
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.table {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 2px 10px 12px 10px;
    box-sizing: border-box;
    visibility: visible;

    .tr {
        position: relative;
        width: 100%;
        height: 30px;
        align-items: center;
        justify-content: space-between;
        display: flex;
        flex-direction: row;
        margin: 4px 0;

        .position {
            width: 95px;
            height: 30px;
            border-radius: var(--default-radius);
        }

        .space {
            width: 18px;
        }

        > .icontext {
            background-color: rgba(#D8D8D8, 0.4);
        }


        .frame {
            width: 95px;
            height: 30px;
            border-radius: var(--default-radius);
        }

        .tool {
            width: 64%;
            height: 100%;
            border-radius: var(--default-radius);
            background-color: var(--input-background);
            display: flex;
            align-content: space-around;
            align-items: center;
            box-sizing: border-box;
            position: relative;
            transition: 0.3s;

            .item {
                height: calc(100% - 4px);
                margin: 2px;
                border-radius: var(--default-radius);
                display: flex;
                justify-content: center;
                align-items: center;

                > svg {
                    height: 60%;
                    width: 60%;
                }
            }

            .active {
                background-color: var(--active-color);
            }
        }

        .tool_disabled {
            opacity: 0.5;
            pointer-events: none;
        }

        .btn {
            width: 100%;
            height: 100%;
            border-radius: 4px;
            background-color: var(--active-color);
            color: var(--theme-color-anti);
            text-align: center;
            line-height: 30px;
            cursor: pointer;
        }
    }
}

</style>