<template>
    <div class="container">
        <el-scrollbar height="100%">
            <div v-if="isProtoType.size">
                <Origin v-if="isProtoType.get('shape').isContainer" :context=props.context
                    :prototypestart=prototypestart @createorigin=createOrigin @setorigin=setPrototypeStartPoint
                    @deleteorigin=deleteOrigin></Origin>
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
                                    <span>{{ getText(action.actions) }}</span>
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
                                    <input v-select ref="aftertimeout"
                                        v-if="action.event.interactionType === PrototypeEvents.AFTERTIMEOUT" type="text"
                                        :value="(action.event.transitionTimeout ? action.event.transitionTimeout : 0.8) * 1000 + 'ms'"
                                        @change="setPrototypeActionEventTime(action.id)">
                                </div>
                                <div class="action">
                                    <span>动作</span>
                                    <Select class="select" id="select" :visibility="true" :status="hasStatus"
                                        :source="actions" :selected="actions.find(item => item.data.value === action.actions.connectionType &&
                item.data.type === action.actions.navigationType)?.data"
                                        @select="setPrototypeActionConnNav($event, action.id)"></Select>
                                </div>
                                <Status v-if="action.actions.navigationType === PrototypeNavigationType.SWAPSTATE"
                                    :context="props.context" :targetNodeId="action.actions.targetNodeID"
                                    @changestatus="changetarget($event, action.id)"></Status>
                                <Target
                                    v-if="action.actions.connectionType === PrototypeConnectionType.INTERNALNODE && action.actions.navigationType !== PrototypeNavigationType.SWAPSTATE"
                                    :context="props.context" :actionid="action.id" :type="action.actions.navigationType"
                                    :targetid="action.actions.targetNodeID"
                                    @settargetnode="selectTargetNode($event, action.id)"></Target>
                                <div v-if="action.actions.navigationType === PrototypeNavigationType.SCROLLTO"
                                    class="retract">
                                    <span>缩进</span>
                                    <div class="retract-y">
                                        <Tooltip content="Y轴缩进" :offset="15">
                                            <svg-icon icon-class="indent-y" @click.stop></svg-icon>
                                        </Tooltip>
                                        <input v-select ref="indenty" class="indent" type="text"
                                            :value="action.actions.extraScrollOffset?.y ?? 0"
                                            @change="setExtraScrollOffsetY(action.id, action.actions.extraScrollOffset?.y ?? 0)">
                                    </div>
                                    <div class="retract-x">
                                        <Tooltip content="X轴缩进" :offset="15">
                                            <svg-icon icon-class="indent-x" @click.stop></svg-icon>
                                        </Tooltip>
                                        <input v-select ref="indentx" class="indent" type="text"
                                            :value="action.actions.extraScrollOffset?.x ?? 0"
                                            @change="setExtraScrollOffsetX(action.id, action.actions.extraScrollOffset?.x ?? 0)">
                                    </div>
                                </div>
                                <div v-if="action.actions.connectionType === PrototypeConnectionType.URL" class="link">
                                    <span>链接</span>
                                    <input v-select ref="connectionURL" type="text" placeholder="输入链接地址"
                                        :value="action.actions.connectionURL"
                                        @change="setPrototypeActionURL(action.id)">
                                </div>
                                <Overlay
                                    v-if="action.actions.navigationType === PrototypeNavigationType.OVERLAY && action.actions.targetNodeID"
                                    :context="props.context" :targetNodeId="action.actions.targetNodeID"
                                    @appearance="setOverlayBackgroundAppearance($event, action.actions.targetNodeID)"
                                    @interaction="setOverlayBackgroundInteraction($event, action.actions.targetNodeID)"
                                    @position="setOverlayPositionType($event, action.actions.targetNodeID)"></Overlay>
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
                                        <Select class="select" id="select" :source="animation" :animation="true"
                                            :action=action.actions.navigationType
                                            :selected="animation.find(item => animations.get(action.actions.transitionType!) === item.data.content)?.data"
                                            @select="setPrototypeActionTransition($event, action.id)"></Select>
                                    </div>
                                    <div v-if="action.actions.transitionType?.split('_').findLast(d => Array.from(Direction.keys()).includes(d))"
                                        class="direction">
                                        <div class="content">
                                            <div class="icon"
                                                :class="{ 'select-item': action.actions.transitionType?.split('_').findLast(i => i) === i[0] }"
                                                v-for="  i  of  Direction " :key="i[0]"
                                                @click.stop="setPrototypeActionTransitionDirection(action.actions.transitionType, action.id, i[0])">
                                                <svg-icon :style="{ rotate: (`${i[1]}` + 'deg') }"
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
                <div v-if="isProtoType.get('shape').isContainer" class="overflow-roll">
                    <div class="text">溢出滚动</div>
                    <Select class="select" :source="overflowRoll"
                        :selected="overflowRoll.find(i => i.data.value === scroll)?.data"
                        @select=scrollDirection></Select>
                </div>
            </div>
            <div v-else class="tips">
                <span>交互</span>
            </div>

        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { WorkSpace } from "@/context/workspace";
