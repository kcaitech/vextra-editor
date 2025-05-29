/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { EL, Matrix, objectId, PageView, PropsType, ShapeView } from "@kcdesign/data";
import { elpatch } from "./patch";
import { DomCtx } from "./domctx";
import { NodeType, opti2none, optiNode, OptiStatus, OptiType, unOptiNode } from "./optinode";

const OPTI_NODE_COUNT = 5000;
const OPTI_AS_CANVAS_COUNT = 20000;
const OPTI_INSIDE_COUNT = 2000;
const OPTI_MIN_COUNT = 20;
function intersect_range(lx0: number, lx1: number, rx0: number, rx1: number): boolean {
    return lx0 < rx1 && lx1 > rx0;
}

type Rect = { x: number, y: number, width: number, height: number };

function intersect_rect(lhs: Rect, rhs: Rect): boolean {
    return intersect_range(lhs.x, lhs.x + lhs.width, rhs.x, rhs.x + rhs.width) &&
        intersect_range(lhs.y, lhs.y + lhs.height, rhs.y, rhs.y + rhs.height);
}

const frame_time = 20;

export class PageDom extends (PageView) {
    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL & { el?: HTMLElement | SVGElement } = EL.make("");

    constructor(ctx: DomCtx, props: PropsType) {
        super(ctx, props);
        this.onRenderIdle = this.onRenderIdle.bind(this);
        this.onBeforeRender = this.onBeforeRender.bind(this);
        ctx.setBeforeRenderCallback(this.onBeforeRender);
        ctx.setIdleCallback(this.onRenderIdle);
    }

    bind(node: HTMLElement | SVGElement /* old, for reuse */) { // 
        if (this.el) throw new Error("already binded");
        this.el = node;
        // this.m_first_bind = true;
    }

    unbind() {
        this.m_save_version = -1;
        this.m_save_render.reset("");
        this.el = undefined;
        // todo 考虑不释放，切换页面就很快
        // const ub = (el: EL) => {
        //     delete (el as any).el;
        //     if (Array.isArray(el.elchilds)) el.elchilds.forEach((el) => ub(el));
        // }
        // ub(this as any);
    }

    // protected checkAndResetDirty(): boolean {
    //     if (super.checkAndResetDirty()) return true;
    //     return this.m_save_version < 0;
    // }

    render(): number {
        const version: number = super.render();
        if (version !== this.m_save_version && this.el) {
            elpatch(this, this.m_save_render);
            this.m_save_version = version;
            this.m_save_render.reset(this.eltag, this.elattr, this.elchilds);
            this.m_save_render.el = this.el;
        }
        return version;
    }

    asyncRender(): number {
        const version: number = super.asyncRender();
        if (version !== this.m_save_version && this.el) {
            elpatch(this, this.m_save_render);
            this.m_save_version = version;
            this.m_save_render.reset(this.eltag, this.elattr, this.elchilds);
            this.m_save_render.el = this.el;
        }
        return version;
    }

    // 在缩放、移动内容、可见窗口大小改变时，增加删除节点
    m_render_args?: {
        visible_rect: Rect,
        matrix: Matrix
    }

    m_delay_optimize: number = 0;

    updateVisibleRect(visible_rect: { x: number, y: number, width: number, height: number }, matrix: Matrix) {
        this.m_render_args = { visible_rect, matrix }
        // delay 更新
        this.m_delay_optimize = Date.now();
        this.m_ctx.continueLoop();
    }

    private get client_visible_rect(): Rect {
        if (!this.m_render_args) throw new Error();
        const visible_rect = this.m_render_args.visible_rect;
        const extend = Math.round(Math.max(100, Math.max(visible_rect.width, visible_rect.height) * 0.4));
        const client_visible_rect = {} as Rect;
        client_visible_rect.x = visible_rect.x - extend;
        client_visible_rect.y = visible_rect.y - extend;
        client_visible_rect.width = visible_rect.width + extend * 2;
        client_visible_rect.height = visible_rect.height + extend * 2;
        return client_visible_rect;
    }

