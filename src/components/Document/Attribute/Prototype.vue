<template>
    <div class="container">
        <el-scrollbar height="100%">
            <div v-if="isProtoType.size">
                <div v-if="isProtoType.size === 1" class="origin">
                    <div class="title" @click.stop=createOrigin>
                        <div class="text" :class="{ active: prototypestart }">流程起点</div>
                        <div v-if="!prototypestart" class="add">
                            <svg-icon icon-class="add"></svg-icon>
                        </div>
                        <div v-else class="delete" @click.stop=deleteOrigin>
                            <svg-icon icon-class="delete"></svg-icon>
                        </div>
                    </div>
                    <div v-if="!prototypestart" class="default">设置选中容器为新流程起点</div>
                    <div v-else class="originname">
                        <label v-if="!showIpnut" for="name" @dblclick="showIpnut = true">{{ originName
                            }}</label>
                        <input v-focus v-if="showIpnut" id="name" type="text" v-model="originName"
                            @blur="showIpnut = false" @change="setPrototypeStartPoint" autocomplete="off">
                        <textarea v-select name="origindes" id="" cols="30" rows="10" placeholder="点击输入流程备注信息"
                            v-model="originDescribed" @change="setPrototypeStartPoint"></textarea>
                    </div>
                </div>
                <div class="interaction">
                    <div class="title" @click.stop="createAction">
                        <div class="text" :class="{ active: prototypeinteraction?.length }">交互</div>
                        <div class="add">
                            <svg-icon icon-class="add"></svg-icon>
                        </div>
                    </div>
                    <div class="actions" v-if="prototypeinteraction?.length">

                        <div class="actions-item" v-for="action in  prototypeinteraction " :key="action.id">
                            <div class="item">
                                <div class="arrow" :class="{ activation: showaction && acitonindex === action.id }"
                                    @click.stop="showhandel(action.id)">
                                    <svg-icon icon-class="arrows-dr"></svg-icon>
                                </div>
                                <div class="item-content">
                                    <span>{{ event.get(action.event.interactionType) }}</span>
                                    <div v-if="action.actions.connectionType !== 'NONE'" class="icon-img">
                                        <svg-icon :icon-class="actions.find(item => item.data.value === action.actions.connectionType &&
                item.data.type === action.actions.navigationType)?.data.icon"></svg-icon>
                                    </div>
                                </div>
                                <div class="delete" @click.stop="deleteAction(action.id)">
                                    <svg-icon icon-class="delete"></svg-icon>
                                </div>
                            </div>
                            <div class="item-setting" v-if="showaction && acitonindex === action.id">
                                <div class="trigger">
                                    <span>触发</span>
                                    <Select class="select" id="select" :visibility="true" :minwidth="100"
                                        :source="trigger"
                                        :selected="trigger.find(item => item.data.value === action.event.interactionType)?.data"
                                        @select="setPrototypeActionEvent($event, action.id)"></Select>
                                    <input ref="aftertimeout"
                                        v-if="action.event.interactionType === PrototypeEvents.AFTERTIMEOUT" type="text"
                                        :value="(action.event.transitionTimeout ? action.event.transitionTimeout : 0.8) * 1000 + 'ms'"
                                        @change="setPrototypeActionEventTime(action.id)">
                                </div>
                                <div class="action">
                                    <span>动作</span>
                                    <Select class="select" id="select" :visibility="true" :source="actions" :selected="actions.find(item => item.data.value === action.actions.connectionType &&
                item.data.type === action.actions.navigationType)?.data"
                                        @select="setPrototypeActionConnNav($event, action.id)"></Select>
                                </div>
                                <div v-if="action.actions.navigationType === PrototypeNavigationType.SWAPSTATE"
                                    class="component-status">
                                    <div class="state" v-for="i in variables" :key="i.variable.id">
                                        <span>{{ i.variable.name }}：</span>
                                        <Select class="select" id="select" :visibility="true" :source="genOptions(i.values.map((v, idx) => {
                return [idx, v];
            }))" :selected="trigger.find(item => item.id === 0)?.data"></Select>
                                    </div>
                                </div>
                                <div v-if="action.actions.connectionType === PrototypeConnectionType.INTERNALNODE"
                                    class="target">
                                    <span>目标</span>
                                    <div class="targetname" @click.stop="test(action.id)">
                                        <span :style="{ color: action.actions.targetNodeID ? '#000' : '#c8c8c8' }">{{
                getTargetNodeName(action.actions.targetNodeID) ?? '请选择容器' }}</span>
                                        <div class="svg-wrap">
                                            <svg-icon icon-class="down"></svg-icon>
                                        </div>
                                    </div>

                                    <div class="search-container" v-if="showtargerlist">
                                        <div class="header-search">
                                            <svg-icon icon-class="search"></svg-icon>
                                            <input v-focus type="text" placeholder="搜索容器" v-model="searchvlue">
                                        </div>
                                        <div class="item-list">
                                            <div class="item" v-for="shape in DomList" :key="shape.id"
                                                @click.stop="selectTargetNode(action.id, shape.id)">
                                                <svg-icon
                                                    :style="{ visibility: action.actions.targetNodeID === shape.id ? 'visible' : 'hidden' }"
                                                    :icon-class="'be70ff3e-5c87-4ddc-90b9-13ae648a20f31' === shape.id ? 'white-select' : 'page-select'"></svg-icon>
                                                <span>{{ shape.name }}</span>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="action.actions.navigationType === PrototypeNavigationType.SCROLLTO"
                                    class="retract">
                                    <span>缩进</span>
                                    <div class="retract-y">
                                        <svg-icon icon-class="indent_Y"></svg-icon>
                                        <input class="indent" type="text"
                                            :value="action.actions.extraScrollOffset?.y ?? 0"
                                            @change="setExtraScrollOffsetY(action.id)">
                                    </div>
                                    <div class="retract-x">
                                        <svg-icon icon-class="indent_X"></svg-icon>
                                        <input class="indent" type="text"
                                            :value="action.actions.extraScrollOffset?.x ?? 0"
                                            @change="setExtraScrollOffsetX(action.id)">
                                    </div>
                                </div>
                                <div v-if="action.actions.connectionType === PrototypeConnectionType.URL"
                                    class="link">
                                    <span>链接</span>
                                    <input v-select ref="connectionURL" type="text" placeholder="输入链接地址"
                                        :value="action.actions.connectionURL"
                                        @change="setPrototypeActionURL(action.id)">
                                </div>
                                <div v-if="action.actions.navigationType === PrototypeNavigationType.OVERLAY && action.actions.targetNodeID"
                                    class="set-float">
                                    <span>浮层设置</span>
                                    <div class="content">
                                        <div class="position">
                                            <div v-for="i in  OverlayPositions " :key="i"
                                                :class="{ 'ptactive': getPosition(action.id, action.actions.targetNodeID!) === i }"
                                                @click.stop="setOverlayPositionType(action.actions.targetNodeID!, i)">
                                            </div>
                                        </div>
                                        <div class="margin">
                                            <div v-for=" i  in  4 " :key="i"></div>
                                        </div>
                                    </div>
                                    <div class="checkbox">
                                        <input type="checkbox" id="closetab" v-model="overlayclose"
                                            @change="setOverlayBackgroundInteraction(action.actions.targetNodeID!)">
                                        <label for="closetab">点击浮层外关闭浮层</label>
                                    </div>
                                    <div class="checkbox">
                                        <input type="checkbox" id="color" v-model="addmask"
                                            @change="setOverlayBackgroundAppearance(action.actions.targetNodeID!)">
                                        <label for="color">在浮层后添加遮罩</label>
                                    </div>
                                    <div v-if="addmask || getBackgroundType(action.actions.targetNodeID!)"
                                        class="setting">
                                        <ColorPicker class="color" :color="(background_color as Color)"
                                            :context="props.context" :auto_to_right_line="true"
                                            @change="c => colorChangeFromPicker(c)"></ColorPicker>
                                        <input v-select type="text" @change.stop="(e: Event) => change_c(e)"
                                            :value="clr_v" id="clr" ref="clr_ele" @click="clr_click" :spellcheck="false"
                                            @blur="is_color_select = false">
                                        <input v-select @change="(e: Event) => change_a(e)" :value="`${alpha_v}%`"
                                            id="alpha" @blur="is_alpha_select = false" @click="alpha_click"
                                            ref="alpha_ele">
                                    </div>

                                </div>
                                <div v-if="action.actions.connectionType === 'INTERNAL_NODE'" class="set-animation">
                                    <span>动画设置</span>
                                    <div class="wrapper">
                                        <div class="mask" @mouseenter.stop="addstyle" @mouseleave.stop="delstyle">
                                        </div>
                                        <div class="container"
                                            :value="test2(action.actions.transitionType!, action.actions.easingType!, action.actions.transitionDuration!)">
                                            <div ref="ela" class="containerA" :style="tara ?? qsa">
                                                A</div>
                                            <div ref="elb" class="containerB" :style="tarb ?? qsb">
                                                B</div>
                                            <div class="containerC"></div>
                                        </div>
                                    </div>
                                    <div class="animation">
                                        <span>动画</span>
                                        <Select class="select" id="select" :visibility="true" :source="animation"
                                            :selected="animation.find(item => animations.get(action.actions.transitionType!) === item.data.content)?.data"
                                            @select="setPrototypeActionTransition($event, action.id)"></Select>
                                    </div>
                                    <div v-if="action.actions.transitionType?.split('_').findLast(d => ['left', 'right', 'top', 'bottom'].includes(d.toLowerCase()))"
                                        class="direction">
                                        <div class="content">
                                            <div class="icon"
                                                :class="{ 'select-item': action.actions.transitionType?.split('_')[action.actions.transitionType?.split('_').length - 1].toLowerCase() === i }"
                                                v-for="  i  of  Object.values(Direction) " :key="i"
                                                @click.stop="setPrototypeActionTransitionDirection(action.actions.transitionType, action.id, i)">
                                                <svg-icon :style="{ rotate: (`${setrotate.get(i)}` + 'deg') }"
                                                    icon-class="right-arrows"></svg-icon>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="action.actions.transitionType !== PrototypeTransitionType.INSTANTTRANSITION"
                                        class="effect">
                                        <span>效果</span>
                                        <Select class="select" id="select" :minwidth="100" :visibility="true"
                                            :source="effect"
                                            :selected="effect.find(item => item.data.value === action.actions.easingType)?.data || effect.find(item => item.id === 0)?.data"
                                            @select="setProtoTypeEasingType($event, action.id)"></Select>
                                        <input v-select ref="animationtimevalue" type="text" placeholder="时间"
                                            @change="setTransitionDuration(action.id)"
                                            :value="action.actions.transitionDuration ? action.actions.transitionDuration * 1000 + 'ms' : '300ms'">
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
            <div v-else class="tips">
                <span>交互</span>
            </div>
            <Origin :context=props.context :prototypestart=prototypestart @createorigin=createOrigin></Origin>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { WorkSpace } from "@/context/workspace";
