import { ArtboradView, DViewCtx, EL, PropsType } from "@kcdesign/data";
import { batchSetAttribute, createElement, elpatch, setAttribute } from "./patch";

export class ArtboradDom extends (ArtboradView) {

    // 检查显示区域
    // 1. 太小时显示成image
    // 2. 

    constructor(ctx: DViewCtx, props: PropsType) {
        super(ctx, props);
        this._bubblewatcher = this._bubblewatcher.bind(this);
        this.m_data.bubblewatch(this._bubblewatcher);
    }

    private _bubblewatcher(...args: any[]) {
        this.m_childs_changed = true;
    }

    onDestory(): void {
        super.onDestory();
        this.m_data.bubbleunwatch(this._bubblewatcher);
    }

    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL & { el?: HTMLElement | SVGElement } = EL.make("");

    render(): number {
        const version: number = super.render();
        if (version !== this.m_save_version || !this.el) {
            elpatch(this, this.m_save_render); // 这里才转化为html或者svg节点
            this.m_save_version = version;
            this.m_save_render.reset(this.eltag, this.elattr, this.elchilds);
            this.m_save_render.el = this.el;
        }
        // 当前是图片且没有修改要更新时
        // todo
        return version;
    }

    m_childs_changed: boolean = false;
    m_image_version: number = -1;
    imageel?: HTMLElement | SVGElement;
    m_save_image_props: any;

    switchIntoImage(force: boolean): boolean {
        if (!this.el) {
            return false;
        }
        if (!((this.m_image_version !== this.m_save_version || this.m_childs_changed || force))) {
            return false;
        }
        //     const svg = exportInnerSvg(props.data);
        //     const href = "data:image/svg+xml," + ((svg.replaceAll("#", "%23")));
        //     console.log("render " + props.data.name + " as svg cost: " + (Date.now() - startTime) + "ms")
        //     const frame = props.data.frame;
        //     const image = h('image', { href, x: frame.x, y: frame.y, width: frame.width, height: frame.height, reflush: common.reflush })

        // const startTime = Date.now();

        const frame = this.frame;
        if (!this.imageel) this.imageel = createElement('image');

        const imageel = this.imageel;
        if (this.m_image_version !== this.m_save_version || this.m_childs_changed) {
            const svg = this.el.outerHTML;
            const href = "data:image/svg+xml," + ((svg.replaceAll("#", "%23")));
            setAttribute(imageel, "href", href);
        }

        const props: any = {};
        props.x = frame.x;
        props.y = frame.y;
        props.width = frame.width;
        props.height = frame.height;

        batchSetAttribute(imageel, props, this.m_save_image_props);
        this.m_save_image_props = props;

        if (this.el.parentNode) {
            this.el.parentNode.replaceChild(imageel, this.el);
        }

        this.m_image_version = this.m_save_version;
        this.m_childs_changed = false;

        // console.log(this.name, " switch into image use time: ", Date.now() - startTime);

        return true;
    }

    switchOutImage(force: boolean) {
        if (this.imageel && this.imageel.parentNode && (this.m_childs_changed || force)) {
            if (this.el) this.imageel.parentNode.replaceChild(this.el, this.imageel);
            else this.imageel.parentNode.removeChild(this.imageel);
        }
    }
}