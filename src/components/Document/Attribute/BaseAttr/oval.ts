/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { PathShapeView, ShapeView } from "@kcdesign/data";

export interface OvalOptions {
    start: number | string;
    sweep: number | string;
    ratio: number | string;
    disabled: boolean;
}

export function sortValue(value: string) {
    return Number(value.replace(/[°|%]/g, ''));
}

export class OvalData {
    private mixed: string;

    private readonly m_options: OvalOptions;
    private readonly m_context: Context;

    private m_selected: ShapeView[];
    private m_disabled: boolean = false;

    constructor(context: Context, options: OvalOptions) {
        this.m_context = context;
        this.m_options = options;
        this.m_selected = context.selection.selectedShapes;
        this.mixed = context.workspace.t('attr.mixed');
    }

    stash() {
        return this.m_selected;
    }

    stashSelection(selected?: ShapeView[]) {
        this.m_selected = [...(selected || this.m_context.selection.selectedShapes)];
    }

    update(trigger: any[] | number) {
        if (typeof trigger === "number" || (trigger.includes('pathsegs') || trigger.includes('endingAngle') || trigger.includes('innerRadius'))) this.__update();
    }

    fix(value: number) {
        value = Number(value.toFixed(2));
        if (!(value * 100 % 10)) value = Number(value.toFixed(1));
        return value;
    }

    __update() {
        const selected = this.m_selected;

        let START = new Set<number | undefined>();
        let SWEEP = new Set<number | undefined>();
        let RATIO = new Set<number | undefined>();

        const round = Math.PI * 2;

        const fix = this.fix.bind(this);

        const options = this.m_options;

        for (const oval of selected) {
            if (oval.isVirtualShape) options.disabled = true;
            if (!(oval instanceof PathShapeView) || oval.haveEdit) continue;

            const start = oval.startingAngle ?? 0;
            const end = oval.endingAngle ?? round;
            const ratio = oval.innerRadius ?? 0;

            const sweep = (end - start) / round;

            START.add(start);
            SWEEP.add(sweep);
            RATIO.add(ratio);
        }

        let __start;
        if (START.size > 1) {
            __start = this.mixed;
        } else {
            __start = Array.from(START.values()).pop() || 0;
        }

        if (SWEEP.size > 1) {
            options.sweep = this.mixed;
        } else {
            options.sweep = fix((Array.from(SWEEP.values()).pop() || 0) * 100) + '%';
        }

        if (typeof __start === "string") {
            options.start = this.mixed;
        } else {
            __start = 360 * (__start / (Math.PI * 2));
            if (__start > 180) __start -= 360;
            options.start = fix(__start) + '°';
        }

        if (RATIO.size > 1) {
            options.ratio = this.mixed;
        } else {
            options.ratio = fix((Array.from(RATIO.values()).pop() || 0) * 100) + '%';
        }

        return this.m_disabled;
    }
}