import { ShapeType, Shape, Color, ShapeView, SymbolRefView, TableCellView, TableView, TextShapeView, BasicArray, PrototypeEvents, PrototypeEvent, PrototypeTransitionType } from "@kcdesign/data"
import { debounce, throttle } from 'lodash';
import { flattenShapes } from '@/utils/cutout';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from '@/utils/common';
import { computed, HtmlHTMLAttributes, nextTick, onMounted, onUnmounted, reactive, ref, shallowRef, StyleHTMLAttributes, StyleValue, toRef, watch } from 'vue';
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
import Origin from "./Prototype/Origin.vue"
import {
    PrototypeStartingPoint,
    ArtboradView,
    PrototypeInterAction,
    PrototypeActions,
    PrototypeConnectionType,
    PrototypeNavigationType,
    PrototypeEasingType,
    // PrototypeEasingfunction,
    OverlayPositions,
    OverlayBackgroundInteraction,
    OverlayBackgroundAppearance,
    OverlayBackgroundType
} from '@kcdesign/data';
import { v4 } from 'uuid';

const background_color = ref(new Color(1, 239, 239, 239));
const alpha_v = ref<number>(100);
const clr_v = ref<string>('EFEFEF');
const is_color_select = ref(false);
const alpha_ele = ref<HTMLInputElement>();
const clr_ele = ref<HTMLInputElement>();
const is_alpha_select = ref(false);
const addmask = ref<boolean>(false)


function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
}



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
    // nextTick(() => {
    //     clr_ele.value?.blur()
    // })
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

enum Animation {
    INSTANT = 'INSTANT_TRANSITION',
    DISSOLVE = 'DISSOLVE',
    SLIDE = 'SLIDE',
    SLIDEOUT = 'SLIDE_OUT',
    MOVE = 'MOVE',
    MOVEOUT = 'MOVE_OUT',
    PUSH = 'PUSH'
}