import { ShapeType, ShapeView, SymbolRefView, BasicArray, PrototypeEvents, PrototypeEvent, PrototypeTransitionType, SymbolShape, SymbolUnionShape, VariableType, SymbolView } from "@kcdesign/data"
import { debounce, throttle } from 'lodash';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from '@/utils/common';
import { nextTick, onMounted, onUnmounted, ref, StyleValue, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Origin from "./Prototype/Origin.vue";
import Overlay, { Type as T } from "./Prototype/Overlay.vue";
import Status, { Data as D } from "./Prototype/Status.vue";
import Target from "./Prototype/Target.vue";
import {
    PrototypeStartingPoint,
    ArtboradView,
    PrototypeInterAction,
    PrototypeActions,
    PrototypeConnectionType,
    PrototypeNavigationType,
    PrototypeEasingType,
    OverlayPositions,
    OverlayBackgroundInteraction,
    OverlayBackgroundAppearance,
    OverlayBackgroundType,
    ScrollDirection
} from '@kcdesign/data';
import { v4 } from 'uuid';
import Tooltip from '@/components/common/Tooltip.vue';
import { get_var_for_ref, states_tag_values_sort } from '@/utils/symbol';
import { flattenShapes } from '@/utils/cutout';


enum Animation {
    INSTANT = 'INSTANT_TRANSITION',
    DISSOLVE = 'DISSOLVE',
    SLIDE = 'SLIDE',
    SLIDEOUT = 'SLIDE_OUT',
    MOVE = 'MOVE',
    MOVEOUT = 'MOVE_OUT',
    PUSH = 'PUSH',
    SCROLL = 'SCROLL_ANIMATE'
}

type Prototypestart = {
    name: string,
    desc: string
}

const props = defineProps<{ context: Context }>();
const reflush = ref<number>(0);
const showaction = ref<boolean>(false)
const acitonindex = ref<string>('')
const indentx = ref<HTMLInputElement[]>()
const indenty = ref<HTMLInputElement[]>()
const { t } = useI18n()
const reflush_trigger = ref<any[]>([]);
const reflush_by_shapes = ref<number>(0);
const constraintShow = ref<boolean>(true);
const animationtimevalue = ref<HTMLInputElement[]>()
const prototypestart = ref<Prototypestart | undefined>({ name: "", desc: "" })
const prototypeinteraction = ref<PrototypeInterAction[]>()
const aftertimeout = ref<HTMLInputElement[]>()
const connectionURL = ref<HTMLInputElement[]>()
const scroll = ref<string>('')
const hasStatus = ref<boolean>(false)
const showtargerlist = ref<boolean>(false)

const Direction = new Map([
    ['LEFT', 180],
    ['RIGHT', 0],
    ['TOP', 90],
    ['BOTTOM', -90]
])

const overflowRoll: SelectSource[] = genOptions([
    [ScrollDirection.NONE, '不滚动'],
    [ScrollDirection.HORIZONTAL, '水平'],
    [ScrollDirection.VERTICAL, '垂直'],
    [ScrollDirection.BOTH, '水平并垂直']
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
    [Animation.PUSH, '推入'],
    [Animation.SCROLL, '位移']
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
    [PrototypeTransitionType.SCROLLANIMATE, '位移']
])

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
    if (animations.get(type as PrototypeTransitionType) === '位移') {
        mbb.value = {
            transition: Bezier,
            opacity: 1,
            left: 0,
            top: 0,
        }
        qsb.value = {
            transition: '',
            zIndex: 2,
            border: "unset",
            left: W + 'px',
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

const search = (shape: ShapeView, id: string | undefined) => {
    if (shape.id === id) {
        return [shape];
    } else {
        if (shape.childs && shape.childs.length > 0) {
            return shape.childs.reduce((acc, child) => {
                const result = search(child, id) as ShapeView[];
                return result.length > 0 ? acc.concat(result) : acc;
            }, [] as ShapeView[]);
        }
    }
    return [];
};

const getText = (actions: PrototypeActions) => {
    if (actions.connectionType === PrototypeConnectionType.BACK) {
        return '返回上一页面'
    } else if (actions.connectionType === PrototypeConnectionType.CLOSE) {
        return '关闭浮层'
    } else if (actions.connectionType === PrototypeConnectionType.URL) {
        return actions.connectionURL
    } else if (actions.connectionType === PrototypeConnectionType.INTERNALNODE && actions.navigationType === PrototypeNavigationType.SCROLLTO) {
        const shapes = props.context.selection.selectedShapes
        const name = shapes[0].childs.find(i => i.id === actions.targetNodeID)?.name
        return name
    } else if (actions.connectionType === PrototypeConnectionType.INTERNALNODE && actions.navigationType === PrototypeNavigationType.SWAPSTATE) {
        const page = props.context.selection.selectedPage
        if (!page) return
        const a = search(page, actions.targetNodeID)
        const result = states_tag_values_sort(a as SymbolView[], t)
        const arr = result.reduce((acc, i) => {
            return acc.concat(i.current_state)
        }, [] as string[])
        return arr.toString()
    } else if (actions.connectionType === PrototypeConnectionType.NONE) {
        return ''
    } else {
        const page = props.context.selection.selectedPage
        if (!page) return
        const name = page.childs.find(i => i.id === actions.targetNodeID)?.name
        return name
    }
}


const setExtraScrollOffsetX = (id: string, old: number) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    const val = indentx.value![0].value
    if (!shape) return;
    if (isNaN(Number(val))) {
        indentx.value![0].value = old.toString()
    } else {
        e.setPrototypeExtraScrollOffsetX(shape as ArtboradView, id, Number(val))
        updateData()
    }
    indentx.value![0].blur()
}

const setExtraScrollOffsetY = (id: string, old: number) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    const val = indenty.value![0].value
    if (!shape) return;
    if (isNaN(Number(val))) {
        indenty.value![0].value = old.toString()
    } else {
        e.setPrototypeExtraScrollOffsetY(shape as ArtboradView, id, Number(val))
        updateData()
    }
    indenty.value![0].blur()

}


//设置浮层后遮罩
const setOverlayBackgroundAppearance = (data: T, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === id)
    if (!shape) return
    if (data.state) {
        if (!(shape as ArtboradView).overlayBackgroundAppearance) {
            e.setOverlayBackgroundAppearance(shape as ArtboradView)
        } else {
            if (data.color) {
                const value = new OverlayBackgroundAppearance(OverlayBackgroundType.SOLIDCOLOR, data.color)
                e.setOverlayBackgroundAppearance(shape as ArtboradView, value)
            } else {
                const value = new OverlayBackgroundAppearance(OverlayBackgroundType.SOLIDCOLOR, (shape as ArtboradView).overlayBackgroundAppearance!.backgroundColor)
                e.setOverlayBackgroundAppearance(shape as ArtboradView, value)
            }
        }
    } else {
        const value = new OverlayBackgroundAppearance(OverlayBackgroundType.NONE, (shape as ArtboradView).overlayBackgroundAppearance!.backgroundColor)
        e.setOverlayBackgroundAppearance(shape as ArtboradView, value)
    }
    // updateData()
}


