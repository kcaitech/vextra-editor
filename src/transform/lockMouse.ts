/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { LockMouseHandler, Shadow, ShapeView, SideType, TidyUpAlign, UniformScaleUnit } from "@kcdesign/data";

export class LockMouse extends TransformHandler {
    private transType: 'scaling' | 'translating' | 'rotating' = 'translating';
    readonly shapes: ShapeView[] = [];

    constructor(context: Context, event: MouseEvent, shapes?: ShapeView[]) {
        super(context, event);

        this.shapes = shapes || context.selection.selectedShapes;
    }

    createApiCaller(transType?: 'scaling' | 'translating' | 'rotating') {
        this.asyncApiCaller = new LockMouseHandler(this.context.coopRepo, this.context.data, this.page);
        if (transType) {
            this.workspace[transType](true);
            this.workspace.setSelectionViewUpdater(false);

            this.transType = transType;
            this.workspace.translating(true); // 借用一下translating的特性
        }
    }

    fulfil() {
        this.workspace[this.transType](false);
        this.workspace.translating(false);

        this.workspace.setSelectionViewUpdater(true);

        super.fulfil();
    }

    executeX(dx: number) {
        (this.asyncApiCaller as LockMouseHandler).executeX(this.shapes, dx);
    }

    executeY(dy: number) {
        (this.asyncApiCaller as LockMouseHandler).executeY(this.shapes, dy);
    }

    executeW(dw: number) {
        (this.asyncApiCaller as LockMouseHandler).executeW(this.shapes, dw);
    }

    executeH(dh: number) {
        (this.asyncApiCaller as LockMouseHandler).executeH(this.shapes, dh);
    }

    executeRotate(deg: number) {
        (this.asyncApiCaller as LockMouseHandler).executeRotate(this.shapes, deg);
        this.updateCtrlView(1);
    }

    executeCounts(count: number) {
        (this.asyncApiCaller as LockMouseHandler).executeCounts(this.shapes, count);
    }

    executeInnerAngle(offset: number) {
        (this.asyncApiCaller as LockMouseHandler).executeInnerAngle(this.shapes, offset);
    }

    executeRadius(values: number[]) {
        (this.asyncApiCaller as LockMouseHandler).executeRadius(this.shapes, values);
    }

    executeShadowX(actions: { shadow: Shadow, value: number }[]) {
        (this.asyncApiCaller as LockMouseHandler).executeShadowX(actions);
    }

    executeShadowY(actions: { shadow: Shadow, value: number }[]) {
        (this.asyncApiCaller as LockMouseHandler).executeShadowY(actions);
    }

    executeShadowB(actions: { shadow: Shadow, value: number }[]) {
        (this.asyncApiCaller as LockMouseHandler).executeShadowB(actions);
    }

    executeShadowS(actions: { shadow: Shadow, value: number }[]) {
        (this.asyncApiCaller as LockMouseHandler).executeShadowS(actions);
    }
    executeTidyup(shapes_rows: ShapeView[][], hor: number, ver: number, dir: boolean, align: TidyUpAlign) {
        (this.asyncApiCaller as LockMouseHandler).executeTidyup(shapes_rows, hor, ver, dir, align);
    }

    executeUniformScale(units: UniformScaleUnit[], ratio: number) {

    }

    modifyStartingAngleBy(shapes: ShapeView[], delta: number) {
        (this.asyncApiCaller as LockMouseHandler).modifyStartingAngleBy(shapes, delta);
    }

    modifySweepBy(shapes: ShapeView[], delta: number) {
        (this.asyncApiCaller as LockMouseHandler).modifySweepBy(shapes, delta);
    }
    modifyInnerRadiusBy(shapes: ShapeView[], delta: number) {
        (this.asyncApiCaller as LockMouseHandler).modifyInnerRadiusBy(shapes, delta);
    }
    modifyBorderThickness(shapes: ShapeView[], thickness: number) {
        (this.asyncApiCaller as LockMouseHandler).modifyBorderThickness(shapes, thickness);
    }

    modifyBorderCustomThickness(shapes: ShapeView[], thickness: number, type: SideType) {
        (this.asyncApiCaller as LockMouseHandler).modifyBorderCustomThickness(shapes, thickness, type);
    }
}