enum Direction {
    Left = 'left',
    Right = 'right',
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
const acitonindex = ref<string>('')
const selectshape = ref<string>('')

const variables = ref<RefAttriListItem[]>([]);
const { t } = useI18n()
const searchvlue = ref<string>('')
const animationtimevalue = ref<HTMLInputElement[]>()
const selectitem = ref<string>('right')
const prototypestart = ref<Prototypestart | undefined>({ name: "", desc: "" })
const prototypeinteraction = ref<PrototypeInterAction[]>()

const aftertimeout = ref<HTMLInputElement[]>()
const connectionURL = ref<HTMLInputElement[]>()
const DomList = ref<ShapeView[]>([])
const direction = ref<string>('')
const overlayclose = ref<boolean>(false)





const setrotate = new Map()

for (let i of Object.values(Direction)) {
    switch (i) {
        case 'left':
            setrotate.set(i, 180)
            break;
        case 'right':
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
    [PrototypeEvents.ONCLICK, '单击'],
    [PrototypeEvents.DBCLICK, '双击'],
    [PrototypeEvents.RIGHTCLICK, '右键'],
    [PrototypeEvents.DRAG, '拖拽'],
    [PrototypeEvents.HOVER, '悬停'],
    [PrototypeEvents.MOUSEENTER, '光标移入'],
    [PrototypeEvents.MOUSELEAVE, '光标移出'],
    [PrototypeEvents.MOUSEDOWN, '按下鼠标'],
    [PrototypeEvents.MOUSEUP, '松开鼠标'],
    [PrototypeEvents.AFTERTIMEOUT, '延迟'],
])

const event = new Map([
    [PrototypeEvents.ONCLICK, '单击'],
    [PrototypeEvents.DBCLICK, '双击'],
    [PrototypeEvents.RIGHTCLICK, '右键'],
    [PrototypeEvents.DRAG, '拖拽'],
    [PrototypeEvents.HOVER, '悬停'],
    [PrototypeEvents.MOUSEENTER, '光标移入'],
    [PrototypeEvents.MOUSELEAVE, '光标移出'],
    [PrototypeEvents.MOUSEDOWN, '按下鼠标'],
    [PrototypeEvents.MOUSEUP, '松开鼠标'],
    [PrototypeEvents.AFTERTIMEOUT, '延迟'],
])


const actions: SelectSource[] = genOptions([
    [PrototypeConnectionType.NONE, '无'],
    [PrototypeConnectionType.INTERNALNODE, '跳转页面', 'jump-page', PrototypeNavigationType.NAVIGATE],
    [PrototypeConnectionType.BACK, '返回上一页面', 'retrun-page'],
    [PrototypeConnectionType.INTERNALNODE, '容器内滚动', 'scroll-page', PrototypeNavigationType.SCROLLTO],
    [PrototypeConnectionType.URL, '打开链接', 'open-link'],
    [PrototypeConnectionType.INTERNALNODE, '组件状态切换', 'component-state', PrototypeNavigationType.SWAPSTATE],
    [PrototypeConnectionType.INTERNALNODE, '打开浮层', 'open-float-layer', PrototypeNavigationType.OVERLAY],
    [PrototypeConnectionType.CLOSE, '关闭浮层', 'close-float-layer'],
    [PrototypeConnectionType.INTERNALNODE, '替换浮层', 'change-float-layer', PrototypeNavigationType.SWAP],
])

const icon = new Map([
    [PrototypeConnectionType.INTERNALNODE, 'jump-page'],
    [PrototypeConnectionType.BACK, 'retrun-page'],
    [PrototypeConnectionType.INTERNALNODE, 'jump-page'],
    [PrototypeConnectionType.URL, 'open-link'],
    [PrototypeConnectionType.INTERNALNODE, 'jump-page'],
    [PrototypeConnectionType.INTERNALNODE, 'jump-page'],
])

const animation: SelectSource[] = genOptions([
    [Animation.INSTANT, '即时'],
    [Animation.DISSOLVE, '淡入淡出'],
    [Animation.SLIDE, '滑入'],
    [Animation.SLIDEOUT, '滑出'],
    [Animation.MOVE, '移入'],
    [Animation.MOVEOUT, '移出'],
    [Animation.PUSH, '推入']
])

const effect: SelectSource[] = genOptions([
    [PrototypeEasingType.LINEAR, '线性渐变'],
    [PrototypeEasingType.INCUBIC, '缓入'],
    [PrototypeEasingType.OUTCUBIC, '缓出'],
    [PrototypeEasingType.INOUTCUBIC, '缓入缓出'],
    [PrototypeEasingType.INBACKCUBIC, '后撤缓入'],
    [PrototypeEasingType.OUTBACKCUBIC, '停滞缓入'],
    [PrototypeEasingType.INOUTBACKCUBIC, '弹性渐变']
])

const easingFn = new Map([
    [PrototypeEasingType.LINEAR, [0, 0, 1, 1]],
    [PrototypeEasingType.INCUBIC, [0.42, 0, 1, 1]],
    [PrototypeEasingType.OUTCUBIC, [0, 0, 0.58, 1]],
    [PrototypeEasingType.INOUTCUBIC, [0.42, 0, 0.58, 1]],
    [PrototypeEasingType.INBACKCUBIC, [0.3, -0.05, 0.7, -0.5]],
    [PrototypeEasingType.OUTBACKCUBIC, [0.45, 1.45, 0.8, 1]],
    [PrototypeEasingType.INOUTBACKCUBIC, [0.7, -0.4, 0.4, 1.4]],
])


const animations = new Map([
    [PrototypeTransitionType.INSTANTTRANSITION, '即时'],
    [PrototypeTransitionType.DISSOLVE, '淡入淡出'],
    [PrototypeTransitionType.MOVEFROMLEFT, '移入'],
    [PrototypeTransitionType.MOVEFROMRIGHT, '移入'],
    [PrototypeTransitionType.MOVEFROMTOP, '移入'],
    [PrototypeTransitionType.MOVEFROMBOTTOM, '移入'],
    [PrototypeTransitionType.MOVEOUTTOLEFT, '移出'],
    [PrototypeTransitionType.MOVEOUTTORIGHT, '移出'],
    [PrototypeTransitionType.MOVEOUTTOTOP, '移出'],
    [PrototypeTransitionType.MOVEOUTTOBOTTOM, '移出'],
    [PrototypeTransitionType.SLIDEFROMLEFT, '滑入'],
    [PrototypeTransitionType.SLIDEFROMRIGHT, '滑入'],
    [PrototypeTransitionType.SLIDEFROMTOP, '滑入'],
    [PrototypeTransitionType.SLIDEFROMBOTTOM, '滑入'],
    [PrototypeTransitionType.SLIDEOUTTOLEFT, '滑出'],
    [PrototypeTransitionType.SLIDEOUTTORIGHT, '滑出'],
    [PrototypeTransitionType.SLIDEOUTTOTOP, '滑出'],
    [PrototypeTransitionType.SLIDEOUTTOBOTTOM, '滑出'],
    [PrototypeTransitionType.PUSHFROMLEFT, '推入'],
    [PrototypeTransitionType.PUSHFROMRIGHT, '推入'],
    [PrototypeTransitionType.PUSHFROMTOP, '推入'],
    [PrototypeTransitionType.PUSHFROMBOTTOM, '推入'],
])


const showtargerlist = ref<boolean>(false)

function checktargetlist(e: MouseEvent) {
    const muen = document.querySelector('.search-container')
    if (!muen) return;
    if (!muen.contains(e.target as HTMLElement)) {
        showtargerlist.value = false
    }
}
const qsa = ref<StyleValue | null>()
const qsb = ref<StyleValue | null>()

const mba = ref<StyleValue | null>()
const mbb = ref<StyleValue | null>()

const tara = ref<StyleValue | null>()
const tarb = ref<StyleValue | null>()

const ela = ref<HTMLDivElement[]>()
const elb = ref<HTMLDivElement[]>()

let timer: any;


let timer3: any
const addstyle = () => {
    if (timer3) clearTimeout(timer3)
    timer3 = setTimeout(() => {
        console.log('添加');
        (ela.value![0] as HTMLDivElement).addEventListener("transitionend", change);
        (elb.value![0] as HTMLDivElement).addEventListener("transitionend", change)
        tarb.value = { ...qsb.value as object, ...mbb.value as object };
        tara.value = { ...qsa.value as object, ...mba.value as object };
        clearTimeout(timer3);
        timer3 = null
    }, 200);

}

const change = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
        (ela.value![0] as HTMLDivElement).removeEventListener("transitionend", change);
        (elb.value![0] as HTMLDivElement).removeEventListener("transitionend", change)
        delstyle()
        clearTimeout(timer);
    }, 1000);
    console.log('jinting');
}

