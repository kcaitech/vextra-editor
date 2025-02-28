import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import {
    BasicArray,
    Color,
    Fill,
    ImageScaleMode,
    Stop,
    FillMask,
    ShapeView, Api, SymbolRefView, GradientType, Matrix, Point2D,
    FillType,
    BorderPaintsAsyncApi
} from "@kcdesign/data";
import { v4 } from "uuid";

export class PaintsPicker extends ColorPickerEditor {
    paint: Fill | undefined;

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    private m_index: number | undefined;

    get index(): number {
        if (this.m_index !== undefined) return this.m_index;
        if (!this.paint) return this.m_index = 0;
        const parent = this.paint.parent as any;
        return this.m_index = parent?.findIndex((i: any) => i.id === this.paint?.id) ?? -1;
    }

    private get editor(): BorderPaintsAsyncApi {
        return (this.m_api as unknown as BorderPaintsAsyncApi)
            ?? (this.m_api = new BorderPaintsAsyncApi(this.context.coopRepo, this.context.data, this.page));
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
        this.m_index = undefined;
    }

    private setType(api: Api, fill: Fill, type: string): void {
        if (type === FillType.SolidColor) {
            api.setFillType(fill, FillType.SolidColor);
            if (fill.gradient) {
                const { red, green, blue, alpha } = fill.gradient.stops[0].color;
                const color = new Color(alpha, red, green, blue);
                api.setFillColor(fill, color);
            }
        } else if (type === FillType.Pattern) {
            api.setFillType(fill, FillType.Pattern);
            if (!fill.imageScaleMode) api.setFillScaleMode(fill, ImageScaleMode.Fill);
        } else {
            api.setFillType(fill, FillType.Gradient);
            this.editor.initGradient(api, { fill, type });
        }
    }

