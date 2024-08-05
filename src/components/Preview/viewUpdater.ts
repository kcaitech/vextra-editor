import { ColVector3D, Matrix, OverlayPositions, Page, PrototypeActions, PrototypeNavigationType, PrototypeTransitionType, Shape, ShapeView, makeShapeTransform2By1 } from "@kcdesign/data";
import { Context } from "@/context";
import PageCard from "@/components/common/PageCard.vue";
import { debounce } from "lodash";
import { is_mac, XYsBounding } from "@/utils/common";
import { Menu } from "@/context/menu";
import { Preview } from "@/context/preview";
import { getFrameList, getPreviewMatrix, viewBox } from "@/utils/preview";
import { nextTick } from "vue";
import { toStyle } from "@/utils/message";
import { opacity } from "@/assets/lang/zh";

type PCard = InstanceType<typeof PageCard>;

type Box = {
    top: number,
    bottom: number,
    left: number,
    right: number
}

/**
 * @description 播放视图渲染管理器
 */
export class ViewUpdater {
    private readonly m_context: Context;

    private m_current_page: Page | undefined; // 当前页
    private m_current_view: ShapeView | undefined; // 当前播放对象
    private m_page_card: PCard | undefined; // 渲染卡片

    private matrix: Matrix = new Matrix();
    private m_container: HTMLDivElement | undefined; // 整个黑盒子

    private m_image_map: Map<string, string> = new Map(); // todo 缓存，使列表流畅
    private m_dirty_target: Map<string, Shape> = new Map();

    private m_lazy_updater: DirtyCleaner;

    constructor(context: Context) {
        this.m_context = context;

        this.m_lazy_updater = new DirtyCleaner(context, this.m_image_map, this.m_dirty_target);
    }

    get lazyLoader() {
        return this.m_lazy_updater;
    }

    get v_matrix() {
        return this.matrix;
    }

    get pageCard() {
        return this.m_page_card;
    }

    setPageCard(card: PCard | undefined) {
        this.m_page_card = card;
    }

    get currentPage() {
        return this.m_context.selection.selectedPage;
    }

    // 停止监听播放对象内部元素(子孙元素)变化
    private m_stop_last_bubble: () => void = () => {
    };
    // 停止监听播放对象的变化
    private m_stop_last: () => void = () => {
    };

    private m_stop_last_on_page: () => void = () => {
    };

    /**
     * @description 监听播放对象的变化
     * @param args
     */
    private updater(...args: any[]) {
        // console.log('__UPDATE_SELF__', ...args, args);
        this.update(...args);
    }

    /**
     * @description 监听播放对象内部元素(子孙元素)变化
     */
    private updaterBubble(...args: any[]) {
        // console.log('__UPDATE_FROM_BUBBLE__', ...args, args);
        this.update(...args);
    }

    /**
     * @description page的变化，有可能导致整个坐标系发生改变，此时应该让播放对象抵消这个改变，避免位移
     */
    private updater4Page(...args: any[]) {
    }

    setAttri(m: Matrix) {
        const shape = this.m_current_view;
        const container = this.m_container;
        if (!shape || !container || !this.m_page_card || !this.m_page_card.pageSvg) {
            return;
        }

        const frame = shape.frame;

        const svgEl = (this.m_page_card.pageSvg as SVGSVGElement);
        svgEl.setAttribute('viewBox', `0 0 ${frame.width} ${frame.height}`);
        svgEl.setAttribute('width', `${frame.width}`);
        svgEl.setAttribute('height', `${frame.height}`);
        svgEl.style['transition'] = ''
        svgEl.style['transform'] = m.toString();
        svgEl.style.zIndex = '0';
        svgEl.style.opacity = '1';
        this.m_context.preview.setScale(this.getScale(m));
        this.overlayBox();
        this.matrix.reset(m);
        this.m_context.preview.notify(Preview.MATRIX_CHANGE);
    }

    private getCenterMatrix() {
        const shape = this.m_current_view;
        const container = this.m_container;
        const page = this.m_current_page;
        if (!shape || !container || !this.m_page_card || !page) {
            return new Matrix();
        }
        const transformMatrix = new Matrix();
        const shape_root_m = shape.matrix2Root();
        shape_root_m.trans(-page.transform.translateX, -page.transform.translateY);
        const m = makeShapeTransform2By1(shape_root_m).clone(); // 图层到root
        const clientTransform = makeShapeTransform2By1(transformMatrix);

        m.addTransform(clientTransform); //root到视图

        const { width, height } = shape.size;
        const { col0: lt, col1: rt, col2: rb, col3: lb } = m.transform([
            ColVector3D.FromXY(0, 0),
            ColVector3D.FromXY(width, 0),
            ColVector3D.FromXY(width, height),
            ColVector3D.FromXY(0, height)
        ]);
        const box = XYsBounding([lt, rt, rb, lb]);

        const root = container.getBoundingClientRect();

        const cx = (box.right + box.left) / 2;
        const cy = (box.bottom + box.top) / 2;

        const rootCX = root.width / 2;
        const rootCY = root.height / 2;
        transformMatrix.trans(rootCX - cx, rootCY - cy);

        return transformMatrix;
    }