const delstyle = () => {
    if (timer3) return
    console.log('移除');

    (ela.value![0] as HTMLDivElement).removeEventListener("transitionend", change);
    (elb.value![0] as HTMLDivElement).removeEventListener("transitionend", change)
    tarb.value = null
    tara.value = null
}

const test2 = (type: string, easingType: PrototypeEasingType, time: number) => {
    qsa.value = null
    qsb.value = null
    mba.value = null
    mbb.value = null
    const FN = easingFn.get(easingType ?? "LINEAR")!
    const T = time ?? 0.3
    const Bezier = `all ${T}s cubic-bezier(${FN.join()}) 0s`
    const W = 54
    const H = 64
    if (animations.get(type as PrototypeTransitionType) === '即时') {
        return
    }
    if (animations.get(type as PrototypeTransitionType) === '淡入淡出') {
        qsb.value = {
            transition: '',
            zIndex: 2,
            opacity: 0,
        }
        mbb.value = {
            transition: Bezier,
            opacity: 1,
        }
    }
    if (animations.get(type as PrototypeTransitionType) === '移入') {
        mbb.value = {
            transition: Bezier,
            opacity: 1,
            left: 0,
            top: 0,
        }
        if (type.includes('LEFT')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: "unset",
                left: W + 'px',
            }
        }
        if (type.includes('RIGHT')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: "unset",
                left: -W + 'px',
            }
        }
        if (type.includes('TOP')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: "unset",
                top: -H + 'px',
            }
        }
        if (type.includes('BOTTOM')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: "unset",
                top: H + 'px',
            }
        }
    }
    if (animations.get(type as PrototypeTransitionType) === '移出') {
        qsb.value = {
            transition: '',
            zIndex: 2,
            border: "unset",
            top: 0,
            left: 0,
        }
        if (type.includes('LEFT')) {
            mbb.value = {
                transition: Bezier,
                left: -W + 'px',
            }
        }
        if (type.includes('RIGHT')) {
            mbb.value = {
                transition: Bezier,
                left: W + 'px',
            }
        }
        if (type.includes('TOP')) {
            mbb.value = {
                transition: Bezier,
                top: H + 'px',
            }
        }
        if (type.includes('BOTTOM')) {
            mbb.value = {
                transition: Bezier,
                top: -H + 'px',
            }
        }

    }
    if (animations.get(type as PrototypeTransitionType) === '滑入') {
        qsa.value = {
            transition: '',
            zIndex: 2,
            opacity: 1,
            left: 0,
        };
        mbb.value = {
            transition: Bezier,
            opacity: 1,
            left: 0,
            top: 0,
        }
        if (type.includes('LEFT')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: "unset",
                left: W + 'px',
            }
            mba.value = {
                transition: Bezier,
                left: -12 + 'px',
                opacity: 0.4,
            }
        }
        if (type.includes('RIGHT')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: "unset",
                left: -W + 'px',
            }
            mba.value = {
                transition: Bezier,
                left: 12 + 'px',
                opacity: 0.4,
            }
        }
        if (type.includes('TOP')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: "unset",
                top: -H + 'px',
            }
            mba.value = {
                transition: Bezier,
                top: 12 + 'px',
                opacity: 0.4,
            }
        }
        if (type.includes('BOTTOM')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: "unset",
                top: H + 'px',
            }
            mba.value = {
                transition: Bezier,
                top: -12 + 'px',
                opacity: 0.4,
            }
        }
    }
    if (animations.get(type as PrototypeTransitionType) === '滑出') {
        qsa.value = {
            transition: '',
            zIndex: 2,
            left: 0,
            top: 0,
            backgroundColor: 'silver',
            border: "unset",
        }
        mbb.value = {
            transition: Bezier,
            opacity: 1,
            left: 0,
            top: 0,
        }
        if (type.includes('LEFT')) {
            qsb.value = {
                transition: '',
                left: 12 + 'px',
                opacity: 0.4,
                backgroundColor: "unset",
            }
            mba.value = {
                transition: Bezier,
                opacity: 1,
                left: -W + 'px',
                top: 0,
            }
        }
        if (type.includes('RIGHT')) {
            qsb.value = {
                transition: '',
                left: -12 + 'px',
                opacity: 0.4,
                backgroundColor: "unset",
            }
            mba.value = {
                transition: Bezier,
                opacity: 1,
                left: W + 'px',
                top: 0,
            }
        }
        if (type.includes('TOP')) {
            qsb.value = {
                transition: '',
                top: -12 + 'px',
                opacity: 0.4,
                backgroundColor: "unset",
            }
            mba.value = {
                transition: Bezier,
                opacity: 1,
                left: 0,
                top: H + 'px',
            }
        }
        if (type.includes('BOTTOM')) {
            qsb.value = {
                transition: '',
                top: 12 + 'px',
                opacity: 0.4,
                backgroundColor: "unset",
            }
            mba.value = {
                transition: Bezier,
                opacity: 1,
                left: 0,
                top: -H + 'px',
            }
        }
    }
    if (animations.get(type as PrototypeTransitionType) === '推入') {
        qsa.value = {
            transition: '',
            zIndex: 2,
            left: 0,
            top: 0,
            opacity: 1,
        }
        mbb.value = {
            transition: Bezier,
            opacity: 1,
            left: 0,
            top: 0,
        }
        if (type.includes('LEFT')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: 'unset',
                left: W + 'px',
            }
            mba.value = {
                transition: Bezier,
                opacity: 0.4,
                left: -W + 'px',
                top: 0,
            }
        }
        if (type.includes('RIGHT')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: 'unset',
                left: -W + 'px',
            }
            mba.value = {
                transition: Bezier,
                opacity: 0.4,
                left: W + 'px',
                top: 0,
            }
        }
        if (type.includes('TOP')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: 'unset',
                top: -H + 'px',
            }
            mba.value = {
                transition: Bezier,
                opacity: 0.4,
                left: 0,
                top: H + 'px',
            }
        }
        if (type.includes('BOTTOM')) {
            qsb.value = {
                transition: '',
                zIndex: 2,
                border: 'unset',
                top: H + 'px',
            }
            mba.value = {
                transition: Bezier,
                opacity: 0.4,
                left: 0,
                top: -H + 'px',
            }
        }
    }

}

