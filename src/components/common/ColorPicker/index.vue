<script setup lang="ts">
import { ref, nextTick, reactive, onMounted, onUnmounted, computed } from 'vue';
import {
    AsyncGradientEditor,
    Color,
    FillType,
    Gradient,
    GradientType,
    ImageScaleMode,
    PaintFilter,
    ShapeType,
    TableView,
    TextShapeView,
} from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { ClientXY } from '@/context/selection';
import { simpleId } from '@/utils/common';
import { Eyedropper } from './eyedropper';
import {
    drawTooltip,
    updateRecently,
    parseColorFormStorage,
    key_storage,
    RGB2HSB,
    RGB2H,
    validate,
    getHRGB,
    HSB2RGB,
    RGB2HSL,
    HSL2RGB,
    getColorsFromDoc,
    block_style_generator,
    gradient_channel_generator,
    StopEl,
    stops_generator,
    hexToX, RGB2SB,
} from './utils';
import { typical, model2label } from './typical';
import { genOptions } from '@/utils/common';
import Select, { SelectSource, SelectItem } from '@/components/common/Select.vue';
import { Menu } from "@/context/menu";
import ColorType from "./ColorType.vue";
import Tooltip from '../Tooltip.vue';
import { ColorCtx } from '@/context/color';
import {
    GradientFrom,
    getTextIndexAndLen,
    get_add_gradient_color,
    isSelectText
} from '@/components/Document/Selection/Controller/ColorEdit/gradient_utils';
import { flattenShapes } from '@/utils/cutout';
import angular from '@/assets/angular-gradient.png'
import { watch } from 'vue';
import PatternFill from "@/components/common/ColorPicker/PatternFill.vue";
import { ImgFrame } from '@/context/atrribute';

interface Props {
    context: Context
    color: Color

    locat?: { index: number, type: GradientFrom }
    fillType?: FillType
    gradient?: Gradient
    late?: number
    top?: number
    auto_to_right_line?: boolean
    cell?: boolean
    op?: boolean
    imageScaleMode?: ImageScaleMode
    scale?: number
    imageUrl?: string
    imageOriginFrame?: { width: number, height: number }
    paintFilter?: PaintFilter
}

interface Data {
    rgba: RGBA
    hueIndicatorAttr: Indicator
    alphaIndicatorAttr: Indicator
    dotPosition: DotPosition
}

interface Emits {
    (e: 'change', color: Color): void;

    (e: 'choosecolor', color: number[]): void;

    (e: 'gradient-reverse'): void;

    (e: 'gradient-rotate'): void;

    (e: 'gradient-add-stop', position: number, color: Color, id: string): void;

    (e: 'gradient-type', type: GradientType, fill: FillType): void;

    (e: 'gradient-color-change', color: Color, index: number): void;

    (e: 'gradient-stop-delete', index: number): void;

    (e: 'changeMode', mode: ImageScaleMode): void;
    (e: 'setImageRef', ref: string, origin: ImgFrame, imageMgr: any): void;
    (e: 'changeRotate'): void;
    (e: 'changeScale', scale: number): void;
    (e: 'closeMode'): void;
}

export interface HRGB { // 色相
    R: number
    G: number
    B: number
}

interface RGBA {
    R: number
    G: number
    B: number
    alpha: number
}

interface HSBA {
    H: number
    S: number
    V: number
    alpha: number
}

interface HSLA {
    H: number
    S: number
    L: number
    alpha: number
}

interface Indicator {
    x: number
}

interface DotPosition {
    left: number
    top: number
}

