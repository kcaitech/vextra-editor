import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import {
    BasicArray,
    Color,
    Fill,
    TextAsyncApi,
    ImagePack,
    ImageScaleMode,
    Stop,
    FillMask,
    PaintFilterType,
    ShapeView, Api, SymbolRefView, GradientType, Matrix, Point2D,
    FillType,
    AttrGetter,
    TextShapeView,
    ShapeType
} from "@kcdesign/data";
import { v4 } from "uuid";
import { getNumberFromInputEvent } from "@/components/Document/Attribute/basic";
import { ImageLoader } from "@/imageLoader";
import { modify_imgs } from "@/utils/content";

export class TextPicker extends ColorPickerEditor {
    format: AttrGetter | undefined

    constructor(public context: Context, type: string) {
        super(context, type);
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
        this.getSelection();
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
        this.getSelection();
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
                api.textModifyColor(page, shape, idx, len, new Color(c.A, c.R, c.G, c.B));
            })
        }
        this.editor.modifySolidColor2([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    private m_views: ShapeView[] = [];
    private m_fills: BasicArray<Fill>[] = [];
    /* 拖拽修改纯色前置 */
    dragSolidBegin(): void {
        this.getSelection();
        for (const view of this.selected) {
            if (view instanceof SymbolRefView || view.isVirtualShape) this.m_views.push(view);
            else this.m_fills.push(view.getFills());
        }
    }

    /* 拖拽修改纯色 */
    solidDragging(c: RGBACatch): void {
        if (this.fill!.parent?.parent instanceof FillMask) {
            this.editor.modifySolidColor2([(api: Api) => {
                api.setFillColor(this.fill!, new Color(c.A, c.R, c.G, c.B));
            }]);
            return;
        }

        const modifyVariable = (api: Api) => {
            this.m_views.forEach(view => {
                const variable = this.editor.getFillsVariable(api, this.page, view);
                api.setFillColor(variable.value[this.index], new Color(c.A, c.R, c.G, c.B));
            });
        }
        const modifyLocal = (api: Api) => {
            this.m_fills.forEach((_fills) => {
                api.setFillColor(_fills[this.index], new Color(c.A, c.R, c.G, c.B));
            })
        }
        this.editor.modifySolidColor2([modifyVariable, modifyLocal]);
        this.hiddenCtrl();
    }

    /* 拖拽修改纯色后置 */
    dragSolidEnd(): void {
        this.m_fills = [];
        this.m_views = [];
        this.commit();
    }

    createStop(c: RGBACatch) {
        this.getSelection();
        const color = new Color(c.A, c.R, c.G, c.B);
        const stop = new Stop([0] as BasicArray<number>, v4(), c.position, color);
        const getCopy = () => {
            const gradient = this.fill!.gradient!;
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
        if (this.fill?.parent?.parent instanceof FillMask) {
            this.editor.createGradientStop([(api: Api) => {
                api.setFillGradient(this.fill!, getCopy());
            }]);
        } else {
            const views: ShapeView[] = [];
            const fills: Fill[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getFills()[this.index]);
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.setFillGradient(variable.value[this.index], getCopy());
                })
            };
            const modifyLocal = (api: Api) => {
                fills.forEach((fill) => api.setFillGradient(fill, getCopy()));
            };
            this.editor.createGradientStop([modifyVariable, modifyLocal]);
            this.hiddenCtrl();
        }
        this.commit();
        return stop.id;
    }

    removeStop(stopAt: number) {
        this.getSelection();
        const getCopy = () => {
            const gradient = this.fill!.gradient!;
            const gradientCopy = this.editor.importGradient(gradient);
            gradientCopy.stops.splice(stopAt, 1);
            return gradientCopy;
        }
        if (this.fill?.parent?.parent instanceof FillMask) {
            this.editor.removeGradientStop([(api: Api) => {
                api.setFillGradient(this.fill!, getCopy());
            }])
        } else {
            const views: ShapeView[] = [];
            const fills: Fill[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getFills()[this.index]);
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.setFillGradient(variable.value[this.index], getCopy());
                })
            };
            const modifyLocal = (api: Api) => {
                fills.forEach((fill) => api.setFillGradient(fill, getCopy()));
            };
            this.editor.removeGradientStop([modifyVariable, modifyLocal]);
            this.hiddenCtrl();
        }
        this.commit();
    }

    setStopColor(c: RGBACatch, stopAt: number) {
        this.getSelection();
        if (!this.fill) return;

        const getCopy = () => {
            const gradient = this.fill!.gradient!;
            const copy = this.editor.importGradient(gradient);
            copy.stops[stopAt].color = new Color(c.A, c.R, c.G, c.B);
            return copy;
        }
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.modifyStopColorOnce([(api: Api) => {
                api.setFillGradient(this.fill!, getCopy());
            }]);
        } else {
            const views: ShapeView[] = [];
            const fills: Fill[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getFills()[this.index]);
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.setFillGradient(variable.value[this.index], getCopy());
                })
            };
            const modifyLocal = (api: Api) => {
                fills.forEach((fill) => api.setFillGradient(fill, getCopy()));
            };
            this.editor.modifyStopColorOnce([modifyVariable, modifyLocal]);
            this.hiddenCtrl();
        }
        this.commit();
    }

    dragStopBegin() {
        this.getSelection();
        for (const view of this.selected) {
            if (view instanceof SymbolRefView || view.isVirtualShape) this.m_views.push(view);
            else this.m_fills.push(view.getFills());
        }
    }

    draggingStop(c: RGBACatch, stopAt: number): void {
        const getCopy = () => {
            const gradient = this.fill!.gradient!;
            const copy = this.editor.importGradient(gradient);
            copy.stops[stopAt].color = new Color(c.A, c.R, c.G, c.B);
            return copy;
        }
        if (this.fill!.parent?.parent instanceof FillMask) {
            this.editor.modifyStopColor([(api: Api) => {
                api.setFillGradient(this.fill!, getCopy());
            }]);
            return;
        }

        const modifyVariable = (api: Api) => {
            this.m_views.forEach(view => {
                const variable = this.editor.getFillsVariable(api, this.page, view);
                api.setFillGradient(variable.value[this.index], getCopy());
            });
        }
        const modifyLocal = (api: Api) => {
            this.m_fills.forEach((_fills) => {
                api.setFillGradient(_fills[this.index], getCopy());
            })
        }
        this.editor.modifyStopColor([modifyVariable, modifyLocal]);
        this.hiddenCtrl();
    }

    dragStopEnd(): void {
        this.m_views = [];
        this.m_fills = [];
        this.commit();
    }

    dragStopPositionBegin() {
        this.getSelection();
        for (const view of this.selected) {
            if (view instanceof SymbolRefView || view.isVirtualShape) this.m_views.push(view);
            else this.m_fills.push(view.getFills());
        }
    }

    draggingStopPosition(position: number, stopAt: number) {
        if (!this.fill) return;
        const getCopy = () => {
            const gradient = this.fill!.gradient!;
            const copy = this.editor.importGradient(gradient);
            copy.stops[stopAt].position = position;
            copy.stops.sort((a, b) => a.position > b.position ? 1 : -1);
            return copy;
        };
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.modifyStopPosition([(api: Api) => {
                api.setFillGradient(this.fill!, getCopy());
            }]);
        } else {
            const modifyVariable = (api: Api) => {
                this.m_views.forEach(view => {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.setFillGradient(variable.value[this.index], getCopy());
                });
            }
            const modifyLocal = (api: Api) => {
                this.m_fills.forEach((_fills) => {
                    api.setFillGradient(_fills[this.index], getCopy());
                })
            }
            this.editor.modifyStopPosition([modifyVariable, modifyLocal]);
        }
        this.hiddenCtrl();
    }

    dragStopPositionEnd() {
        this.m_views = [];
        this.m_fills = [];
        this.commit();
    }

    reverseStops() {
        if (!this.fill) return;

        this.getSelection();

        const getCopy = () => {
            const gradient = this.fill!.gradient!;
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
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.removeGradientStop([(api: Api) => {
                api.setFillGradient(this.fill!, getCopy());
            }])
        } else {
            const views: ShapeView[] = [];
            const fills: BasicArray<Fill>[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getFills());
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.setFillGradient(variable.value[this.index], getCopy());
                });
            }
            const modifyLocal = (api: Api) => {
                fills.forEach((_fills) => {
                    api.setFillGradient(_fills[this.index], getCopy());
                })
            }
            this.editor.reverseGradientStops([modifyVariable, modifyLocal]);
            this.hiddenCtrl();
        }
        this.commit();
    }

    rotateStops() {
        if (!this.fill) return;

        this.getSelection();

        const getCopy = () => {
            const gradient = this.fill!.gradient!;
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
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.removeGradientStop([(api: Api) => {
                api.setFillGradient(this.fill!, getCopy());
            }])
        } else {
            const views: ShapeView[] = [];
            const fills: BasicArray<Fill>[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getFills());
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.setFillGradient(variable.value[this.index], getCopy());
                });
            }
            const modifyLocal = (api: Api) => {
                fills.forEach((_fills) => {
                    api.setFillGradient(_fills[this.index], getCopy());
                })
            }
            this.editor.reverseGradientStops([modifyVariable, modifyLocal]);
            this.hiddenCtrl();
        }
        this.commit();
    }
}