const changeStyle = (type: string, easingType: PrototypeEasingType, time: number) => {
    const el = document.querySelector('.containerB') as HTMLElement
    const elA = document.querySelector('.containerA') as HTMLElement
    const fn = easingFn.get(easingType ?? "LINEAR")!
    const t = time || 0.3

    if (type === PrototypeTransitionType.INSTANTTRANSITION) return
    el.style.transition = `all ${t}s cubic-bezier(${fn.join()}) 0s`;
    el.style.opacity = "1";
    el.style.left = "0px";
    el.style.top = "0px";
    if (type.includes('OUT') && type.includes('LEFT')) {
        if (type.includes('SLIDE')) {
            el.style.left = "0px";
            el.style.opacity = "1";
        } else {
            el.style.left = "-54px";
            el.style.top = "0px";
        }
    }
    if (type.includes('OUT') && type.includes('RIGHT')) {

        if (type.includes('SLIDE')) {
            el.style.left = "0px";
            el.style.opacity = "1";
        } else {
            el.style.left = "54px";
            el.style.top = "0px";
        }
    }
    if (type.includes('OUT') && type.includes('TOP')) {

        if (type.includes('SLIDE')) {
            el.style.top = "0px";
            el.style.opacity = "1";
        } else {
            el.style.left = "0px";
            el.style.top = "64px";
        }
    }
    if (type.includes('OUT') && type.includes('BOTTOM')) {

        if (type.includes('SLIDE')) {
            el.style.top = "0px";
            el.style.opacity = "1";
        } else {
            el.style.left = "0px";
            el.style.top = "-64px";
        }
    }
    if (animations.get(type as PrototypeTransitionType) === '滑入') {
        if (type.includes('LEFT')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.left = '-12px';
            elA.style.opacity = '0.4';
        }
        if (type.includes('RIGHT')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.left = '12px';
            elA.style.opacity = '0.4';
        }
        if (type.includes('TOP')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.top = '12px';
            elA.style.opacity = '0.4';
        }
        if (type.includes('BOTTOM')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.top = '-12px';
            elA.style.opacity = '0.4';
        }
    }
    if (animations.get(type as PrototypeTransitionType) === '滑出') {
        if (type.includes('LEFT')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.left = '-54px';
            // elA.style.opacity = '0.4';
        }
        if (type.includes('RIGHT')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.left = '54px';
            // elA.style.opacity = '0.4';
        }
        if (type.includes('TOP')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.top = '64px';
            // elA.style.opacity = '0.4';
        }
        if (type.includes('BOTTOM')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.top = '-64px';
            // elA.style.opacity = '0.4';
        }
    }
    if (animations.get(type as PrototypeTransitionType) === '推入') {
        if (type.includes('LEFT')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.left = '-54px';
            elA.style.opacity = '0.4';
        }
        if (type.includes('RIGHT')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.left = '54px';
            elA.style.opacity = '0.4';
        }
        if (type.includes('TOP')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.top = '64px';
            elA.style.opacity = '0.4';
        }
        if (type.includes('BOTTOM')) {
            elA.style.transition = `all ${t}s cubic-bezier(${fn[0]},${fn[1]},${fn[2]},${fn[3]}) 0s`;
            elA.style.top = '-64px';
            elA.style.opacity = '0.4';
        }
    }
}

const setStyleA = (type: PrototypeTransitionType, easingType: PrototypeEasingType, time: number): StyleValue => {
    console.log('========a', type);
    const width = 54
    const height = 64
    const el = document.querySelector('.containerA') as HTMLElement;
    let sty: any;
    let timer: any
    let timer2: any
    if (el) {
        const change = () => {
            if (timer2) clearTimeout(timer2)
            timer2 = setTimeout(() => {
                if (typeof sty === 'object') {
                    Object.keys(sty).forEach((key: any) => {
                        el.style[key] = sty[key]
                    });
                }
                console.log('==============1111111');
                clearTimeout(timer2)
            }, 500);
            el.removeEventListener("transitionend", change)
        }
        el.addEventListener("transitionend", change)
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            changeStyle(type, easingType, time)
            clearTimeout(timer)
        }, 200);
    }
    switch (type) {
        case PrototypeTransitionType.SLIDEFROMLEFT:

            return sty = {
                transition: '',
                zIndex: 2,
                opacity: 1,
                left: 0,
            }
        case PrototypeTransitionType.SLIDEFROMRIGHT:
            return sty = {
                transition: '',
                zIndex: 2,
                opacity: 1,
                left: 0,
            }
        case PrototypeTransitionType.SLIDEFROMTOP:
            return {
                transition: '',
                zIndex: 2,
                opacity: 1,
                top: 0,
            }
        case PrototypeTransitionType.SLIDEFROMBOTTOM:
            return {
                transition: '',
                zIndex: 2,
                opacity: 1,
                top: 0,
            }
        case PrototypeTransitionType.SLIDEOUTTOLEFT:
            return {
                transition: '',
                zIndex: 2,
                left: 0,
                backgroundColor: 'silver',
                border: "unset",
            }
        case PrototypeTransitionType.SLIDEOUTTORIGHT:
            return {
                transition: '',
                zIndex: 2,
                left: 0,
                backgroundColor: 'silver',
                border: "unset",
            }
        case PrototypeTransitionType.SLIDEOUTTOTOP:
            return {
                transition: '',
                zIndex: 2,
                top: 0,
                backgroundColor: 'silver',
                border: "unset",
            }
        case PrototypeTransitionType.SLIDEOUTTOBOTTOM:
            return {
                transition: '',
                zIndex: 2,
                top: 0,
                backgroundColor: 'silver',
                border: "unset",
            }
        case PrototypeTransitionType.PUSHFROMLEFT:
            return {
                transition: '',
                zIndex: 2,
                left: 0,
                opacity: 1,
            }
        case PrototypeTransitionType.PUSHFROMRIGHT:
            return {
                transition: '',
                zIndex: 2,
                left: 0,
                opacity: 1,
            }
        case PrototypeTransitionType.PUSHFROMTOP:
            return {
                transition: '',
                zIndex: 2,
                top: 0,
                opacity: 1,
            }
        case PrototypeTransitionType.PUSHFROMBOTTOM:
            return {
                transition: '',
                zIndex: 2,
                top: 0,
                opacity: 1,
            }
        default:
            return
    }
}
const setStyle = (type: string, easingType: PrototypeEasingType, time: number): StyleValue => {
    console.log('========', type);
    const width = 54
    const height = 64
    const el = document.querySelector('.containerB') as HTMLElement;
    let sty: any;
    let timer: any
    let timer2: any
    if (el) {
        const change = () => {
            if (timer2) clearTimeout(timer2)
            timer2 = setTimeout(() => {
                if (typeof sty === 'object') {
                    Object.keys(sty).forEach((key: any) => {
                        el.style[key] = sty[key]
                    });
                }
                console.log('==============2222222');

                clearTimeout(timer2)
            }, 500);
            el.removeEventListener("transitionend", change)
        }
        el.addEventListener("transitionend", change)
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            changeStyle(type, easingType, time)
            clearTimeout(timer)
        }, 200);
    }
    switch (type) {
        case PrototypeTransitionType.DISSOLVE:
            return {
                transition: '',
                zIndex: 2,
                opacity: 0,
            }
        case PrototypeTransitionType.MOVEFROMLEFT:
            return {
                transition: '',
                zIndex: 2,
                border: "unset",
                left: width + 'px',
            }

        case PrototypeTransitionType.MOVEFROMRIGHT:
            return {
                transition: '',
                zIndex: 2,
                border: "unset",
                left: -width + 'px',
            }

        case PrototypeTransitionType.MOVEFROMTOP:
            return {
                transition: '',
                zIndex: 2,
                border: "unset",
                top: -height + 'px',
            }
        case PrototypeTransitionType.MOVEFROMBOTTOM:
            return {
                transition: '',
                zIndex: 2,
                border: "unset",
                top: height + 'px',
            }
        case PrototypeTransitionType.MOVEOUTTOLEFT:
            return {
                transition: '',
                zIndex: 2,
                top: 0 + 'px',
                left: 0 + 'px',
                border: "unset",
            }
        case PrototypeTransitionType.MOVEOUTTORIGHT:
            return {
                transition: '',
                zIndex: 2,
                top: 0 + 'px',
                left: 0 + 'px',
                border: "unset",
            }
        case PrototypeTransitionType.MOVEOUTTOTOP:
            return {
                transition: '',
                zIndex: 2,
                top: 0 + 'px',
                left: 0 + 'px',
                border: "unset",
            }
        case PrototypeTransitionType.MOVEOUTTOBOTTOM:
            return {
                transition: '',
                zIndex: 2,
                top: 0 + 'px',
                left: 0 + 'px',
                border: "unset",
            }
        case PrototypeTransitionType.SLIDEFROMLEFT:
            return sty = {
                transition: '',
                zIndex: 2,
                border: "unset",
                left: width + 'px',
            }
        case PrototypeTransitionType.SLIDEFROMRIGHT:
            return sty = {
                transition: '',
                zIndex: 2,
                border: "unset",
                left: -width + 'px',
            }
        case PrototypeTransitionType.SLIDEFROMTOP:
            return {
                transition: '',
                zIndex: 2,
                border: "unset",
                top: -height + 'px',
            }
        case PrototypeTransitionType.SLIDEFROMBOTTOM:
            return {
                transition: '',
                zIndex: 2,
                border: "unset",
                top: height + 'px',
            }
        case PrototypeTransitionType.SLIDEOUTTOLEFT:
            return {
                transition: '',
                top: 0 + 'px',
                left: 12 + 'px',
                opacity: 0.4,
                backgroundColor: "unset",
            }
        case PrototypeTransitionType.SLIDEOUTTORIGHT:
            return {
                transition: '',
                top: 0 + 'px',
                left: -12 + 'px',
                opacity: 0.4,
                backgroundColor: "unset",
            }
        case PrototypeTransitionType.SLIDEOUTTOTOP:
            return {
                transition: '',
                top: -12 + 'px',
                left: 0 + 'px',
                opacity: 0.4,
                backgroundColor: "unset",
            }
        case PrototypeTransitionType.SLIDEOUTTOBOTTOM:
            return {
                transition: '',
                top: 12 + 'px',
                left: 0 + 'px',
                opacity: 0.4,
                backgroundColor: "unset",
            }
        case PrototypeTransitionType.PUSHFROMLEFT:
            return {
                transition: '',
                zIndex: 2,
                border: 'unset',
                left: width + 'px',
            }
        case PrototypeTransitionType.PUSHFROMRIGHT:
            return {
                transition: '',
                zIndex: 2,
                border: 'unset',
                left: -width + 'px',
            }
        case PrototypeTransitionType.PUSHFROMTOP:
            return {
                transition: '',
                zIndex: 2,
                border: 'unset',
                top: -height + 'px',
            }
        case PrototypeTransitionType.PUSHFROMBOTTOM:
            return {
                transition: '',
                zIndex: 2,
                border: 'unset',
                top: height + 'px',
            }
        default:
            return {}
    }
}
function onblur() {
    console.log('失焦');
    showtargerlist.value = false
}