    getBoundingBox(toClient = false) {
        const shape = this.m_current_view;
        const container = this.m_container;

        if (!shape || !container || !this.m_page_card) {
            return;
        }

        const frame = shape.frame;
        const m = new Matrix(shape.matrix2Parent());
        m.trans(-frame.x, -frame.y);

        if (toClient) {
            m.multiAtLeft(this.matrix);
        }

        const points = [
            m.computeCoord2(0, 0),
            m.computeCoord2(frame.width, 0),
            m.computeCoord2(frame.width, frame.height),
            m.computeCoord2(0, frame.height)
        ];

        const box = XYsBounding(points);

        return { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top };
    }

    private __update(...args: any[]) {
        (this.m_page_card as any)?.repaint() // 执行PreviewPageCard内部重绘函数

        if (args.includes('frame') || args.includes('rotation') || args.includes('transform')) {
            this.modifyTransform();
        }
    }

    // __update属于播放对象的全量绘制，消耗比较大
    private update = debounce(this.__update, 300);

    private getScale(m?: Matrix) {
        let __m: any = (m || this.matrix).toArray();
        __m[4] = 0;
        __m[5] = 0;
        __m = new Matrix(__m);

        const xy = __m.computeCoord2(1, 0);

        return Math.hypot(xy.x, xy.y);
    }

    modifyTransformToFit() {
        const shape = this.m_current_view;
        const container = this.m_container;

        if (!shape || !container || !this.m_page_card) {
            return;
        }
        const box = this.getBoundingBox()!;
        const boxWidth = box.width;
        const boxHeight = box.height;

        const root = container.getBoundingClientRect();
        const rootWidth = root.width;
        const rootHeight = root.height;

        const ratio_w = boxWidth / rootWidth * 1.06;
        const ratio_h = boxHeight / rootHeight * 1.12;

        const ratio = Math.max(ratio_h, ratio_w);

        const max = 256;
        const min = 0.02;
        let scale = 1 / ratio;
        if (scale < min) {
            scale = min;
        } else if (scale > max) {
            scale = max;
        }

        const matrix = this.getCenterMatrix();
        matrix.trans(-rootWidth / 2, -rootHeight / 2);
        matrix.scale(scale);
        matrix.trans(rootWidth / 2, rootHeight / 2);
        this.setAttri(matrix);
    }

    modifyTransformToFill() {
        const shape = this.m_current_view;
        const container = this.m_container;

        if (!shape || !container || !this.m_page_card) {
            return;
        }
        const box = this.getBoundingBox()!;
        const boxWidth = box.width;
        const boxHeight = box.height;

        const root = container.getBoundingClientRect();
        const rootWidth = root.width;
        const rootHeight = root.height;

        const ratio_w = boxWidth / rootWidth;
        const ratio_h = boxHeight / rootHeight;

        const ratio = Math.min(ratio_h, ratio_w);

        const max = 256;
        const min = 0.02;
        let scale = 1 / ratio;
        if (scale < min) {
            scale = min;
        } else if (scale > max) {
            scale = max;
        }

        const matrix = this.getCenterMatrix();
        matrix.trans(-rootWidth / 2, -rootHeight / 2);
        matrix.scale(scale);
        matrix.trans(rootWidth / 2, rootHeight / 2);

        if (ratio_w > ratio_h) {
            matrix.trans((box.width * scale - rootWidth) / 2, 0);
        } else {
            matrix.trans(0, (box.height * scale - rootHeight) / 2);
        }

        this.setAttri(matrix);
    }

    modifyTransformToFillByWidth() {
        const shape = this.m_current_view;
        const container = this.m_container;

        if (!shape || !container || !this.m_page_card) {
            return;
        }
        const box = this.getBoundingBox()!;
        const boxWidth = box.width;

        const root = container.getBoundingClientRect();
        const rootWidth = root.width;
        const rootHeight = root.height;

        const ratio = boxWidth / rootWidth;

        const max = 256;
        const min = 0.02;
        let scale = 1 / ratio;
        if (scale < min) {
            scale = min;
        } else if (scale > max) {
            scale = max;
        }

        const matrix = this.getCenterMatrix();
        matrix.trans(-rootWidth / 2, -rootHeight / 2);
        matrix.scale(scale);
        matrix.trans(rootWidth / 2, rootHeight / 2);
        this.setAttri(matrix);
    }

    mount(container: HTMLDivElement, page: Page, current: ShapeView | undefined, pageCard: PCard | undefined) {
        this.m_container = container;

        this.m_current_page = page;
        this.m_current_view = current;
        this.m_page_card = pageCard;

        if (!this.m_current_view) {
            return
        }

        // 填装监听函数
        const bubble = this.updaterBubble.bind(this);
        const updater = this.updater.bind(this);

        this.m_stop_last = this.m_current_view.watch(updater);
        this.m_stop_last_bubble = this.m_current_view.data.bubblewatch(bubble);

        if (!this.m_current_page) {
            return;
        }
        this.m_stop_last_on_page = this.m_current_page.watch(this.updater4Page.bind(this));
    }

