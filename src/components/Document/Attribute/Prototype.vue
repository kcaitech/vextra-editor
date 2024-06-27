<template>
    <div class="container">
        <el-scrollbar height="100%">
            <div v-if="isProtoType">
                <div v-if="isPrototype.length < 2" class="origin">
                    <div class="title">
                        <div class="text" :style="{ color: originedit ? '#000' : '' }">流程起点</div>
                        <div v-if="prototypestart" class="add" @click.stop=createOrigin>
                            <svg-icon icon-class="add"></svg-icon>
                        </div>
                        <div v-else class="delete" @click.stop=deleteOrigin>
                            <svg-icon icon-class="delete"></svg-icon>
                        </div>
                    </div>
                    <div v-if="!prototypestart" class="default">设置选中容器为新流程起点</div>
                    <div v-else class="originname">
                        <label v-if="!showIpnut" for="name" @dblclick="showIpnut = true">{{ prototypestart.name
                            }}</label>
                        <input v-focus v-if="showIpnut" id="name" type="text" v-model="prototypestart.name"
                            @blur="showIpnut = false" @change="setPrototypeStartPoint" autocomplete="off">
                        <textarea v-select name="origindes" id="" cols="30" rows="10" placeholder="点击输入流程备注信息"
                            v-model="prototypestart.desc" @change="setPrototypeStartPoint"></textarea>
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
                            <div class="item">
                                <div class="arrow" :class="{ activation: showaction && acitonindex === i }"
                                    @click.stop="showhandel(i)">
                                    <svg-icon icon-class="arrows-dr"></svg-icon>
                                </div>
                                <div class="item-content">{{ i }}</div>
                                <div class="delete" @click.stop="deleteAction(i)">
                                    <svg-icon icon-class="delete"></svg-icon>
                                </div>
                            </div>
                            <div class="item-setting" v-if="showaction && acitonindex === i">
                                <div class="trigger">
                                    <span>触发</span>
                                    <Select class="select" id="select" :visibility="true" :source="trigger"
                                        :selected="trigger.find(item => item.id === 0)?.data"></Select>
                                </div>
                                <div class="action">
                                    <span>动作</span>
                                    <Select class="select" id="select" :visibility="true" :source="actions"
                                        :selected="actions.find(item => item.id === 0)?.data"></Select>
                                </div>
                                <div class="component-status">
                                    <div class="state" v-for="i in variables" :key="i.variable.id">
                                        <span>{{ i.variable.name }}：</span>
                                        <Select class="select" id="select" :visibility="true" :source="genOptions(i.values.map((v, idx) => {
                return [idx, v];
            }))" :selected="trigger.find(item => item.id === 0)?.data"></Select>
                                    </div>
                                </div>
                                <div class="target">
                                    <span>目标</span>
                                    <input id="target-input" type="text" placeholder="请选择目标容器" readonly
                                        v-model="selectshape" @click="test">
                                    <div class="svg-wrap">
                                        <svg-icon icon-class="down"></svg-icon>
                                    </div>
                                    <div class="search-container" v-if="showtargerlist">
                                        <div class="header-search">
                                            <svg-icon icon-class="search"></svg-icon>
                                            <input v-focus type="text" placeholder="搜索容器" v-model="searchvlue">
                                        </div>
                                        <div class="item-list">
                                            <div class="item" v-for="shape in DomList" :key="shape.id"
                                                @click.stop="selectshape = shape.name">{{ shape.name }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="retract">
                                    <span>缩进</span>
                                    <div class="retract-y"></div>
                                    <div class="retract-x"></div>
                                </div>
                                <div class="link">
                                    <span>链接</span>
                                    <input type="text" placeholder="输入链接地址">
                                </div>

                                <div class="set-float">
                                    <span>浮层设置</span>
                                    <div class="content">
                                        <div class="position">
                                            <div v-for="i in 9" :key="i"></div>
                                        </div>
                                        <div class="margin">
                                            <div v-for="i in 4" :key="i"></div>
                                        </div>
                                    </div>
                                    <div class="checkbox">
                                        <input type="checkbox" id="closetab">
                                        <label for="closetab">点击浮层外关闭浮层</label>
                                    </div>
                                    <div class="checkbox">
                                        <input type="checkbox" id="color" v-model="addmask"
                                            @change="checkTarget($event)">
                                        <label for="color">在浮层后添加遮罩</label>
                                    </div>
                                    <div v-if="addmask" class="setting">
                                        <ColorPicker class="color" :color="(background_color as Color)"
                                            :context="props.context" :auto_to_right_line="true"
                                            @change="c => colorChangeFromPicker(c)">
                                        </ColorPicker>
                                        <input v-select type="text" @change.stop="(e: Event) => change_c(e)"
                                            :value="clr_v" id="clr" ref="clr_ele" @click="clr_click" :spellcheck="false"
                                            @blur="is_color_select = false">
                                        <input v-select @change="(e: Event) => change_a(e)" :value="`${alpha_v}%`"
                                            id="alpha" @blur="is_alpha_select = false" @click="alpha_click"
                                            ref="alpha_ele">
                                    </div>

                                </div>
                                <div class="set-animation">
                                    <span>动画设置</span>
                                    <div class="wrapper">
                                        <div class="container">
                                            <div class="containerA">A</div>
                                            <div class="containerB">B</div>
                                            <div class="containerC"></div>
                                        </div>
                                    </div>
                                    <div class="animation">
                                        <span>动画</span>
                                        <Select class="select" id="select" :visibility="true" :source="animation"
                                            :selected="animation.find(item => item.id === 0)?.data"></Select>
                                    </div>
                                    <div class="direction">
                                        <div class="content">
                                            <div class="icon" :class="{ 'select-item': selectitem === i }"
                                                v-for=" i of Object.values(Direction)" :key="i"
                                                @click.stop="selectitem = i">
                                                <svg-icon :style="{ rotate: (`${setrotate.get(i)}` + 'deg') }"
                                                    icon-class="right-arrows"></svg-icon>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="effect">
                                        <span>效果</span>
                                        <Select class="select" id="select" :width="100" :visibility="true"
                                            :source="effect"
                                            :selected="effect.find(item => item.id === 0)?.data"></Select>
                                        <input v-select ref="animationtimevalue" type="text" placeholder="时间"
                                            @change="changeinputvalue" :value="'300ms'">
                                    </div>
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
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { WorkSpace } from "@/context/workspace";
import { ShapeType, Shape, Color, ShapeView, SymbolRefView, TableCellView, TableView, TextShapeView } from "@kcdesign/data"
import { debounce, throttle } from 'lodash';
import { flattenShapes } from '@/utils/cutout';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from '@/utils/common';
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import {
    get_var_for_ref,
    is_able_to_unbind,
    is_symbolref_disa,
    RefAttriListItem,
    reset_all_attr_for_ref,
    is_part_of_symbol
} from "@/utils/symbol";
import { useI18n } from 'vue-i18n';
import ColorPicker from "@/components/common/ColorPicker/index.vue";
import { debounce as d } from "@/utils/timing_util";
import { Reg_HEX } from "@/utils/color";
import { message } from "@/utils/message";
import { PrototypeStartingPoint, ArtboradView } from '@kcdesign/data';

const background_color = ref(new Color(1, 239, 239, 239));
const alpha_v = ref<number>(100);
const clr_v = ref<string>('EFEFEF');
const is_color_select = ref(false);
const alpha_ele = ref<HTMLInputElement>();
const clr_ele = ref<HTMLInputElement>();
const is_alpha_select = ref(false);
const addmask = ref<boolean>(false)


//检测浮层设置是否已有目标
const checkTarget = (e: Event) => {

    console.log(selectshape.value);

    if (selectshape.value === '') {
        addmask.value = false
        return
    }
}

function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
}