//设置浮层外点击事件
const setOverlayBackgroundInteraction = (state: boolean, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === id)
    if (!shape) return
    if (!state) {
        e.setOverlayBackgroundInteraction(shape as ArtboradView, OverlayBackgroundInteraction.NONE)
    } else {
        e.setOverlayBackgroundInteraction(shape as ArtboradView, OverlayBackgroundInteraction.CLOSEONCLICKOUTSIDE)
    }
    updateData()


}

//设置浮层位置
const setOverlayPositionType = (data: OverlayPositions, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === id)
    if (!shape) return
    e.setOverlayPositionType(shape as ArtboradView, data)
    updateData()
}


//创建原型起始节点
const createOrigin = (data: PrototypeStartingPoint) => {
    if (prototypestart.value) return;
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
const setPrototypeStartPoint = (data: PrototypeStartingPoint) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeStart(shape as ShapeView, data);
    updateData()
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
        aftertimeout.value[0].blur()
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
    updateData()
}

//设置目标
const selectTargetNode = (targetid: string, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeActionTargetNodeID(shape as ShapeView, id, targetid)
    showtargerlist.value = false
    updateData()
}


//设置动画类型
const setPrototypeActionTransition = (data: SelectItem, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
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

const scrollDirection = (data: SelectItem) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setscrollDirection(shape as ShapeView, data.value as ScrollDirection);
    updateData()
}


