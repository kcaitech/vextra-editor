import { Matrix, Page, Shape } from "@kcdesign/data";
import { Context } from "@/context";
import PageCard from "@/components/common/PageCard.vue";
import { debounce } from "lodash";

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

    // 停止监听播放对象内部元素(子孙元素)变化
    private m_stop_last_bubble: () => void = () => {
    };
    // 停止监听播放对象的变化
    private m_stop_last: () => void = () => {
    };

    private m_stop_last_on_page: () => void = () => {
    };

    mount(container: HTMLDivElement, page: Page, current: Shape | undefined, pageCard: PCard | undefined) {
        console.log('__MOUNTED__', current, pageCard);
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
     * @description 监听播放对象的变化
     * @param args
     */
    updater(...args: any[]) {
        console.log('__UPDATE_SELF__', ...args, args);
        this.update(...args);
    }

    /**
     * @description 监听播放对象内部元素(子孙元素)变化
     */
    updaterBubble(...args: any[]) {
        console.log('__UPDATE_FROM_BUBBLE__', ...args, args);
        this.update(...args);
    }

    /**
     * @description page的变化，有可能导致整个坐标系发生改变，此时应该让播放对象抵消这个改变，避免位移
     */
    updater4Page(...args: any[]) {
        // console.log('__UPDATE_PAGE__', args);
        // if (!(args.includes('frame'))) {
        //     // frame 没有发生变化，不需要抵消
        //     return;
        // }
        //
        // this.modifyTransform();
    }

    /**
     * @description 修改播放对象的transform
     */
    modifyTransform() {
        const shape = this.m_current_view;
        const container = this.m_container;

        if (!shape || !container || !this.m_page_card) {
            return;
        }

        const root = container.getBoundingClientRect();
        const frame = shape.frame;

        console.log('__root&frame__', root, frame);

        // const m = new Matrix(shape.matrix2Parent());
        // m.trans(-frame.x, -frame.y);

        // const points = [
        //     m.computeCoord2(0, 0),
        //     m.computeCoord2(frame.width, 0),
        //     m.computeCoord2(frame.width, frame.height),
        //     m.computeCoord2(0, frame.height)
        // ];
        //
        // const box = XYsBounding(points);
        // const width = box.right - box.left;
        // const height = box.bottom - box.top;

        // console.log('__bounding_box__', box, box.right - box.left, width, height);

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

        this.m_page_card.pageSvg.style['transform'] = transformMatrix.toString();
        const svgEl = (this.m_page_card.pageSvg as Element);
        svgEl.setAttribute('viewBox', `0 0 ${frame.width} ${frame.height}`);
        svgEl.setAttribute('width', `${frame.width}`);
        svgEl.setAttribute('height', `${frame.height}`);
    }

    __update(...args: any[]) {
        this.m_page_card?.repaint() // 执行PreviewPageCard内部重绘函数

        if (args.includes('frame') || args.includes('rotation')) {
            this.modifyTransform();
        }
    }

    // __update属于播放对象的全量绘制，消耗比较大
    update = debounce(this.__update, 300);
}