const _colorChangeFromPicker = d((c: Color) => {
    // const page = props.context.selection.selectedPage;
    // if (!page) return;
    // const editor = props.context.editor4Page(page);
    // editor.setBackground(c);
    background_color.value = c
    clr_v.value = toHex(c.red, c.green, c.blue)
}, 100)
const colorChangeFromPicker = (c: Color) => {
    _colorChangeFromPicker(c).catch((e) => {
    });
};

function setColor(clr: string, alpha: number) {
    const res = clr.match(Reg_HEX);
    if (!res) return message('danger', t('system.illegal_input'));
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    const nc = new Color(alpha, r, g, b);
    //修改目标遮罩层颜色
    background_color.value = nc
    clr_v.value = toHex(nc.red, nc.green, nc.blue)

}

function change_c(e: Event) {
    let value = (e.target as HTMLInputElement)?.value;
    if (value.slice(0, 1) !== '#') value = "#" + value;
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    if (Reg_HEX.test(value)) {
        setColor(value, alpha_v.value / 100);
    } else {
        message('danger', t('system.illegal_input'));
    }
    nextTick(() => {
        clr_ele.value?.blur()
    })
}

function change_a(e: Event) {
    let value = (e.currentTarget as any)['value'];
    value = Number(value) / 100;
    if (isNaN(value)) {
        return;
    }
    if (1 >= value && value >= 0) {
        setColor("#" + clr_v.value, value);
        alpha_v.value = value * 100;
    } else if (value > 1) {
        if (alpha_ele.value) {
            alpha_ele.value.value = String(100);
            setColor("#" + clr_v.value, 1);
        }
    } else if (value < 0) {
        if (alpha_ele.value) {
            alpha_ele.value.value = String(0);
            setColor("#" + clr_v.value, 0);
        }
    }
    alpha_ele.value?.blur()
}

