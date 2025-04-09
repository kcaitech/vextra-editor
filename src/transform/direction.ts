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
    ArtboardView,
    layoutShapesOrder2,
    LinearApi,
    PageView,
    ShapeType,
    ShapeView,
} from "@kcdesign/data";
import { StyleManager } from "@/transform/style";
import { hidden_selection } from "@/utils/content";
import { MossError } from "@/basic/error";
import { UserConfig } from "@/context/user"
import { KeyboardMgr } from "@/keyboard";

export class DirectionCalc {
    static STEP = 1;
    static FASTER = 10;
    private m_up: boolean = false;
    private m_down: boolean = false;
    private m_left: boolean = false;
    private m_right: boolean = false;
    private m_faster: boolean = false;

    is_catfish(code: string) {
        return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code);
    }

    down(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowUp':
                this.m_up = true;
                break;
            case 'ArrowDown':
                this.m_down = true;
                break;
            case 'ArrowLeft':
                this.m_left = true;
                break;
            case 'ArrowRight':
                this.m_right = true;
                break;
            default:
                break;
        }
        if (event.shiftKey) {
            this.m_faster = true;
        }
    }

    up(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowUp':
                this.m_up = false;
                break;
            case 'ArrowDown':
                this.m_down = false;
                break;
            case 'ArrowLeft':
                this.m_left = false;
                break;
            case 'ArrowRight':
                this.m_right = false;
                break;
            case 'ShiftLeft':
                this.m_faster = false;
                break;
            case 'ShiftRight':
                this.m_faster = false;
                break;
            default:
                break;
        }

        return this.m_up || this.m_down || this.m_left || this.m_right;
    }

    reset() {
        this.m_up = false;
        this.m_down = false;
        this.m_left = false;
        this.m_right = false;
        this.m_faster = false;
    }

    calc() {
        let x = 0;
        let y = 0;

        const UserConfig: UserConfig = JSON.parse(localStorage.getItem('userConfig') as string)
        const step = this.m_faster ? (UserConfig?.fast || DirectionCalc.STEP * 10) : (UserConfig?.slow || DirectionCalc.STEP);

        if (this.m_up) {
            y -= step;
        }

        if (this.m_down) {
            y += step;
        }

        if (this.m_left) {
            x -= step;
        }

        if (this.m_right) {
            x += step;


        }

        return { x, y };
    }
}
export enum ActionMode {
    View = 'view',
    Flex = 'flex',
    Edit = 'edit',
    Text = 'text'
}

export class Direction {
    static UP = 'ArrowUp';
    static DOWN = 'ArrowDown';
    static LEFT = 'ArrowLeft';
    static RIGHT = 'ArrowRight';

    private readonly context: Context;
    private readonly page: PageView;
    private readonly api: LinearApi;
    private readonly style: StyleManager;
    private directionCalc: DirectionCalc;
    private boardMgr: KeyboardMgr;
    constructor(context: Context) {
        this.context = context;

        const page = context.selection.selectedPage!;
        this.page = page;
        this.api = new LinearApi(context.coopRepo, context.data, page);
        this.style = new StyleManager(context);
        this.directionCalc = new DirectionCalc();
        this.boardMgr = new KeyboardMgr(context)
        this.boardMgr.addEventListener('keydown', this.keydown);
        this.boardMgr.addEventListener('keyup', this.keyup);
    }

    private __mode: ActionMode | undefined;

    private timers: Set<any> = new Set();

    private __set_time_out(fn: Function, duration: number) {
        this.timers.add(setTimeout(fn, duration));
    }

    private __clear_timer() {
        this.timers.forEach(t => {
            clearTimeout(t);
            t = null;
        });
        this.timers.clear();
    }

    get mode() {
        return this.__mode;
    }

    set mode(mode) {
        this.__mode = mode;
    }