//创建原型动画
const createAction = () => {
    showaction.value = true
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    const Event = new PrototypeEvent(PrototypeEvents.ONCLICK)
    const Action = new PrototypeActions(v4(), PrototypeConnectionType.NONE)
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

const changetarget = (data: D, actionid: string) => {
    const shapes = props.context.selection.selectedShapes
    if (!shapes) return
    const shape = shapes[0]
    const sym = ref<SymbolUnionShape>();
    const sym1 = ref<SymbolShape>();
    if (shape instanceof SymbolRefView) {
        sym.value = shape.symData?.parent as SymbolUnionShape;
        sym1.value = shape.symData!
    }
    if (shape.data instanceof SymbolShape) {
        sym.value = shape.data.parent as SymbolUnionShape
        sym1.value = shape.data
    }
    if (!sym) return

    const symbols: SymbolShape[] = sym.value!.childs as any as SymbolShape[];
    const state = data.data.content === t('compos.dlt') ? SymbolShape.Default_State : data.data.content
    const curState = new Map<string, string>();
    sym.value!.variables?.forEach(v => {
        if (v.type === VariableType.Status) {
            const cur = v.id === data.id ? state : sym1.value?.symtags?.get(v.id);
            curState.set(v.id, cur ?? v.value);
        }

    })

    // 找到对应的shape
    const candidateshape: SymbolShape[] = []
    const matchshapes: SymbolShape[] = [];
    symbols.forEach((s) => {
        const symtags = s.symtags;
        let match = true;
        curState.forEach((v, k) => {
            const tag = symtags?.get(k) ?? SymbolShape.Default_State;
            if (match) match = v === tag;
            if (k === data.id && v === tag) candidateshape.push(s);
        });
        if (match) {
            matchshapes.push(s);
        }
    })
    const matchsym = matchshapes[0] ?? candidateshape[0];

    const page = props.context.selection.selectedPage
    if (!page) return
    const e = props.context.editor4Page(page);
    e.setPrototypeActionTargetNodeID(shape as ShapeView, actionid, matchsym.id)
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

const isProtoType = ref(new Map())
//更新原型数据
function updateData() {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length !== 1) return
    const shape = shapes[0]
    const types = [ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolRef]
    let isContainer = false
    if (types.includes(shape.type)) {
        isContainer = true
        isProtoType.value.set('shape', { shape, isContainer })
    } else if ((shape.parent?.isContainer && shape.parent.type !== ShapeType.Page) || (shape.prototypeInterAction !== undefined && shape.prototypeInterAction.length !== 0)) {
        isProtoType.value.set('shape', { shape, isContainer })
    } else {
        isProtoType.value.clear()
    }

    if (isProtoType.value.size) {
        isProtoType.value.forEach((v, k) => {
            if (k) prototypestart.value = v.shape.prototypeStartPoint;
            prototypeinteraction.value = v.shape.prototypeInterAction;
            scroll.value = v.shape.scrollDirection ? v.shape.scrollDirection : 'NONE';
        })
    }

    showtargerlist.value = false
}



// 图层选区变化
function _selection_change() {
    updateData()
}

const selection_change = debounce(_selection_change, 160, { leading: true });


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


function selection_watcher(t: number | string) {
    if (t !== Selection.CHANGE_SHAPE && t !== Selection.CHANGE_PAGE) {
        return;
    }
    selection_change();
    watch_shapes();
}

// 选区图层变化
function update_by_shapes(...args: any[]) {
    updateData()
    reflush_trigger.value = [...(args?.length ? args : [])];
    reflush_by_shapes.value++;
    reflush.value++;
}

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    selection_change();
    watch_shapes();
})

onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    watchedShapes.forEach(v => {
        v.unwatch(update_by_shapes);
    });
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
            line-height: 30px;
            color: #c8c8c8;
            font-size: 12px;
        }

    }

    .origin,
    .interaction {
        display: flex;
        flex-direction: column;
        padding: 12px 8px;
        border-bottom: 1px solid #F0F0F0;
        box-sizing: border-box;
        gap: 8px;

        .title {
            @extend .flex;
            align-items: center;
            height: 30px;

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
                justify-content: flex-start;
                gap: 4px;
                width: 172px;
                height: 32px;
                font-size: 12px;
                background-color: #F5F5F5;
                border-radius: 6px;
                text-align: center;
                line-height: 32px;
                padding-left: 9px;
                box-sizing: border-box;

                .icon-img {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background-color: #1878F5;
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
                    z-index: 999;

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

                        .no-data {
                            height: var(--default-input-height);
                            color: var(--theme-color);
                            line-height: var(--default-input-height);
                            padding-left: 8px;
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
                        outline: none;
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