interface Bounding {
    x: number
    y: number
    right: number
    bottom: number
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const modelOptions: SelectSource[] = genOptions([['RGB', 'RGB'], ['HSL', 'HSL'], ['HSB', 'HSB']]);
const saturationEL = ref<HTMLElement>();
const saturationELBounding: Bounding = { x: 0, y: 0, right: 0, bottom: 0 };
const typicalColor = ref<Color[]>(typical);
const hueEl = ref<HTMLElement>();
const alphaEl = ref<HTMLElement>();
const blockId: string = simpleId();
const recent = ref<Color[]>([]);
const document_colors = ref<{ times: number, color: Color }[]>([]);
let inputTarget: HTMLInputElement;
let handleIndex = 0;
const downXY: ClientXY = { x: 0, y: 0 };
let isDrag: boolean = false;
const model = ref<SelectItem>({ value: 'RGB', content: 'RGB' });
const sliders = ref<HTMLDivElement>();
const block = ref<HTMLDivElement>();
const popoverEl = ref<HTMLDivElement>();
const hueIndicator = ref<HTMLDivElement>();
const alphaIndicator = ref<HTMLDivElement>();
const picker_visible = ref<boolean>(false);
const eyeDropper: Eyedropper = eyeDropperInit(); // 自制吸管🍉
const need_update_recent = ref<boolean>(false);
const gradient_channel_style = ref<any>({});
const gradient_type = ref<GradientType>();
const fill_type = ref<FillType>(FillType.SolidColor);
const stop_els = ref<StopEl[]>([]);
const imageScale = ref<number>();
const scaleMode = ref<ImageScaleMode>();

const LINE_LENGTH = 196;
const DOT_SIZE = 12;
const HALF_DOT_SIZE = DOT_SIZE / 2;
const HUE_WIDTH = 250;
const HUE_HEIGHT = 200;

const DOT_SIZE_CSS = `${DOT_SIZE}px`;
const HUE_WIDTH_CSS = `${HUE_WIDTH}px`;
const HUE_HEIGHT_CSS = `${HUE_HEIGHT}px`;
const LINE_LENGTH_CSS = `${LINE_LENGTH}px`;

const data = reactive<Data>({
    rgba: { R: 255, G: 0, B: 0, alpha: 1 },
    hueIndicatorAttr: { x: 0 },
    alphaIndicatorAttr: { x: LINE_LENGTH - DOT_SIZE },
    dotPosition: { left: HUE_WIDTH - DOT_SIZE / 2, top: -DOT_SIZE / 2 }
})
const { rgba, hueIndicatorAttr, alphaIndicatorAttr, dotPosition } = data;

// 色相
const hue = computed<number>(() => {
    return Math.floor((hueIndicatorAttr.x / (LINE_LENGTH - DOT_SIZE)) * 360);
})

// 饱和度
const saturation = computed<number>(() => {
    return (dotPosition.left + HALF_DOT_SIZE) / HUE_WIDTH;
})

// 亮度
const brightness = computed<number>(() => {
    return (1 - (dotPosition.top + HALF_DOT_SIZE) / HUE_HEIGHT);
})

const h_rgb = computed<HRGB>(() => {
    const color = new Color(1, rgba.R, rgba.G, rgba.B);
    return getHRGB(RGB2H(color, hue.value));
})

const hsba = computed<HSBA>(() => {
    const { R, G, B, alpha } = rgba;
    const { h, s, b } = RGB2HSB(new Color(alpha, R, G, B));
    return { H: h, S: s, V: b, alpha };
})

const hsla = computed<HSLA>(() => {
    const { R, G, B, alpha } = rgba;
    const { h, s, l } = RGB2HSL(new Color(alpha, R, G, B));
    return { H: h, S: s, L: l, alpha };
})

const labels = computed(() => {
    return model2label.get(model.value.value as string) || ['R', 'G', 'B', 'A'];
});

const values = computed<number[]>(() => {
    if (model.value.value === 'RGB') {
        return [Math.round(rgba.R), Math.round(rgba.G), Math.round(rgba.B), Math.round(rgba.alpha * 100)];
    } else if (model.value.value === 'HSB') {
        return [Math.round(hsba.value.H * 360), Math.round(hsba.value.S * 100), Math.round(hsba.value.V * 100), Math.round(hsba.value.alpha * 100)];
    } else if (model.value.value === 'HSL') {
        return [Math.round(hsla.value.H), Math.round(hsla.value.S * 100), Math.round(hsla.value.L * 100), Math.round(hsla.value.alpha * 100)];
    } else {
        return [Math.round(rgba.R), Math.round(rgba.G), Math.round(rgba.B), Math.round(rgba.alpha * 100)];
    }
});

let sleep = false;
let sleepTime = 600;
let bed: any = null;

function passive() {
    if (bed) {
        clearTimeout(bed);
    }

    bed = setTimeout(() => {
        sleep = false;
        clearTimeout(sleepTime);
        bed = null;
    }, sleepTime);

    sleep = true;
}

/**
 * @description 调色板定位
 */
function locate() {
    if (!(popoverEl.value && block.value)) {
        return;
    }
    let el = popoverEl.value
    let top = Math.min(document.documentElement.clientHeight - 76 - block.value.offsetTop - el.offsetHeight, 0);
    const p_el = block.value.getBoundingClientRect();
    const body_h = document.body.clientHeight;
    let p_top;
    const su = body_h - p_el.top;
    const cur_t = su - el.clientHeight;
    if (cur_t > 0) {
        p_top = p_el.top;
    } else {
        // p_top = p_el.top - Math.abs(cur_t - 10 - (props.fillType && props.fillType === FillType.SolidColor ? 38 : 0));
        p_top = p_el.top - Math.abs(cur_t - 10);
    }
    if (p_top - 40 < 0) {
        p_top = 40
    }
    if (props.top) {
        el.style.top = (top + props.top) + 'px';
    } else {
        el.style.top = p_top + 'px';
    }
    const doc_height = document.documentElement.clientHeight;
    const { height, y } = el.getBoundingClientRect();

    //避免工具栏遮挡调色板
    if (doc_height - y < height + 10) {
        el.style.top = ((parseInt(el.style.top) - ((height + 20) - (doc_height - y))) < 46 ? 56 : parseInt(el.style.top) - ((height + 20) - (doc_height - y))) + 'px'
    }
    //从表单快捷入口调起调色板时固定top
    if (props.cell) {
        el.style.top = 40 + 'px';
    }
    if (props.late) {
        el.style.left = p_el.left - el.clientWidth - 47 - props.late + 'px';
    } else if (props.cell) {
        el.style.left = 0 + 'px';
    } else {
        el.style.left = p_el.left - el.clientWidth - 40 + 'px';
    }
}

/**
 * @description 退出调色板
 */
function quit(e: MouseEvent) {
    const need_quit = props.fillType === FillType.Gradient && props.gradient
        ? e.target instanceof Element && !e.target.closest('.color-block') && !e.target.closest('#content')
        : e.target instanceof Element && !e.target.closest('.color-block');
    if (need_quit) {
        picker_visible.value = false;
        props.context.color.select_stop(undefined);
        blockUnmount();
        document.removeEventListener('mousedown', quit);
        props.context.color.setImageScale(undefined);
        props.context.color.setImageScaleMode(undefined);
    }
}

function setMousedownPosition(e: MouseEvent) {
    downXY.x = e.clientX;
    downXY.y = e.clientY;
}

function is_drag(e: MouseEvent) {
    return Math.hypot(e.clientX - downXY.x, e.clientY - downXY.y) > 4;
}

// 设置色相
function setHueIndicatorPosition(e: MouseEvent) {
    if (sliders.value) {
        setMousedownPosition(e);
        const x = sliders.value.getBoundingClientRect().x;
        let placement = e.x - x;

        if (placement < HALF_DOT_SIZE) {
            placement = HALF_DOT_SIZE;
        } else if (placement > LINE_LENGTH - HALF_DOT_SIZE) {
            placement = LINE_LENGTH - HALF_DOT_SIZE;
        }

        hueIndicatorAttr.x = placement - HALF_DOT_SIZE;

        setRGB(hueIndicatorAttr.x);

        document.addEventListener('mousemove', mousemove4Hue);
        document.addEventListener('mouseup', mouseup);

        need_update_recent.value = true;

        passive();
    }
}

function mousemove4Hue(e: MouseEvent) {
    if (isDrag) {
        const x = sliders.value!.getBoundingClientRect().x;
        let placement = e.x - x;
        if (placement < HALF_DOT_SIZE) {
            placement = HALF_DOT_SIZE;
        } else if (placement > LINE_LENGTH - HALF_DOT_SIZE) {
            placement = LINE_LENGTH - HALF_DOT_SIZE;
        }
        hueIndicatorAttr.x = placement - HALF_DOT_SIZE;
        setRGB(hueIndicatorAttr.x);

        passive();
    } else {
        isDrag = is_drag(e);
    }
}

function wheel(e: WheelEvent) {
    const wheel_step = 2;
    e.preventDefault();
    const { deltaX, deltaY } = e;
    if (Math.abs(deltaX) + Math.abs(deltaY) < 150) { // 临时适配方案，需根据使用设备进一步完善适配
        // todo
    } else {
        const delta = deltaY > 0 ? wheel_step : -wheel_step;
        const critical_len = LINE_LENGTH - DOT_SIZE
        if (delta > 0) {
            hueIndicatorAttr.x = (hueIndicatorAttr.x + delta) > critical_len
                ? hueIndicatorAttr.x + delta - critical_len
                : hueIndicatorAttr.x + delta;
            setRGB(hueIndicatorAttr.x);
        } else {
            hueIndicatorAttr.x = (hueIndicatorAttr.x + delta) < 0
                ? hueIndicatorAttr.x + delta + critical_len
                : hueIndicatorAttr.x + delta;
            setRGB(hueIndicatorAttr.x);
        }

        passive();
    }
}

// 设置透明度
function setAlphaIndicatorPosition(e: MouseEvent) {
    if (sliders.value) {
        setMousedownPosition(e);

        const x = sliders.value.getBoundingClientRect().x;
        let placement = e.x - x;

        if (placement < HALF_DOT_SIZE) {
            placement = HALF_DOT_SIZE;
        } else if (placement > LINE_LENGTH - HALF_DOT_SIZE) {
            placement = LINE_LENGTH - HALF_DOT_SIZE;
        }

        alphaIndicatorAttr.x = placement - HALF_DOT_SIZE;

        setAlpha(alphaIndicatorAttr.x);

        document.addEventListener('mousemove', mousemove4Alpha);
        document.addEventListener('mouseup', mouseup);

        need_update_recent.value = true;

        passive();
    }
}

function mousemove4Alpha(e: MouseEvent) {
    if (isDrag) {
        const x = sliders.value!.getBoundingClientRect().x;
        let placement = e.x - x;

        if (placement < HALF_DOT_SIZE) {
            placement = HALF_DOT_SIZE;
        } else if (placement > LINE_LENGTH - HALF_DOT_SIZE) {
            placement = LINE_LENGTH - HALF_DOT_SIZE;
        }

        alphaIndicatorAttr.x = placement - HALF_DOT_SIZE;

        setAlpha(alphaIndicatorAttr.x);

        passive();
    } else {
        isDrag = is_drag(e);
    }
}

function setDotPosition(e: MouseEvent) {
    if (saturationEL.value) {
        setMousedownPosition(e);
        const { x: saturationX, y: saturationY, right, bottom } = saturationEL.value.getBoundingClientRect();
        const { x: mx, y: my } = e;
        dotPosition.left = mx - saturationX - 5;
        dotPosition.top = my - saturationY - 5;
        saturationELBounding.x = saturationX;
        saturationELBounding.y = saturationY;
        saturationELBounding.right = right;
        saturationELBounding.bottom = bottom;
        const { R, G, B } = HSB2RGB(hue.value, saturation.value, brightness.value);
        update_rgb(R, G, B);
        const color = new Color(rgba.alpha, Math.round(R), Math.round(G), Math.round(B));
        changeColor(color);
        document.addEventListener('mousemove', mousemove4Dot);
        document.addEventListener('mouseup', mouseup);

        passive();
    }
}

function mousemove4Dot(e: MouseEvent) {
    if (isDrag) {
        const { x, y } = e;
        const { x: saturationX, y: saturationY, right, bottom } = saturationELBounding;

        if (x >= saturationX && x <= right) {
            dotPosition.left = x - saturationX - DOT_SIZE / 2;
        } else if (x < saturationX) {
            dotPosition.left = -(DOT_SIZE / 2);
        } else {
            dotPosition.left = HUE_WIDTH - (DOT_SIZE / 2);
        }

        if (y >= saturationY && y <= bottom) {
            dotPosition.top = y - saturationY - DOT_SIZE / 2;
        } else if (y < saturationY) {
            dotPosition.top = -(DOT_SIZE / 2);
        } else {
            dotPosition.top = HUE_HEIGHT - (DOT_SIZE / 2)
        }

        const { R, G, B } = HSB2RGB(hue.value, saturation.value, brightness.value);
        const color = new Color(rgba.alpha, Math.round(R), Math.round(G), Math.round(B));
        update_rgb(R, G, B);
        changeColor(color);

        passive();
    } else {
        isDrag = is_drag(e);
    }
}

// set color
function setRGB(indicator: number) {
    const h = (indicator / (LINE_LENGTH - DOT_SIZE)) * 360;
    const { R, G, B } = HSB2RGB(h, saturation.value, brightness.value);
    const color = new Color(rgba.alpha, Math.round(R), Math.round(G), Math.round(B));
    changeColor(color);
    update_rgb(R, G, B);
    need_update_recent.value = true;
}

function setAlpha(indicator: number) {
    rgba.alpha = Number((indicator / (LINE_LENGTH - DOT_SIZE)).toFixed(2));
    const color = new Color(rgba.alpha, Math.round(rgba.R), Math.round(rgba.G), Math.round(rgba.B));
    changeColor(color);
    need_update_recent.value = true;
}

function setColor(color: Color) {
    rgba.R = color.red;
    rgba.G = color.green;
    rgba.B = color.blue;
    rgba.alpha = color.alpha;
    changeColor(color);
    update_hue_indicator_position(color);
    update_dot_indicator_position(color);
    update_alpha_indicator(color);
    need_update_recent.value = true;
}

const changeColor = (color: Color) => {
    if (fill_type.value === FillType.SolidColor || !props.fillType) {
        emit('change', color);
    } else {
        if (!props.gradient) return;
        let id = props.context.color.selected_stop;
        const _id = props.gradient.stops[0].id;
        let index = props.gradient.stops.findIndex(v => v.id === id);
        if (id === undefined || index === -1) {
            id = _id;
            index = 0
        }
        emit('gradient-color-change', color, index);
        nextTick(() => {
            update_gradient(props.gradient);
        })
    }
}

// 鼠标抬起
function mouseup(e: MouseEvent) {
    document.removeEventListener('mousemove', mousemove4Dot);
    document.removeEventListener('mousemove', mousemove4Alpha)
    document.removeEventListener('mousemove', mousemove4Hue);
    document.removeEventListener('mouseup', mouseup)
    need_update_recent.value = true;
    isDrag = false;
}

function eyedropper() {
    if (!(window as any).EyeDropper) { // 不支持系统自带的接口，使用自实现的接口
        const { x, y, right, bottom } = props.context.workspace.root;
        eyeDropper.updateRoot({ x, y, width: right - x, height: bottom - y });
        eyeDropper.start(t('color.esc'));
    } else { // 调用系统自带的接口
        systemEyeDropper();
    }
}

// 系统自带的取色器
function systemEyeDropper() {
    const System_EyeDropper = (window as any).EyeDropper;
    const s_eye_dropper = new System_EyeDropper();
    s_eye_dropper.open().then((result: any) => {
        const rgb = hexToX(result.sRGBHex);
        rgba.R = rgb[0];
        rgba.G = rgb[1];
        rgba.B = rgb[2];
        const c = new Color(rgba.alpha, rgba.R, rgba.G, rgba.B);
        changeColor(c);
        update_hue_indicator_position(c);
        update_dot_indicator_position(c);
    }).catch((e: any) => {
        console.log("failed:", e);
    });
    const tooltip = drawTooltip(t('color.esc'));
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip?.parentNode?.removeChild(tooltip), 2000);
}

