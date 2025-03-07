/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import {
    BasicArray,
    Color,
    TextAsyncApi,
    Stop,
    ShapeView, Api, GradientType, Matrix, Point2D,
    FillType,
    AttrGetter,
    TextShapeView,
    ShapeType
} from "@kcdesign/data";
import { v4 } from "uuid";

export class TextPicker extends ColorPickerEditor {
    format: AttrGetter | undefined
    colorType: string = 'color';

    constructor(public context: Context, type: string, colorType: string) {
        super(context, type);
        this.colorType = colorType;
    }

    private get editor(): TextAsyncApi {
        return (this.m_api as unknown as TextAsyncApi)
            ?? (this.m_api = new TextAsyncApi(this.context.coopRepo, this.context.data, this.page));
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
    }

    private get textShapes(): TextShapeView[] {
        return this.selected.filter(shape => shape.type === ShapeType.Text) as TextShapeView[];
    }

    private get length(): boolean {
        return this.textShapes.length === 1;
    }

    //获取选中字体的长度和开始下标
    private getTextIndexAndLen = () => {
        const selection = this.context.selection.textSelection;
        const textIndex = Math.min(selection.cursorEnd, selection.cursorStart)
        const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart)
        if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
            return { textIndex, selectLength }
        } else {
            return { textIndex: 0, selectLength: Infinity }
        }
    }

    private setType(api: Api, textShape: TextShapeView, type: string): void {
        const shape = this.editor.shape4edit(api, textShape);
        const page = this.page.data;
        const fillType = type === FillType.SolidColor ? FillType.SolidColor : FillType.Gradient;
        let idx = 0, len = 0;
        if (this.length) {
            const { textIndex, selectLength } = this.getTextIndexAndLen();
            idx = textIndex; len = selectLength;
        } else {
            const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
            len = text.length;
            if (len === 0) return;
        }
        api.textModifyFillType(page, shape, fillType, idx, len);
        if (type === FillType.SolidColor) {
            if (this.format?.gradient) {
                const { red, green, blue, alpha } = this.format?.gradient.stops[0].color;
                const color = new Color(alpha, red, green, blue);
                api.textModifyColor(page, shape, idx, len, color);
            }
        } else if (this.format) {
            const color = this.format.color || new Color(1, 6, 6, 6);
            const g = this.editor.initGradient(this.format.gradient, type as GradientType, color);
            api.setTextGradient(page, shape, g, idx, len);
        }
    }

    /* 修改填充类型 */
    modifyFillType(type: string): void {
        super.modifyFillType(type);
        this.updateSelection();
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((shape) => {
                this.setType(api, shape, type);
            })
        }
        this.editor.modifyFillType([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    /* 修改填充纯色 */
    setSolidColor(c: RGBACatch): void {
        super.setSolidColor(c);
        this.updateSelection();
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                if (this.colorType === 'color') {
                    api.textModifyColor(page, shape, idx, len, new Color(c.A, c.R, c.G, c.B));
                } else {
                    api.textModifyHighlightColor(page, shape, idx, len, new Color(c.A, c.R, c.G, c.B));
                }
            })
        }
        this.editor.modifySolidColor([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    /* 拖拽修改纯色前置 */
    dragSolidBegin(): void {
        this.updateSelection();
    }

    /* 拖拽修改纯色 */
    solidDragging(c: RGBACatch): void {
        super.setSolidColor(c);
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                if (this.colorType === 'color') {
                    api.textModifyColor(page, shape, idx, len, new Color(c.A, c.R, c.G, c.B));
                } else {
                    api.textModifyHighlightColor(page, shape, idx, len, new Color(c.A, c.R, c.G, c.B));
                }
            })
        }
        this.editor.modifySolidColor([modifyLocal]);
        this.hiddenCtrl();
    }

    /* 拖拽修改纯色后置 */
    dragSolidEnd(): void {
        this.commit();
    }

    createStop(c: RGBACatch) {
        this.updateSelection();
        const color = new Color(c.A, c.R, c.G, c.B);
        const stop = new Stop([0] as BasicArray<number>, v4(), c.position, color);
        const getCopy = () => {
            const gradient = this.format!.gradient!;
            const gradientCopy = this.editor.importGradient(gradient);
            gradientCopy.stops.push(this.editor.importStop(stop));
            gradientCopy.stops.sort((a, b) => {
                if (a.position > b.position) {
                    return 1;
                } else if (a.position < b.position) {
                    return -1;
                } else {
                    return 0;
                }
            });
            gradientCopy.stops.forEach((v, i) => {
                const idx = new BasicArray<number>();
                idx.push(i);
                v.crdtidx = idx;
            })
            return gradientCopy;
        }
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                api.setTextGradient(page, shape, getCopy(), idx, len);
            })
        };
        this.editor.createGradientStop([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
        return stop.id;
    }

    removeStop(stopAt: number) {
        this.updateSelection();
        const getCopy = () => {
            const gradient = this.format!.gradient!;
            const gradientCopy = this.editor.importGradient(gradient);
            gradientCopy.stops.splice(stopAt, 1);
            return gradientCopy;
        }
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                api.setTextGradient(page, shape, getCopy(), idx, len);
            })
        };
        this.editor.removeGradientStop([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    setStopColor(c: RGBACatch, stopAt: number) {
        this.updateSelection();
        const getCopy = () => {
            const gradient = this.format!.gradient!;
            const copy = this.editor.importGradient(gradient);
            copy.stops[stopAt].color = new Color(c.A, c.R, c.G, c.B);
            return copy;
        }
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                api.setTextGradient(page, shape, getCopy(), idx, len);
            })
        };
        this.editor.modifyStopColorOnce([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    dragStopBegin() {
        this.updateSelection();
    }

    draggingStop(c: RGBACatch, stopAt: number): void {
        const getCopy = () => {
            const gradient = this.format!.gradient!;
            const copy = this.editor.importGradient(gradient);
            copy.stops[stopAt].color = new Color(c.A, c.R, c.G, c.B);
            return copy;
        }
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                api.setTextGradient(page, shape, getCopy(), idx, len);
            })
        }
        this.editor.modifyStopColor([modifyLocal]);
        this.hiddenCtrl();
    }

    dragStopEnd(): void {
        this.commit();
    }

    dragStopPositionBegin() {
        this.updateSelection();
    }

    draggingStopPosition(position: number, stopAt: number) {
        const getCopy = () => {
            const gradient = this.format!.gradient!;
            const copy = this.editor.importGradient(gradient);
            copy.stops[stopAt].position = position;
            copy.stops.sort((a, b) => a.position > b.position ? 1 : -1);
            return copy;
        };
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                api.setTextGradient(page, shape, getCopy(), idx, len);
            })
        }
        this.editor.modifyStopPosition([modifyLocal]);
        this.hiddenCtrl();
    }

    dragStopPositionEnd() {
        this.commit();
    }

    reverseStops() {
        this.updateSelection();
        const getCopy = () => {
            const gradient = this.format!.gradient!;
            const stops = gradient.stops;
            const reversedStops: BasicArray<Stop> = new BasicArray<Stop>();
            for (let _i = 0, _l = stops.length; _i < _l; _i++) {
                const _stop = stops[_i];
                const inverseIndex = stops.length - 1 - _i;
                reversedStops.push(new Stop([_i] as BasicArray<number>, _stop.id, _stop.position, stops[inverseIndex].color));
            }
            const copy = this.editor.importGradient(gradient);
            copy.stops = reversedStops;
            return copy;
        }
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                api.setTextGradient(page, shape, getCopy(), idx, len);
            })
        }
        this.editor.reverseGradientStops([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    rotateStops() {
        this.updateSelection();
        const getCopy = () => {
            const gradient = this.format!.gradient!;
            const copy = this.editor.importGradient(gradient);
            const { from, to } = copy;
            const gradientType = copy.gradientType;
            if (gradientType === GradientType.Linear) {
                const midpoint = { x: (to.x + from.x) / 2, y: (to.y + from.y) / 2 };
                const m = new Matrix();
                m.trans(-midpoint.x, -midpoint.y);
                m.rotate(Math.PI / 2);
                m.trans(midpoint.x, midpoint.y);
                copy.to = m.computeCoord3(to) as Point2D;
                copy.from = m.computeCoord3(from) as Point2D;
            } else if (gradientType === GradientType.Radial || gradientType === GradientType.Angular) {
                const m = new Matrix();
                m.trans(-from.x, -from.y);
                m.rotate(Math.PI / 2);
                m.trans(from.x, from.y);
                copy.to = m.computeCoord3(to) as any;
            }
            return copy;
        }
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                api.setTextGradient(page, shape, getCopy(), idx, len);
            })
        }
        this.editor.rotateGradientStops([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }
}