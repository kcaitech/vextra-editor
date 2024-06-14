<template>
    <div class="container">
        <div v-if="isPrototype.length">
            <div v-if="isPrototype.length < 2" class="origin">
                <div class="title">
                    <div class="text" :style="{ color: originedit ? '#000' : '' }">流程起点</div>
                    <div v-if="!originedit" class="add" @click.stop=createOrigin>
                        <svg-icon icon-class="add"></svg-icon>
                    </div>
                    <div v-else class="delete" @click.stop=deleteOrigin>
                        <svg-icon icon-class="delete"></svg-icon>
                    </div>
                </div>
                <div v-if="!originedit" class="default">设置选中容器为新流程起点</div>
                <div v-else class="originname">
                    <label v-if="!showIpnut" for="name" @dblclick="showIpnut = true">{{ originName }}</label>
                    <input v-focus v-if="showIpnut" id="name" type="text" v-model="originName"
                        @blur="showIpnut = false">
                    <textarea v-select name="origindes" id="" cols="30" rows="10" placeholder="点击输入流程备注信息"
                        v-model="originDescribed"></textarea>
                </div>
            </div>
            <div class="interaction">
                <div class="title">
                    <div class="text">交互</div>
                    <div class="add" @click.stop="createAction">
                        <svg-icon icon-class="add"></svg-icon>
                    </div>
                </div>
                <div class="actions" v-if="numbers.length">

                    <div class="actions-item" v-for="i in numbers" :key="i">
                        <div>
                            <div class="arrow" :class="{ activation: showaction && acitonindex === i }"
                                @click.stop="showhandel(i)">
                                <svg-icon icon-class="arrows-dr"></svg-icon>
                            </div>
                            <div class="item-content">{{ i }}</div>
                            <div class="delete" @click.stop="deleteAction(i)">
                                <svg-icon icon-class="delete"></svg-icon>
                            </div>
                        </div>
                        <div v-if="showaction && acitonindex === i">
                            <div class="trigger">
                                <span>触发</span>
                                <Select class="select" id="select" :source="actions"
                                    :selected="actions.find(item => item.id === 0)?.data"></Select>
                            </div>
                            <div class="action">
                                <span>动作</span>
                                <Select class="select" id="select" :source="actions"
                                    :selected="actions.find(item => item.id === 0)?.data"></Select>
                            </div>
                            <div class="target">
                                <span>目标</span>
                                <Select class="select" id="select" :source="actions"
                                    :selected="actions.find(item => item.id === 0)?.data"></Select>
                            </div>

                        </div>
                    </div>

                </div>
                <div v-else class="default">设置窗口或其中控件的交互行为</div>
            </div>
            <div class="overflow-roll">
                <div class="text">溢出滚动</div>
                <Select class="select" :source="overflowRoll"
                    :selected="overflowRoll.find(i => i.id === 0)?.data"></Select>
            </div>
        </div>
        <div v-else>
            <span class="tips">交互</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { WorkSpace } from "@/context/workspace";
import { ShapeType, Shape, ShapeView, SymbolRefView, TableCellView, TableView, TextShapeView } from "@kcdesign/data"
import { debounce, throttle } from 'lodash';
import { flattenShapes } from '@/utils/cutout';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from '@/utils/common';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';


enum overflowRollType {
    NotRoll = 'notroll',
    Horizontal = 'horizontal',
    Vertical = 'vertical',
    HorAndVer = 'horandver'
}

enum Actions {
    Click = 'click',
    DBLClick = 'dblclick',
    RightClick = 'rightclick',
    Drag = 'drag',
    Hover = 'hover',
    MouseEnter = 'mouseenter',
    MouseLeave = 'mouseleave',
    MouseDown = 'mousedown',
    MouseUp = 'mouseup',
    Delay = 'delay'

}


const props = defineProps<{ context: Context }>();
const baseAttr = ref(true);
const editAttr = ref<boolean>(false);
const symbol_attribute = ref<boolean>(true);
const shapes = shallowRef<ShapeView[]>([]);
const shapeType = ref();
const reflush_trigger = ref<any[]>([]);
const reflush = ref<number>(0);
const reflush_by_selection = ref<number>(0);
const reflush_by_shapes = ref<number>(0);
const isPrototype = ref<ShapeView[]>([])
const originName = ref<string>()
const originDescribed = ref<string>()
const originNameNumber = ref<number>(0)
const originedit = ref<boolean>(false)
const showIpnut = ref<boolean>(false)
const showaction = ref<boolean>(false)
const acitonindex = ref<number>(-1)

const overflowRoll: SelectSource[] = genOptions([
    [overflowRollType.NotRoll, '不滚动'],
    [overflowRollType.Horizontal, '水平'],
    [overflowRollType.Vertical, '垂直'],
    [overflowRollType.HorAndVer, '水平并垂直']
])

const actions: SelectSource[] = genOptions([
    [Actions.Click, '单击'],
    [Actions.DBLClick, '双击'],
    [Actions.RightClick, '右键'],
    [Actions.Drag, '拖拽'],
    [Actions.Hover, '悬停'],
    [Actions.MouseEnter, '光标移入'],
    [Actions.MouseLeave, '光标移出'],
    [Actions.MouseDown, '按下鼠标'],
    [Actions.MouseUp, '松开鼠标'],
    [Actions.Delay, '延迟'],
])



const createOrigin = () => {
    originName.value = '流程 ' + ++originNameNumber.value
    originedit.value = true
}

const deleteOrigin = () => {
    originedit.value = false
}


const numbers = ref<number[]>([])
let i = 0
const createAction = () => {
    numbers.value.push(++i)
    acitonindex.value = i
    showaction.value = true
}