// 自制取色器
function eyeDropperInit(): Eyedropper {
    const root = props.context.workspace.root.element;
    return new Eyedropper({
        container: root,
        scale: 2,
        listener: {
            onOk: ({ color }) => {
                const rgb = hexToX(color);
                rgba.R = rgb[0];
                rgba.G = rgb[1];
                rgba.B = rgb[2];
                const c = new Color(rgba.alpha, rgba.R, rgba.G, rgba.B);
                changeColor(c);
                update_hue_indicator_position(c);
                update_dot_indicator_position(c);
            }
        }
    });
}

function switchModel(item: SelectItem) {
    model.value = item;
}

function inputClick(e: MouseEvent, hidx: number) {
    const target = e.target as HTMLInputElement;
    inputTarget = target;
    handleIndex = hidx;
    target.select();
    target.addEventListener('keydown', keyboardWatcher);
}

function keyboardWatcher(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        enter();

        passive();
    } else if (e.code === 'ArrowUp') {
        let v: string | number = inputTarget.value;
        v = Number(v);
        let _v = v + 1;
        const valid = validate(model.value.value as any, handleIndex, _v);
        if (valid) {
            if (handleIndex === 0) {
                rgba.R = Number(v) + 1;
            } else if (handleIndex === 1) {
                rgba.G = Number(v) + 1;
            } else if (handleIndex === 2) {
                rgba.B = Number(v) + 1;
            }
            const color = new Color(rgba.alpha, Math.floor(rgba.R), Math.floor(rgba.G), Math.floor(rgba.B));
            changeColor(color);
            update_hue_indicator_position(color);
            update_dot_indicator_position(color);
            need_update_recent.value = true;

            passive();
        }
    } else if (e.code === 'ArrowDown') {
        let v: string | number = inputTarget.value;
        v = Number(v);
        let _v = v - 1;
        const valid = validate(model.value.value as any, handleIndex, _v);
        if (valid) {
            if (handleIndex === 0) {
                rgba.R = Number(v) - 1;
            } else if (handleIndex === 1) {
                rgba.G = Number(v) - 1;
            } else if (handleIndex === 2) {
                rgba.B = Number(v) - 1;
            }
            const color = new Color(rgba.alpha, Math.floor(rgba.R), Math.floor(rgba.G), Math.floor(rgba.B));
            changeColor(color);
            update_dot_indicator_position(color);
            update_hue_indicator_position(color);
            need_update_recent.value = true;

            passive();
        }
    }
}

// 输入框输入
function enter() {
    let v: string | number = inputTarget.value;
    const valid = validate(model.value.value as any, handleIndex, Number(v));
    if (valid) {
        if (model.value.value === 'RGB') {
            v = Math.floor(Number(v));
            if (handleIndex === 0) {
                rgba.R = Number(v);
            } else if (handleIndex === 1) {
                rgba.G = Number(v);
            } else if (handleIndex === 2) {
                rgba.B = Number(v);
            } else if (handleIndex === 3) {
                rgba.alpha = Number(v) / 100;
            }
        } else if (model.value.value === 'HSB') {
            const { H, S, V, alpha } = hsba.value;
            const n = { H: H * 360, S, V, alpha };
            if (handleIndex === 0) {
                n.H = Number(v);
            } else if (handleIndex === 1) {
                n.S = Number(v) / 100;
            } else if (handleIndex === 2) {
                n.V = Number(v) / 100;
            } else if (handleIndex === 3) {
                n.alpha = Number(v) / 100;
            }
            const rgb_form_n = HSB2RGB(n.H, n.S, n.V);
            rgba.R = rgb_form_n.R;
            rgba.G = rgb_form_n.G;
            rgba.B = rgb_form_n.B;
            rgba.alpha = n.alpha;
        } else if (model.value.value === 'HSL') {
            const { H, S, L, alpha } = hsla.value;
            const n = { h: H, s: S, l: L, alpha };
            if (handleIndex === 0) {
                n.h = Number(v);
            } else if (handleIndex === 1) {
                n.s = Number(v) / 100;
            } else if (handleIndex === 2) {
                n.l = Number(v) / 100;
            } else if (handleIndex === 3) {
                n.alpha = Number(v) / 100;
            }
            const rgb_form_n = HSL2RGB(n);
            rgba.R = rgb_form_n.R;
            rgba.G = rgb_form_n.G;
            rgba.B = rgb_form_n.B;
            rgba.alpha = n.alpha;
        }
        const color = new Color(rgba.alpha, Math.round(rgba.R), Math.round(rgba.G), Math.round(rgba.B));
        changeColor(color);
        update_dot_indicator_position(color);
        update_hue_indicator_position(color);
        update_alpha_indicator(color);
        need_update_recent.value = true;
    }
    inputTarget.removeEventListener('keydown', keyboardWatcher);
    inputTarget.blur();
}

function triggle() {
    const menu = props.context.menu;
    const exsit = menu.isColorPickerMount;
    if (exsit) {
        menu.removeColorPicker();
        if (exsit !== blockId) {
            colorPickerMount();
        }
    } else {
        colorPickerMount();
    }
}

/**
 * @description 打开调色板
 */
function colorPickerMount() {
    picker_visible.value = true;
    props.context.menu.setupColorPicker(blockId);

    if (props.locat) {
        props.context.color.gradinet_locat(props.locat);
    }

    init();

    init_document_colors();

    switch_editor_mode();

    get_gradient_type();

    switch_tile();

    document.addEventListener('mousedown', quit);

    nextTick(locate);
}

function blockUnmount() {
    const menu = props.context.menu;
    const e = menu.isColorPickerMount;
    if (e === blockId) {
        menu.clearColorPickerId();
    }
    props.context.color.clear_locat();
    props.context.color.switch_editor_mode(false);
}

/**
 * @description 移除调色板
 */
function removeCurColorPicker() {
    if (need_update_recent.value) {
        update_recent_color();
        need_update_recent.value = false;
    }
    props.context.menu.clearColorPickerId();
    props.context.color.clear_locat();
    props.context.color.switch_editor_mode(false);
    picker_visible.value = false;
    props.context.color.select_stop(undefined);
    props.context.color.setImageScale(undefined);
    props.context.color.setImageScaleMode(undefined);
}

function switch_editor_mode() {
    if (props.locat && props.gradient && props.fillType === FillType.Gradient) {
        props.context.color.switch_editor_mode(true, props.gradient);
    }
}

function switch_tile() {
    if (props.imageScaleMode === ImageScaleMode.Tile) {
        props.context.color.setImageScale(props.scale);
        props.context.color.setImageScaleMode(ImageScaleMode.Tile);
        props.context.color.setImageOriginFrame(props.imageOriginFrame);
    }
}