    /**
     * @description 切换播放对象
     */
    atTarget(shape?: ShapeView) {
        // console.log("__TARGET__", shape?.name);

        if (shape && (shape.id === this.m_current_view?.id)) {
            // 无效切换
            return;
        }

        this.m_stop_last(); // 先把上一个播放对象的监听给闭了
        this.m_stop_last_bubble();

        this.m_current_view = shape;

        if (!this.m_current_view) {
            return;
        }

        // 填装当前播放对象的监听函数
        const bubble = this.updaterBubble.bind(this);
        const updater = this.updater.bind(this);

        this.m_stop_last = this.m_current_view.watch(updater);
        this.m_stop_last_bubble = this.m_current_view.data.bubblewatch(bubble);
    }

    /**
     * @description 切换页面
     */
    atPage(page?: Page) {
        // console.log("__PAGE__", page?.name);
        if (page && (page.id === this.m_current_page?.id)) {
            // 无效切换
            return;
        }

        this.m_stop_last_on_page();

        this.m_current_page = page;

        if (!this.m_current_page) {
            return;
        }

        this.m_stop_last_on_page = this.m_current_page.watch(this.updater4Page.bind(this));
    }

    /**
     * @description 修改播放对象的transform(原比例);
     */
    modifyTransform() {
        const shape = this.m_current_view;
        const container = this.m_container;

        if (!shape || !container || !this.m_page_card) {
            return;
        }

        const matrix = this.getCenterMatrix();

        this.setAttri(matrix);
    }

    modifyTransformKeepScale() {
        const scale = this.getScale();
        if (scale === 1) {
            return this.modifyTransform();
        }
        const shape = this.m_current_view;
        const container = this.m_container;

        if (!shape || !container || !this.m_page_card) {
            return;
        }

        const rootBox = container.getBoundingClientRect();

        const matrix = this.getCenterMatrix();
        const rcx = rootBox.width / 2;
        const rcy = rootBox.height / 2;
        matrix.trans(-rcx, -rcy);
        matrix.scale(scale);
        matrix.trans(rcx, rcy);

        this.setAttri(matrix);
    }

    private MAX = 25600;
    private MIN = 2;

    scale(e: WheelEvent) {
        const MAX = this.MAX;
        const MIN = this.MIN;

        let scale_delta = 1.3;
        if (Math.abs(e.deltaY) < 16 && Math.abs(e.deltaX) < 16) {
            scale_delta = 1.12;
        }
        const scale = Number((this.m_context.preview.scale * 100).toFixed(0));
        let scale_delta_ = 1 / scale_delta;
        if (scale <= MIN) {
            scale_delta_ = 1
        } else if (scale >= MAX) {
            scale_delta = MAX / scale;
        }

        const shape = this.m_current_view;
        const container = this.m_container;
        if (!shape || !container || !this.m_page_card) {
            return;
        }

        const targetBox = this.getBoundingBox()!;
        const rootBox = container.getBoundingClientRect();

        const rcx = rootBox.width / 2;
        const rcy = rootBox.height / 2;

        const matrix = this.matrix;

        const __s = this.m_context.preview.scale;
        const __scale = Math.sign(e.deltaY) <= 0 ? Math.min(scale_delta * __s, 256) : Math.max(scale_delta_ * __s, 0.02);

        if ((targetBox.width * __s) > rootBox.width && (targetBox.height * __s) > rootBox.height) {
            const offsetX = e.x - rootBox.x;
            const offsetY = e.y - rootBox.y;
            matrix.trans(-offsetX, -offsetY);
            matrix.scale(Math.sign(e.deltaY) <= 0 ? scale_delta : scale_delta_);
            matrix.trans(offsetX, offsetY);
        } else {
            matrix.reset(this.getCenterMatrix());
            matrix.trans(-rcx, -rcy);
            matrix.scale(__scale);
            matrix.trans(rcx, rcy);
        }

        this.setAttri(matrix);

        this.m_context.preview.setScaleMenu(undefined);
    }

    keyScale(s: number) {
        const shape = this.m_current_view;
        const container = this.m_container;
        if (!shape || !container || !this.m_page_card) {
            return;
        }

        const rootBox = container.getBoundingClientRect();

        const rcx = rootBox.width / 2;
        const rcy = rootBox.height / 2;

        const matrix = this.matrix;

        matrix.reset(this.getCenterMatrix());
        matrix.trans(-rcx, -rcy);
        matrix.scale(s > 0 ? Math.min(this.m_context.preview.scale + s, 256) : Math.max(this.m_context.preview.scale + s, 0.02));
        matrix.trans(rcx, rcy);

        this.setAttri(matrix);

        this.m_context.preview.setScaleMenu(undefined);
    }

    getBoundingOnView() {
        const shape = this.m_current_view;
        const container = this.m_container;
        const page = this.m_current_page;
        if (!shape || !container || !this.m_page_card || !page) {
            return;
        }
        const shape_root_m = shape.matrix2Root();
        shape_root_m.trans(-page.transform.translateX, -page.transform.translateY);
        const m = makeShapeTransform2By1(shape_root_m).clone(); // 图层到root
        const clientTransform = makeShapeTransform2By1(this.matrix);

        m.addTransform(clientTransform); //root到视图

        const { width, height } = shape.size;
        const { col0: lt, col1: rt, col2: rb, col3: lb } = m.transform([
            ColVector3D.FromXY(0, 0),
            ColVector3D.FromXY(width, 0),
            ColVector3D.FromXY(width, height),
            ColVector3D.FromXY(0, height)
        ]);
        const box = XYsBounding([lt, rt, rb, lb]);

        return box;
    }