const deleteAction = (i: number) => {
    numbers.value = numbers.value.filter(item => item != i)
}

const showhandel = (i: number) => {
    if (acitonindex.value !== i) {
        acitonindex.value = i
        if (!showaction.value) {
            showaction.value = true
        }
        return
    } else {
        showaction.value = !showaction.value
    }


}

// 图层选区变化
function _selection_change() {
    baseAttr.value = true;
    editAttr.value = false;
    symbol_attribute.value = false;

    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length === 1) {
        symbol_attribute.value = true;
        const shape = selectedShapes[0];
        shapeType.value = shape.type;
    }
    shapes.value = [];
    isPrototype.value = []

    for (let i = 0, l = selectedShapes.length; i < l; i++) {
        const shape = selectedShapes[i];
        shapes.value.push(shape);
        if (shape.type === ShapeType.Artboard || shape.type === ShapeType.Symbol || shape.type === ShapeType.SymbolRef) {
            isPrototype.value.push(shape)
        }
    }

    reflush_by_selection.value++;
    reflush.value++;
}

const selection_change = debounce(_selection_change, 160, { leading: true });

function workspace_watcher(t: number) {
    if (t === WorkSpace.PATH_EDIT_MODE) {
        const _is_pdm = props.context.workspace.is_path_edit_mode;
        baseAttr.value = !_is_pdm;
        editAttr.value = _is_pdm;
    }
}

const watchedShapes = new Map<string, ShapeView>(); // 图层监听
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update_by_shapes);
        watchedShapes.delete(k);
    })

    const selectedShapes = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selectedShapes);
    shapes.forEach((v) => {
        v.watch(update_by_shapes);
        watchedShapes.set(v.id, v)
    });
}

// 选区图层变化
function update_by_shapes(...args: any[]) {
    // isCheckPrototype()
    reflush_trigger.value = [...(args?.length ? args : [])];
    reflush_by_shapes.value++;
    reflush.value++;
}

function isCheckPrototype() {
    props.context.selection.selectedShapes.forEach(item => {
        console.log(item);

    })
}

function selection_watcher(t: number) {
    if (t !== Selection.CHANGE_SHAPE && t !== Selection.CHANGE_PAGE) {
        return;
    }
    selection_change();
    watch_shapes();
}

onMounted(() => {
    props.context.workspace.watch(workspace_watcher);
    props.context.selection.watch(selection_watcher);
    watch_shapes()
    update_by_shapes()
    selection_change();
})

onUnmounted(() => {
    props.context.workspace.unwatch(workspace_watcher);
    props.context.selection.unwatch(selection_watcher);
    watchedShapes.forEach(v => {
        v.unwatch(update_by_shapes);
    });
})

</script>

<style lang="scss" scoped>
.flex {
    display: flex;
    justify-content: space-between;
}

.activation {
    transform: rotate(90deg);
}

@mixin flex($j, $a) {
    display: flex;
    justify-content: $j;
    align-items: $a;
}

.container {
    width: 100%;
    box-sizing: border-box;

    div .tips {
        color: #c8c8c8;
        font-size: 12px;
    }

    .origin,
    .interaction {
        display: flex;
        flex-direction: column;
        padding: 14px 12px;
        border-bottom: 1px solid #F0F0F0;
        box-sizing: border-box;
        gap: 8px;

        .title {
            @extend .flex;
            line-height: 30px;

            .text {
                font-size: 12px;
                color: #c8c8c8;
            }

            .add,
            .delete {
                width: 28px;
                height: 28px;
                @include flex(center, center);
            }

            svg {
                width: 16px;
                height: 16px;
            }
        }

        .default {
            font-size: 11px;
            color: #D9D9D9;
            line-height: 24px;
        }

        .originname {
            // position: relative;

            label {
                display: inline-block;
                width: 100%;
                font-size: 12px;
                line-height: 32px;
                padding: 0 12px;
                background-color: #F5F5F5;
                border-radius: 6px;
                box-sizing: border-box;
            }

            input {
                outline: none;
                border: none;
                font-size: 12px;
                width: 100%;
                height: 32px;
                padding: 12px 10px;
                border-radius: 6px;
                background-color: #F5F5F5;
                box-sizing: border-box;

                &:focus {
                    border: 1px solid #1878F5;
                }
            }

            textarea {
                margin-top: 8px;
                outline: none;
                resize: none;
                border: none;
                font-size: 12px;
                padding: 12px 10px;
                width: 100%;
                height: 60px;
                border-radius: 6px;
                border: 1px solid #EBEBEB;
                box-sizing: border-box;

                &::placeholder {
                    color: #D9D9D9;
                }

                &:focus {
                    border-color: #1878F5;
                }
            }
        }
    }

    .overflow-roll {
        @include flex(space-between, center);
        padding: 14px 12px;
        font-size: 12px;

        .select {
            width: 144px;
            height: 32px;
        }

    }

    .interaction .actions {
        @include flex(space-between, center);
        flex-direction: column;
        gap: 8px;

        .actions-item div {
            @include flex(space-between, center);
            gap: 8px;

            .arrow {
                display: flex;
                width: 10px;
                height: 10px;

                svg {
                    width: 100%;
                    height: 100%;
                }
            }

            .item-content {
                width: 172px;
                height: 32px;
                background-color: #F5F5F5;
                border-radius: 6px;
                text-align: center;
                line-height: 32px;

            }

            .delete {
                width: 28px;
                height: 28px;
                display: flex;

                svg {
                    width: 16px;
                    height: 16px;
                    margin: auto;
                }
            }
        }
    }
}
</style>