// init
function init_recent() {
    let r = localStorage.getItem(key_storage);
    r = JSON.parse(r || '[]');
    if (!r || !r.length) {
        return;
    }
    recent.value = [];
    for (let i = 0; i < r.length; i++) {
        recent.value.push(parseColorFormStorage(r[i]));
    }
}

function init_document_colors() {
    document_colors.value = getColorsFromDoc(props.context);
}

// init
function init(color = props.color) {
    init_recent();
    const { red, green, blue, alpha } = color;
    rgba.alpha = alpha;
    update_rgb(red, green, blue);
    update_dot_indicator_position(color);
    update_hue_indicator_position(color);
    update_alpha_indicator(color);
    update_gradient(props.gradient);
}

function update(color = props.color) {
    if (sleep) {
        return;
    }
    const { red, green, blue, alpha } = color;
    rgba.alpha = alpha;
    update_rgb(red, green, blue);
    update_dot_indicator_position(color);
    update_hue_indicator_position(color, hue.value);
    update_alpha_indicator(color);
    get_gradient_type();
}

function update_recent_color() {
    const color = new Color(rgba.alpha, Math.round(rgba.R), Math.round(rgba.G,), Math.round(rgba.B));
    let nVal = updateRecently(color) || JSON.stringify([]);
    nVal = JSON.parse(nVal);
    if (nVal.length) {
        recent.value = [];
        for (let i = 0; i < nVal.length; i++) {
            recent.value.push(parseColorFormStorage(nVal[i]));
        }
    }
}

function update_rgb(R: number, G: number, B: number) {
    rgba.R = R;
    rgba.G = G;
    rgba.B = B;
}

function update_alpha_indicator(color: Color) {
    const { alpha } = color;
    alphaIndicatorAttr.x = (LINE_LENGTH - DOT_SIZE) * alpha;
}

function update_dot_indicator_position(color: Color) {
    const { s, b } = RGB2SB(color);
    dotPosition.left = HUE_WIDTH * s - (DOT_SIZE / 2);
    dotPosition.top = HUE_HEIGHT * (1 - b) - (DOT_SIZE / 2);
}

function update_hue_indicator_position(color: Color, sub?: number) {
    const h = RGB2H(color, sub);
    let hueIndicator = (LINE_LENGTH - DOT_SIZE) * (h / 360);

    if (hueIndicator < 0) {
        hueIndicator = 0;
    }

    if (hueIndicator > (LINE_LENGTH - DOT_SIZE)) {
        hueIndicator = LINE_LENGTH - DOT_SIZE;
    }

    hueIndicatorAttr.x = hueIndicator;
}

//渐变颜色
function update_gradient(gradient: Gradient | undefined) {
    if (!gradient || props.fillType !== FillType.Gradient) {
        return;
    }
    gradient_channel_style.value = gradient_channel_generator(gradient);
    const id = props.context.color.selected_stop;
    update_stops(id);
    props.context.color.notify(ColorCtx.GRADIENT_UPDATE);
}

const gradient_line = ref<HTMLDivElement>();

//更新渐变颜色画板
function update_stops(selected: string | undefined) {
    if (sleep) return;
    stop_els.value.length = 0;
    if (!props.gradient || props.fillType !== FillType.Gradient) {
        return;
    }
    let index = props.gradient.stops.findIndex((v) => v.id === selected);
    if (selected === undefined || index === -1) index = 0;
    stop_els.value = stops_generator(props.gradient, 152, index); // 条条的宽度 减去 一个圆的宽度
    const c = stop_els.value[index]?.stop.color;
    if (!c) {
        return;
    }
    rgba.alpha = c.alpha;
    update_rgb(c.red, c.green, c.blue);
    update_dot_indicator_position(c as Color);
    update_hue_indicator_position(c as Color);
    update_alpha_indicator(c as Color);
}

//新增渐变节点
function _gradient_channel_down(e: MouseEvent) {
    const target = e.target as HTMLInputElement;
    const left = e.offsetX / target.clientWidth;
    if (!props.gradient || props.fillType !== FillType.Gradient) return;
    const stops = props.gradient.stops;
    const stop = get_add_gradient_color(stops, left);
    if (!stop) return;
    emit('gradient-add-stop', left, stop.color, stop.id);
    nextTick(() => {
        props.context.color.select_stop(stop.id);
    })
}

function delete_gradient_stop() {
    if (stop_els.value.length <= 1) return;
    let id = props.context.color.selected_stop;
    const index = stop_els.value.findIndex((item) => item.stop.id === id);
    if (index === -1) return;
    if (stop_els.value[stop_els.value.length - 1].stop.id === id) {
        props.context.color.select_stop(stop_els.value[0].stop.id);
    } else {
        props.context.color.select_stop(stop_els.value[index + 1].stop.id);
    }
    stop_els.value.splice(index, 1);
    emit('gradient-stop-delete', index);
    nextTick(() => {
        update_gradient(props.gradient!);
    })
}

// 选中渐变节点
let stop_start_position: ClientXY = { x: 0, y: 0 };
let gradientEditor: AsyncGradientEditor | undefined;
const stop_id = ref<string>('');

function _stop_down(e: MouseEvent, index: number, id: string) {
    e.stopPropagation();
    props.context.color.select_stop(id);
    stop_id.value = id;
    const workspace = props.context.workspace;
    stop_start_position = workspace.getContentXY(e);
    document.addEventListener('mousemove', move_stop_position);
    document.addEventListener('mouseup', stop_mouseup);
}

function move_stop_position(e: MouseEvent) {
    const { x, y } = props.context.workspace.getContentXY(e);
    const { x: sx, y: sy } = stop_start_position;
    const dx = x - sx;
    const dy = y - sy;
    if (!props.locat) return;
    if (isDrag && gradient_line.value && gradientEditor) {
        stop_start_position.x = x, stop_start_position.y = y;
        const index = stop_els.value.findIndex((item) => item.stop.id === stop_id.value);
        if (index === -1) return;
        const line_rect = gradient_line.value.getBoundingClientRect();
        const line_width = Math.min(Math.max(e.clientX - line_rect.left, 0), line_rect.width);
        const stop_p = line_width / line_rect.width;
        gradient_channel_style.value = gradient_channel_generator(props.gradient!);
        stop_els.value[index].left = stop_p * 152 + 16;
        gradientEditor.execute_stop_position(stop_p, stop_id.value);
        passive();
    } else {
        if (Math.hypot(dx, dy) > 3) {
            isDrag = true;
            const selected = props.context.selection.selectedShapes;
            const page = props.context.selection.selectedPage;
            const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
            const locat = props.locat;
            if (locat.type !== 'table_text' && locat.type !== 'text') {
                gradientEditor = props.context.editor.controller().asyncGradientEditor(shapes, page!, locat.index, locat.type);
            } else {
                if (!props.gradient) return;
                const { textIndex, selectLength } = getTextIndexAndLen(props.context);
                if (locat.type === 'table_text') {
                    const tableSelection = props.context.tableSelection;
                    const table_shape = shapes.filter((s) => s.type === ShapeType.Table)[0] as TableView;
                    if (tableSelection.editingCell) {
                        const table_cell = tableSelection.editingCell;
                        const editor_text = props.context.editor4TextShape(table_cell);
                        if (isSelectText(props.context)) {
                            gradientEditor = editor_text.asyncSetTextGradient([table_cell], props.gradient, 0, Infinity);
                        } else {
                            gradientEditor = editor_text.asyncSetTextGradient([table_cell], props.gradient, textIndex, selectLength);
                        }
                    } else {
                        const editor = props.context.editor4Table(table_shape);
                        if (tableSelection.tableRowStart < 0 || tableSelection.tableColStart < 0) {
                            gradientEditor = editor.asyncSetTextGradient(props.gradient);
                        } else {
                            gradientEditor = editor.asyncSetTextGradient(props.gradient, {
                                rowStart: tableSelection.tableRowStart,
                                rowEnd: tableSelection.tableRowEnd,
                                colStart: tableSelection.tableColStart,
                                colEnd: tableSelection.tableColEnd
                            });
                        }
                    }
                } else {
                    const text_shapes = shapes.filter((s) => s.type === ShapeType.Text);
                    const editor = props.context.editor4TextShape(text_shapes[0] as TextShapeView);
                    if (isSelectText(props.context)) {
                        gradientEditor = editor.asyncSetTextGradient(text_shapes as TextShapeView[], props.gradient, 0, Infinity);
                    } else {
                        gradientEditor = editor.asyncSetTextGradient(text_shapes as TextShapeView[], props.gradient, textIndex, selectLength);
                    }
                }
            }

            passive();
        }
    }
}

const stop_mouseup = () => {
    isDrag = false;
    if (gradientEditor) {
        gradientEditor.close();
        gradientEditor = undefined;
    }
    document.removeEventListener('mousemove', move_stop_position);
    document.removeEventListener('mouseup', stop_mouseup);
}