    /* 修改填充类型 */
    modifyFillType(type: string): void {
        if (!this.paint) return;
        super.modifyFillType(type);
        this.updateSelection();
        if (this.paint.parent?.parent instanceof FillMask) {
            this.editor.modifyFillType([(api: Api) => {
                this.setType(api, this.paint!, type);
            }]);
            this.commit();
            return;
        }
        const views: ShapeView[] = [];
        const fills: BasicArray<Fill>[] = [];
        for (const view of this.selected) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getBorders().strokePaints);
        }
        const modifyVariable = (api: Api) => {
            views.forEach(view => {
                const variable = this.editor.getBorderVariable(api, this.page, view);
                this.setType(api, variable.value.strokePaints[this.index], type);
            });
        }
        const modifyLocal = (api: Api) => {
            fills.forEach((_fills) => {
                this.setType(api, _fills[this.index], type);
            })
        }
        this.editor.modifyFillType([modifyVariable, modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    /* 修改填充纯色 */
    setSolidColor(c: RGBACatch): void {
        if (!this.paint) return;
        this.updateSelection();
        if (this.paint.parent?.parent instanceof FillMask) {
            this.editor.modifySolidColor([(api: Api) => {
                api.setFillColor(this.paint!, new Color(c.A, c.R, c.G, c.B));
            }]);
            this.commit();
            return;
        }
        const views: ShapeView[] = [];
        const fills: BasicArray<Fill>[] = [];
        for (const view of this.selected) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getBorders().strokePaints);
        }
        const modifyVariable = (api: Api) => {
            views.forEach(view => {
                const variable = this.editor.getBorderVariable(api, this.page, view);
                api.setFillColor(variable.value.strokePaints[this.index], new Color(c.A, c.R, c.G, c.B));
            });
        }
        const modifyLocal = (api: Api) => {
            fills.forEach((_fills) => {
                api.setFillColor(_fills[this.index], new Color(c.A, c.R, c.G, c.B));
            })
        }
        this.editor.modifySolidColor([modifyVariable, modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    private m_views: ShapeView[] = [];
    private m_fills: BasicArray<Fill>[] = [];

    /* 拖拽修改纯色前置 */
    dragSolidBegin(): void {
        this.updateSelection();
        for (const view of this.selected) {
            if (view instanceof SymbolRefView || view.isVirtualShape) this.m_views.push(view);
            else this.m_fills.push(view.getBorders().strokePaints);
        }
    }

    /* 拖拽修改纯色 */
    solidDragging(c: RGBACatch): void {
        if (this.paint!.parent?.parent instanceof FillMask) {
            this.editor.modifySolidColor([(api: Api) => {
                api.setFillColor(this.paint!, new Color(c.A, c.R, c.G, c.B));
            }]);
            return;
        }

        const modifyVariable = (api: Api) => {
            this.m_views.forEach(view => {
                const variable = this.editor.getBorderVariable(api, this.page, view);
                api.setFillColor(variable.value.strokePaints[this.index], new Color(c.A, c.R, c.G, c.B));
            });
        }
        const modifyLocal = (api: Api) => {
            this.m_fills.forEach((_fills) => {
                api.setFillColor(_fills[this.index], new Color(c.A, c.R, c.G, c.B));
            })
        }
        this.editor.modifySolidColor([modifyVariable, modifyLocal]);
        this.hiddenCtrl();
    }

    /* 拖拽修改纯色后置 */
    dragSolidEnd(): void {
        this.m_fills = [];
        this.m_views = [];
        this.commit();
    }

    createStop(c: RGBACatch) {
        this.updateSelection();
        const color = new Color(c.A, c.R, c.G, c.B);
        const stop = new Stop([0] as BasicArray<number>, v4(), c.position, color);
        const getCopy = () => {
            const gradient = this.paint!.gradient!;
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
        if (this.paint?.parent?.parent instanceof FillMask) {
            this.editor.createGradientStop([(api: Api) => {
                api.setFillGradient(this.paint!, getCopy());
            }]);
        } else {
            const views: ShapeView[] = [];
            const fills: Fill[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getBorders().strokePaints[this.index]);
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getBorderVariable(api, this.page, view);
                    api.setFillGradient(variable.value.strokePaints[this.index], getCopy());
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
        this.updateSelection();
        const getCopy = () => {
            const gradient = this.paint!.gradient!;
            const gradientCopy = this.editor.importGradient(gradient);
            gradientCopy.stops.splice(stopAt, 1);
            return gradientCopy;
        }
        if (this.paint?.parent?.parent instanceof FillMask) {
            this.editor.removeGradientStop([(api: Api) => {
                api.setFillGradient(this.paint!, getCopy());
            }])
        } else {
            const views: ShapeView[] = [];
            const fills: Fill[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getBorders().strokePaints[this.index]);
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getBorderVariable(api, this.page, view);
                    api.setFillGradient(variable.value.strokePaints[this.index], getCopy());
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
        this.updateSelection();
        if (!this.paint) return;

        const getCopy = () => {
            const gradient = this.paint!.gradient!;
            const copy = this.editor.importGradient(gradient);
            copy.stops[stopAt].color = new Color(c.A, c.R, c.G, c.B);
            return copy;
        }
        if (this.paint.parent?.parent instanceof FillMask) {
            this.editor.modifyStopColorOnce([(api: Api) => {
                api.setFillGradient(this.paint!, getCopy());
            }]);
        } else {
            const views: ShapeView[] = [];
            const fills: Fill[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getBorders().strokePaints[this.index]);
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getBorderVariable(api, this.page, view);
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
        this.updateSelection();
        for (const view of this.selected) {
            if (view instanceof SymbolRefView || view.isVirtualShape) this.m_views.push(view);
            else this.m_fills.push(view.getBorders().strokePaints);
        }
    }

    draggingStop(c: RGBACatch, stopAt: number): void {
        const getCopy = () => {
            const gradient = this.paint!.gradient!;
            const copy = this.editor.importGradient(gradient);
            copy.stops[stopAt].color = new Color(c.A, c.R, c.G, c.B);
            return copy;
        }
        if (this.paint!.parent?.parent instanceof FillMask) {
            this.editor.modifyStopColor([(api: Api) => {
                api.setFillGradient(this.paint!, getCopy());
            }]);
            return;
        }

        const modifyVariable = (api: Api) => {
            this.m_views.forEach(view => {
                const variable = this.editor.getBorderVariable(api, this.page, view);
                api.setFillGradient(variable.value.strokePaints[this.index], getCopy());
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
        this.updateSelection();
        for (const view of this.selected) {
            if (view instanceof SymbolRefView || view.isVirtualShape) this.m_views.push(view);
            else this.m_fills.push(view.getBorders().strokePaints);
        }
    }

    draggingStopPosition(position: number, stopAt: number) {
        if (!this.paint) return;
        const getCopy = () => {
            const gradient = this.paint!.gradient!;
            const copy = this.editor.importGradient(gradient);
            copy.stops[stopAt].position = position;
            copy.stops.sort((a, b) => a.position > b.position ? 1 : -1);
            return copy;
        };
        if (this.paint.parent?.parent instanceof FillMask) {
            this.editor.modifyStopPosition([(api: Api) => {
                api.setFillGradient(this.paint!, getCopy());
            }]);
        } else {
            const modifyVariable = (api: Api) => {
                this.m_views.forEach(view => {
                    const variable = this.editor.getBorderVariable(api, this.page, view);
                    api.setFillGradient(variable.value.strokePaints[this.index], getCopy());
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
        if (!this.paint) return;

        this.updateSelection();

        const getCopy = () => {
            const gradient = this.paint!.gradient!;
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
        if (this.paint.parent?.parent instanceof FillMask) {
            this.editor.removeGradientStop([(api: Api) => {
                api.setFillGradient(this.paint!, getCopy());
            }])
        } else {
            const views: ShapeView[] = [];
            const fills: BasicArray<Fill>[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getBorders().strokePaints);
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getBorderVariable(api, this.page, view);
                    api.setFillGradient(variable.value.strokePaints[this.index], getCopy());
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
        if (!this.paint) return;

        this.updateSelection();

        const getCopy = () => {
            const gradient = this.paint!.gradient!;
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
        if (this.paint.parent?.parent instanceof FillMask) {
            this.editor.removeGradientStop([(api: Api) => {
                api.setFillGradient(this.paint!, getCopy());
            }])
        } else {
            const views: ShapeView[] = [];
            const fills: BasicArray<Fill>[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getBorders().strokePaints);
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getBorderVariable(api, this.page, view);
                    api.setFillGradient(variable.value.strokePaints[this.index], getCopy());
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