    private get client_drop_rect(): Rect {
        if (!this.m_render_args) throw new Error();
        const visible_rect = this.m_render_args.visible_rect;
        const dropextend = Math.round(Math.max(500, Math.max(visible_rect.width, visible_rect.height) * 1.0));
        const client_drop_rect = {} as Rect;
        client_drop_rect.x = visible_rect.x - dropextend;
        client_drop_rect.y = visible_rect.y - dropextend;
        client_drop_rect.width = visible_rect.width + dropextend * 2;
        client_drop_rect.height = visible_rect.height + dropextend * 2;
        return client_drop_rect;
    }

    // 可见区域+20%绘制
    // 可见区域+50%以外drop
    private _optimizeClientVisibleNodes(node: (ShapeView & NodeType), startTime: number, client_visible_rect: Rect, client_drop_rect: Rect, optimize: number[], level: number, focusid: { [key: number]: true }, matrix: Matrix): { expired: boolean, hasOptimizing: boolean } {
        if (!this.m_optimize) throw new Error();

        let hasOptimizing = false;
        const optiNodes: (ShapeView & NodeType)[] = [];
        let optiNodesCount = 0;

        for (let i = 0, len = node.m_children.length; i < len; i++) {
            const c = node.m_children[i] as (ShapeView & NodeType);
            if (!c.isVisible) {
                unOptiNode(c);
            } else if (c.canOptiNode) {

                if (!(intersect_rect(c.relativeVisibleFrame, client_drop_rect))) {
                    opti2none(c);// 这个是优化隐藏

                    const id = objectId(c);
                    optimize.push(id);
                    this.m_optimize.set(id, { node: c });

                } else if (intersect_rect(c.relativeVisibleFrame, client_visible_rect)) {

                    optiNodesCount += c.nodeCount;
                    optiNodes.push(c);
                }

            }
        }

        if (level > 0 || optiNodesCount > OPTI_INSIDE_COUNT) { // 当前节点大量不可见时，直接用svg
            for (let i = 0, len = optiNodes.length; i < len; ++i) {

                const c = optiNodes[i];

                if (c.nodeCount > OPTI_INSIDE_COUNT && ((c.nodeCount / c.m_children.length) > OPTI_MIN_COUNT || focusid[objectId(c)])) {

                    const transform = c.transform.inverse;
                    const vlt = transform.computeCoord(client_visible_rect);
                    const vrb = transform.computeCoord(client_visible_rect.x + client_visible_rect.width, client_visible_rect.y + client_visible_rect.height);
                    const vx = Math.min(vlt.x, vrb.x);
                    const vy = Math.min(vlt.y, vrb.y);
                    const vw = Math.max(vlt.x, vrb.x) - vx;
                    const vh = Math.max(vlt.y, vrb.y) - vy;
                    const dlt = transform.computeCoord(client_drop_rect);
                    const drb = transform.computeCoord(client_drop_rect.x + client_drop_rect.width, client_drop_rect.y + client_drop_rect.height);
                    const dx = Math.min(dlt.x, drb.x);
                    const dy = Math.min(dlt.y, drb.y);
                    const dw = Math.max(dlt.x, drb.x) - dx;
                    const dh = Math.max(dlt.y, drb.y) - dy;

                    const _client_visible_rect = { x: vx, y: vy, width: vw, height: vh };
                    const _client_drop_rect = { x: dx, y: dy, width: dw, height: dh };

                    const _matrix = matrix.clone();
                    _matrix.multi(c.transform.toArray())

                    const ret = this._optimizeClientVisibleNodes(c, startTime, _client_visible_rect, _client_drop_rect, optimize, level + 1, focusid, _matrix);

                    hasOptimizing = hasOptimizing || ret.hasOptimizing;
                    if (ret.expired) {
                        return { expired: true, hasOptimizing };
                    }
                    continue;
                }

                const id = objectId(c);
                const ret = optiNode(c, this.m_optimize_type, true, focusid[id], matrix);

                if (ret !== OptiStatus.none) {
                    optimize.push(id);
                    if (ret === OptiStatus.done) {
                        this.m_optimize.set(id, { node: c });
                    } else {
                        this.m_optimize.set(id, { node: c, optimizing: true });
                        hasOptimizing = true;
                    }

                    const endTime = Date.now();
                    if (endTime - startTime > frame_time) {
                        return { expired: true, hasOptimizing }
                    }
                }
            }
        }
        return { expired: false, hasOptimizing };
    }