    trans(e: WheelEvent) {
        const MAX_STEP = 120;

        const shape = this.m_current_view;
        const container = this.m_container;
        if (!shape || !container || !this.m_page_card) {
            return;
        }

        const root = container.getBoundingClientRect();
        let stepx = Math.abs(e.deltaX) > MAX_STEP ? (MAX_STEP * (e.deltaX / Math.abs(e.deltaX))) : e.deltaX;
        let stepy = Math.abs(e.deltaY) > MAX_STEP ? (MAX_STEP * (e.deltaY / Math.abs(e.deltaY))) : e.deltaY;
        if (e.shiftKey && !is_mac() && e.deltaX < 1) {
            stepx = stepy;
            stepy = 0;
        }

        const bound = this.getBoundingOnView()!;

        const left = bound.left;
        const top = bound.top;
        const right = bound.right;
        const bottom = bound.bottom;

        if (left < 0) {
            if (left > stepx) stepx = left;
        }
        if (left >= 0 && stepx < 0) stepx = 0;
        if (top < 0) {
            if (top > stepy) stepy = top;
        }
        if (top >= 0 && stepy < 0) stepy = 0;

        if (right > root.width) {
            if ((right - root.width) < stepx) stepx = right - root.width;
        }
        if (right <= root.width && stepx > 0) stepx = 0;
        if (bottom > root.height) {
            if ((bottom - root.height) < stepy) stepy = bottom - root.height;
        }
        if (bottom <= root.height && stepy > 0) stepy = 0;

        this.matrix.trans(-stepx, -stepy);

        this.setAttri(this.matrix);
    }

    artboardInTrans() {
        const shape = this.m_current_view;
        const container = this.m_container;
        if (!shape || !container || !this.m_page_card) {
            return true;
        }

        const root = container.getBoundingClientRect();
        let stepx = this.m_context.preview.artboardScrollOffset.x;
        let stepy = this.m_context.preview.artboardScrollOffset.y;

        const bound = this.getBoundingOnView()!;

        const left = bound.left;
        const top = bound.top;
        const right = bound.right;
        const bottom = bound.bottom;

        if (left < 0) {
            if (left > stepx) stepx = left;
        }
        if (left >= 0 && stepx < 0) stepx = 0;
        if (top < 0) {
            if (top > stepy) stepy = top;
        }
        if (top >= 0 && stepy < 0) stepy = 0;

        if (right > root.width) {
            if ((right - root.width) < stepx) stepx = right - root.width;
        }
        if (right <= root.width && stepx > 0) stepx = 0;
        if (bottom > root.height) {
            if ((bottom - root.height) < stepy) stepy = bottom - root.height;
        }
        if (bottom <= root.height && stepy > 0) stepy = 0;

        this.matrix.trans(-stepx, -stepy);

        this.setAttri(this.matrix);
        if (stepx === stepy && stepx === 0) {
            return true;
        }
    }