function clr_click(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_color_select.value) return;
    is_color_select.value = true;
}

function alpha_click(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_alpha_select.value) return;
    is_alpha_select.value = true;
}


enum overflowRollType {
    NotRoll = 'notroll',
    Horizontal = 'horizontal',
    Vertical = 'vertical',
    HorAndVer = 'horandver'
}

enum Actions {
    JumpPage = 'jump-page',
    ReturnPage = 'return-page',
    PageScroll = 'page-scroll',
    OpenLink = 'open-link',
    ComponentState = 'component-state',
    OpenFloatLayer = 'open-float-layer',
    CloseFloatLayer = 'close-float-layer',
    ChangeFloatLayer = 'change-float-layer'

}


enum Trigger {
    Click = 'click',
    DBLClick = 'dbl-click',
    RightClick = 'right-click',
    Drag = 'drag',
    Hover = 'hover',
    MouseEnter = 'mouse-enter',
    MouseLeave = 'mouse-leave',
    MouseDown = 'mouse-down',
    MouseUp = 'mouse-up',
    Delay = 'delay'
}

enum Animation {
    Immediately = 'immediately',
    FadeInOut = 'fade-in-out',
    SlideIn = 'slide-in',
    SlideOut = 'slide-out',
    MoveIn = 'move-in',
    MoveOut = 'move-out',
    PushIn = 'push-in'
}

enum Effect {
    LinearGradient = 'linear-gradient',
    SlowIn = 'slow-in',
    SlowOut = 'slow-out',
    SlowInOut = 'slow-in-out',
    SpringbackStart = 'springback-start',
    SpringbackEnd = 'springback-end',
    SpringbackStartEnd = 'springback-start-end'
}

enum Direction {
    Right = 'right',
    Left = 'left',
    TOP = 'top',
    Bottom = 'bottom'
}