watch(showtargerlist, () => {
    if (showtargerlist.value) {
        document.addEventListener('click', checktargetlist);
        nextTick(() => {
            const muen = document.querySelector('.search-container');
            (muen as HTMLDivElement).addEventListener('blur', onblur);
            (muen as HTMLDivElement).focus()
        })
    }

})


const setExtraScrollOffsetX = (id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeExtraScrollOffsetX(shape as ArtboradView, id, 10)
    updateData()
}

const setExtraScrollOffsetY = (id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeExtraScrollOffsetY(shape as ArtboradView, id, 20)
    updateData()
}

//获取目标浮层
const getPosition = (id: string, targetID: string) => {
    if (!targetID) return;
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === targetID)
    if (!shape) return;
    const position = (shape as ArtboradView).overlayPositionType
    const event = (shape as ArtboradView).overlayBackgroundInteraction
    const Appearance = (shape as ArtboradView).overlayBackgroundAppearance
    overlayclose.value = event ? event === 'NONE' ? false : true : false
    return position ? position : 'CENTER'
}

//获取浮层背景颜色
const getBackgroundColor = (id: string, targetID: string) => {
    if (!targetID) return;
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === targetID)
    if (!shape) return;
    const color = (shape as ArtboradView).overlayBackgroundAppearance?.backgroundColor
    if (color) return color as Color
}

const getBackgroundType = (targetID: string) => {
    if (!targetID) return;
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === targetID)
    if (!shape) return;
    const type = (shape as ArtboradView).overlayBackgroundAppearance?.backgroundType

    addmask.value = type === OverlayBackgroundType.NONE ? false : true;
    return type === OverlayBackgroundType.NONE ? false : true
}

const _colorChangeFromPicker = d((c: Color) => {
    console.log(c);

    // const page = props.context.selection.selectedPage;
    // if (!page) return;
    // const editor = props.context.editor4Page(page);
    // editor.setBackground(c);
    background_color.value = c;
    console.log(background_color.value);
    clr_v.value = toHex(c.red, c.green, c.blue)
}, 100)
const colorChangeFromPicker = (c: Color) => {
    _colorChangeFromPicker(c).catch((e) => {
    });
};

//设置浮层后遮罩
const setOverlayBackgroundAppearance = (targetID: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === targetID)
    if (!shape) return
    if (addmask.value) {
        if (!(shape as ArtboradView).overlayBackgroundAppearance) {
            e.setOverlayBackgroundAppearance(shape as ArtboradView)
        } else {
            const value = new OverlayBackgroundAppearance(OverlayBackgroundType.SOLIDCOLOR, (shape as ArtboradView).overlayBackgroundAppearance!.backgroundColor)
            e.setOverlayBackgroundAppearance(shape as ArtboradView, value)
        }
    } else {
        const value = new OverlayBackgroundAppearance(OverlayBackgroundType.NONE, (shape as ArtboradView).overlayBackgroundAppearance!.backgroundColor)
        e.setOverlayBackgroundAppearance(shape as ArtboradView, value)
    }
    // updateData()
}


//设置浮层外点击事件
const setOverlayBackgroundInteraction = (targetID: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === targetID)
    if (!shape) return
    if (overlayclose.value) {
        e.setOverlayBackgroundInteraction(shape as ArtboradView, OverlayBackgroundInteraction.NONE)
    } else {
        e.setOverlayBackgroundInteraction(shape as ArtboradView, OverlayBackgroundInteraction.CLOSEONCLICKOUTSIDE)
    }
    updateData()
}

//设置浮层位置
const setOverlayPositionType = (targetID: string, value: OverlayPositions) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === targetID)
    if (!shape) return
    e.setOverlayPositionType(shape as ArtboradView, value)
    updateData()
}

