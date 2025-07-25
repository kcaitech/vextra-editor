/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { XY } from "@/context/selection";
import { CurvePoint, PathShapeView, PathModifier, Transform } from "@kcaitech/vextra-core";
import { DragKit } from "@/components/common/draggable";
import { Context } from "@/context";

/**
 * @description 曲线修改器
 */
export class CurveModifier {
    constructor(
        private context: Context,
        private view: PathShapeView,
        private segmentIndex: number,
        private previousIndex: number,
        private nextIndex: number
    ) {
    }

    private m_api: PathModifier | undefined;

    private get api(): PathModifier {
        return this.m_api ?? (this.m_api = (() => {
            return new PathModifier(this.context.repo, this.context.data, this.context.selection.selectedPage!);
        })());
    }

    private m_previous: CurvePoint | undefined;

    private get previous() {
        return this.m_previous ?? (this.m_previous = (() => {
            const segment = this.view.segments[this.segmentIndex];
            return segment.points[this.previousIndex] as CurvePoint;
        })());
    }

    private m_qua_to_cube(p0: XY, p1: XY, p2: XY) {
        const p3 = { x: p0.x / 3 + 2 * p1.x / 3, y: p0.y / 3 + 2 * p1.y / 3 }
        const p4 = { x: p2.x / 3 + 2 * p1.x / 3, y: p2.y / 3 + 2 * p1.y / 3 }
        return { p0, p1: p3, p2: p4, p3: p2 };
    }

    private get bezier(): { p0: XY, p1: XY, p2: XY, p3: XY } {
        if (this.previous.hasFrom && this.next.hasTo) {
            return {
                p0: { x: this.previous.x, y: this.previous.y },
                p1: { x: this.previous.fromX!, y: this.previous.fromY! },
                p2: { x: this.next.toX!, y: this.next.toY! },
                p3: { x: this.next.x, y: this.next.y }
            }
        } else if (this.previous.hasFrom) {
            return this.m_qua_to_cube(
                { x: this.previous.x, y: this.previous.y },
                { x: this.previous.fromX!, y: this.previous.fromY! },
                { x: this.next.x, y: this.next.y }
            );
        } else {
            return this.m_qua_to_cube(
                { x: this.previous.x, y: this.previous.y },
                { x: this.next.toX!, y: this.next.toY! },
                { x: this.next.x, y: this.next.y }
            );
        }
    }

    private m_next: CurvePoint | undefined;

    private get next() {
        return this.m_next ?? (this.m_next = (() => {
            const segment = this.view.segments[this.segmentIndex];
            return segment.points[this.nextIndex] as CurvePoint;
        })());
    }

    private getUnitXY(event: MouseEvent): XY {
        const rootXY = this.context.workspace.getRootXY(event);
        let transform = new Transform();
        transform.preScale(this.view.frame.width, this.view.frame.height);
        transform.multiAtLeft(this.view.matrix2Root());
        transform = transform.inverse;
        return transform.computeCoord3(rootXY);
    }

    private getBezierPoint(t: number, bezier?: { p0: XY, p1: XY, p2: XY, p3: XY }) {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;
        const { p0, p1, p2, p3 } = bezier ?? this.bezier;

        return {
            x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
            y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
        };
    }

    private getStraightPoint(t: number) {
        const { p0, p3 } = this.bezier;
        return { x: p0.x + t * (p3.x - p0.x), y: p0.y + t * (p3.y - p0.y) };
    }

    private getNearestT(event: MouseEvent) {
        const point = this.getUnitXY(event);

        const getT = ((this.previous.hasFrom || this.next.hasTo) ? this.getBezierPoint : this.getStraightPoint).bind(this);

        const steps = 1000;
        let bestT = 0.5;
        let minDistance = Infinity;

        // 遍历所有可能的t值
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const curvePoint = getT(t);

            // 计算点到曲线点的距离
            const distance = Math.sqrt(
                Math.pow(point.x - curvePoint.x, 2) +
                Math.pow(point.y - curvePoint.y, 2)
            );

            // 更新最小距离和对应的t值
            if (distance < minDistance) {
                minDistance = distance;
                bestT = t;
            }
        }

        // 添加额外的检查，确保t值不会太接近端点
        if (bestT < 0.01) bestT = 0.01;
        if (bestT > 0.99) bestT = 0.99;

        return bestT;
    }

    private startT: number = 0.5;

    private dragKit = new DragKit({
        down: () => {
            this.api.initCurveBeforeCurveModify(this.view, this.segmentIndex, this.previousIndex, this.nextIndex);
        },
        move: (event: MouseEvent) => {
            this.adjustCtrlPoints(this.getUnitXY(event));
        },
        commit: () => {
            this.api.commit();
            this.commit();
        }
    });

    private adjustCtrlPoints(newPoint: XY) {
        const t = this.startT;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const t2 = t * t;
        const maxIterations = 100;
        const tolerance = 0.01;

        const { p0, p1, p2, p3 } = this.bezier;

        const frame = this.view.frame;
        [p0, p1, p2, p3, newPoint].forEach((point) => {
            point.x *= frame.width;
            point.y *= frame.height;
        });

        const originalP1 = { ...p1 };
        const originalP2 = { ...p2 };

        let bestDistance = Infinity;
        let bestP1 = { ...originalP1 };
        let bestP2 = { ...originalP2 };

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const currentPoint = this.getBezierPoint(t, { p0, p1, p2, p3 });

            const dx = newPoint.x - currentPoint.x;
            const dy = newPoint.y - currentPoint.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestP1 = { x: p1.x, y: p1.y };
                bestP2 = { x: p2.x, y: p2.y };
            }
            if (distance < tolerance) break;
            const progress = iteration / maxIterations;
            const lambda = 0.01 + 0.99 * Math.pow(progress, 1.2);
            const weight = Math.min(1.0, distance / 20);

            p1.x += lambda * (dx * mt2 * weight + (originalP1.x - p1.x) * (1 - weight) * 0.01);
            p1.y += lambda * (dy * mt2 * weight + (originalP1.y - p1.y) * (1 - weight) * 0.01);
            p2.x += lambda * (dx * t2 * weight + (originalP2.x - p2.x) * (1 - weight) * 0.01);
            p2.y += lambda * (dy * t2 * weight + (originalP2.y - p2.y) * (1 - weight) * 0.01);
        }
        bestP1.x /= frame.width;
        bestP1.y /= frame.height;
        bestP2.x /= frame.width;
        bestP2.y /= frame.height;
        this.api.curveModify(this.view, this.segmentIndex, this.previousIndex, this.nextIndex, bestP1, bestP2);
    }

    private commit() {
        this.m_api = undefined;
    }

    start(event: MouseEvent) {
        this.dragKit.start(event);
        this.startT = this.getNearestT(event);
    }
}