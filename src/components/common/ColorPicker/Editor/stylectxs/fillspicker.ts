import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { BasicArray, Color, Fill, FillsAsyncApi, ImagePack, ImageScaleMode, Stop, FillMask } from "@kcdesign/data";
import { get_action_gradient_stop } from "@/utils/shape_style";
import { v4 } from "uuid";
import { getNumberFromInputEvent } from "@/components/Document/Attribute/basic";
import { ImageLoader } from "@/imageLoader";
import { modify_imgs } from "@/utils/content";

export class FillsPicker extends ColorPickerEditor {
    fill: Fill | undefined;

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    private m_index: number | undefined;

    get index(): number {
        if (this.m_index !== undefined) return this.m_index;
        if (!this.fill) return this.m_index = 0;
        const parent = this.fill.parent as any;
        return this.m_index = parent?.findIndex((i: any) => i === this.fill) ?? -1;
    }

    private get api(): FillsAsyncApi {
        return (this.m_api as unknown as FillsAsyncApi)
            ?? (this.m_api = new FillsAsyncApi(this.context.coopRepo, this.context.data, this.page));
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
        this.m_index = undefined;
        this.m_target_fills = undefined;
    }

    private m_target_fills: Fill[] | undefined;

    /* 获取目标填充，获取的结果可能来自不同类型的载体 */
    private get targetFills(): Fill[] {
        return this.m_target_fills ?? (this.m_target_fills = (() => {
            if (!this.fill) return [];
            if (this.fill.parent?.parent instanceof FillMask) {
                return [this.fill];
            } else {
                return this.flat.map(i => i.getFills()[this.index]);
            }
        })());
    }

    /* 修改填充类型 */
    modifyFillType(type: string): void {
        this.getSelection();
        this.pageEditor.setFillsType(this.targetFills.map(fill => ({ fill, type })));
        super.modifyFillType(type);
        this.hiddenCtrl();
    }

    /* 修改填充纯色 */
    setSolidColor(c: RGBACatch): void {
        this.getSelection();
        this.api.modifySolidColor(this.targetFills.map(i => ({ fill: i, color: new Color(c.A, c.R, c.G, c.B) })));
        this.hiddenCtrl();
        this.commit();
    }

    /* 拖拽修改纯色前置 */
    dragSolidBegin(): void {
        this.getSelection();
    }

    /* 拖拽修改纯色 */
    solidDragging(c: RGBACatch): void {
        this.api.modifySolidColor(this.targetFills.map(i => ({ fill: i, color: new Color(c.A, c.R, c.G, c.B) })));
        this.hiddenCtrl();
    }

    /* 拖拽修改纯色后置 */
    dragSolidEnd(): void {
        this.commit();
    }

    createStop(c: RGBACatch) {
        this.getSelection();
        const color = new Color(c.A, c.R, c.G, c.B);
        const stop = new Stop([0] as BasicArray<number>, v4(), c.position, color);
        const actions = get_action_gradient_stop(this.flat, this.index, stop, "fills");
        this.pageEditor.addShapesGradientStop(actions);
        this.hiddenCtrl();
        return stop.id;
    }

    removeStop(stopAt: number) {
        this.getSelection();
        this.api.removeGradientStop(this.targetFills.map(fill => ({ fill, stopAt })));
        this.commit();
        this.hiddenCtrl();
    }

    setStopColor(c: RGBACatch, stopAt: number) {
        this.getSelection();
        this.api.modifyStopColorOnce(this.targetFills.map(i => ({ fill: i, color: new Color(c.A, c.R, c.G, c.B), stopAt })));
        this.commit();
        this.hiddenCtrl();
    }

    dragStopBegin() {
        this.getSelection();
    }

    draggingStop(c: RGBACatch, stopAt: number): void {
        this.api.modifyStopColor(this.targetFills.map(i => ({ fill: i, color: new Color(c.A, c.R, c.G, c.B), stopAt })));
        this.hiddenCtrl();
    }

    dragStopEnd(): void {
        this.commit();
    }

    dragStopPositionBegin() {
        this.getSelection();
    }

    draggingStopPosition(position: number, stopAt: number) {
        this.api.modifyStopPosition(this.targetFills.map(i => ({ fill: i, position, stopAt })));
        this.hiddenCtrl();
    }

    dragStopPositionEnd() {
        this.commit();
    }

    reverseStops() {
        this.getSelection();
        this.api.reverseGradientStops(this.targetFills);
        this.hiddenCtrl();
        this.commit();
    }

    rotateStops() {
        this.getSelection();
        this.api.rotateGradientStops(this.targetFills);
        this.hiddenCtrl();
        this.commit();
    }

    modifyObjectFit(type: ImageScaleMode): void {
        this.getSelection();
        this.api.modifyObjectFit(this.targetFills, type);
        this.hiddenCtrl();
        this.commit();
    }

    modifyTileScale(event: Event): void {
        this.getSelection();
        const val = getNumberFromInputEvent(event);
        if (isNaN(val)) return;
        this.api.modifyTileScale(this.targetFills, Math.max(val / 100, 0.02));
        this.hiddenCtrl(event);
        this.commit();
    }

    rotateImg(): void {
        this.getSelection();
        this.api.rotateImg(this.index, ((this.fill?.rotation ?? 0) + 90) % 360, this.flat);
        this.hiddenCtrl();
        this.commit();
    }

    /* 当一个填充以图片作为填充物的时，用于修改图片的资源链接 */
    modifyRef(event: Event): void {
        if (!event.target) return;
        const files = (event.target as HTMLInputElement).files;
        if (!files?.length) return;
        const file = files[0];
        const imageLoader = new ImageLoader(this.context);
        imageLoader
            .packFile(file, false)
            .then(res => {
                if (!res) return;
                const result = res as ImagePack;
                const {buff, base64, size} = result;
                const media = {name: file.name || '', frame: result.size, buff, base64};
                const container: any = {};
                modify_imgs(this.context, [media], container);
                const keys = Array.from(Object.keys(container) || []) as string[];
                this.getSelection();
                this.api.modifyFillImageRef(this.targetFills, keys[0], {buff, base64}, size.width, size.height);
                this.hiddenCtrl();
                const upload = this.flat.map(shape => ({shape, upload: [{buff, ref: keys[0]}]}));
                imageLoader.upload(upload)
            })
            .finally(() => {
                this.commit();
            });
    }

    filterDragBegin(): void {
        this.getSelection();
    }

    filterDragging(type: string, val: number): void {
        this.api.modifyFillImageFilter(type as any, val, this.index, this.flat);
        this.hiddenCtrl();
    }

    filterDragEnd(): void {
        this.commit();
    }
}