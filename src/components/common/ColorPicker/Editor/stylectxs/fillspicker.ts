/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
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
    Fill,
    FillsAsyncApi,
    ImagePack,
    ImageScaleMode,
    Stop,
    FillMask,
    PaintFilterType,
    ShapeView, Api, SymbolRefView, GradientType, Matrix, Point2D,
    FillType
} from "@kcdesign/data";
import { v4 } from "uuid";
import { getNumberFromInputEvent } from "@/components/Document/Attribute/basic";
import { ImageLoader } from "@/imageLoader";
import { modify_imgs } from "@/utils/content";
import { updateRecently } from "@/components/common/ColorPicker/utils";

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
        return this.m_index = parent?.findIndex((i: any) => i.id === this.fill?.id) ?? -1;
    }

    private get editor(): FillsAsyncApi {
        return (this.m_api as unknown as FillsAsyncApi)
            ?? (this.m_api = new FillsAsyncApi(this.context.coopRepo, this.context.data, this.page));
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
        if (!this.fill) return;
        super.modifyFillType(type);
        this.updateSelection();
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.modifyFillType([(api: Api) => {
                this.setType(api, this.fill!, type);
            }]);
            this.commit();
            return;
        }
        const views: ShapeView[] = [];
        const fills: BasicArray<Fill>[] = [];
        for (const view of this.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills());
        }
        const modifyVariable = (api: Api) => {
            views.forEach(view => {
                const variable = this.editor.getFillsVariable(api, this.page, view);
                this.setType(api, variable.value[this.index], type);
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
        super.setSolidColor(c);
        if (!this.fill) return;
        this.updateSelection();
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.modifySolidColor([(api: Api) => {
                api.setFillColor(this.fill!, new Color(c.A, c.R, c.G, c.B));
            }]);
            this.commit();
            return;
        }
        const views: ShapeView[] = [];
        const fills: BasicArray<Fill>[] = [];
        
        for (const view of this.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills());
        }
        const modifyVariable = (api: Api) => {
            views.forEach(view => {
                const variable = this.editor.getFillsVariable(api, this.page, view);
                api.setFillColor(variable.value[this.index], new Color(c.A, c.R, c.G, c.B));
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
        for (const view of this.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) this.m_views.push(view);
            else this.m_fills.push(view.getFills());
        }
    }

    /* 拖拽修改纯色 */
    solidDragging(c: RGBACatch): void {
        super.setSolidColor(c);
        if (this.fill!.parent?.parent instanceof FillMask) {
            this.editor.modifySolidColor([(api: Api) => {
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
            for (const view of this.flat) {
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
        this.updateSelection();
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
            for (const view of this.flat) {
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
        this.updateSelection();
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
            for (const view of this.flat) {
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
        this.updateSelection();
        for (const view of this.flat) {
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
        this.updateSelection();
        for (const view of this.flat) {
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

        this.updateSelection();

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
            for (const view of this.flat) {
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

        this.updateSelection();

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
            for (const view of this.flat) {
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
            this.editor.rotateGradientStops([modifyVariable, modifyLocal]);
            this.hiddenCtrl();
        }
        this.commit();
    }

    modifyObjectFit(type: ImageScaleMode): void {
        if (!this.fill) return;
        this.updateSelection();
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.modifyObjectFit([(api: Api) => {
                api.setFillScaleMode(this.fill!, type);
                if (type === ImageScaleMode.Tile) {
                    if (!this.fill!.scale) api.setFillImageScale(this.fill!, 0.5);
                }
            }]);
            this.commit();
            return;
        }
        const views: ShapeView[] = [];
        const fills: BasicArray<Fill>[] = [];
        for (const view of this.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills());
        }
        const modifyVariable = (api: Api) => {
            views.forEach(view => {
                const variable = this.editor.getFillsVariable(api, this.page, view);
                api.setFillScaleMode(variable.value[this.index], type);
                if (type === ImageScaleMode.Tile) {
                    if (!variable.value[this.index].scale) api.setFillImageScale(variable.value[this.index], 0.5);
                }
            });
        }
        const modifyLocal = (api: Api) => {
            fills.forEach((_fills) => {
                api.setFillScaleMode(_fills[this.index], type);
                if (type === ImageScaleMode.Tile) {
                    if (!_fills[this.index].scale) api.setFillImageScale(_fills[this.index], 0.5);
                }
            })
        }
        this.editor.modifyObjectFit([modifyVariable, modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    modifyTileScale(event: Event): void {
        if (!this.fill) return;
        this.updateSelection();
        const val = Math.max(2, getNumberFromInputEvent(event)) / 100;
        if (isNaN(val)) return;
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.modifyTileScale([(api: Api) => {
                api.setFillImageScale(this.fill!, val);
            }]);
            this.commit();
            return;
        }
        const views: ShapeView[] = [];
        const fills: BasicArray<Fill>[] = [];
        for (const view of this.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills());
        }
        const modifyVariable = (api: Api) => {
            views.forEach(view => {
                const variable = this.editor.getFillsVariable(api, this.page, view);
                api.setFillImageScale(variable.value[this.index], val);
            });
        }
        const modifyLocal = (api: Api) => {
            fills.forEach((_fills) => {
                api.setFillImageScale(_fills[this.index], val);
            })
        }
        this.editor.modifyTileScale([modifyVariable, modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    /* 当一个填充以图片作为填充物并以平铺方式填充时，用于旋转图片 */
    rotateImg(): void {
        if (!this.fill) return;
        this.updateSelection();
        const rotate = ((this.fill?.rotation ?? 0) + 90) % 360;
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.rotateImg([(api: Api) => api.setFillImageRotate(this.fill!, rotate)]);
            this.commit();
            return;
        }
        const views: ShapeView[] = [];
        const fills: BasicArray<Fill>[] = [];
        for (const view of this.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills());
        }
        const modifyVariable = (api: Api) => {
            views.forEach(view => {
                const variable = this.editor.getFillsVariable(api, this.page, view);
                api.setFillImageRotate(variable.value[this.index], rotate);
            });
        }
        const modifyLocal = (api: Api) => {
            fills.forEach((_fills) => api.setFillImageRotate(_fills[this.index], rotate));
        }
        this.editor.rotateImg([modifyVariable, modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    private getModifyRefMissions(ref: string, media: {
        buff: Uint8Array,
        base64: string
    }, width: number, height: number): Function[] {
        this.updateSelection();
        if (!this.fill) return [];
        if (this.fill.parent?.parent instanceof FillMask) {
            const mission = (api: Api) => {
                api.setFillImageRef(this.context.data, this.fill!, ref, media);
                api.setFillImageOriginWidth(this.fill!, width);
                api.setFillImageOriginHeight(this.fill!, height);
            }
            return [mission];
        } else {
            const views: ShapeView[] = [];
            const fills: BasicArray<Fill>[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getFills());
            }
            const modifyVariable = (api: Api) => {
                views.forEach(view => {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    const fill = variable.value[this.index];
                    api.setFillImageRef(this.context.data, fill, ref, media);
                    api.setFillImageOriginWidth(fill, width);
                    api.setFillImageOriginHeight(fill, height);
                });
            }
            const modifyLocal = (api: Api) => {
                fills.forEach((_fills) => {
                    const fill = _fills[this.index];
                    api.setFillImageRef(this.context.data, fill, ref, media);
                    api.setFillImageOriginWidth(fill, width);
                    api.setFillImageOriginHeight(fill, height);
                })
            }
            return [modifyVariable, modifyLocal];
        }
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
                const { buff, base64, size } = result;
                const media = { name: file.name || '', frame: result.size, buff, base64 };
                const container: any = {};
                modify_imgs(this.context, [media], container);
                const keys = Array.from(Object.keys(container) || []) as string[];
                const missions = this.getModifyRefMissions(keys[0], { buff, base64 }, size.width, size.height);
                this.editor.modifyFillImageRef(missions);
                this.hiddenCtrl();
                const upload = this.flat.map(shape => ({ shape, upload: [{ buff, ref: keys[0], base64 }] }));
                imageLoader.upload(upload)
            })
            .finally(() => {
                this.commit();
            });
    }

    filterDragBegin(): void {
        this.updateSelection();
        for (const view of this.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) this.m_views.push(view);
            else this.m_fills.push(view.getFills());
        }
    }

    filterDragging(type: string, val: number): void {
        if (!this.fill) return;
        const key = type as PaintFilterType;
        if (this.fill.parent?.parent instanceof FillMask) {
            this.editor.modifyFillImageFilter([(api: Api) => {
                api.setFillImageFilter(this.fill!, key, val);
            }]);
        } else {
            const modifyVariable = (api: Api) => {
                this.m_views.forEach(view => {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.setFillImageFilter(variable.value[this.index], key, val);
                });
            }
            const modifyLocal = (api: Api) => {
                this.m_fills.forEach((_fills) => {
                    api.setFillImageFilter(_fills[this.index], key, val);
                })
            }
            this.editor.modifyFillImageFilter([modifyVariable, modifyLocal]);
            this.hiddenCtrl();
        }
    }

    filterDragEnd(): void {
        this.m_fills = [];
        this.m_views = [];
        this.commit();
    }
}