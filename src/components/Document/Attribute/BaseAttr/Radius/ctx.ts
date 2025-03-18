/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import {
    BasicArray,
    RadiusMask,
    RadiusModifier,
    RadiusType,
    ShapeView,
    StyleMangerMember,
} from "@kcdesign/data";
import { v4 } from "uuid";
import { StyleCtx } from "../../stylectx";
import { MaskInfo } from "../../basic";

export type RadiusContext = {
    mixed: boolean;
    radius: (number | string)[];
    rect: boolean;
    mask?: string;
    maskInfo?: MaskInfo;
}

function radiusMaskMixed(radiusMask: string | undefined) {
    if (radiusMask) return radiusMask;
    return '-';
}

export class RadiusContextMgr extends StyleCtx {
    can_be_rect: boolean = false;

    constructor(protected context: Context, public radiusCtx: RadiusContext) {
        super(context);
        this.radiusCtx.rect = localStorage.getItem('radius-corner-display') === "all";
    }

    private modifyMixedStatus() {
        if (this.flat.length < 1) return;
        if (this.flat.length < 2) return this.radiusCtx.mixed = false;
        const allRadius = this.flat.map(i => ({ radius: i.radius, radiusMask: i.radiusMask }));

        const stringMixed = radiusMaskMixed(allRadius[0].radiusMask);
        for (let i = 1; i < allRadius.length; i++) {
            const str = radiusMaskMixed(allRadius[i].radiusMask);
            if (str !== stringMixed) return this.radiusCtx.mixed = true;
        }
        return this.radiusCtx.mixed = false;
    }

    private updateRadius() {
        if (this.flat.length < 1) return;
        this.radiusCtx.mask = this.radiusCtx.mixed ? undefined : this.flat[0].radiusMask;
        if (this.radiusCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.radiusCtx.mask) as RadiusMask;
            this.radiusCtx.maskInfo = {
                name: mask.name,
                desc: mask.description,
                disabled: mask.disabled
            }
            this.radiusCtx.radius = [...this.flat[0].radius];
        } else {
            this.radiusCtx.maskInfo = undefined;
            this.radiusCtx.radius = this.calculateRadius(this.flat[0]);
        }
    }

    private calculateRadius(shape: ShapeView): (number | string)[] {
        const radiusFirst: (number | string)[] = [];
        const r = shape.radius;
        const mixed = this.context.workspace.t('attr.mixed');
        if (shape.radiusType !== RadiusType.Rect) {
            const same = r.every(i => i === r[0]);
            radiusFirst.push(same && r[0] > -1 ? r[0] : mixed);
        } else {
            radiusFirst.push(...r);
        }

        for (let i = 1, l = this.flat.length; i < l; i++) {
            const currentRadius = this.flat[i].radius;
            if (this.flat[i].radiusType !== RadiusType.Rect) {
                const same = currentRadius.every(i => i === currentRadius[0]);
                if (same) {
                    if (radiusFirst[0] !== currentRadius[0]) radiusFirst[0] = mixed;
                } else {
                    radiusFirst[0] = mixed;
                }
            } else {
                radiusFirst.forEach((v, i) => {
                    radiusFirst[i] = currentRadius[i] === v ? v : mixed;
                });
            }
        }
        if (!this.radiusCtx.rect && radiusFirst.length > 1) {
            const same = radiusFirst.every(r => r === radiusFirst[0]);
            if (!same) radiusFirst[0] = mixed;
        }
        return radiusFirst;
    }

    private modify_can_be_rect() {
        if (this.flat.length < 1) return;
        this.can_be_rect = false;
        const origin = this.radiusCtx.rect;
        this.radiusCtx.rect = false;

        for (let i = 0, l = this.flat.length; i < l; i++) {
            if (this.flat[i].radiusType !== RadiusType.Rect) return;
        }

        this.can_be_rect = true;
        this.radiusCtx.rect = origin;
    }

    private m_editor: RadiusModifier | undefined;

    protected get radiusEditor(): RadiusModifier {
        return this.m_editor ?? (this.m_editor = new RadiusModifier(this.repo));
    }

    update() {
        this.updateSelection();
        this.modify_can_be_rect();
        this.modifyMixedStatus();
        this.updateRadius();
    }

    rectToggle() {
        this.radiusCtx.rect = !this.radiusCtx.rect;
        localStorage.setItem('radius-corner-display', this.radiusCtx.rect ? 'all' : 'corner');
        this.radiusCtx.radius = this.calculateRadius(this.flat[0]);
    }

    modifyRadius(value: number[]) {
        this.editor.shapesModifyRadius(this.flat, value);
        this.hiddenCtrl();
    }

    modifyRadiusMask(mask: RadiusMask, radius: number[]) {
        this.radiusEditor.setShapeMaskRadius(mask, radius);
    }

    addRadiusMask(id: string) {
        if (Object.keys(this.radiusCtx).length === 0) return;
        this.radiusEditor.setShapesRadiusMask(this.page, this.flat, id);
        this.kill();
        this.hiddenCtrl();
    }

    unbind() {
        const id = this.flat[0].radiusMask;
        const { shapes, radius } = get_actions_radius_mask(this.flat, id);
        this.editor.shapesModifyRadius(shapes, radius);
    }

    createStyleLib(name: string, desc: string) {
        let radius = new BasicArray<number>();
        const represent = this.flat[0];
        if (represent.radius.length === 4) {
            radius.push(...represent.radius);
        } else {
            const r = represent.radius[0];
            radius.push(r, r, r, r);
        }
        if (this.radiusCtx.mask) radius = new BasicArray<number>(1, 1, 1, 1);
        const radiusMask = new RadiusMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, radius);
        this.radiusEditor.createRadiusMask(this.document, radiusMask, this.page, this.flat);
        this.kill();
    }
    disableMask(data: StyleMangerMember) {
        this.radiusEditor.disableMask(data);
    }
}

function get_actions_radius_mask(shapes: ShapeView[], mask_id?: string) {
    let radius: number[];
    const id = mask_id ? mask_id : shapes[0].radiusMask!
    const mgr = shapes[0].style.getStylesMgr();
    radius = (mgr?.getSync(id) as RadiusMask).radius;
    return { shapes, radius };
}

export function get_value_from_input(val: any) {
    let value = Number.parseFloat(val);
    value = (value > 0 && !isNaN(value)) ? value : 0;
    if (!(value % 1)) return value;
    if (!(value % 0.1)) return Number(value.toFixed(1));
    else return Number(value.toFixed(2));
}
