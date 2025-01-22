import { SelectionCtx } from "@/components/common/ColorPicker/Editor/basic";
import { Context } from "@/context";
import { IColorPicker, IGradientModifier, IPatternModifier } from "@/components/common/ColorPicker/Editor/basic/icolorpicker";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { FillType, GradientType } from "@kcdesign/data";

export class ColorPickerEditor extends SelectionCtx implements IColorPicker, IGradientModifier, IPatternModifier {
    constructor(public context: Context) {
        super(context);
    }

    setColor(rgbaCatch: RGBACatch): void {
        console.log('--铁铁，哈哈哈哈哈！！！--', rgbaCatch);
    }

    createStop(position: number): void {
    }

    dragBegin(): void {
    }

    dragEnd(): void {
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

    dragging(rgbaCatch: RGBACatch): void {
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

    modifyFillType(type: FillType | GradientType): void {
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