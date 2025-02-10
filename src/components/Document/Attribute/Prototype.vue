<template>
    <div class="container">
        <el-scrollbar height="100%">
            <div v-if="isProtoType.size">
                <Origin
                    v-if="isProtoType.get('shape').isContainer && isProtoType.get('shape').shape.parent.type === ShapeType.Page"
                    :context=props.context :prototypestart=prototypestart @createorigin=createOrigin
                    @setorigin=setPrototypeStartPoint @deleteorigin=deleteOrigin></Origin>
                <div class="interaction">
                    <div class="title" @click.stop="createAction">
                        <div class="text" :class="{ active: prototypeinteraction?.length }">
                            {{ t('prototype.interaction') }}</div>
                        <div class="add">
                            <SvgIcon :icon="add_icon" />
                        </div>
                    </div>
                    <div class="actions" v-if="prototypeinteraction?.length">
                        <div class="actions-item" v-for="action in prototypeinteraction " :key="action.id">
                            <div class="item" @click.stop="showhandel(action.id)">
                                <div class="arrow" :class="{ activation: showaction && acitonindex === action.id }">
                                    <SvgIcon :icon="arrows_dr_icon" />
                                </div>
                                <div class="item-content">
                                    <span class="event">{{ event.get(action.event.interactionType) }}</span>
                                    <div v-if="action.actions.connectionType !== 'NONE'" class="icon-img">
                                        <SvgIcon :icon="actions.find(item => item.data.value === action.actions.connectionType &&
                                            item.data.type === action.actions.navigationType)?.data.icon!" />
                                    </div>
                                    <span class="name">{{ getText(action.actions) }}</span>
                                    <div v-if="checkConflict(action.event.interactionType, action.id)" class="conflict">
                                        <Tooltip :content="t('prototype.warning')">
                                            <SvgIcon :icon="warning_icon" />
                                        </Tooltip>
                                    </div>

                                </div>
                                <div class="delete" @click.stop="deleteAction(action.id)">
                                    <SvgIcon :icon="delete_icon" />
                                </div>
                            </div>
                            <div class="item-setting" v-if="showaction && acitonindex === action.id">
                                <div class="trigger">
                                    <span>{{ t('prototype.interaction_trigger') }}</span>
                                    <div class="container">
                                        <Select class="select" id="select" :visibility="true" :iscontainer="isContainer"
                                            :minwidth="100" :source="trigger"
                                            :selected="trigger.find(item => item.data.value === action.event.interactionType)?.data"
                                            @select="setPrototypeActionEvent($event, action.id)"></Select>
                                        <input class="time" v-select ref="aftertimeout"
                                            v-if="action.event.interactionType === PrototypeEvents.AFTERTIMEOUT"
                                            type="text"
                                            :value="(action.event.transitionTimeout ? action.event.transitionTimeout : 0.8) * 1000 + 'ms'"
                                            @change="setPrototypeActionEventTime(action.id)">
                                    </div>
                                </div>
                                <div class="action">
                                    <span>{{ t('prototype.interaction_action') }}</span>
                                    <div class="container">
                                        <Select class="select" id="select" :visibility="true" :status="hasStatus"
                                            :source="actions" :selected="actions.find(item => item.data.value === action.actions.connectionType &&
                                                item.data.type === action.actions.navigationType)?.data"
                                            @select="setPrototypeActionConnNav($event, action.id)"></Select>
                                    </div>
                                </div>
                                <Status v-if="action.actions.navigationType === PrototypeNavigationType.SWAPSTATE"
                                    :context="props.context" :targetNodeId="action.actions.targetNodeID"
                                    @changestatus="changetarget($event, action.id)"></Status>
                                <Target
                                    v-if="action.actions.connectionType === PrototypeConnectionType.INTERNALNODE && action.actions.navigationType !== PrototypeNavigationType.SWAPSTATE"
                                    :context="props.context" :actionid="action.id" :type="action.actions.navigationType"
                                    :targetid="action.actions.targetNodeID"
                                    @settargetnode="selectTargetNode($event, action.id)"></Target>
                                <div class="retract"
                                    v-if="action.actions.navigationType === PrototypeNavigationType.SCROLLTO">
                                    <span>{{ t('prototype.interaction_offset') }}</span>
                                    <div class="container">
                                        <div class="retract-x">
                                            <Tooltip :content="t('prototype.offsetx')" :offset="15">
                                                <SvgIcon :icon="indent_x_icon" @click.stop />
                                            </Tooltip>
                                            <input v-select ref="indentx" class="indent" type="text"
                                                :value="action.actions.extraScrollOffset?.x ?? 0"
                                                @change="setExtraScrollOffsetX(action.id, action.actions.extraScrollOffset?.x ?? 0)">
                                        </div>
                                        <div class="retract-y">
                                            <Tooltip :content="t('prototype.offsety')" :offset="15">
                                                <SvgIcon :icon="indent_y_icon" @click.stop />
                                            </Tooltip>
                                            <input v-select ref="indenty" class="indent" type="text"
                                                :value="action.actions.extraScrollOffset?.y ?? 0"
                                                @change="setExtraScrollOffsetY(action.id, action.actions.extraScrollOffset?.y ?? 0)">
                                        </div>
                                    </div>
                                </div>
                                <div class="link" v-if="action.actions.connectionType === PrototypeConnectionType.URL">
                                    <span>{{ t('prototype.interaction_link') }}</span>
                                    <div class="container">
                                        <input class="url" v-select ref="connectionURL" type="text"
                                            :placeholder="t('prototype.link_tips')"
                                            :value="action.actions.connectionURL"
                                            @change="setPrototypeActionURL(action.id)">
                                    </div>
                                </div>
                                <div class="link_select"
                                    v-if="action.actions.connectionType === PrototypeConnectionType.URL">
                                    <div :class="action.actions.openUrlInNewTab ? 'visibility_select' : 'hidden_select'"
                                        @click="changeLinkSelect(action.id, !action.actions.openUrlInNewTab)">
                                        <SvgIcon v-if="action.actions.openUrlInNewTab" :icon="select_icon" />
                                    </div>
                                    <span>{{ t('prototype.open_in_new_tab') }}</span>
                                </div>
                                <Overlay
                                    v-if="action.actions.navigationType === PrototypeNavigationType.OVERLAY && action.actions.targetNodeID"
                                    :context="props.context" :targetNodeId="action.actions.targetNodeID"
                                    @appearance="setOverlayBackgroundAppearance($event, action.actions.targetNodeID)"
                                    @interaction="setOverlayBackgroundInteraction($event, action.actions.targetNodeID)"
                                    @position="setOverlayPositionType($event, action.actions.targetNodeID)"
                                    @margin="setOverlayPositionMargin($event, action.actions.targetNodeID)"></Overlay>
                                <div class="set-animation"
                                    v-if="action.actions.connectionType === PrototypeConnectionType.INTERNALNODE">
                                    <span>{{ t('prototype.animation_set') }}</span>
                                    <div class="wrapper">
                                        <div class="mask" @mouseenter.stop="addstyle" @mouseleave.stop="delstyle">
                                        </div>
                                        <div class="container"
                                            v-if="action.actions.transitionType !== PrototypeTransitionType.SMARTANIMATE"
                                            :value="test2(action.actions.transitionType!, action.actions.easingType!, action.actions.transitionDuration!, action.actions.easingFunction)">
                                            <div ref="ela" class="containerA" :style="tara ?? qsa">
                                                A</div>
                                            <div ref="elb" class="containerB" :style="tarb ?? qsb">
                                                B</div>
                                            <div class="containerC"></div>
                                        </div>
                                        <div class="container" v-else
                                            :value="test2(action.actions.transitionType!, action.actions.easingType!, action.actions.transitionDuration!, action.actions.easingFunction)">
                                            <div ref="ela" class="containerSmartA" :style="tara ?? qsa"></div>
                                            <div ref="elb" class="containerSmartB" :style="tarb ?? qsb">
                                                <div></div>
                                                <div style="top: 18px;"></div>
                                            </div>
                                            <div class="containerC"></div>
                                        </div>
                                    </div>
                                    <div class="animation">
                                        <span>{{ t('prototype.interaction_animation') }}</span>
                                        <div class="container">
                                            <Select class="select" id="select" :source="animation" :animation="true"
                                                :action=action.actions.navigationType
                                                :selected="animation.find(item => animations.get(action.actions.transitionType!) === item.data.content)?.data"
                                                @select="setPrototypeActionTransition($event, action.id)"></Select>
                                        </div>
                                    </div>
                                    <div class="direction"
                                        v-if="action.actions.transitionType?.split('_').findLast(d => Array.from(Direction.keys()).includes(d))">
                                        <span></span>
                                        <div class="container">
                                            <div class="content">
                                                <div class="icon"
                                                    :class="{ 'select-item': action.actions.transitionType?.split('_').findLast(i => i) === i[0] }"
                                                    v-for="  i of Direction " :key="i[0]"
                                                    @click.stop="setPrototypeActionTransitionDirection(action.actions.transitionType, action.id, i[0])">
                                                    <SvgIcon :style="{ rotate: (`${i[1]}` + 'deg') }"
                                                        :icon="right_arrows_icon" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="effect"
                                        v-if="action.actions.transitionType !== PrototypeTransitionType.INSTANTTRANSITION">
                                        <span>{{ t('prototype.interaction_curve') }}</span>
                                        <div class="container">
                                            <Select class="select" id="select" :minwidth="100" :visibility="true"
                                                :source="effect"
                                                :selected="effect.find(item => item.data.value === action.actions.easingType)?.data || effect.find(item => item.id === 0)?.data"
                                                @select="setProtoTypeEasingType($event, action.id)"></Select>
                                            <input v-select ref="animationtimevalue" type="text" placeholder="时间"
                                                @change="setTransitionDuration(action.id)"
                                                :value="action.actions.transitionDuration ? action.actions.transitionDuration * 1000 + 'ms' : '300ms'">
                                        </div>
                                    </div>
                                    <CustomBezier
                                        v-if="action.actions.easingType === PrototypeEasingType.CUSTOMCUBIC && action.actions.transitionType !== PrototypeTransitionType.INSTANTTRANSITION"
                                        :bezier="action.actions.easingFunction" :byshapes="reflush_by_shapes"
                                        :trigger="reflush_trigger"
                                        @setBezier="setProtoTypeEasingFunction($event, action.id)"></CustomBezier>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="default">{{ t('prototype.interaction_tips') }}</div>
                </div>
                <div v-if="isProtoType.get('shape').isContainer" class="overflow-roll" style="padding-bottom: 0">
                    <div class="text">{{ t('prototype.overflow') }}</div>
                    <Select class="select" :source="overflowRoll"
                        :selected="overflowRoll.find(i => i.data.value === scroll)?.data"
                        @select=scrollDirection></Select>
                </div>
                <div v-if="is_scroll_behavior" class="overflow-roll">
                    <div class="text">{{ t('prototype.scroll_behavior') }}</div>
                    <Select class="select" :source="fixedBehavior" :selected="scroll_behavior_value"
                        @select=scrollBehavior></Select>
                </div>
            </div>
            <div v-else class="tips">
                <span>{{ t('prototype.interaction') }}</span>
            </div>

        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">


