import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { BasicArray, Color, Fill, FillsAsyncApi, FillType, ImagePack, ImageScaleMode, Stop } from "@kcdesign/data";
import { get_action_gradient_stop, get_actions_filltype } from "@/utils/shape_style";
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
    }

    modifyFillType(type: string): void {
        this.getSelection();
        if (type === FillType.SolidColor || type === FillType.Pattern) {
            const actions = get_actions_filltype(this.flat, this.index, type as FillType);
            this.pageEditor.setShapesFillType(actions);
        } else {
            const actions = get_action_gradient_stop(this.flat, this.index, type, 'fills');
            this.pageEditor.modifyShapeGradientType(actions);
        }
        super.modifyFillType(type);
        this.hiddenCtrl();
    }

    setSolidColor(c: RGBACatch): void {
        this.getSelection();
        this.api.modifySolidColor(this.flat, this.index, new Color(c.A, c.R, c.G, c.B));
        this.hiddenCtrl();
        this.commit();
    }

    dragSolidBegin(): void {
        this.getSelection();
    }

    solidDragging(c: RGBACatch): void {
        this.api.modifySolidColor(this.flat, this.index, new Color(c.A, c.R, c.G, c.B));
        this.hiddenCtrl();
    }

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
    }

    setStopColor(c: RGBACatch, stopAt: number) {
        this.getSelection();
        const color = new Color(c.A, c.R, c.G, c.B);
        this.api.modifyStopColorOnce(this.flat, this.index, color, stopAt);
        this.commit();
        this.hiddenCtrl();
    }

    dragStopBegin() {
        this.getSelection();
    }

    draggingStop(c: RGBACatch, stopAt: number): void {
        this.api.modifyStopColor(this.flat, this.index, new Color(c.A, c.R, c.G, c.B), stopAt);
        this.hiddenCtrl();
    }

    dragStopEnd(): void {
        this.commit();
    }

    reverseStops() {
        this.getSelection();
        this.api.reverseGradientStops(this.flat, this.index);
        this.hiddenCtrl();
        this.commit();
    }

    rotateStops() {
        this.getSelection();
        this.api.rotateGradientStops(this.flat, this.index);
        this.hiddenCtrl();
        this.commit();
    }

    modifyObjectFit(type: ImageScaleMode): void {
        this.getSelection();
        this.api.modifyObjectFit(this.flat, this.index, type);
        this.hiddenCtrl();
        this.commit();
    }

    modifyTileScale(event: Event): void {
        this.getSelection();
        const val = getNumberFromInputEvent(event);
        if (isNaN(val)) return;
        this.api.modifyTileScale(this.index, Math.max(val / 100, 0.02), this.flat);
        this.hiddenCtrl(event);
        this.commit();
    }

    rotateImg(): void {
        this.getSelection();
        this.api.rotateImg(this.index, ((this.fill?.rotation ?? 0) + 90) % 360, this.flat);
        this.hiddenCtrl();
        this.commit();
    }

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
                this.api.modifyFillImageRef(this.index, keys[0], {buff, base64}, size.width, size.height, this.flat);
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