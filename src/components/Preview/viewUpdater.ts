import { Matrix, Page, Shape } from "@kcdesign/data";
import { Context } from "@/context";
import PageCard from "@/components/common/PageCard.vue";
import { debounce } from "lodash";
import { is_mac, XYsBounding } from "@/utils/common";

type PCard = InstanceType<typeof PageCard>;

/**
 * @description 播放视图渲染管理器
 */
export class ViewUpdater {
    private readonly m_context: Context;

    private m_current_page: Page | undefined; // 当前页
    private m_current_view: Shape | undefined; // 当前播放对象
    private m_page_card: PCard | undefined; // 渲染卡片

    private matrix: Matrix = new Matrix();
    private m_container: HTMLDivElement | undefined; // 整个黑盒子

    private m_image_map: Map<string, string> = new Map<string, string>();

    constructor(context: Context) {
        this.m_context = context;
    }

    get v_matrix() {
        return this.matrix;
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
        console.log('__UPDATE_SELF__', ...args, args);
        this.update(...args);
    }

    /**
     * @description 监听播放对象内部元素(子孙元素)变化
     */
    private updaterBubble(...args: any[]) {
        console.log('__UPDATE_FROM_BUBBLE__', ...args, args);
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

        if (!shape || !container || !this.m_page_card) {
            return;
        }

        const frame = shape.frame;

        const svgEl = (this.m_page_card.pageSvg as Element);
        svgEl.setAttribute('viewBox', `0 0 ${frame.width} ${frame.height}`);
        svgEl.setAttribute('width', `${frame.width}`);
        svgEl.setAttribute('height', `${frame.height}`);
        console.log(m, 'mmm');
        
        this.m_page_card!.pageSvg!.style['transform'] = m.toString();

        console.log('__m__', m.toString(), this.getScale(m));

        this.m_context.preview.setScale(this.getScale(m));

        this.matrix.reset(m);
    }

    beCenterView() {
        const shape = this.m_current_view;
        const container = this.m_container;

        if (!shape || !container || !this.m_page_card) {
            return;
        }

        const box = this.getBoundingBox(true)!;
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;

        const root = container.getBoundingClientRect();
        const delX = root.width / 2 - cx;
        const delY = root.height / 2 - cy;

        this.matrix.trans(delX, delY);
        this.setAttri(this.matrix);
    }

    private getCenterMatrix() {
        const shape = this.m_current_view;
        const container = this.m_container;

        if (!shape || !container || !this.m_page_card) {
            return new Matrix();
        }

        const root = container.getBoundingClientRect();
        const frame = shape.frame;

        const cx = frame.width / 2;
        const cy = frame.height / 2;

        const transformMatrix = new Matrix();
        transformMatrix.trans(-cx, -cy);
        if (shape.rotation) {
            transformMatrix.rotate(shape.rotation / 360 * 2 * Math.PI);
        }
        if (shape.isFlippedHorizontal) {
            transformMatrix.flipHoriz();
        }
        if (shape.isFlippedVertical) {
            transformMatrix.flipVert();
        }
        transformMatrix.trans(cx, cy);

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
        this.m_page_card?.repaint() // 执行PreviewPageCard内部重绘函数

        if (args.includes('frame') || args.includes('rotation')) {
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

    mount(container: HTMLDivElement, page: Page, current: Shape | undefined, pageCard: PCard | undefined) {
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
        this.m_stop_last_bubble = this.m_current_view.bubblewatch(bubble);

        if (!this.m_current_page) {
            return;
        }
        this.m_stop_last_on_page = this.m_current_page.watch(this.updater4Page.bind(this));
    }

    /**
     * @description 切换播放对象
     */
    atTarget(shape?: Shape) {
        console.log("__TARGET__", shape?.name);

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
        this.m_stop_last_bubble = this.m_current_view.bubblewatch(bubble);
    }

    /**
     * @description 切换页面
     */
    atPage(page?: Page) {
        console.log("__PAGE__", page?.name);
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
        const bound = this.getBoundingBox(true)!;

        if (bound.x < 0) {
            if (bound.x > stepx) stepx = bound.x;
        }
        if (bound.x >= 0 && stepx < 0) stepx = 0;
        if (bound.y < 0) {
            if (bound.y > stepy) stepy = bound.y;
        }
        if (bound.y >= 0 && stepy < 0) stepy = 0;
        const right = bound.x + bound.width;
        const bottom = bound.y + bound.height;
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
}