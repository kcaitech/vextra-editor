import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { FillType, GradientType } from "@kcdesign/data";

export interface IColorPicker {
    /**
     * @description 修改填充类型
     */
    modifyFillType(type: FillType | GradientType): void; /* 修改填充类型 */
    /**
     * @description 修改一次颜色
     */
    setSolidColor(rgbaCatch: RGBACatch): void;

    /**
     * @description 颜色修改拖拽事件
     */
    dragSolidBegin(): void;

    solidDragging(rgbaCatch: RGBACatch): void;

    dragSolidEnd(): void;
}

export interface IGradientModifier {
    /**
     * @description 创建一个stop
     */
    createStop(c: RGBACatch): void;

    /**
     * @description 删除一个stop
     * @param index
     */
    removeStop(index: number): void;

    /**
     * @description 反转stop
     */
    reverseStops(): void;

    /**
     * @description 旋转stop
     */
    rotateStops(): void;

    /**
     * @description stop 拖拽事件
     */
    dragStopBegin(): void;

    draggingStop(index: number, rgbaCatch: RGBACatch): void;

    dragStopEnd(): void;

    /**
     * @description from拖拽事件
     */
    dragFromBegin(): void;

    draggingFrom(): void;

    dragFromEnd(): void;

    /**
     * @description to拖拽事件
     */
    dragToBegin(): void;

    draggingTo(): void;

    dragToEnd(): void;
}

export interface IPatternModifier {
    /**
     * @description 修改图片资源的引用
     */
    modifyRef(): void;

    /**
     * @description 修改图片填充规则
     */
    modifyObjectFit(type: string): void;

    /**
     * @description 旋转图片
     */
    rotateImg(): void;

    /**
     * @description 图片滤镜拖拽事件
     */
    filterDragBegin(): void;

    filterDragging(type: string, val: number): void;

    filterDragEnd(): void;
}