    set optiel_dirty(dirty: boolean) {
    }

    canOptiNode: boolean = true;
    preFocusId: { [key: number]: true } = {}
    // todo 图片更新还有问题
    private optimizeClientVisibleNodes() {
        if (!this.m_render_args || !this.m_optimize) return false;

        const client_visible_rect = this.client_visible_rect;
        const client_drop_rect = this.client_drop_rect;

        const optimize: number[] = [];

        // const startTime = Date.now();
        const ctx = this.m_ctx as DomCtx;

        const focusshape = ctx.getFocusShape();
        let focusid: { [key: number]: true } = this.preFocusId;
        if (focusshape) {
            focusid = {}
            let p: ShapeView | undefined = focusshape;
            while (p) {
                focusid[objectId(p)] = true;
                p = p.parent;
            }
            this.preFocusId = focusid;
        }

        const ret = this._optimizeClientVisibleNodes(this as (ShapeView & NodeType), Date.now(), client_visible_rect, client_drop_rect, optimize, 0, focusid, this.m_render_args.matrix.clone())
        if (ret.expired) return true;
        let hasOptimizing = ret.hasOptimizing;

        // todo找差值，进行unopti
        if (optimize.length !== this.m_optimize.size) {

            const _opti = new Set(optimize);

            const unopti: (ShapeView & NodeType)[] = [];
            this.m_optimize.forEach(v => {
                if (_opti.has(objectId(v.node))) return;
                // unOptiNode(v.node);
                unopti.push(v.node);
            })

            for (let i = 0, len = unopti.length; i < len; ++i) {
                const n = unopti[i];
                unOptiNode(n);
                // 如果n的上一级现在有优化，需要重新更新
                let p = n.parent as (ShapeView & NodeType);
                while (p) {
                    if (p.canOptiNode && p.optis && p.optis.records[OptiType.image]) {
                        p.optis.records[OptiType.image].dirty = true;
                        if (p.el === p.optis.records[OptiType.image].el) {
                            hasOptimizing = true; // 需要更新
                        }
                    }
                    p = p.parent as (ShapeView & NodeType);
                }
                this.m_optimize.delete(objectId(n));
            }
        }

        return hasOptimizing;
    }

    m_optimize?: Map<number, {
        node: ShapeView & NodeType, optimizing?: boolean
    }>;
    m_optimize_type: 'image' | 'canvas' = 'image'

    onBeforeRender() {

        if (!this.m_optimize || !this.m_render_args) {
            return;
        }

        const ctx = this.m_ctx as DomCtx;
        const shape = ctx.getFocusShape(); // todo
        // const client_visible_rect = this.client_visible_rect;
        // todo 仅有编辑时需要提前unopti
        let p = shape;
        while (p) {
            const n = p as (ShapeView & NodeType);
            if (n.canOptiNode && n.optis) {
                unOptiNode(n);
                this.m_optimize.delete(objectId(p));
                // break; // 正常只会有一个
            }
            p = p.parent;
        }
    }

    onRenderIdle(): boolean {
        if (!this.m_optimize && this.nodeCount > OPTI_NODE_COUNT) {
            this.m_optimize = new Map();
            if (this.nodeCount > OPTI_AS_CANVAS_COUNT) this.m_optimize_type = 'canvas'
        }
        if (this.m_optimize) {
            const delay_optimize = 100;
            if (Date.now() - this.m_delay_optimize < delay_optimize) return true;
            if (this.optimizeClientVisibleNodes()) return true;
        }

        this.emit('renderidle')
        return false;

    }
}