    overlayBox(s?: ShapeView) {
        const shape = s || this.m_current_view;
        if (!shape) {
            return;
        }

        const over_el = document.querySelector('.preview_overlay') as HTMLDivElement;
        if (over_el) {
            const frame = shape.frame;
            const _m = getPreviewMatrix(shape);
            const matrix = new Matrix(this.v_matrix.clone());
            _m.multiAtLeft(matrix);
            const points = [[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => _m.computeCoord(p[0], p[1]));
            const box = XYsBounding(points);
            over_el.style.clipPath = `polygon(
                0 0, 
                100% 0, 
                100% 100%, 
                0 100%, 
                0 ${box.top}px, 
                ${box.left}px ${box.top}px, 
                ${box.left}px ${box.bottom}px, 
                ${box.right}px ${box.bottom}px, 
                ${box.right}px ${box.top}px, 
                100% ${box.top}px, 
                0 ${box.top}px
            )`
        }
    }

    updateViewBox(context: Context, shape: ShapeView, type: PrototypeNavigationType | undefined, box: { top: number, bottom: number, left: number, right: number }) {
        const cur_shape = context.selection.selectedShapes[0];
        if (!cur_shape) return;
        const cur_frame = cur_shape.frame;
        const m = new Matrix()
        m.reset(this.v_matrix);
        if (type === PrototypeNavigationType.OVERLAY || type === PrototypeNavigationType.SWAP || type === PrototypeNavigationType.NAVIGATE) {
            let s: ShapeView | undefined = shape;
            const frame = shape.frame;
            const cur_box = viewBox(this.v_matrix, shape);
            if (type === PrototypeNavigationType.SWAP) {
                const before_action = context.preview.swapEndAction;
                if (!before_action) return;
                s = this.getCurLayerShape(context, before_action.targetNodeID);
            }
            if (!s) return;
            const scale = this.v_matrix.m00;
            const { left, right, top, bottom } = s.overlayPositionType ? s.overlayPositionType.margin : { left: 0, right: 0, top: 0, bottom: 0 }
            m.trans((cur_frame.x - frame.x) * scale, (cur_frame.y - frame.y) * scale);
            if (s.overlayPositionType?.position === OverlayPositions.CENTER || !s.overlayPositionType) {
                const c_x = (frame.width * scale) / 2;
                const c_y = (frame.height * scale) / 2;
                const v_center = { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 }
                m.trans(v_center.x - (box.left + c_x), v_center.y - (box.top + c_y));
            } else if (s.overlayPositionType.position === OverlayPositions.TOPCENTER) {
                const c_x = (frame.width * scale) / 2;
                const v_centerx = (box.left + box.right) / 2
                m.trans(v_centerx - (box.left + c_x), top);
            } else if (s.overlayPositionType.position === OverlayPositions.TOPRIGHT) {
                const r = (frame.width * scale) + box.left;
                m.trans((box.right - r) - right, top);
            } else if (s.overlayPositionType.position === OverlayPositions.CENTERLEFT) {
                const c_y = (frame.height * scale) / 2;
                const v_centery = (box.top + box.bottom) / 2
                m.trans(left, v_centery - (box.top + c_y));
            } else if (s.overlayPositionType.position === OverlayPositions.CENTERRIGHT) {
                const c_y = (frame.height * scale) / 2;
                const v_centery = (box.top + box.bottom) / 2
                const r = (frame.width * scale) + box.left;
                m.trans((box.right - r) - right, v_centery - (box.top + c_y));
            } else if (s.overlayPositionType.position === OverlayPositions.BOTTOMCENTER) {
                const c_x = (frame.width * scale) / 2;
                const v_centerx = (box.left + box.right) / 2
                const b = (frame.height * scale) + box.top;
                m.trans(v_centerx - (box.left + c_x), (box.bottom - b) - bottom);
            } else if (s.overlayPositionType.position === OverlayPositions.BOTTOMLEFT) {
                const b = (frame.height * scale) + box.top;
                m.trans(left, (box.bottom - b) - bottom);
            } else if (s.overlayPositionType.position === OverlayPositions.BOTTOMRIGHT) {
                const r = (frame.width * scale) + box.left;
                const b = (frame.height * scale) + box.top;
                m.trans((box.right - r) - right, (box.bottom - b) - bottom);
            } else {
                m.trans(left, top);
            }
        }
        return m;
    }
    readyPosition(matrix: Matrix, shape: ShapeView, type: PrototypeTransitionType | undefined) {
        const m = new Matrix(matrix.clone());
        if (!type) return m;
        const select_shape = this.m_context.selection.selectedShapes[0];
        const box = viewBox(this.v_matrix, select_shape);
        const cur_box = viewBox(matrix, shape);
        const animate_type = type.split('_');
        const direction = animate_type.at(-1);
        if (animate_type.includes('FROM')) {
            if (direction === 'RIGHT') {
                const trans = box.right - cur_box.left;
                m.trans(-trans, 0);
            } else if (direction === 'LEFT') {
                const trans = cur_box.right - box.left;
                m.trans(trans, 0);
            } else if (direction === 'TOP') {
                const trans = cur_box.bottom - box.top;
                m.trans(0, trans);
            } else if (direction === 'BOTTOM') {
                const trans = box.bottom - cur_box.top;
                m.trans(0, -trans);
            }
        } else if (animate_type.includes('SLIDE') && animate_type.includes('OUT')) {
            const w = (box.right - box.left) * 0.3;
            const h = (box.bottom - box.top) * 0.3;
            if (direction === 'RIGHT') {
                const trans = (box.right - cur_box.right) - w;
                m.trans(trans, 0);
            } else if (direction === 'LEFT') {
                const trans = (cur_box.left - box.left) + w;
                m.trans(trans, 0);
            } else if (direction === 'TOP') {
                const trans = (cur_box.top - box.top) + h;
                m.trans(0, trans);
            } else if (direction === 'BOTTOM') {
                const trans = (box.bottom - cur_box.bottom) - h;
                m.trans(0, trans);
            }
        }
        return m;
    }
    backReadyPosition(matrix: Matrix, shape: ShapeView, type: PrototypeTransitionType | undefined) {
        const m = new Matrix(matrix.clone());
        if (!type) return m;
        const select_shape = this.m_context.selection.selectedShapes[0];
        const box = viewBox(this.v_matrix, select_shape);
        const cur_box = viewBox(matrix, shape);
        const animate_type = type.split('_');
        const direction = animate_type.at(-1);
        if (animate_type.includes('SLIDE') && animate_type.includes('FROM')) {
            const w = (box.right - box.left) * 0.3;
            const h = (box.bottom - box.top) * 0.3;
            if (direction === 'RIGHT') {
                const trans = (box.left - cur_box.left) + w;
                m.trans(trans, 0);
            } else if (direction === 'LEFT') {
                const trans = (box.right - cur_box.right) - w;
                console.log(trans, 'trans');

                m.trans(trans, 0);
            } else if (direction === 'TOP') {
                const trans = (cur_box.bottom - box.bottom) - h;
                m.trans(0, trans);
            } else if (direction === 'BOTTOM') {
                const trans = (box.top - cur_box.top) + h;
                m.trans(0, trans);
            }
        } else if (animate_type.includes('OUT') || animate_type.includes('PUSH')) {
            if (direction === 'RIGHT') {
                const trans = cur_box.right - box.left;
                m.trans(trans, 0);
            } else if (direction === 'LEFT') {
                const trans = box.right - cur_box.left;
                m.trans(-trans, 0);
            } else if (direction === 'TOP') {
                const trans = box.bottom - cur_box.top;
                m.trans(0, -trans);
            } else if (direction === 'BOTTOM') {
                const trans = cur_box.bottom - box.top;
                m.trans(0, trans);
            }
        }
        return m;
    }
    getCurLayerShape(context: Context, id?: string) {
        const page = context.selection.selectedPage;
        const shapes = getFrameList(page!);
        return shapes.find(item => item.id === id);
    }
    // 容器内滚动
    scrollAnimate(el: SVGSVGElement, action: PrototypeActions) {
        const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
        const time = action.transitionDuration || 0.3;
        el.style['transition'] = `all ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
    }

    // 淡入淡出动画
    dissolveAnimate(action: PrototypeActions, els: SVGSVGElement[] | undefined, value: number) {
        if (action.transitionType !== PrototypeTransitionType.DISSOLVE || !els) return;
        const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
        const time = action.transitionDuration || 0.3;
        els[els.length - 1].style['transition'] = `opacity ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
        els[els.length - 1].style.opacity = `${value}`;
    }

    // 移入动画
    shiftInAnimate(action: PrototypeActions, els: SVGSVGElement[] | undefined) {
        if (!els) return;
        if (action.transitionType === PrototypeTransitionType.MOVEFROMLEFT ||
            action.transitionType === PrototypeTransitionType.MOVEFROMRIGHT ||
            action.transitionType === PrototypeTransitionType.MOVEFROMTOP ||
            action.transitionType === PrototypeTransitionType.MOVEFROMBOTTOM) {
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            els[els.length - 1].style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
        }
    }

    // pageSvg移出动作
    slideAndshiftOutAnimate(action: PrototypeActions) {
        const animateType = action.transitionType?.split('_');
        if (animateType && animateType.includes('OUT')) {
            const pageSvg = this.pageCard?.pageSvg as SVGSVGElement;
            if (!pageSvg) return;
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            pageSvg.style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
            pageSvg.style.zIndex = '9';
            this.outAction(action);
        }
    }
    // 滑入 推入动画
    pushAndslideInAnimate(action: PrototypeActions, els: SVGSVGElement[] | undefined) {
        if (!els) return;
        const animateType = action.transitionType?.split('_');
        if (animateType && (animateType.includes('SLIDE') || animateType.includes('PUSH'))) {
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            els[els.length - 1].style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`;
        }
    }
    // 滑入动画
    pageSvgSlideAnimate(action: PrototypeActions) {
        const select_shape = this.m_context.selection.selectedShapes[0];
        const box = viewBox(this.v_matrix, select_shape);
        const m = new Matrix(this.v_matrix.clone());
        if (action.transitionType === PrototypeTransitionType.SLIDEFROMBOTTOM ||
            action.transitionType === PrototypeTransitionType.SLIDEFROMLEFT ||
            action.transitionType === PrototypeTransitionType.SLIDEFROMRIGHT ||
            action.transitionType === PrototypeTransitionType.SLIDEFROMTOP) {
            const pageSvg = this.pageCard?.pageSvg as SVGSVGElement;
            if (!pageSvg) return;
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            pageSvg.style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
            const animate_type = action.transitionType.split('_');
            const direction = animate_type.at(-1);
            const w = (box.right - box.left) * 0.3;
            const h = (box.bottom - box.top) * 0.3;
            if (direction === 'RIGHT') {
                m.trans(w, 0);
            } else if (direction === 'LEFT') {
                m.trans(-w, 0);
            } else if (direction === 'TOP') {
                m.trans(0, -h);
            } else if (direction === 'BOTTOM') {
                m.trans(0, h);
            }
            pageSvg.style['transform'] = m.toString();
        }
    }
    // pageSvg推出动画
    pageSvgPushAnimate(action: PrototypeActions) {
        const select_shape = this.m_context.selection.selectedShapes[0];
        const box = viewBox(this.v_matrix, select_shape);
        const m = new Matrix(this.v_matrix.clone());
        const animateType = action.transitionType?.split('_');
        if (animateType && animateType.includes('PUSH')) {
            const pageSvg = this.pageCard?.pageSvg as SVGSVGElement;
            if (!pageSvg) return;
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            pageSvg.style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
            const direction = animateType.at(-1);
            const w = (box.right - box.left);
            const h = (box.bottom - box.top);
            if (direction === 'RIGHT') {
                m.trans(w, 0);
            } else if (direction === 'LEFT') {
                m.trans(-w, 0);
            } else if (direction === 'TOP') {
                m.trans(0, -h);
            } else if (direction === 'BOTTOM') {
                m.trans(0, h);
            }
            const svgEl = (this.m_page_card?.pageSvg as SVGSVGElement);
            svgEl.style['transform'] = m.toString();
        }
    }

    // 移除动画效果
    removeAnimate(el: SVGSVGElement, isTrans?: boolean) {
        if (el) {
            el.addEventListener('transitionend', function () {
                this.style['transition'] = ''
            });
        }
        if (isTrans) {
            el.style['transition'] = '';
        }
    }

    // 移出动作
    outAction(action: PrototypeActions) {
        const select_shape = this.m_context.selection.selectedShapes[0];
        const box = viewBox(this.v_matrix, select_shape);
        const animate_type = action.transitionType?.split('_');
        if (!animate_type) return;
        const m = new Matrix(this.v_matrix.clone());
        const direction = animate_type.at(-1);
        if (animate_type.includes('OUT')) {
            if (direction === 'RIGHT') {
                const trans = box.right - box.left;
                m.trans(trans, 0);
            } else if (direction === 'LEFT') {
                const trans = box.right - box.left;
                m.trans(-trans, 0);
            } else if (direction === 'TOP') {
                const trans = box.bottom - box.top;
                m.trans(0, -trans);
            } else if (direction === 'BOTTOM') {
                const trans = box.bottom - box.top;
                m.trans(0, trans);
            }
        }
        const svgEl = (this.m_page_card?.pageSvg as SVGSVGElement);
        svgEl.style['transform'] = m.toString();
    }

    backSlideInAnimate(action: PrototypeActions, els: SVGSVGElement[]) {
        const animateType = action.transitionType?.split('_');
        const select_shape = this.m_context.selection.selectedShapes[0];
        if (animateType && animateType.includes('SLIDE') && animateType.includes('FROM')) {
            const box = viewBox(this.v_matrix, select_shape);
            const m = new Matrix(this.v_matrix.clone());
            const direction = animateType.at(-1);
            const w = box.right - box.left;
            const h = box.bottom - box.top;
            if (direction === 'RIGHT') {
                m.trans(-w, 0);
            } else if (direction === 'LEFT') {
                m.trans(w, 0);
            } else if (direction === 'TOP') {
                m.trans(0, h);
            } else if (direction === 'BOTTOM') {
                m.trans(0, -h);
            }
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            els[els.length - 1].style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
            const svgEl = (this.m_page_card?.pageSvg as SVGSVGElement);
            svgEl.style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`;
            svgEl.style.zIndex = '9';
            svgEl.style['transform'] = m.toString();
        }
    }
    backSlideOutAnimate(action: PrototypeActions, els: SVGSVGElement[]) {
        const animateType = action.transitionType?.split('_');
        if (animateType && animateType.includes('OUT') && animateType.includes('SLIDE')) {
            const select_shape = this.m_context.selection.selectedShapes[0];
            const box = viewBox(this.v_matrix, select_shape);
            const pageSvg = this.pageCard?.pageSvg as SVGSVGElement;
            if (!pageSvg) return;
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            pageSvg.style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`;
            els[els.length - 1].style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`;
            const m = new Matrix(this.v_matrix.clone());
            const direction = animateType.at(-1);
            const w = (box.right - box.left) * 0.3;
            const h = (box.bottom - box.top) * 0.3;
            if (direction === 'RIGHT') {
                m.trans(-w, 0);
            } else if (direction === 'LEFT') {
                m.trans(w, 0);
            } else if (direction === 'TOP') {
                m.trans(0, h);
            } else if (direction === 'BOTTOM') {
                m.trans(0, -h);
            }
            const svgEl = (this.m_page_card?.pageSvg as SVGSVGElement);
            svgEl.style['transform'] = m.toString();
        }
    }
    backDissolveAnimate(action: PrototypeActions, els: SVGSVGElement[]) {
        if (action.transitionType !== PrototypeTransitionType.DISSOLVE) return;
        const svgEl = (this.m_page_card?.pageSvg as SVGSVGElement);
        const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
        const time = action.transitionDuration || 0.3;
        svgEl.style['transition'] = `opacity ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`;
        svgEl.style.zIndex = '9';
        svgEl.style.opacity = '0';
        if (els.length > 1) {
            for (let i = 0; i < els.length - 1; i++) {
                const el = els[i];
                el.style['transition'] = `opacity ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
                el.style.zIndex = '9';
                el.style.opacity = `0`;
            }
        }
    }
    backOutAction(action: PrototypeActions) {
        const select_shape = this.m_context.selection.selectedShapes[0];
        const box = viewBox(this.v_matrix, select_shape);
        const animate_type = action.transitionType?.split('_');
        if (!animate_type) return;
        const m = new Matrix(this.v_matrix.clone());
        const direction = animate_type.at(-1);
        const w = box.right - box.left;
        const h = box.bottom - box.top;
        if (direction === 'RIGHT') {
            m.trans(-w, 0);
        } else if (direction === 'LEFT') {
            m.trans(w, 0);
        } else if (direction === 'TOP') {
            m.trans(0, h);
        } else if (direction === 'BOTTOM') {
            m.trans(0, -h);
        }
        const svgEl = (this.m_page_card?.pageSvg as SVGSVGElement);
        svgEl.style['transform'] = m.toString();
    }

    backShiftInAnimate(action: PrototypeActions) {
        const animateType = action.transitionType?.split('_');
        if (animateType && (animateType.includes('MOVE') && animateType.includes('FROM'))) {
            const pageSvg = this.pageCard?.pageSvg as SVGSVGElement;
            if (!pageSvg) return;
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            pageSvg.style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
            pageSvg.style.zIndex = '9';
            this.backOutAction(action);
        }
    }

    backShiftOutAnimate(action: PrototypeActions, els: SVGSVGElement[] | undefined) {
        if (!els) return;
        const animateType = action.transitionType?.split('_');
        if (animateType && animateType.includes('MOVE') && animateType.includes('OUT')) {
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            els[els.length - 1].style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
        }
    }
    backPushInAnimate(action: PrototypeActions, els: SVGSVGElement[] | undefined) {
        if (!els) return;
        const animateType = action.transitionType?.split('_');
        if (animateType && animateType.includes('PUSH')) {
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            els[els.length - 1].style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
        }
    }
    backPushAnimate(action: PrototypeActions) {
        const animateType = action.transitionType?.split('_');
        if (animateType && animateType.includes('PUSH')) {
            const pageSvg = this.pageCard?.pageSvg as SVGSVGElement;
            if (!pageSvg) return;
            const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
            const time = action.transitionDuration || 0.3;
            pageSvg.style['transition'] = `transform ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
            this.backOutAction(action);
        }
    }

    getHotZone(matrix: Matrix, shape: ShapeView) {
        const view = this.m_container;
        const boxs: Set<Box> = new Set();
        if (!view) return;
        this.hotZoneBox(matrix, shape, boxs);
        const hotBoxs = Array.from(boxs);
        for (let i = 0; i < hotBoxs.length; i++) {
            const box = hotBoxs[i];
            const style = toStyle({
                position: 'absolute',
                top: box.top + 'px',
                left: box.left + 'px',
                width: box.right - box.left + 'px',
                height: box.bottom - box.top + 'px',
                'background-color': 'rgba(255, 0, 0, 0.3)',
                'z-index': '999',
                opacity: '1',
                transition: 'opacity 0.3s cubic-bezier(0, 0, 1, 1) 0s'
            });
            const el = document.createElement('div');
            el.setAttribute('style', style);
            view.appendChild(el);
            setTimeout(() => {
                el.style.opacity = '0';
            }, 0);
            setTimeout(() => {
                view.removeChild(el);
            }, 300);
        }
    }
    hotZoneBox(matrix: Matrix, shape: ShapeView, boxs: Set<Box>) {
        if (shape.prototypeInterAction && shape.prototypeInterAction.length) {
            const box = viewBox(matrix, shape);
            boxs.add(box);
        } else {
            const children = shape.childs;
            if (children.length) {
                for (let i = 0; i < children.length; i++) {
                    const c = children[i];
                    this.hotZoneBox(matrix, c, boxs);
                }
            }
        }
    }
}
class DirtyCleaner {
    private m_image_map: Map<string, string>; // todo 缓存，使列表流畅
    private m_dirty_target: Map<string, Shape>;
    private m_context: Context;

    constructor(context: Context, store: Map<string, string>, dirty: Map<string, Shape>) {
        this.m_context = context;
        this.m_image_map = store;
        this.m_dirty_target = dirty;
    }

    private timer: any = null;

    private m_current_creating: string = '';
    private m_loop: boolean = false;

    changePage(targets: Shape[]) {
        let needInit = false;
        for (let i = 0; i < targets.length; i++) {
            const t = targets[i];
            if (!this.m_image_map.has(t.id)) {
                needInit = true;
                this.m_dirty_target.set(t.id, t);
            }
        }

        if (needInit) {
            clearTimeout(this.timer);
            this.timer = null;
            this.initStore();
        }
    }

    initStore() {
        const dirty = Array.from(this.m_dirty_target.keys());
        const cd = dirty.pop();
        if (!cd) {
            console.log('finish init');
            this.m_loop = false;
            return;
        }
        const target = this.m_dirty_target.get(cd);
        if (!target) {
            return;
        }

        this.m_dirty_target.delete(this.m_current_creating);

        this.m_current_creating = cd;

        console.log('_target_', target.name, target);

        this.m_context.menu.notify(Menu.WRITE_MEDIA_LAZY, target);

        this.m_loop = true;
    }

    dataLoad(b64: string) {
        if (!this.m_current_creating) {
            this.m_loop = false;
            return;
        }

        console.log('__dataLoad__', this.m_current_creating);

        this.m_image_map.set(this.m_current_creating, b64);
        const last = this.m_current_creating;
        if (this.m_loop) {
            this.initStore();
        } else {
            this.lazyAfter5s();
        }
        return last;
    }

    lazyAfter5s() {
        const __lazy = this.lazyLong.bind(this);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            __lazy();
            clearTimeout(this.timer);
            this.timer = null;
        }, 5000);
    }

    lazyLong() {
        const dirty = Array.from(this.m_dirty_target.keys());
        const cd = dirty.pop();
        if (!cd) {
            this.lazyAfter5s();
            console.log('no dirty');
            return;
        }
        const target = this.m_dirty_target.get(cd);
        if (!target) {
            this.lazyAfter5s();
            return;
        }

        // 获取成功
        this.m_dirty_target.delete(this.m_current_creating);

        this.m_current_creating = cd;

        this.m_context.menu.notify(Menu.WRITE_MEDIA_LAZY, target);
    }

    uninstall() {
        this.m_current_creating = '';
        clearTimeout(this.timer);
        this.timer = null;
    }
}