    private __can_not(event: KeyboardEvent) {
        const target = event.target;
        if (target && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return true;
        return this.context.readonly;
    }

    private __checkout() {
        const context = this.context;
        this.mode = ActionMode.Flex;

        if (context.workspace.is_path_edit_mode) return this.mode = ActionMode.Edit;
        else if (context.workspace.isEditing) return this.mode = ActionMode.Text;
        else for (const view of context.selection.selectedShapes) {
            if (!(view.parent as ArtboardView).autoLayout) return this.mode = ActionMode.View;
        }
    }

    private __keydown(event: KeyboardEvent) {
        if (this.__can_not(event)) return;

        !event.repeat && this.__checkout();

        switch (this.mode) {
            case ActionMode.View:
                return this.__view(event);
            case ActionMode.Flex:
                return this.__flex(event);
            case ActionMode.Edit:
                return this.__edit(event);
        }
    }

    private __view(event: KeyboardEvent) {
        if (!this.directionCalc.is_catfish(event.code)) return;
        this.directionCalc.down(event);
        const { x: dx, y: dy } = this.directionCalc.calc();
        this.api.modifyShapesXY((this.context.selection.selectedShapes)
            .map(i => ({ target: i, dx, dy })));
    }

    private __envs: ShapeView[] | undefined;

    private get envs() {
        if (this.__envs) return this.__envs;
        const sel = this.context.selection.selectedShapes;
        const parents: ShapeView[] = [];
        for (const view of sel) parents.push(view.parent!);
        this.__envs = Array.from(new Set(parents));
        return this.__envs;
    }

    private __flex(event: KeyboardEvent) {
        if (event.repeat) return;

        switch (event.code) {
            case Direction.DOWN:
                return this.__down();
            case Direction.UP:
                return this.__up();
            case Direction.LEFT:
                return this.__left();
            case Direction.RIGHT:
                return this.__right();
        }
    }

    private __order(env: ArtboardView) {
        const rows = env.childs.filter(c => c.isVisible);
        return (() => {
            const order: Map<string, number> = new Map();
            for (let i = 0; i < rows.length; i++) {
                const cc = rows[i];
                order.set(cc.id, i);
            }
            return order;
        })();
    }

    private __girds(env: ArtboardView) {
        const rows = layoutShapesOrder2(env.childs, !!env.autoLayout?.bordersTakeSpace);
        const childs = env.childs.filter(c => c.isVisible);
        return (() => {
            const order: Map<string, number> = new Map();
            const grids: { shape: string, order: number, leave?: boolean }[][] = [];
            let count = 0;
            for (let y = 0; y < rows.length; y++) {
                const row: { shape: string, order: number, leave?: boolean }[] = [];
                for (let x = 0; x < rows[y].length; x++) {
                    const shape = rows[y][x];
                    const o = count++;
                    row.push({ shape: shape.id, order: o });
                }
                grids.push(row);
            }
            for (let i = 0; i < childs.length; i++) {
                const cc = childs[i];
                order.set(cc.id, i);
            }
            return { order, grids, shapes: childs.map(i => i.id) };
        })();
    }

    private __left() {
        const envs = this.envs as ArtboardView[];
        const selection = this.context.selection.selectedShapes;
        let someFire = false;
        for (const env of envs) {
            if (env.type === ShapeType.SymbolRef) continue;
            const order = this.__order(env);
            const reflex = (() => {
                const m: Map<number, string> = new Map();
                order.forEach((v, k) => m.set(v, k));
                return m;
            })();
            const sel = selection
                .filter(i => order.get(i.id) !== undefined)
                .sort((a, b) => order.get(a.id)! < order.get(b.id)! ? -1 : 1);
            const selSet = new Set(sel.map(i => i.id));
            let fire = false;
            for (const view of sel) {
                const o = order.get(view.id)!;
                if (!o) continue;

                const t = o - 1;
                const before = reflex.get(t)!;

                if (selSet.has(before)) continue;

                fire = true;

                order.set(before, o);
                reflex.set(o, before);
                order.set(view.id, t);
                reflex.set(t, view.id);
            }
            if (!fire) continue;
            someFire = true;
            this.style.slidifyEnv(env);
            this.__set_time_out(() => {
                this.style.clearSlide();
            }, 240);
            this.api.reLayout(env, order);
        }
        if (someFire) hidden_selection(this.context);
    }

    private __right() {
        const envs = this.envs as ArtboardView[];
        const selection = this.context.selection.selectedShapes;
        let someFire = false;
        for (const env of envs) {
            if (env.type === ShapeType.SymbolRef) continue;
            const order = this.__order(env);
            const reflex = (() => {
                const m: Map<number, string> = new Map();
                order.forEach((v, k) => m.set(v, k));
                return m;
            })();
            const sel = selection
                .filter(i => order.get(i.id) !== undefined)
                .sort((a, b) => order.get(a.id)! < order.get(b.id)! ? 1 : -1);
            const selSet = new Set(sel.map(i => i.id));
            let fire = false;
            for (const view of sel) {
                const o = order.get(view.id)!;
                if (o === env.childs.length - 1) continue;

                const t = o + 1;
                const after = reflex.get(t)!;

                if (selSet.has(after)) continue;

                fire = true;

                order.set(after, o);
                reflex.set(o, after);
                order.set(view.id, t);
                reflex.set(t, view.id);
            }
            if (!fire) continue;
            someFire = true;
            this.style.slidifyEnv(env);
            this.__set_time_out(() => {
                this.style.clearSlide();
            }, 240);
            this.api.reLayout(env, order);
        }
        if (someFire) hidden_selection(this.context);
    }

    private __up() {
        const envs = this.envs as ArtboardView[];
        const selection = this.context.selection.selectedShapes;
        let someFire = false;
        const locate = this.__locate;
        for (const env of envs) {
            if (env.type === ShapeType.SymbolRef) continue;
            const targetMap: Map<number, string> = new Map();
            const { order, grids, shapes } = this.__girds(env);
            const sel = selection
                .filter(i => order.get(i.id) !== undefined)
                .sort((a, b) => order.get(a.id)! < order.get(b.id)! ? -1 : 1);
            const selSet = new Set(sel.map(i => i.id));
            let fire = false;
            let fireTarget: Set<string> = new Set();
            for (const view of sel) {
                const { row, column } = locate(view.id, grids)!;
                if (!row) continue;
                const upRowIndex = row - 1;
                const upRow = grids[upRowIndex];
                let upColIndex = Math.min(column, upRow.length - 1);
                const upCol = upRow[upColIndex];
                const currentRow = grids[row];
                const currentCol = currentRow[column];
                if (upCol && selSet.has(upCol.shape) && !upCol.leave) continue;
                currentCol.leave = true;
                fire = true;
                let key = upCol.order;
                while (targetMap.has(key)) key++;
                targetMap.set(key, currentCol.shape);
                fireTarget.add(currentCol.shape);
            }
            this.__sort(env, targetMap, order, fireTarget, shapes);
            if (!fire) continue;
            someFire = true;
            this.style.slidifyEnv(env);
            this.__set_time_out(() => {
                this.style.clearSlide();
            }, 240);
            this.api.reLayout(env, order);
        }
        if (someFire) hidden_selection(this.context);
    }

    private __down() {
        const envs = this.envs as ArtboardView[];
        const selection = this.context.selection.selectedShapes;
        let someFire = false;
        const locate = this.__locate;
        for (const env of envs) {
            if (env.type === ShapeType.SymbolRef) continue;
            const targetMap: Map<number, string> = new Map();
            const { order, grids, shapes } = this.__girds(env);
            const sel = selection
                .filter(i => order.get(i.id) !== undefined)
                .sort((a, b) => order.get(a.id)! > order.get(b.id)! ? -1 : 1);
            const selSet = new Set(sel.map(i => i.id));
            let fire = false;
            let fireTarget: Set<string> = new Set();
            for (const view of sel) {
                const { row, column } = locate(view.id, grids)!;
                if (row === grids.length - 1) continue;
                const downRowIndex = row + 1;
                const downRow = grids[downRowIndex];
                let downColIndex = Math.min(column, downRow.length - 1);
                const downCol = downRow[downColIndex];
                const currentRow = grids[row];
                const currentCol = currentRow[column];
                if (downCol && selSet.has(downCol.shape) && !downCol.leave) continue;
                currentCol.leave = true;
                fire = true;
                let key = downCol.order;
                while (targetMap.has(key)) key++;
                targetMap.set(key, currentCol.shape);
                fireTarget.add(currentCol.shape);
            }
            this.__sort(env, targetMap, order, fireTarget, shapes);
            if (!fire) continue;
            someFire = true;
            this.style.slidifyEnv(env);
            this.__set_time_out(() => {
                this.style.clearSlide();
            }, 240);
            this.api.reLayout(env, order);
        }
        if (someFire) hidden_selection(this.context);
    }

    private __sort(env: ShapeView, target: Map<number, string>, order: Map<string, number>, fireTarget: Set<string>, shapes: string[]) {
        const children = shapes.filter(i => !fireTarget.has(i));
        const childs = env.childs.filter(s => s.isVisible);
        if (children.length + target.size !== childs.length) throw new MossError('wrong match');
        const orderAfterSort: string[] = [];
        let flowIndex = 0;
        for (let i = 0; i < shapes.length; i++) {
            const fixed = target.get(i);
            if (fixed === undefined) orderAfterSort.push(children[flowIndex++]);
            else orderAfterSort.push(fixed);
        }
        for (let i = 0; i < orderAfterSort.length; i++) order.set(orderAfterSort[i], i);
    }


    __locate(id: string, grids: { shape: string, order: number }[][]) {
        let index = 0;
        for (let r = 0; r < grids.length; r++)
            for (let c = 0; c < grids[r].length; c++)
                if (grids[r][c].shape === id) return { column: c, row: r, index: index++ };
    }

    private __edit(event: KeyboardEvent) {
        // console.log('---edit---')
    }

    private __keyup(event: KeyboardEvent) {
        if (this.__can_not(event)) return;
        this.directionCalc.up(event);
    }

    private keydown = this.__keydown.bind(this);
    private keyup = this.__keyup.bind(this);

    destroy() {
        this.__clear_timer();

        this.boardMgr.removeEventListener('keydown', this.keydown);
        this.boardMgr.removeEventListener('keyup', this.keyup);
    }

    clear() {
        this.__envs = undefined;
    }
}