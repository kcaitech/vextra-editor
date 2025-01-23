import { SelectionCtx } from "@/components/common/ColorPicker/Editor/basic";
import { Context } from "@/context";
import { IColorPicker, IGradientModifier, IPatternModifier } from "@/components/common/ColorPicker/Editor/basic/icolorpicker";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { AsyncApiCaller} from "@kcdesign/data";

export class ColorPickerEditor extends SelectionCtx implements IColorPicker, IGradientModifier, IPatternModifier {
    private m_fill_type: string;
    protected m_api: AsyncApiCaller | undefined;

    constructor(public context: Context, type: string) {
        super(context);
        this.m_fill_type = type;
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
    }

    modifyFillType(type: string): void {
        this.m_fill_type = type;
    }

    setSolidColor(c: RGBACatch): void {
    }

    dragSolidBegin(): void {
        this.getSelection();
    }

    solidDragging(c: RGBACatch): void {
    }

    dragSolidEnd(): void {
    }

    createStop(position: number): void {
    }

    dragFromBegin(): void {
    }

    dragFromEnd(): void {
    }

    dragStopBegin(): void {
    }

    dragStopEnd(): void {
    }

    dragToBegin(): void {
    }

    dragToEnd(): void {
    }

    draggingFrom(): void {
    }

    draggingStop(index: number, rgbaCatch: RGBACatch): void {
    }

    draggingTo(): void {
    }

    filterDragBegin(): void {
    }

    filterDragEnd(): void {
    }

    filterDragging(type: string, val: number): void {
    }

    modifyObjectFit(type: string): void {
    }

    modifyRef(): void {
    }

    removeStop(index: number): void {
    }

    reverseStops(): void {
    }

    rotateImg(): void {
    }

    rotateStops(): void {
    }
}