const test = (id: string) => {
    const shapes = props.context.selection.selectedPage?.childs
    const types = [ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolRef];
    if (!shapes) return;
    DomList.value = []
    for (let index = 0; index < shapes.length; index++) {
        const shape = shapes[index];
        if (types.includes(shape.type)) {
            const actions = (shape as ArtboradView).prototypeInterAction
            if (actions?.length) {
                for (let index = 0; index < actions.length; index++) {
                    const e = actions[index];
                    if (e.id === id) break
                    DomList.value?.push(shape)
                }
            } else {
                DomList.value?.push(shape)
            }
        }
    }
    showtargerlist.value = !showtargerlist.value
}


//创建原型起始节点
const createOrigin = (data: PrototypeStartingPoint) => {
    if (prototypestart.value) return;
    showIpnut.value = true
    originName.value = '流程 ' + ++originNameNumber.value
    originDescribed.value = ''
    originedit.value = true;
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeStart(shape, data);
    updateData()
}


//删除原型起始节点
const deleteOrigin = () => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0]
    if (!shape) return;
    e.delPrototypeStart(shape as ShapeView);
    updateData()

}


//设置原型起始节点
const setPrototypeStartPoint = () => {
    console.log('change');
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeStart(shape as ShapeView, new PrototypeStartingPoint(originName.value, originDescribed.value));

    console.log('change-end');
}

//设置原型动作-其他
const setPrototypeActionEvent = (data: SelectItem, id: string) => {
    const value = data.value
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeActionEvent(shape as ShapeView, id, value as PrototypeEvents)
    updateData()
}

//设置原型动作-延时
const setPrototypeActionEventTime = (id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    if (aftertimeout.value) {
        const time = Number(aftertimeout.value[0].value.split('ms')[0])
        const T = time < 1 ? 1 : time > 20000 ? 20000 : time
        e.setPrototypeActionEventTime(shape as ShapeView, id, T / 1000)
    }
    updateData()
}


//设置连接类型和导航类型
const setPrototypeActionConnNav = (data: SelectItem, id: string) => {
    const conn = data.value
    const nav = data.type
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    if (nav) {
        e.setPrototypeActionConnNav(shape as ShapeView, id, conn as PrototypeConnectionType, nav as PrototypeNavigationType)
    } else {
        e.setPrototypeActionConnNav(shape as ShapeView, id, conn as PrototypeConnectionType, undefined)
    }
    updateData()
}

//设置链接

const setPrototypeActionURL = (id: string) => {
    if (!connectionURL.value) return
    const value = connectionURL.value[0].value
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    if (value) e.setPrototypeActionConnectionURL(shape as ShapeView, id, value)
    connectionURL.value[0].blur()
}

//设置目标
const selectTargetNode = (id: string, targetid: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeActionTargetNodeID(shape as ShapeView, id, targetid)
    showtargerlist.value = false
    updateData()
}

const getTargetNodeName = (target: string | undefined) => {
    if (!target) return;
    const shape = props.context.selection.selectedPage?.childs.filter(i => i.id === target)
    if (shape) return shape[0].name
}

//设置动画类型
const setPrototypeActionTransition = (data: SelectItem, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    console.log(data.value);
    let type = data.value
    if (type === 'MOVE' || type === 'SLIDE' || type === 'PUSH') {
        type = type + '_FROM_LEFT'
    }
    else if (type === 'MOVE_OUT' || type === 'SLIDE_OUT') {
        type = type + '_TO_LEFT'
    }

    e.setPrototypeActionTransitionType(shape as ShapeView, id, type as PrototypeTransitionType)
    updateData()
    delstyle()
    nextTick(() => {
        addstyle()
    })
}

//设置动画方向
const setPrototypeActionTransitionDirection = (type: PrototypeTransitionType, id: string, i: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    const arr = type.split('_')
    arr[arr.length - 1] = i.toUpperCase()
    const newtype = arr.join('_')
    console.log(newtype);
    e.setPrototypeActionTransitionType(shape as ShapeView, id, newtype as PrototypeTransitionType)
    updateData()
    delstyle()
    nextTick(() => {
        addstyle()
    })
}

//换算动画时长
const getDuration = (value: string, oldval?: number) => {
    const regex = /^(\d+)/
    const maxvalue = (v: number) => {
        return v <= 20000 ? v : 20000
    }
    if (Number(value)) {
        return maxvalue(Number(value))
    } else {
        if (value.match(regex) !== null) {
            const str = value.match(regex)
            return maxvalue(Number(str![1]))
        } else {
            return oldval ? oldval : 300
        }
    }
}

//设置动画时长
const setTransitionDuration = (id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    const oldval = (shape as ArtboradView).prototypeInterAction?.find(item => item.id === id)?.actions.transitionDuration;
    const value = getDuration(animationtimevalue.value![0].value, oldval);
    e.setPrototypeActionTransitionDuration(shape as ShapeView, id, value / 1000)
    animationtimevalue.value![0].value = value + 'ms';
    animationtimevalue.value![0].blur()
    updateData()
    delstyle()
    nextTick(() => {
        addstyle()
    })
}

//设置动画效果
const setProtoTypeEasingType = (data: SelectItem, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    const value = data.value as PrototypeEasingType;
    const esfn = easingFn.get(value) as BasicArray<number>;
    e.setPrototypeActionEasingType(shape as ShapeView, id, value, esfn)
    updateData()
    delstyle()
    nextTick(() => {
        addstyle()
    })
}


//更新原型数据
function updateData() {
    const selecteds = props.context.selection.selectedShapes;
    if (!isProtoType.value.size) return;
    if (isProtoType.value.size === 1) {
        const shape = selecteds[0]
        if (shape.type === ShapeType.Artboard || shape.type === ShapeType.Symbol || shape.type === ShapeType.SymbolRef) {
            prototypestart.value = (shape as ArtboradView).prototypeStartPoint;
            // prototypeinteraction.value = (shape as ArtboradView).prototypeInterAction;
            if (prototypestart.value) {
                originName.value = prototypestart.value.name
                originDescribed.value = prototypestart.value.desc
            }
            // if (prototypeinteraction.value) {
            //     for (let index = 0; index < prototypeinteraction.value.length; index++) {
            //         const element = prototypeinteraction.value[index];
            //         getTargetNodeName(element.actions[0].targetNodeID)
            //     }
            // }
        }

    }

    let items: any[] = []

    isProtoType.value.forEach((item) => {
        const interaction = (item as ArtboradView).prototypeInterAction
        if (interaction) items = items.concat(...interaction)
    })

    // for (let index = 0; index < isProtoType.value.size; index++) {
    //     const shape = isProtoType.value
    //     const i = (shape as ArtboradView).prototypeInterAction;
    //     if (i) items = items.concat(...i)
    // }
    prototypeinteraction.value = [...new Set(items)].reverse()
    showtargerlist.value = false
}


//创建原型动画
const createAction = () => {
    showaction.value = true
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    const Event = new PrototypeEvent(PrototypeEvents.ONCLICK)
    const Action = new PrototypeActions(new BasicArray<number>(), v4(), PrototypeConnectionType.NONE)
    Action.transitionType = PrototypeTransitionType.INSTANTTRANSITION
    let id = v4()
    e.insertPrototypeAction(shape as ShapeView, new PrototypeInterAction(new BasicArray<number>(), id, Event, Action));
    acitonindex.value = id
    updateData()
}