type Prototypestart = {
    name: string,
    desc: string
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
const originName = ref<string>('')
const originDescribed = ref<string>('')
const originNameNumber = ref<number>(0)
const originedit = ref<boolean>(false)
const showIpnut = ref<boolean>(false)
const showaction = ref<boolean>(false)
const acitonindex = ref<number>(-1)
const selectshape = ref<string>('')

const variables = ref<RefAttriListItem[]>([]);
const { t } = useI18n()
const searchvlue = ref<string>('')
const animationtimevalue = ref<HTMLInputElement[]>()
const selectitem = ref<string>('right')
const prototypestart = ref<Prototypestart>({ name: "", desc: "" })



const regex = /^(\d+)/
const changeinputvalue = () => {

    const value = animationtimevalue.value![0].value

    const maxvalue = (v: number) => {
        return v <= 20000 ? v : 20000
    }

    if (Number(value)) {
        animationtimevalue.value![0].value = maxvalue(Number(value)) + 'ms'
    } else {
        if (value.match(regex) !== null) {
            const str = value.match(regex)
            animationtimevalue.value![0].value = maxvalue(Number(str![1])) + 'ms'
        } else {
            animationtimevalue.value![0].value = '1ms'
        }
    }

    animationtimevalue.value![0].blur()
}

const setrotate = new Map()

for (let i of Object.values(Direction)) {
    switch (i) {
        case 'right':
            setrotate.set(i, 180)
            break;
        case 'left':
            setrotate.set(i, 0)
            break;
        case 'top':
            setrotate.set(i, 90)
            break;
        case 'bottom':
            setrotate.set(i, -90)
            break;
        default:
            break;
    }
}

const overflowRoll: SelectSource[] = genOptions([
    [overflowRollType.NotRoll, '不滚动'],
    [overflowRollType.Horizontal, '水平'],
    [overflowRollType.Vertical, '垂直'],
    [overflowRollType.HorAndVer, '水平并垂直']
])

const trigger: SelectSource[] = genOptions([
    [Trigger.Click, '单击'],
    [Trigger.DBLClick, '双击'],
    [Trigger.RightClick, '右键'],
    [Trigger.Drag, '拖拽'],
    [Trigger.Hover, '悬停'],
    [Trigger.MouseEnter, '光标移入'],
    [Trigger.MouseLeave, '光标移出'],
    [Trigger.MouseDown, '按下鼠标'],
    [Trigger.MouseUp, '松开鼠标'],
    [Trigger.Delay, '延迟'],
])

const actions: SelectSource[] = genOptions([
    [Actions.JumpPage, '跳转页面', 'jump-page'],
    [Actions.ReturnPage, '返回上一页面', 'retrun-page'],
    [Actions.PageScroll, '容器内滚动', 'scroll-page'],
    [Actions.OpenLink, '打开链接', 'open-link'],
    [Actions.ComponentState, '组件状态切换', 'component-state'],
    [Actions.OpenFloatLayer, '打开浮层', 'open-float-layer'],
    [Actions.CloseFloatLayer, '关闭浮层', 'close-float-layer'],
    [Actions.ChangeFloatLayer, '替换浮层', 'change-float-layer'],
])

const animation: SelectSource[] = genOptions([
    [Animation.Immediately, '即时'],
    [Animation.FadeInOut, '淡入淡出'],
    [Animation.SlideIn, '滑入'],
    [Animation.SlideOut, '滑出'],
    [Animation.MoveIn, '移入'],
    [Animation.MoveOut, '移出'],
    [Animation.PushIn, '推入']
])

const effect: SelectSource[] = genOptions([
    [Effect.LinearGradient, '线性渐变'],
    [Effect.SlowIn, '缓入'],
    [Effect.SlowOut, '缓出'],
    [Effect.SlowInOut, '缓入缓出'],
    [Effect.SpringbackStart, '后撤缓入'],
    [Effect.SpringbackEnd, '停滞缓入'],
    [Effect.SpringbackStartEnd, '弹性渐变']
])


const showtargerlist = ref<boolean>(false)
const test = () => {
    console.log('1111');
    showtargerlist.value = !showtargerlist.value
}

const createOrigin = () => {
    originName.value = '流程 ' + ++originNameNumber.value
    originDescribed.value = ''
    originedit.value = true;
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setProtoXX(shape, new PrototypeStartingPoint(originName.value, originDescribed.value));
}

const deleteOrigin = () => {
    originedit.value = false
}

const setPrototypeStartPoint = () => {
    console.log('change');
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = isPrototype.value[0];
    const { name, desc } = prototypestart.value!
    if (!shape) return;
    e.setProtoXX(shape as ShapeView, new PrototypeStartingPoint(name, desc));

    console.log('change-end');
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

const DomList = computed(() => {
    return props.context.selection.selectedPage?.childs.filter(i => {
        return (i.isContainer || i.type === ShapeType.SymbolRef) && i.name.includes(searchvlue.value)
    })
})


const isProtoType=ref<boolean>(false)

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
        isProtoType.value=false
        if (shape.type === ShapeType.Artboard || shape.type === ShapeType.Symbol || shape.type === ShapeType.SymbolRef) {
            isProtoType.value=true
        }
        //暂时获取组件状态
        const symref = props.context.selection.symbolrefview;
        if (!symref) {
            return;
        }
        const result = get_var_for_ref(symref, t);
        variables.value = [];
        if (!result) {
            return;
        }
        variables.value = result.variables;

    }
    shapes.value = [];
    // isPrototype.value = []

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

function selection_watcher(t: number) {
    if (t !== Selection.CHANGE_SHAPE && t !== Selection.CHANGE_PAGE) {
        return;
    }
    selection_change();
    watch_shapes();
    updateData()
}

function updateData() {
    const selecteds = props.context.selection.selectedShapes;
    if (selecteds.length < 1) return;
    if (selecteds.length === 1) {
        const shape = selecteds[0]
        if (shape.type === ShapeType.Artboard || shape.type === ShapeType.Symbol || shape.type === ShapeType.SymbolRef) {
            if ((shape as ArtboradView).prototypeStartPoint) {
                const { name, desc } = (shape as ArtboradView).prototypeStartPoint;
                prototypestart.value.name = name
                prototypestart.value.desc = desc
            } else {

            }
        }
    }
}

onMounted(() => {
    props.context.workspace.watch(workspace_watcher);
    props.context.selection.watch(selection_watcher);
    watch_shapes()
    update_by_shapes()
    selection_change();
    updateData()
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

.select-item {
    background-color: #fff;
    box-shadow: 0 3px 3px #00000008;
}

@mixin flex($j, $a) {
    display: flex;
    justify-content: $j;
    align-items: $a;
}

.container {
    width: 100%;
    height: 100%;
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
                height: 32px;
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

        .actions-item .item {
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
                font-size: 12px;
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

        .actions-item .item-setting {
            display: flex;
            flex-direction: column;
            width: 172px;
            margin-left: 18px;
            margin-top: 8px;
            font-size: 12px;
            font-weight: 400;
            gap: 8px;

            .trigger,
            .action,
            .target,
            .retract,
            .link {
                position: relative;
                display: flex;
                gap: 8px;

                span {
                    line-height: 32px;
                    white-space: nowrap;
                }

                .svg-wrap {
                    display: flex;
                    position: absolute;
                    right: 9px;
                    height: 32px;
                    flex: 0 0 10px;

                    svg {
                        margin: auto 0;
                        width: 10px;
                        height: 12px;
                        transition: 0.3s;
                        color: #666666;
                    }

                    &:hover svg {
                        transform: translateY(2px);
                    }
                }

                #target-input {
                    cursor: default;
                    outline: none;
                    border: none;
                    width: 100%;
                    padding: 10px;
                    height: 32px;
                    background-color: #F5F5F5;
                    border-radius: 6px;
                    font-size: 12px;
                    box-sizing: border-box;

                    &:hover {
                        background-color: #EBEBEB;
                    }
                }

                .search-container {
                    position: absolute;
                    top: 38px;
                    left: 32px;
                    width: 140px;
                    padding: 6px;
                    border-radius: 4px;
                    background-color: white;
                    box-sizing: border-box;
                    z-index: 1;

                    .header-search {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        width: 100%;
                        height: 32px;
                        padding: 10px 8px;
                        border-radius: 6px;
                        background-color: #F5F5F5;
                        box-sizing: border-box;

                        svg {
                            width: 12px;
                            height: 12px;
                        }

                        input {
                            outline: none;
                            border: none;
                            padding: 0;
                            width: 100%;
                            font-size: 12px;
                            background-color: transparent;

                            &::placeholder {
                                color: #BFBFBF;
                            }
                        }
                    }

                    .item-list {
                        max-height: 200px;
                        overflow-y: scroll;

                        &::-webkit-scrollbar {
                            width: 0;
                            height: 0;
                        }

                        .item {
                            height: 32px;
                        }
                    }
                }

                .retract-y,
                .retract-x {
                    width: 65px;
                    height: 32px;
                    background-color: #F5F5F5;
                    border-radius: 6px;
                    box-sizing: border-box;
                }

                input {
                    outline: none;
                    border: none;
                    font-size: 12px;
                    padding: 10px 8px;
                    height: 32px;
                    width: 100%;
                    border-radius: 6px;
                    background-color: #F5F5F5;
                    box-sizing: border-box;
                }
            }

            .set-animation {
                display: flex;
                flex-direction: column;

                span {
                    line-height: 32px;
                }

                .wrapper {
                    display: flex;
                    width: 172px;
                    height: 100px;
                    border-radius: 6px;
                    background-color: #F5F5F5;
                    box-sizing: border-box;

                    .container {
                        position: relative;
                        @include flex(center, center);
                        margin: auto;
                        width: 54px;
                        height: 64px;
                        border-radius: 4px;


                        .containerA {
                            position: absolute;
                            @include flex(center, center);
                            width: 100%;
                            height: 100%;
                            border-radius: 4px;
                            border: 1px solid #000;
                            box-sizing: border-box;
                        }

                        .containerB {
                            position: absolute;
                            @include flex(center, center);
                            transform: translateX(100%);
                            width: 100%;
                            height: 100%;
                            border-radius: 4px;
                            background-color: silver;
                        }

                        .containerC {
                            position: absolute;
                            @include flex(center, center);
                            width: 100%;
                            height: 100%;
                            border: 1px solid #000;
                            border-radius: 4px;
                            box-sizing: border-box;
                        }
                    }
                }

                .animation,
                .effect,
                .direction {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 8px;

                    span {
                        white-space: nowrap;
                    }

                    input {
                        font-size: 12px;
                        outline: none;
                        border: none;
                        padding: 10px 8px;
                        width: 54px;
                        height: 32px;
                        border-radius: 6px;
                        background-color: #F5F5F5;
                        box-sizing: border-box;

                    }

                    .content {
                        display: grid;
                        align-items: center;
                        grid-template-columns: 1fr 1fr 1fr 1fr;
                        grid-template-rows: 1fr;
                        width: 140px;
                        height: 32px;
                        padding: 2px;
                        border-radius: 6px;
                        background-color: #F5F5F5;
                        box-sizing: border-box;

                        .icon {
                            @include flex(center, center);
                            width: 34px;
                            height: 28px;
                            border-radius: 4px;
                            box-sizing: border-box;
                            transition: all 0.3s;

                            svg {
                                width: 16px;
                                height: 16px;
                            }
                        }
                    }
                }
            }

            .set-float {
                display: flex;
                flex-direction: column;

                span {
                    line-height: 32px;
                }

                .content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;
                    width: 100%;
                    height: 70px;

                    .position {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        grid-template-rows: 1fr 1fr 1fr;
                        gap: 2px;
                        padding: 2px;
                        border-radius: 6px;
                        border: 1px solid #F5F5F5;
                        box-sizing: border-box;

                        // background-color: #F5F5F5;
                        div {
                            width: 100%;
                            height: 100%;
                            border-radius: 3px;
                            background-color: #F5F5F5;
                        }
                    }

                    .margin {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        grid-template-rows: 1fr 1fr;
                        gap: 4px;

                        div {
                            width: 47px;
                            height: 100%;
                            border-radius: 6px;
                            background-color: #F5F5F5;
                        }
                    }
                }

                .checkbox {
                    display: flex;
                    align-items: center;
                    line-height: 32px;

                    input[type=checkbox] {
                        position: relative;
                        padding: 0;
                        width: 14px;
                        height: 14px;
                    }

                    input[type=checkbox]:checked::after {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        content: "";
                        color: #FFFFFF;
                        border-radius: 3px;
                        border: 1px solid rgb(24, 120, 245);
                        background-image: url('@/assets/select-icon.svg');
                        background-repeat: no-repeat;
                        background-position: center center;
                        background-size: 60% 40%;
                        background-color: rgb(24, 120, 245);
                        box-sizing: border-box;
                    }
                }

                .checkbox:has(input[type]:disabled) {
                    opacity: 0.4;
                }

                .setting {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 8px;
                    width: 172px;
                    height: 32px;
                    background-color: #f5f5f5;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    box-sizing: border-box;

                    input {
                        outline: none;
                        border: none;
                        font-size: 12px;
                        background-color: transparent;
                    }

                    #clr {
                        width: 70%;
                        padding: 0 8px;
                    }

                    #alpha {
                        width: 30%;
                    }
                }
            }

            .component-status {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;

                .state {
                    display: flex;
                    align-items: center;
                    width: 140px;

                    span {
                        white-space: nowrap;
                    }
                }
            }
        }
    }
}
</style>