function color_type_change(val: GradientType, type: FillType) {
    if (gradient_type.value === val && fill_type.value === type) {
        set_gradient(val, type);
        return;
    }
    emit('gradient-type', val, type);
    update_gradient_type(val, type);
    nextTick(() => {
        set_gradient(val, type);
        if (props.locat) props.context.color.gradinet_locat(props.locat);
        init();
        locate();
        if (type === FillType.Pattern) {
            props.context.color.setImageOriginFrame(props.imageOriginFrame);
        }
    })
}

const set_gradient = (val: GradientType, fillType: FillType) => {
    if (fillType !== FillType.Gradient) {
        props.context.color.set_gradient_type(undefined);
        props.context.color.clear_locat();
        props.context.color.switch_editor_mode(false);
        props.context.color.setImageScale(undefined);
        props.context.color.setImageScaleMode(undefined);
        if (fillType === FillType.Pattern) {
            props.context.color.setImageScale(props.scale);
            props.context.color.setImageScaleMode(props.imageScaleMode);
        }
    } else {
        props.context.color.set_gradient_type(val);
        setTimeout(() => {
            if (props.locat) props.context.color.switch_editor_mode(true, props.gradient);
        }, 100)
    }
    if (props.locat) props.context.color.gradinet_locat(props.locat);
}

// 切换渐变类型
function update_gradient_type(type: GradientType, fill: FillType) {
    if (fill !== FillType.Gradient) {
        props.context.color.select_stop(undefined);
    } else {
        let id = props.context.color.selected_stop;
        if (id === undefined) id = props.gradient?.stops[0].id;
        props.context.color.select_stop(id);
    }
    nextTick(() => {
        gradient_type.value = type;
        fill_type.value = fill;
    })
}

// 获取渐变类型
const get_gradient_type = () => {
    if (props.fillType === FillType.Gradient) {
        fill_type.value = FillType.Gradient;
        gradient_type.value = props.gradient?.gradientType;
        props.context.color.set_gradient_type(gradient_type.value);
        let id = props.context.color.selected_stop;
        if (id === undefined) id = props.gradient?.stops[0].id;
        props.context.color.select_stop(id);
        props.context.color.setImageScale(undefined);
        props.context.color.setImageScaleMode(undefined);
    } else {
        props.context.color.select_stop(undefined);
        props.context.color.set_gradient_type(undefined);
        props.context.color.switch_editor_mode(false);
        if (props.fillType === FillType.SolidColor) {
            fill_type.value = FillType.SolidColor;
            props.context.color.clear_locat();
            props.context.color.setImageScale(undefined);
            props.context.color.setImageScaleMode(undefined);
        } else if (props.fillType === FillType.Pattern) {
            fill_type.value = FillType.Pattern;
            imageScale.value = props.scale;
            scaleMode.value = props.imageScaleMode;
            props.context.color.setImageScale(props.scale);
            props.context.color.setImageOriginFrame(props.imageOriginFrame);
        }
    }

    if (props.locat) {
        props.context.color.gradinet_locat(props.locat);
    }
}

// 渐变翻转
function reverse() {
    emit('gradient-reverse');
    nextTick(() => {
        update_gradient(props.gradient!);
    })
}

// 渐变选中90度
function rotate() {
    emit('gradient-rotate');
    nextTick(() => {
        update_gradient(props.gradient!);
    })
}

function menu_watcher(t: any, id: string) {
    if (t === Menu.REMOVE_COLOR_PICKER && id === blockId) {
        removeCurColorPicker();
    } else if (t === Menu.SHUTDOWN_MENU) {
        removeCurColorPicker();
    }
}

function color_watch(t: number) {
    if (t === ColorCtx.CHANGE_STOP && props.gradient) {
        gradient_channel_style.value = gradient_channel_generator(props.gradient);
        update_stops(props.context.color.selected_stop);
    } else if (t === ColorCtx.STOP_DELETE) {
        delete_gradient_stop();
    }
}

function window_blur() {
    isDrag = false;
}

const is_gradient_selected = () => {
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    if (shapes.length === 1) {
        if (shapes[0].type === ShapeType.Table && props.locat && props.locat.type !== 'table_text') {
            const t = props.context.tableSelection;
            if (t.editingCell || !(t.tableRowStart < 0 || t.tableColStart < 0)) {
                return false;
            }
        }
        return shapes[0].type === ShapeType.Contact ? false : true;
    } else {
        let ret = false;
        shapes.forEach((s) => {
            if (s.type !== ShapeType.Contact) {
                ret = true;
            }
        })
        return ret;
    }
}

watch(() => props.gradient, () => watch_picker(), { deep: true })

watch(() => props.color, () => watch_picker(), { deep: true })

const watch_picker = () => {
    if (picker_visible.value) {
        update();
    }
}

watch(() => picker_visible.value, (v) => {
    if (!v) {
        emit('closeMode');
    }
})

const observer = new ResizeObserver(locate);
let isDragging = false
let elpx: any
let elpy: any
let mx: any
let my: any


function startDrag(e: MouseEvent) {
    if (!props.cell) return
    isDragging = true
    const elp = document.querySelector('.custom-popover') as HTMLElement
    //父元素的页面位置
    elpx = elp.getBoundingClientRect().left
    elpy = elp.getBoundingClientRect().top

    //鼠标相对于盒子的坐标
    mx = e.offsetX
    my = e.offsetY
    document.addEventListener('mousemove', onDrag)

}

function onDrag(e: MouseEvent) {
    let el = popoverEl.value as HTMLElement
    if (isDragging) {
        const ex = e.pageX
        const ey = e.pageY
        el.style.left = ex - mx - elpx + 'px'
        el.style.top = ey - my - elpy + 'px'
    }
}

const changeScaleMode = (mode: ImageScaleMode) => {
    emit('changeMode', mode);
    nextTick(() => {
        get_gradient_type();
        if (mode === ImageScaleMode.Tile) {
            props.context.color.setImageOriginFrame(props.imageOriginFrame);
        }
    })
}

const setImageRef = (urlRef: string, origin: ImgFrame, imageMgr: any) => {
    emit('setImageRef', urlRef, origin, imageMgr);
}

function stopDrag(e: MouseEvent) {
    isDragging = false
    document.removeEventListener('mousemove', onDrag)
}
const image_url = ref(props.imageUrl);
watch(() => props.imageUrl, (v) => {
    image_url.value = v;
}, { immediate: true })

onMounted(() => {
    if (document.body) observer.observe(document.body);
    props.context.menu.watch(menu_watcher);
    props.context.color.watch(color_watch);
    window.addEventListener('blur', window_blur);
    init();
})

onUnmounted(() => {
    observer.disconnect();
    eyeDropper.destroy();
    props.context.menu.unwatch(menu_watcher);
    props.context.color.unwatch(color_watch);
    window.removeEventListener('blur', window_blur);
    document.removeEventListener('mousedown', quit);
    blockUnmount();
    props.context.color.select_stop(undefined);
    props.context.color.clear_locat();
    props.context.color.switch_editor_mode(false);
})
</script>