//删除原型动画
const deleteAction = (id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.deletePrototypeAction(shape as ShapeView, id)
    updateData()
}

const showhandel = (id: string) => {
    if (acitonindex.value !== id) {
        acitonindex.value = id
        if (!showaction.value) {
            showaction.value = true
        }
        return
    } else {
        showaction.value = !showaction.value
    }
}

const isProtoType = ref(new Set())

// 图层选区变化
function _selection_change() {
    baseAttr.value = true;
    editAttr.value = false;
    const selectedShapes = props.context.selection.selectedShapes;

    isProtoType.value.clear()
    // if (selectedShapes.length === 1) {
    //     const shape = selectedShapes[0];
    //     if (shape.type === ShapeType.Artboard || shape.type === ShapeType.Symbol || shape.type === ShapeType.SymbolRef) {
    //         isProtoType.value.push(shape)
    //     }
    //     //暂时获取组件状态
    //     const symref = props.context.selection.symbolrefview;
    //     variables.value = [];
    //     if (symref) {
    //         const result = get_var_for_ref(symref, t);
    //         if (result) {
    //             variables.value = result.variables;
    //         }
    //     }
    // }

    // shapes.value = [];

    for (let i = 0, l = selectedShapes.length; i < l; i++) {
        const shape = selectedShapes[i];
        if (shape.type === ShapeType.Artboard || shape.type === ShapeType.Symbol || shape.type === ShapeType.SymbolRef) {
            isProtoType.value.add(shape)
        }
        // shapes.value.push(shape);
    }
    reflush_by_selection.value++;
    reflush.value++;

    console.log(isProtoType.value);

    updateData()

}

const selection_change = debounce(_selection_change, 160, { leading: true });

function workspace_watcher(t: number) {
    if (t === WorkSpace.PATH_EDIT_MODE) {
        const _is_pdm = props.context.workspace.is_path_edit_mode;
        baseAttr.value = !_is_pdm;
        editAttr.value = _is_pdm;
    }
}

// const watchedShapes = new Map<string, ShapeView>(); // 图层监听
// function watch_shapes() {

//     watchedShapes.forEach((v, k) => {
//         v.unwatch(update_by_shapes);
//         watchedShapes.delete(k);
//     })

//     const selectedShapes = props.context.selection.selectedShapes;
//     const shapes = flattenShapes(selectedShapes);
//     shapes.forEach((v) => {
//         v.watch(update_by_shapes);
//         watchedShapes.set(v.id, v)
//     });
// }

// // 选区图层变化
// function update_by_shapes(...args: any[]) {
//     // isCheckPrototype()
//     reflush_trigger.value = [...(args?.length ? args : [])];
//     reflush_by_shapes.value++;
//     reflush.value++;
// }

function selection_watcher(t: number | string) {
    if (t !== Selection.CHANGE_SHAPE && t !== Selection.CHANGE_PAGE) {
        return;
    }
    selection_change();
    // watch_shapes();
}



onMounted(() => {
    props.context.workspace.watch(workspace_watcher);
    props.context.selection.watch(selection_watcher);
    // watch_shapes()
    // update_by_shapes()
    selection_change();
})

onUnmounted(() => {
    props.context.workspace.unwatch(workspace_watcher);
    props.context.selection.unwatch(selection_watcher);
    // watchedShapes.forEach(v => {
    //     v.unwatch(update_by_shapes);
    // });
})

</script>

<style lang="scss" scoped>
.ptactive {
    background-color: #1878F5 !important;
}

.active {
    color: #000 !important;
}

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

    .tips {
        display: flex;
        align-items: center;
        height: 32px;
        padding: 12px 8px;

        span {
            color: #c8c8c8;
            font-size: 12px;
        }

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
                border-radius: var(--default-radius);
                @include flex(center, center);

                &:hover {
                    background-color: #F5F5F5;
                }
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
                display: flex;
                align-items: center;
                justify-content: center;
                width: 172px;
                height: 32px;
                font-size: 12px;
                background-color: #F5F5F5;
                border-radius: 6px;
                text-align: center;
                line-height: 32px;

                .icon-img {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background-color: #1878F5;
                    margin-right: 8px;
                    overflow: hidden;
                    display: flex;

                    svg {
                        margin: auto;
                        width: 12px;
                        height: 12px;
                        color: white;
                    }
                }

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

                .targetname {
                    display: flex;
                    align-items: center;
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
                    padding: 6px 0;
                    border-radius: 4px;
                    background-color: white;
                    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
                    box-sizing: border-box;
                    z-index: 1;

                    .header-search {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        margin: 0 6px;
                        height: 32px;
                        padding: 10px 8px;
                        border-radius: 6px;
                        margin-bottom: 6px;
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
                            display: flex;
                            justify-content: flex-start;
                            align-items: center;
                            gap: 8px;
                            height: 32px;
                            padding: 0 6px;

                            svg {
                                flex: 0 0 12px;
                                height: 12px;
                            }

                            &:hover {
                                background-color: var(--active-color);
                                color: white;
                            }
                        }
                    }
                }

                .retract-y,
                .retract-x {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 9px 8px;
                    width: 65px;
                    height: 32px;
                    background-color: #F5F5F5;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    box-sizing: border-box;
                    overflow: hidden;


                    svg {
                        max-width: 14px;
                        height: 14px;
                    }

                    .indent {
                        padding: 0;
                        outline: none;
                        border: none;
                    }

                    &:has(.indent:focus) {
                        border: 1px solid #1878F5;
                    }
                }

                input {
                    outline: none;
                    border: none;
                    font-size: 12px;
                    padding: 10px 8px;
                    height: 32px;
                    width: 100%;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    background-color: #F5F5F5;
                    box-sizing: border-box;

                    &:focus {
                        border: 1px solid #1878F5;
                    }
                }
            }

            .set-animation {
                display: flex;
                flex-direction: column;

                span {
                    line-height: 32px;
                }

                .wrapper {
                    position: relative;
                    display: flex;
                    width: 172px;
                    height: 100px;
                    border-radius: 6px;
                    background-color: #F5F5F5;
                    box-sizing: border-box;
                    overflow: hidden;

                    .mask {
                        position: absolute;
                        z-index: 4;
                        width: 100%;
                        height: 100%;
                        opacity: 1%;
                    }

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
                            left: 0;
                            top: 0;
                            z-index: 1;
                            border-radius: 4px;
                            border: 1px solid #000;
                            background-color: #f5f5f5;
                            box-sizing: border-box;
                        }

                        .containerB {
                            position: absolute;
                            @include flex(center, center);
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            border-radius: 4px;
                            border: 1px solid #000;
                            background-color: silver;
                            box-sizing: border-box
                        }

                        .containerC {
                            position: absolute;
                            @include flex(center, center);
                            width: 100%;
                            height: 100%;
                            border: 1px solid #000;
                            border-radius: 4px;
                            box-sizing: border-box;
                            background-color: transparent;
                            z-index: 3;
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