import SvgIcon from '@/components/common/SvgIcon.vue';
import add_icon from '@/assets/icons/svg/add.svg';
import arrows_dr_icon from '@/assets/icons/svg/arrows-dr.svg';
import warning_icon from '@/assets/icons/svg/warning.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import indent_x_icon from '@/assets/icons/svg/indent-x.svg';
import indent_y_icon from '@/assets/icons/svg/indent-y.svg';
import select_icon from '@/assets/icons/svg/select.svg';
import right_arrows_icon from '@/assets/icons/svg/right-arrows.svg';

import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { WorkSpace } from "@/context/workspace";
import { ShapeType, ShapeView, SymbolRefView, BasicArray, PrototypeEvents, PrototypeEvent, PrototypeTransitionType, SymbolShape, SymbolUnionShape, VariableType, SymbolView, PageView } from "@kcdesign/data"
import { debounce, throttle } from 'lodash';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from '@/utils/common';
import { computed, nextTick, onMounted, onUnmounted, ref, StyleValue, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Origin from "./Prototype/Origin.vue";
import Overlay, { Type as T, Margin as M } from "./Prototype/Overlay.vue";
import Status, { Data as D } from "./Prototype/Status.vue";
import Target from "./Prototype/Target.vue";
import CustomBezier from "./Prototype/CustomBezier.vue"
import {
    PrototypeStartingPoint,
    ArtboardView,
    PrototypeInterAction,
    PrototypeActions,
    PrototypeConnectionType,
    PrototypeNavigationType,
    PrototypeEasingType,
    OverlayPositionType,
    OverlayBackgroundInteraction,
    OverlayBackgroundAppearance,
    OverlayBackgroundType,
    ScrollDirection,
    ScrollBehavior,
    PrototypeEasingBezier
} from '@kcdesign/data';
import { v4 } from 'uuid';
import Tooltip from '@/components/common/Tooltip.vue';
import { get_var_for_ref, states_tag_values_sort } from '@/utils/symbol';
import { flattenShapes } from '@/utils/cutout';
import { hover } from '@/utils/listview';
// import { PrototypeEasingBezier } from '@kcdesign/data/dist/types/data';

enum Animation {
    INSTANT = 'INSTANT_TRANSITION',
    DISSOLVE = 'DISSOLVE',
    SLIDE = 'SLIDE',
    SLIDEOUT = 'SLIDE_OUT',
    MOVE = 'MOVE',
    MOVEOUT = 'MOVE_OUT',
    PUSH = 'PUSH',
    SCROLL = 'SCROLL_ANIMATE',
    SMART = 'SMART_ANIMATE'
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
const isContainer = ref<boolean>(false)
const Direction = new Map([
    ['LEFT', 180],
    ['RIGHT', 0],
    ['TOP', 90],
    ['BOTTOM', -90]
])

const overflowRoll: SelectSource[] = genOptions([
    [ScrollDirection.NONE, t('prototype.flow_no')],
    [ScrollDirection.HORIZONTAL, t('prototype.flow_h')],
    [ScrollDirection.VERTICAL, t('prototype.flow_v')],
    [ScrollDirection.BOTH, t('prototype.flow_b')]
])
const fixedBehavior: SelectSource[] = genOptions([
    [ScrollBehavior.SCROLLS, t('prototype.scroll_with_parent')],
    [ScrollBehavior.FIXEDWHENCHILDOFSCROLLINGFRAME, t('prototype.fixed')],
    [ScrollBehavior.STICKYSCROLLS, t('prototype.sticky_fixed')],
])

const trigger: SelectSource[] = genOptions([
    [PrototypeEvents.ONCLICK, t('prototype.trigger_click')],
    [PrototypeEvents.DBCLICK, t('prototype.trigger_dbclick')],
    [PrototypeEvents.RIGHTCLICK, t('prototype.trigger_right')],
    [PrototypeEvents.DRAG, t('prototype.trigger_drag')],
    [PrototypeEvents.HOVER, t('prototype.trigger_hover')],
    [PrototypeEvents.MOUSEENTER, t('prototype.trigger_mouseenter')],
    [PrototypeEvents.MOUSELEAVE, t('prototype.trigger_mouseleave')],
    [PrototypeEvents.MOUSEDOWN, t('prototype.trigger_mousedown')],
    [PrototypeEvents.MOUSEUP, t('prototype.trigger_mouseup')],
    [PrototypeEvents.AFTERTIMEOUT, t('prototype.trigger_delay')],
])

const event = new Map([
    [PrototypeEvents.ONCLICK, t('prototype.trigger_click')],
    [PrototypeEvents.DBCLICK, t('prototype.trigger_dbclick')],
    [PrototypeEvents.RIGHTCLICK, t('prototype.trigger_right')],
    [PrototypeEvents.DRAG, t('prototype.trigger_drag')],
    [PrototypeEvents.HOVER, t('prototype.trigger_hover')],
    [PrototypeEvents.MOUSEENTER, t('prototype.trigger_mouseenter')],
    [PrototypeEvents.MOUSELEAVE, t('prototype.trigger_mouseleave')],
    [PrototypeEvents.MOUSEDOWN, t('prototype.trigger_mousedown')],
    [PrototypeEvents.MOUSEUP, t('prototype.trigger_mouseup')],
    [PrototypeEvents.AFTERTIMEOUT, t('prototype.trigger_delay')],
])

import jump_page_icon from "@/assets/icons/svg/jump-page.svg";
import retrun_page_icon from "@/assets/icons/svg/retrun-page.svg";
import scroll_page_icon from "@/assets/icons/svg/scroll-page.svg";
import open_link_icon from "@/assets/icons/svg/open-link.svg";
import component_state_icon from "@/assets/icons/svg/component-state.svg";
import open_float_layer_icon from "@/assets/icons/svg/open-float-layer.svg";
import close_float_layer_icon from "@/assets/icons/svg/close-float-layer.svg";
import change_float_layer_icon from "@/assets/icons/svg/change-float-layer.svg";

const actions: SelectSource[] = genOptions([
    [PrototypeConnectionType.NONE, t('prototype.action_none')],
    [PrototypeConnectionType.INTERNALNODE, t('prototype.action_nav'), jump_page_icon, PrototypeNavigationType.NAVIGATE],
    [PrototypeConnectionType.BACK, t('prototype.action_back'), retrun_page_icon],
    [PrototypeConnectionType.INTERNALNODE, t('prototype.action_scroll'), scroll_page_icon, PrototypeNavigationType.SCROLLTO],
    [PrototypeConnectionType.URL, t('prototype.action_link'), open_link_icon],
    [PrototypeConnectionType.INTERNALNODE, t('prototype.action_change'), component_state_icon, PrototypeNavigationType.SWAPSTATE],
    [PrototypeConnectionType.INTERNALNODE, t('prototype.action_open'), open_float_layer_icon, PrototypeNavigationType.OVERLAY],
    [PrototypeConnectionType.CLOSE, t('prototype.action_close'), close_float_layer_icon],
    [PrototypeConnectionType.INTERNALNODE, t('prototype.action_swap'), change_float_layer_icon, PrototypeNavigationType.SWAP],
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
    [Animation.INSTANT, t('prototype.animation_instant')],
    [Animation.DISSOLVE, t('prototype.animation_dissolve')],
    [Animation.SLIDE, t('prototype.animation_slidein')],
    [Animation.SLIDEOUT, t('prototype.animation_slideout')],
    [Animation.MOVE, t('prototype.animation_movein')],
    [Animation.MOVEOUT, t('prototype.animation_moveout')],
    [Animation.PUSH, t('prototype.animation_push')],
    [Animation.SCROLL, t('prototype.animation_animate')],
    [Animation.SMART, t('prototype.animation_smart')],
])

const effect: SelectSource[] = genOptions([
    [PrototypeEasingType.LINEAR, t('prototype.curve_linear')],
    [PrototypeEasingType.INCUBIC, t('prototype.curve_easein')],
    [PrototypeEasingType.OUTCUBIC, t('prototype.curve_easeout')],
    [PrototypeEasingType.INOUTCUBIC, t('prototype.curve_easeinout')],
    [PrototypeEasingType.INBACKCUBIC, t('prototype.curve_easeinback')],
    [PrototypeEasingType.OUTBACKCUBIC, t('prototype.curve_easeoutback')],
    [PrototypeEasingType.INOUTBACKCUBIC, t('prototype.curve_easeinoutback')],
    [PrototypeEasingType.CUSTOMCUBIC, '自定义']
])

const easingFn = new Map([
    [PrototypeEasingType.LINEAR, [0, 0, 1, 1]],
    [PrototypeEasingType.INCUBIC, [0.42, 0, 1, 1]],
    [PrototypeEasingType.OUTCUBIC, [0, 0, 0.58, 1]],
    [PrototypeEasingType.INOUTCUBIC, [0.42, 0, 0.58, 1]],
    [PrototypeEasingType.INBACKCUBIC, [0.3, -0.05, 0.7, -0.5]],
    [PrototypeEasingType.OUTBACKCUBIC, [0.45, 1.45, 0.8, 1]],
    [PrototypeEasingType.INOUTBACKCUBIC, [0.7, -0.4, 0.4, 1.4]],
    [PrototypeEasingType.CUSTOMCUBIC, [0, 0, 1, 1]]
]);

const animations = new Map([
    [PrototypeTransitionType.INSTANTTRANSITION, t('prototype.animation_instant')],
    [PrototypeTransitionType.DISSOLVE, t('prototype.animation_dissolve')],
    [PrototypeTransitionType.MOVEFROMLEFT, t('prototype.animation_movein')],
    [PrototypeTransitionType.MOVEFROMRIGHT, t('prototype.animation_movein')],
    [PrototypeTransitionType.MOVEFROMTOP, t('prototype.animation_movein')],
    [PrototypeTransitionType.MOVEFROMBOTTOM, t('prototype.animation_movein')],
    [PrototypeTransitionType.MOVEOUTTOLEFT, t('prototype.animation_moveout')],
    [PrototypeTransitionType.MOVEOUTTORIGHT, t('prototype.animation_moveout')],
    [PrototypeTransitionType.MOVEOUTTOTOP, t('prototype.animation_moveout')],
    [PrototypeTransitionType.MOVEOUTTOBOTTOM, t('prototype.animation_moveout')],
    [PrototypeTransitionType.SLIDEFROMLEFT, t('prototype.animation_slidein')],
    [PrototypeTransitionType.SLIDEFROMRIGHT, t('prototype.animation_slidein')],
    [PrototypeTransitionType.SLIDEFROMTOP, t('prototype.animation_slidein')],
    [PrototypeTransitionType.SLIDEFROMBOTTOM, t('prototype.animation_slidein')],
    [PrototypeTransitionType.SLIDEOUTTOLEFT, t('prototype.animation_slideout')],
    [PrototypeTransitionType.SLIDEOUTTORIGHT, t('prototype.animation_slideout')],
    [PrototypeTransitionType.SLIDEOUTTOTOP, t('prototype.animation_slideout')],
    [PrototypeTransitionType.SLIDEOUTTOBOTTOM, t('prototype.animation_slideout')],
    [PrototypeTransitionType.PUSHFROMLEFT, t('prototype.animation_push')],
    [PrototypeTransitionType.PUSHFROMRIGHT, t('prototype.animation_push')],
    [PrototypeTransitionType.PUSHFROMTOP, t('prototype.animation_push')],
    [PrototypeTransitionType.PUSHFROMBOTTOM, t('prototype.animation_push')],
    [PrototypeTransitionType.SCROLLANIMATE, t('prototype.animation_animate')],
    [PrototypeTransitionType.SMARTANIMATE, t('prototype.animation_smart')]
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


const _addstyle = () => {
    if (timer3) clearTimeout(timer3)
    timer3 = setTimeout(() => {
        (ela.value![0] as HTMLDivElement).addEventListener("transitionend", change);
        (elb.value![0] as HTMLDivElement).addEventListener("transitionend", change)
        tarb.value = { ...qsb.value as object, ...mbb.value as object };
        tara.value = { ...qsa.value as object, ...mba.value as object };
        clearTimeout(timer3);
        timer3 = null
    }, 200);

}

const addstyle = debounce(_addstyle, 200)

const change = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
        (ela.value![0] as HTMLDivElement).removeEventListener("transitionend", change);
        (elb.value![0] as HTMLDivElement).removeEventListener("transitionend", change)
        delstyle()
        clearTimeout(timer);
    }, 1000);
}

const _delstyle = () => {
    if (timer3) return
    (ela.value![0] as HTMLDivElement).removeEventListener("transitionend", change);
    (elb.value![0] as HTMLDivElement).removeEventListener("transitionend", change)
    tarb.value = null
    tara.value = null
}

const delstyle = debounce(_delstyle, 200)

const test2 = (type: string, easingType: PrototypeEasingType, time: number, esfn: PrototypeEasingBezier | undefined) => {
    qsa.value = null
    qsb.value = null
    mba.value = null
    mbb.value = null
    const bezier = [esfn?.x1, esfn?.y1, esfn?.x2, esfn?.y2]
    const FN = easingType !== PrototypeEasingType.CUSTOMCUBIC ? easingFn.get(easingType ?? "LINEAR")! : bezier
    const T = time ?? 0.3
    const Bezier = `all ${T}s cubic-bezier(${FN.join()}) 0s`
    const W = 54
    const H = 64
    if (animations.get(type as PrototypeTransitionType) === t('prototype.animation_instant')) {
        return
    }
    if (animations.get(type as PrototypeTransitionType) === t('prototype.animation_dissolve')) {
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
    if (animations.get(type as PrototypeTransitionType) === t('prototype.animation_animate')) {
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
    if (animations.get(type as PrototypeTransitionType) === t('prototype.animation_movein')) {
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
    if (animations.get(type as PrototypeTransitionType) === t('prototype.animation_moveout')) {
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
    if (animations.get(type as PrototypeTransitionType) === t('prototype.animation_slidein')) {
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
    if (animations.get(type as PrototypeTransitionType) === t('prototype.animation_slideout')) {
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
    if (animations.get(type as PrototypeTransitionType) === t('prototype.animation_push')) {
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
    if (animations.get(type as PrototypeTransitionType) === t('prototype.animation_smart')) {
        qsa.value = {
            transition: '',
        }
        mba.value = {
            transition: Bezier,
            height: '22px',
            background: '#507afc'
        }
        qsb.value = {
            transition: '',
            top: '0'
        }
        mbb.value = {
            transition: Bezier,
            top: '12px'
        }
    }
}

const checkConflict = (event: PrototypeEvents, id: string) => {
    let map = new Map()
    prototypeinteraction.value?.forEach((i, index) => {
        if (i.event.interactionType === event) {
            map.set(i.id, index)
        }
    })
    const min = Math.min(...Array.from(map.values()));
    const events: PrototypeEvents[] = []
    prototypeinteraction.value?.forEach(i => events.push(i.event.interactionType))

    const result = (event: PrototypeEvents): boolean => {
        if (event === PrototypeEvents.HOVER && events.includes(PrototypeEvents.MOUSEENTER)) {
            return true
        } else if ((event === PrototypeEvents.ONCLICK && events.includes(PrototypeEvents.MOUSEDOWN)) || (event === PrototypeEvents.ONCLICK && events.includes(PrototypeEvents.MOUSEUP))) {
            return true
        } else if ((event === PrototypeEvents.DBCLICK && events.includes(PrototypeEvents.MOUSEDOWN)) || (event === PrototypeEvents.DBCLICK && events.includes(PrototypeEvents.MOUSEUP)) || (event === PrototypeEvents.DBCLICK && events.includes(PrototypeEvents.ONCLICK))) {
            return true
        } else {
            return false
        }
    }

    if (map.get(id) === min) {
        return result(event)
    } else {
        return true
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
        return t('prototype.action_back')
    } else if (actions.connectionType === PrototypeConnectionType.CLOSE) {
        return t('prototype.action_close')
    } else if (actions.connectionType === PrototypeConnectionType.URL) {
        return actions.connectionURL
    } else if (actions.connectionType === PrototypeConnectionType.INTERNALNODE && actions.navigationType === PrototypeNavigationType.SCROLLTO) {
        const shape = props.context.selection.selectedPage
        const targetnmae = ref<string>()
        const a = (s: PageView | ShapeView, id: string) => {
            if (s.id === id) {
                return s.name
            } else {
                s.childs.forEach(i => {
                    const name = a(i, id)
                    if (name) return targetnmae.value = name
                })
            }
        }
        a(shape!, actions.targetNodeID!)
        return targetnmae.value
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
        e.setPrototypeExtraScrollOffsetX(shape as ArtboardView, id, Number(val))
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
        e.setPrototypeExtraScrollOffsetY(shape as ArtboardView, id, Number(val))
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
        if (!(shape as ArtboardView).overlayBackgroundAppearance) {
            e.setOverlayBackgroundAppearance(shape as ArtboardView)
        } else {
            if (data.color) {
                const value = new OverlayBackgroundAppearance(OverlayBackgroundType.SOLIDCOLOR, data.color)
                e.setOverlayBackgroundAppearance(shape as ArtboardView, value)
            } else {
                const value = new OverlayBackgroundAppearance(OverlayBackgroundType.SOLIDCOLOR, (shape as ArtboardView).overlayBackgroundAppearance!.backgroundColor)
                e.setOverlayBackgroundAppearance(shape as ArtboardView, value)
            }
        }
    } else {
        const value = new OverlayBackgroundAppearance(OverlayBackgroundType.NONE, (shape as ArtboardView).overlayBackgroundAppearance!.backgroundColor)
        e.setOverlayBackgroundAppearance(shape as ArtboardView, value)
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
        e.setOverlayBackgroundInteraction(shape as ArtboardView, OverlayBackgroundInteraction.NONE)
    } else {
        e.setOverlayBackgroundInteraction(shape as ArtboardView, OverlayBackgroundInteraction.CLOSEONCLICKOUTSIDE)
    }
    updateData()


}

//设置浮层位置
const setOverlayPositionType = (data: OverlayPositionType, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === id)
    if (!shape) return
    e.setOverlayPositionType(shape as ArtboardView, data)
    updateData()
}

//设置浮层间距
const setOverlayPositionMargin = (data: M, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === id)
    if (!shape) return
    if (data.type === 'TOP') e.setOverlayPositionTypeMarginTop(shape as ArtboardView, data.val)
    if (data.type === 'BOTTOM') e.setOverlayPositionTypeMarginBottom(shape as ArtboardView, data.val)
    if (data.type === 'LEFT') e.setOverlayPositionTypeMarginLeft(shape as ArtboardView, data.val)
    if (data.type === 'RIGHT') e.setOverlayPositionTypeMarginRight(shape as ArtboardView, data.val)
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
    e.setPrototypeActionConnectionURL(shape as ShapeView, id, value)
    connectionURL.value[0].blur()
    updateData()
}

const changeLinkSelect = (id: string, value: boolean) => {
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    editor.setPrototypeIsOpenNewTab(shape as ShapeView, id, value);
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
const getDuration = (value: string, oldval: number | undefined) => {
    if (oldval) oldval = oldval * 1000;
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
    const oldval = shape.prototypeInterActions?.find(item => item.id === id)?.actions.transitionDuration;
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
    const esfn = easingFn.get(value)
    if (!esfn) return;
    const bezier = new PrototypeEasingBezier(esfn[0], esfn[1], esfn[2], esfn[3])
    e.setPrototypeActionEasingType(shape as ShapeView, id, value, bezier)
    updateData()
    delstyle()
    nextTick(() => {
        addstyle()
    })
}

//自定义贝塞尔曲线
const setProtoTypeEasingFunction = (val: PrototypeEasingBezier, id: string) => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeActionEasingFunction(shape, id, val)
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
    e.setScrollDirection(shape as ShapeView, data.value as ScrollDirection);
    updateData()
}

const scrollBehavior = (data: SelectItem) => {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const editor = props.context.editor4Page(page);
    const shapes = props.context.selection.selectedShapes;
    editor.setScrollBehavior(shapes, data.value as ScrollBehavior);
    scroll_behavior_value.value = data;
}

const test = new Set()
for (let i of Object.values(PrototypeEvents)) {
    test.add(i)
}

//创建原型动画
const createAction = () => {
    showaction.value = true
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];

    if (!shape) return;

    const Events = new Set()
    for (let i of Object.values(PrototypeEvents)) {
        Events.add(i)
    }

    if (!isContainer.value) Events.delete(PrototypeEvents.AFTERTIMEOUT);

    const iterator = Events[Symbol.iterator]()
    let events: PrototypeEvents[] = []
    const event = ref<PrototypeEvents>()

    shape.prototypeInterActions?.forEach(i => {
        events.push(i.event.interactionType)
    })

    const checktype = () => {
        let type = iterator.next()
        if (events.includes(type.value as PrototypeEvents)) {
            checktype()
        } else {
            event.value = type.value as PrototypeEvents
        }
    }
    checktype()

    if (!event.value) return
    const Event = new PrototypeEvent(event.value)
    const Action = new PrototypeActions(PrototypeConnectionType.NONE, true);
    Action.transitionType = PrototypeTransitionType.INSTANTTRANSITION
    let id = v4()
    e.insertPrototypeAction(shape, new PrototypeInterAction(new BasicArray<number>(), id, Event, Action));
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
const is_scroll_behavior = ref(false);
const scroll_behavior_value = ref<SelectItem>({ value: ScrollBehavior.SCROLLS, content: t('prototype.scroll_with_parent') });
const isProtoType = ref(new Map())
//更新原型数据
function updateData() {
    const shapes = props.context.selection.selectedShapes;
    isProtoType.value.clear()
    is_scroll_behavior.value = false;
    hasStatus.value = false
    if (shapes.length !== 1) return
    scroll_behavior();
    const shape = shapes[0]
    const types = [ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolRef]
    if (types.includes(shape.type)) {
        isContainer.value = true
        isProtoType.value.set('shape', { shape, isContainer })
    } else if (((shape.parent?.isContainer || shape.parent?.type === ShapeType.SymbolRef) && shape.parent.type !== ShapeType.Page) || (shape.prototypeInterActions !== undefined && shape.prototypeInterActions.length !== 0)) {
        isContainer.value = false
        isProtoType.value.set('shape', { shape, isContainer })
    } else {
        isContainer.value = false
    }

    if (shape instanceof SymbolRefView) {
        const variable = get_var_for_ref(shape, t)
        if (variable) {
            const variables = variable.variables
            if (variables.length !== 0) hasStatus.value = true
        }
    }

    if (shape instanceof SymbolView) {
        const variables = states_tag_values_sort([shape], t)
        if (variables.length !== 0) {
            hasStatus.value = true
        }
    }

    if (isProtoType.value.size) {
        isProtoType.value.forEach((v, k) => {
            if (k) prototypestart.value = v.shape.prototypeStartPoint;
            prototypeinteraction.value = v.shape.prototypeInterActions;
            if (prototypeinteraction.value) {
                prototypeinteraction.value = [...prototypeinteraction.value].reverse()
            }
            scroll.value = v.shape.scrollDirection ? v.shape.scrollDirection : 'NONE';
        })
    }

    showtargerlist.value = false
}

const scroll_behavior = () => {
    const shapes = props.context.selection.selectedShapes;
    const types = [ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolRef];
    const every = shapes.every(s => s.parent && types.includes(s.parent.type));
    is_scroll_behavior.value = every;
    if (every) {
        const behavior = shapes[0].scrollBehavior || ScrollBehavior.SCROLLS;
        const result = shapes.every(s => (s.scrollBehavior || ScrollBehavior.SCROLLS) === behavior);
        if (result) {
            const scrollBehaviorMap = new Map([
                [ScrollBehavior.SCROLLS, t('prototype.scroll_with_parent')],
                [ScrollBehavior.FIXEDWHENCHILDOFSCROLLINGFRAME, t('prototype.fixed')],
                [ScrollBehavior.STICKYSCROLLS, t('prototype.sticky_fixed')],
            ]);
            const content = scrollBehaviorMap.get(behavior) || t('prototype.scroll_with_parent');
            scroll_behavior_value.value = { value: behavior, content };
        } else {
            scroll_behavior_value.value = { value: t('attr.mixed'), content: t('attr.mixed') };
        }
    }
}

// 图层选区变化
function _selection_change() {
    updateData()
    watch_shapes();
    reflush_by_shapes.value++;
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
    document.addEventListener('dblclick', () => {
        console.log('双击了');

    })
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

            img {
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

        .actions-item {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .actions-item .item {
            @include flex(space-between, center);
            gap: 8px;

            .arrow {
                display: flex;
                width: 10px;
                height: 10px;

                img {
                    width: 100%;
                    height: 100%;
                }
            }

            .item-content {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                flex: 1;
                gap: 4px;
                height: 32px;
                width: 180px;
                font-size: 12px;
                background-color: #F5F5F5;
                border-radius: 6px;
                line-height: 32px;
                padding: 0 9px;
                box-sizing: border-box;

                .event {
                    font-size: 12px;
                    line-height: 32px;
                    white-space: nowrap;
                }

                .icon-img {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background-color: #1878F5;
                    overflow: hidden;
                    display: flex;

                    img {
                        margin: auto;
                        width: 12px;
                        height: 12px;
                        filter: invert(1);
                    }
                }

                .name {
                    font-size: 12px;
                    line-height: 32px;
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .conflict {
                    display: flex;
                    width: 14px;
                    height: 14px;

                    img {
                        width: 100%;
                        height: 100%;
                        color: #333333;
                        outline: none;
                    }
                }

            }

            .delete {
                display: flex;
                width: 28px;
                height: 28px;
                border-radius: var(--default-radius);

                img {
                    width: 16px;
                    height: 16px;
                    margin: auto;
                }

                &:hover {
                    background-color: #F5F5F5;
                }
            }
        }

        .actions-item .item-setting {
            display: flex;
            flex-direction: column;
            margin: 0 36px 0 18px;
            font-size: 12px;
            font-weight: 400;
            gap: 8px;


            .trigger,
            .action,
            .link,
            .retract {
                position: relative;
                display: flex;
                gap: 8px;

                span {
                    flex: 0.2;
                    font-size: 12px;
                    line-height: 32px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .container {
                    flex: 0.8;
                    display: flex;
                    gap: 8px;

                    .select {
                        flex: 1;
                    }

                    .retract-y,
                    .retract-x {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        padding: 9px 8px;
                        flex: 1;
                        height: 32px;
                        background-color: #F5F5F5;
                        border-radius: 6px;
                        border: 1px solid transparent;
                        box-sizing: border-box;
                        overflow: hidden;


                        img {
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

                    .time {
                        flex: 0.5;
                    }

                    .url {
                        flex: 1;
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
                        overflow: hidden;

                        &:focus {
                            border: 1px solid #1878F5;
                        }
                    }
                }

            }

            .link_select {
                display: flex;
                align-items: center;
                margin-top: -2px;
                height: 20px;
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

                        .containerSmartA {
                            position: absolute;
                            top: 7px;
                            width: 42px;
                            height: 10px;
                            border-radius: 2px;
                            box-sizing: border-box;
                            border: 1px solid rgba(0, 0, 0, 0.75);
                        }

                        .containerSmartB {
                            position: relative;
                            width: 42px;
                            height: 30px;

                            >div {
                                position: absolute;
                                top: 4px;
                                width: 42px;
                                height: 10px;
                                border-radius: 2px;
                                box-sizing: border-box;
                                border: 1px solid rgba(0, 0, 0, 0.75);
                            }
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
                        flex: 0.2;
                        font-size: 12px;
                        line-height: 32px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .container {
                        flex: 0.8;
                        display: flex;
                        gap: 8px;

                        .select {
                            width: 100%;
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
                            width: 100%;
                            height: 32px;
                            padding: 2px;
                            border-radius: 6px;
                            background-color: #F5F5F5;
                            box-sizing: border-box;

                            .icon {
                                @include flex(center, center);
                                height: 28px;
                                border-radius: 4px;
                                box-sizing: border-box;
                                transition: all 0.3s;

                                img {
                                    width: 16px;
                                    height: 16px;
                                }
                            }
                        }

                    }

                }

                .effect .container {
                    flex-direction: column;

                    input {
                        width: 100%;
                    }
                }
            }
        }
    }
}

.visibility_select {
    flex: 0 0 14px;
    height: 14px;
    width: 14px;
    background-color: var(--active-color);
    box-sizing: border-box;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    margin-right: 5px;

    >img {
        width: 60%;
        height: 60%;
    }
}

.hidden_select {
    flex: 0 0 14px;
    height: 14px;
    width: 14px;
    background: #FFFFFF;
    border-radius: 4px;
    border: 1px solid #EBEBEB;
    box-sizing: border-box;
    margin-right: 5px;
}
</style>