<template>
    <div class="color-block" :style="block_style_generator(color, gradient, fillType)" ref="block" @click="triggle">
        <img v-if="fillType === FillType.Pattern" :src="image_url" alt="">
        <div class="popover" v-if="picker_visible" ref="popoverEl" @click.stop @wheel="wheel" @mousedown.stop>
            <!-- 头部 -->
            <div class="header" @mousedown.stop="startDrag" @mouseup="stopDrag">
                <div class="color-type-desc">
                    <div class="color-type">{{ t(`attr.fill`) }}</div>
                    <!-- <svg-icon icon-class="down"></svg-icon> -->
                </div>
                <div @click.stop="removeCurColorPicker" @mousedown.stop class="close">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
            </div>
            <div class="color_type_container" v-if="fillType && is_gradient_selected()">
                <ColorType :color="color" :gradient_type="gradient_type" @change="color_type_change"
                    :fillType="fill_type" :angular="angular" :imageScaleMode="imageScaleMode">
                </ColorType>
            </div>
            <!-- 渐变工具 -->
            <div v-if="fill_type === FillType.Gradient && fillType === FillType.Gradient && is_gradient_selected()"
                class="gradient-container">
                <div class="line-container">
                    <div class="line" ref="gradient_line" :style="gradient_channel_style"
                        @mouseup.stop="_gradient_channel_down"></div>
                    <div class="stops" v-for="(item, i) in stop_els" :key="i" :style="{ left: item.left + 'px' }"
                        @mousedown.stop="(e) => { _stop_down(e, i, item.stop.id) }">
                        <div :class="item.is_active ? 'stop-active' : 'stop'"></div>
                    </div>
                </div>
                <div class="reverse" @click="reverse">
                    <Tooltip :content="t('color.reverse')">
                        <svg-icon icon-class="exchange"></svg-icon>
                    </Tooltip>
                </div>
                <div class="rotate" @click="rotate">
                    <Tooltip :content="t('color.rotate')">
                        <svg-icon icon-class="rotate90"></svg-icon>
                    </Tooltip>
                </div>
            </div>
            <!-- 饱和度 -->
            <template v-if="fillType !== FillType.Pattern">
                <div class="saturation" @mousedown.stop="e => setDotPosition(e)"
                    :style="{ backgroundColor: `rgba(${h_rgb.R}, ${h_rgb.G}, ${h_rgb.B}, 1)` }" ref="saturationEL">
                    <div class="white"></div>
                    <div class="black"></div>
                    <div class="dot" :style="{ left: `${dotPosition.left}px`, top: `${dotPosition.top}px` }"></div>
                </div>
                <!-- &lt;!&ndash; 常用色 &ndash;&gt; -->
                <div class="typical-container">
                    <div class="block" v-for="(c, idx) in typicalColor" :key="idx" @click="() => setColor(c as any)"
                        :style="{ 'background-color': `rgba(${c.red}, ${c.green}, ${c.blue}, ${c.alpha * 100}%)` }">
                    </div>
                </div>
                <div class="controller">
                    <div class="eyedropper">
                        <svg-icon icon-class="eyedropper" @click.stop="eyedropper"></svg-icon>
                    </div>
                    <div class="sliders-container" ref="sliders">
                        <!-- &lt;!&ndash; 色相 &ndash;&gt; -->
                        <div class="hue" @mousedown.stop="setHueIndicatorPosition" ref="hueEl">
                            <div class="hueIndicator" ref="hueIndicator" :style="{ left: hueIndicatorAttr.x + 'px' }">
                            </div>
                        </div>
                        <!-- &lt;!&ndash; 透明度 &ndash;&gt; -->
                        <div class="alpha-bacground">
                            <div class="alpha" @mousedown.stop="setAlphaIndicatorPosition" ref="alphaEl"
                                :style="{ background: `linear-gradient(to right, rgba(${rgba.R}, ${rgba.G}, ${rgba.B}, 0) 0%, rgb(${rgba.R}, ${rgba.G}, ${rgba.B}) 100%)` }">
                                <div class="alphaIndicator" ref="alphaIndicator"
                                    :style="{ left: alphaIndicatorAttr.x + 'px' }">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- &lt;!&ndash; model & values &ndash;&gt; -->
                <div class="input-container">
                    <Select class="model" :source="modelOptions" :selected="model" @select="switchModel"></Select>
                    <div class="values">
                        <div class="wrap">
                            <div class="value">
                                <div v-for="(i, idx) in values" :key="idx" class="item"><input :value="i"
                                        @click="(e) => inputClick(e, idx)" />
                                </div>
                            </div>
                            <div class="label">
                                <div v-for="(i, idx) in labels" :key="idx" class="item">{{ i }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- &lt;!&ndash; 最近使用 &ndash;&gt; -->
                <div class="recently-container" v-if="recent.length">
                    <div class="inner">
                        <div class="header">{{ t('color.recently') }}</div>
                        <div class="typical-container">
                            <div class="block" v-for="(c, idx) in recent" :key="idx" @click="() => setColor(c as any)"
                                :style="{ 'background-color': `rgba(${c.red}, ${c.green}, ${c.blue}, ${c.alpha * 100}%)` }">
                            </div>
                        </div>
                    </div>
                </div>
                <!-- &lt;!&ndash; 文档使用 &ndash;&gt; -->
                <div class="dc-container" v-if="document_colors.length">
                    <div class="inner">
                        <div class="header">{{ t('color.documentc') }}</div>
                        <div class="documentc-container" @wheel.stop>
                            <div class="block" v-for="(c, idx) in document_colors" :key="idx"
                                @click="() => setColor(c.color as any)"
                                :title="t('color.times').replace('xx', c.times.toString())"
                                :style="{ 'background-color': `rgba(${c.color.red}, ${c.color.green}, ${c.color.blue}, ${c.color.alpha * 100}%)` }">
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <PatternFill :context="context" v-else :scale="imageScale" :imageScaleMode="scaleMode" :image="image_url"
                :paintFilter="paintFilter" @changeMode="changeScaleMode" @setImageRef="setImageRef"
                @changeRotate="emit('changeRotate')" @changeScale="(s) => emit('changeScale', s)" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.showop {
    opacity: 0.3;
}

.color-block {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    font-weight: 500;
    font-size: var(--font-default-fontsize);
    opacity: 1;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    flex: 0 0 16px;

    img {
        border-radius: 3px;
        width: 16px;
        height: 16px;
        object-fit: fill;
    }

    .popover {
        position: fixed;
        background-color: #ffffff;
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
        border-radius: 8px;
        border: 1px solid #F0F0F0;
        overflow: hidden;
        z-index: 99;

        width: v-bind('HUE_WIDTH_CSS');

        >.header {
            width: 100%;
            height: 40px;
            position: relative;
            color: #000000;
            border-bottom: 1px solid var(--grey-dark);
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            border-width: 0 0 1px 0;
            border-style: solid;
            border-color: #F5F5F5;
            padding: 14px 12px;

            >.color-type-desc {
                display: flex;
                align-items: center;
                cursor: pointer;

                .color-type {
                    user-select: none;
                }

                >svg {
                    transition: 0.3s;
                    width: 10px;
                    height: 10px;
                    margin-left: 4px;
                }

                >svg:hover {
                    transform: translateY(2px);
                }
            }

            >.close {
                flex: 0 0 16px;
                height: 16px;
                text-align: center;
                line-height: 16px;
                border-radius: 4px;
                user-select: none;
                display: flex;
                align-items: center;

                >svg {
                    width: 85%;
                    height: 85%;
                }
            }
        }

        .color_type_container {
            width: 100%;
            height: 32px;
            display: flex;
            margin: 10px 0;
            padding: 0 12px;
            box-sizing: border-box;
        }

        >.gradient-container {
            display: flex;
            align-items: center;
            width: 100%;
            height: 28px;
            text-align: center;
            padding-right: 12px;
            margin-bottom: 10px;
            box-sizing: border-box;

            .line-container {
                flex: 1;
                position: relative;
                margin-left: 2px;
                padding-left: 12px;
                margin-right: 8px;
                box-sizing: border-box;

                .line {
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    box-shadow: 0 0 1px 1px #efefef;
                }

                .stops {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    top: 4px;
                    transform: translate(-50%, -50%);
                }

                .stop {
                    width: 12px;
                    height: 12px;
                    border: 1px solid rgba(0, 0, 0, .2);
                    border-radius: 50%;
                    box-sizing: border-box;
                    box-shadow: inset 0 0 0 2px #fff, inset 0 0 0 3px rgba(0, 0, 0, 0.2);
                }

                .stop-active {
                    width: 14px;
                    height: 14px;
                    box-sizing: border-box;
                    border: 2px solid var(--active-color);
                    border-radius: 50%;
                    box-shadow: inset 0 0 0 2px #fff, inset 0 0 0 3px rgba(0, 0, 0, 0.2);
                }
            }

            .reverse {
                flex: 0 0 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;

                svg {
                    width: 14px;
                    height: 14px;
                    outline: none;
                }
            }

            .rotate {
                flex: 0 0 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;

                svg {
                    width: 14px;
                    height: 14px;
                    outline: none;
                }
            }
        }

        >.saturation {
            width: 100%;
            position: relative;
            cursor: pointer;
            overflow: hidden;

            height: v-bind('HUE_HEIGHT_CSS');

            >.white {
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0));
            }

            >.black {
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(0deg, #000, hsla(0, 0%, 100%, 0));
            }

            >.dot {
                width: v-bind('DOT_SIZE_CSS');
                height: v-bind('DOT_SIZE_CSS');
                border-radius: 50%;
                border: 2px solid #fff;
                position: absolute;
                box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .2), 0 0 0 1px rgba(0, 0, 0, .2);
                box-sizing: border-box;
            }
        }

        >.typical-container {
            width: 100%;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            padding: 12px 6px;
            box-sizing: border-box;

            >.block {
                margin: 0 3px 6px 3px;
                width: 16px;
                height: 16px;
                border-radius: 3px;
                border: 1px solid rgba(0, 0, 0, 0.1);
                cursor: -webkit-image-set(url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABV9JREFUaEPtmG1oVXUcxz8+zpZbLgcuTHDOF6OYsGoTI3IyMG14Hex67waJFERBqdALfZNDDLIoexG9qCjyTTBQat7bwoXMXRTntm4OFnIFr2srkPWc7VG7M77z/1/zsrvOuWdXEe4fDmdnnHPu5/f0/f3Ofx73+Jp3j/OTNeBuRzAbgWwEPHogm0IeHej58WwEPLvQ4wuyEfDoQM+PZyPg2YUeX3AnIqDfmH4I+aY5JjzyZ3wanQ8sNMciQNeCTwD/ADfM3/pfWiuTERDsYmAJ8BDQBDwM/A58B+wGRoExY0xaRmTKgAUGPhd4HAib6+le7gJqgSFjiCLiemXCAAt/P/Ak0GxqYCa4o8B+4BowbtLLlRFzbYDgcwDBPw0cmwVeoD8BT5m0GjH1cFcMkCOs55cC1cDn/wMv0D+BSuAXk0qu0yjdCCRLoy1YeX4r8JlDN8ZMHfwM/G2K2eGjt25LxwArjfL4I8BlQBK5pKys7FBvb+/zDgmkQLuAKPCbiYDk1dVKxwDBSh7l5TLgVeVyeXn5hxcuXKhy+OvS/zeBL036KJUkp64bWzoGCP4+IAB8DMRLS0uvxWKxcofwyvN3jDr9CvwBDJum5roXuDVA91uVeQDwFxcXv93X1+eQfdLD703zvIWXhLr2fjo1oPxXZxX88rq6uj0tLS0vjo+Pc/OmI+cJ/gvAel5NTPCuc996zG0ElP/qrg8Gg8G9J0+e3LNy5cp5hw8fZseOHVy/fn22SLxv+sJ0eOV92vBuI6ChTN7Pa2ho2N3a2rq/qKhofkdHB/n5+USjUTZs2MCNG6rP21dJSUkkHo83moLVLGQ971r3k9/tNAKCV+4vra+vf7mtra2xsLBwCt6+VLWwdu1aJib+S+fS0tLeWCy2F5DWC96ODZ7hnUZgCr6hoeGFSCTyxrJlyxZYzyd75OrVq6xatYpEIkFxcfEPfX19rwCDxgDJpfR/TuCdGDAFHwgEnuvo6HgrLy9vYSr44eFhqqur6ezsZMWKFQwODg4ArwPdpnDVbVUojireibTNlkJTg1kwGKzv7Ow8kpubu2g2+M2bN3Pu3Dm2bdv2TTgc/h54TX0CeAn41uj9nHl/tgjIMDWspYFAYGs0Gv00JydncSr4kZERtmzZwpkzZwT/dTgc/sjMNhrUNNjtMyOH0seT6jgtYqWOum3B+vXre/r7+wsuXbo0qTbJa3R0lJqaGk6fPo3P5/sqFApJLpUq6q4akeVxXQte6XNHDJDi5Pt8vmdDodDRpqYmgsHgjPA+n49Tp05Z+CNmNBCwNF7AMsB+/0pj0+q4qephphpQt51sVn6/f9fx48cPxeNx1qxZc9s7xsbGqK2tpbW1dTq85nopjTxvva2CFbQ95qyAU9WAcl+58qjf7393YGDgCaVIY6P60K2l0aGuro6WlhYZEW5ubtaIIHjNNvK+xgN5fTrsnIKnGiXsrFOwcePGUCQSeayqqor29nYOHjzIzp076enp4cCBA1y8eNHCK23seGBTJxneiSKmdU9yCkk69VW1HLgieBXnpk2bJo2wa926daOrV68Oh0KhD8zHiNLmjsPPlEIyQN+0hdu3bz924sSJchuBmpqay4lEom1oaOjHs2fPnjcjwV/mrNnG0/5OWu6f4ZPSRqAAeKaysnJfV1dXSUVFxZXu7u5PAO3lCFYSac+Sx5lyPl0mV88lp5CtgTwz8+usCVQFKEjBCt5CS2k8bw+6Ik66OdkAXU9+oJtGpmampiYDBKs00SFoFaqVRi8Mnp5N1QfshqzOdkPWNiQLnhFZdGtNqmHO7vsI3i55226Lu/2djN3v9IMmYwBeX/wvm6rTQFcM4lMAAAAASUVORK5CYII=') 1.5x) 4 28, auto;
                box-sizing: border-box;
            }
        }

        >.controller {
            width: 100%;
            height: 46px;
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 8px 12px;
            box-sizing: border-box;
            justify-content: space-around;

            >.sliders-container {
                width: v-bind('LINE_LENGTH_CSS');
                height: 32px;

                >.hue {
                    position: relative;
                    width: 100%;
                    height: 8px;
                    background: linear-gradient(90deg, #f00 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00);
                    border-radius: 5px 5px 5px 5px;
                    cursor: pointer;

                    >.hueIndicator {
                        top: -2px;
                        width: v-bind('DOT_SIZE_CSS');
                        height: v-bind('DOT_SIZE_CSS');
                        border-radius: 50%;
                        border: 2px solid #fff;
                        position: absolute;
                        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .2), 0 0 0 1px rgba(0, 0, 0, .2);
                        box-sizing: border-box;
                    }
                }

                >.alpha-bacground {
                    margin-top: 8px;
                    width: 100%;
                    height: 8px;
                    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
                    background-size: auto 75%;
                    border-radius: 5px 5px 5px 5px;
                    cursor: pointer;
                    box-sizing: border-box;

                    >.alpha {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        border-radius: 5px 5px 5px 5px;

                        >.alphaIndicator {
                            top: -2px;
                            width: v-bind('DOT_SIZE_CSS');
                            height: v-bind('DOT_SIZE_CSS');
                            border-radius: 50%;
                            border: 2px solid #fff;
                            position: absolute;
                            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .2), 0 0 0 1px rgba(0, 0, 0, .2);
                            box-sizing: border-box;
                        }
                    }

                }
            }

            >.eyedropper {
                width: 30px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 2px;
                transition: 0.1s;
                padding: 6px;
                box-sizing: border-box;

                >svg {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }
            }
        }

        .input-container {
            width: 100%;
            height: 80px;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 12px;
            box-sizing: border-box;
            justify-content: space-between;

            .model {
                flex: 0 0 62px;
                height: 32px;
            }

            .values {
                width: 160px;

                .wrap {
                    width: 160px;
                    height: 100%;
                    box-sizing: border-box;

                    .value {
                        width: 160px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        background-color: #F5F5F5;
                        border-radius: 6px;
                        padding: 9px 5px;
                        box-sizing: border-box;

                        .item {
                            height: 100%;
                            width: 25%;
                            text-align: center;

                            >input {
                                width: 100%;
                                height: 100%;
                                border: none;
                                outline: none;
                                text-align: center;
                                padding: 0;
                                background-color: transparent;
                                font-size: 13px;
                                font-weight: 500;
                                line-height: 14px;
                                color: #000000;
                            }
                        }
                    }

                    .label {
                        width: 160px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        padding: 5px;
                        box-sizing: border-box;

                        .item {
                            height: 100%;
                            width: 25%;
                            font-size: 12px;
                            font-weight: 500;
                            color: #8C8C8C;
                            align-items: center;
                            display: flex;
                            justify-content: center;
                        }
                    }
                }
            }
        }

        >.recently-container {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 12px;
            box-sizing: border-box;
            border-top: 1px solid #EBEBEB;
            border-bottom: 1px solid #EBEBEB;

            .inner {
                //border-top: 1px solid #cecece;
                width: 100%;

                .header {
                    width: 48px;
                    height: 14px;
                    font-family: HarmonyOS Sans;
                    font-size: 12px;
                    font-weight: 500;
                    line-height: 14px;
                    color: #000000;
                    margin-bottom: 12px;
                }

                >.typical-container {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    box-sizing: border-box;

                    >.block {
                        width: 16px;
                        height: 16px;
                        border-radius: 3px;
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        cursor: -webkit-image-set(url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABV9JREFUaEPtmG1oVXUcxz8+zpZbLgcuTHDOF6OYsGoTI3IyMG14Hex67waJFERBqdALfZNDDLIoexG9qCjyTTBQat7bwoXMXRTntm4OFnIFr2srkPWc7VG7M77z/1/zsrvOuWdXEe4fDmdnnHPu5/f0/f3Ofx73+Jp3j/OTNeBuRzAbgWwEPHogm0IeHej58WwEPLvQ4wuyEfDoQM+PZyPg2YUeX3AnIqDfmH4I+aY5JjzyZ3wanQ8sNMciQNeCTwD/ADfM3/pfWiuTERDsYmAJ8BDQBDwM/A58B+wGRoExY0xaRmTKgAUGPhd4HAib6+le7gJqgSFjiCLiemXCAAt/P/Ak0GxqYCa4o8B+4BowbtLLlRFzbYDgcwDBPw0cmwVeoD8BT5m0GjH1cFcMkCOs55cC1cDn/wMv0D+BSuAXk0qu0yjdCCRLoy1YeX4r8JlDN8ZMHfwM/G2K2eGjt25LxwArjfL4I8BlQBK5pKys7FBvb+/zDgmkQLuAKPCbiYDk1dVKxwDBSh7l5TLgVeVyeXn5hxcuXKhy+OvS/zeBL036KJUkp64bWzoGCP4+IAB8DMRLS0uvxWKxcofwyvN3jDr9CvwBDJum5roXuDVA91uVeQDwFxcXv93X1+eQfdLD703zvIWXhLr2fjo1oPxXZxX88rq6uj0tLS0vjo+Pc/OmI+cJ/gvAel5NTPCuc996zG0ElP/qrg8Gg8G9J0+e3LNy5cp5hw8fZseOHVy/fn22SLxv+sJ0eOV92vBuI6ChTN7Pa2ho2N3a2rq/qKhofkdHB/n5+USjUTZs2MCNG6rP21dJSUkkHo83moLVLGQ971r3k9/tNAKCV+4vra+vf7mtra2xsLBwCt6+VLWwdu1aJib+S+fS0tLeWCy2F5DWC96ODZ7hnUZgCr6hoeGFSCTyxrJlyxZYzyd75OrVq6xatYpEIkFxcfEPfX19rwCDxgDJpfR/TuCdGDAFHwgEnuvo6HgrLy9vYSr44eFhqqur6ezsZMWKFQwODg4ArwPdpnDVbVUojireibTNlkJTg1kwGKzv7Ow8kpubu2g2+M2bN3Pu3Dm2bdv2TTgc/h54TX0CeAn41uj9nHl/tgjIMDWspYFAYGs0Gv00JydncSr4kZERtmzZwpkzZwT/dTgc/sjMNhrUNNjtMyOH0seT6jgtYqWOum3B+vXre/r7+wsuXbo0qTbJa3R0lJqaGk6fPo3P5/sqFApJLpUq6q4akeVxXQte6XNHDJDi5Pt8vmdDodDRpqYmgsHgjPA+n49Tp05Z+CNmNBCwNF7AMsB+/0pj0+q4qephphpQt51sVn6/f9fx48cPxeNx1qxZc9s7xsbGqK2tpbW1dTq85nopjTxvva2CFbQ95qyAU9WAcl+58qjf7393YGDgCaVIY6P60K2l0aGuro6WlhYZEW5ubtaIIHjNNvK+xgN5fTrsnIKnGiXsrFOwcePGUCQSeayqqor29nYOHjzIzp076enp4cCBA1y8eNHCK23seGBTJxneiSKmdU9yCkk69VW1HLgieBXnpk2bJo2wa926daOrV68Oh0KhD8zHiNLmjsPPlEIyQN+0hdu3bz924sSJchuBmpqay4lEom1oaOjHs2fPnjcjwV/mrNnG0/5OWu6f4ZPSRqAAeKaysnJfV1dXSUVFxZXu7u5PAO3lCFYSac+Sx5lyPl0mV88lp5CtgTwz8+usCVQFKEjBCt5CS2k8bw+6Ik66OdkAXU9+oJtGpmampiYDBKs00SFoFaqVRi8Mnp5N1QfshqzOdkPWNiQLnhFZdGtNqmHO7vsI3i55226Lu/2djN3v9IMmYwBeX/wvm6rTQFcM4lMAAAAASUVORK5CYII=') 1.5x) 4 28, auto;
                        box-sizing: border-box;
                    }

                    >.block:not(:first-child) {
                        margin-left: 6.2px;
                    }
                }
            }
        }

        >.dc-container {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 12px 2px 2px 12px;
            box-sizing: border-box;

            .inner {
                //border-top: 1px solid #cecece;
                width: 100%;

                .header {
                    // width: 48px;
                    height: 14px;
                    font-family: HarmonyOS Sans;
                    font-size: 12px;
                    font-weight: 500;
                    line-height: 14px;
                    color: #000000;
                    margin-bottom: 12px;
                }

                >.documentc-container {
                    width: 100%;
                    max-height: 90px;
                    overflow: scroll;
                    display: grid;
                    grid-row-gap: 7px;
                    grid-column-gap: 7px;
                    grid-template-columns: repeat(auto-fill, 16px);

                    &::-webkit-scrollbar {
                        width: 5px;
                    }

                    &::-webkit-scrollbar-track {
                        background-color: none;
                    }

                    &::-webkit-scrollbar-thumb {
                        background-color: #EBEBEB;
                        border-radius: 150px;
                    }

                    &::-webkit-scrollbar-thumb:hover {
                        background-color: none;
                    }

                    &::-webkit-scrollbar-thumb:active {
                        background-color: none;
                    }

                    >.block {
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        border-radius: 3px;
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        cursor: -webkit-image-set(url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABV9JREFUaEPtmG1oVXUcxz8+zpZbLgcuTHDOF6OYsGoTI3IyMG14Hex67waJFERBqdALfZNDDLIoexG9qCjyTTBQat7bwoXMXRTntm4OFnIFr2srkPWc7VG7M77z/1/zsrvOuWdXEe4fDmdnnHPu5/f0/f3Ofx73+Jp3j/OTNeBuRzAbgWwEPHogm0IeHej58WwEPLvQ4wuyEfDoQM+PZyPg2YUeX3AnIqDfmH4I+aY5JjzyZ3wanQ8sNMciQNeCTwD/ADfM3/pfWiuTERDsYmAJ8BDQBDwM/A58B+wGRoExY0xaRmTKgAUGPhd4HAib6+le7gJqgSFjiCLiemXCAAt/P/Ak0GxqYCa4o8B+4BowbtLLlRFzbYDgcwDBPw0cmwVeoD8BT5m0GjH1cFcMkCOs55cC1cDn/wMv0D+BSuAXk0qu0yjdCCRLoy1YeX4r8JlDN8ZMHfwM/G2K2eGjt25LxwArjfL4I8BlQBK5pKys7FBvb+/zDgmkQLuAKPCbiYDk1dVKxwDBSh7l5TLgVeVyeXn5hxcuXKhy+OvS/zeBL036KJUkp64bWzoGCP4+IAB8DMRLS0uvxWKxcofwyvN3jDr9CvwBDJum5roXuDVA91uVeQDwFxcXv93X1+eQfdLD703zvIWXhLr2fjo1oPxXZxX88rq6uj0tLS0vjo+Pc/OmI+cJ/gvAel5NTPCuc996zG0ElP/qrg8Gg8G9J0+e3LNy5cp5hw8fZseOHVy/fn22SLxv+sJ0eOV92vBuI6ChTN7Pa2ho2N3a2rq/qKhofkdHB/n5+USjUTZs2MCNG6rP21dJSUkkHo83moLVLGQ971r3k9/tNAKCV+4vra+vf7mtra2xsLBwCt6+VLWwdu1aJib+S+fS0tLeWCy2F5DWC96ODZ7hnUZgCr6hoeGFSCTyxrJlyxZYzyd75OrVq6xatYpEIkFxcfEPfX19rwCDxgDJpfR/TuCdGDAFHwgEnuvo6HgrLy9vYSr44eFhqqur6ezsZMWKFQwODg4ArwPdpnDVbVUojireibTNlkJTg1kwGKzv7Ow8kpubu2g2+M2bN3Pu3Dm2bdv2TTgc/h54TX0CeAn41uj9nHl/tgjIMDWspYFAYGs0Gv00JydncSr4kZERtmzZwpkzZwT/dTgc/sjMNhrUNNjtMyOH0seT6jgtYqWOum3B+vXre/r7+wsuXbo0qTbJa3R0lJqaGk6fPo3P5/sqFApJLpUq6q4akeVxXQte6XNHDJDi5Pt8vmdDodDRpqYmgsHgjPA+n49Tp05Z+CNmNBCwNF7AMsB+/0pj0+q4qephphpQt51sVn6/f9fx48cPxeNx1qxZc9s7xsbGqK2tpbW1dTq85nopjTxvva2CFbQ95qyAU9WAcl+58qjf7393YGDgCaVIY6P60K2l0aGuro6WlhYZEW5ubtaIIHjNNvK+xgN5fTrsnIKnGiXsrFOwcePGUCQSeayqqor29nYOHjzIzp076enp4cCBA1y8eNHCK23seGBTJxneiSKmdU9yCkk69VW1HLgieBXnpk2bJo2wa926daOrV68Oh0KhD8zHiNLmjsPPlEIyQN+0hdu3bz924sSJchuBmpqay4lEom1oaOjHs2fPnjcjwV/mrNnG0/5OWu6f4ZPSRqAAeKaysnJfV1dXSUVFxZXu7u5PAO3lCFYSac+Sx5lyPl0mV88lp5CtgTwz8+usCVQFKEjBCt5CS2k8bw+6Ik66OdkAXU9+oJtGpmampiYDBKs00SFoFaqVRi8Mnp5N1QfshqzOdkPWNiQLnhFZdGtNqmHO7vsI3i55226Lu/2djN3v9IMmYwBeX/wvm6rTQFcM4lMAAAAASUVORK5CYII=') 1.5x) 4 28, auto;
                        box-sizing: border-box;
                    }
                }
            }
        }
    }
}
</style>
