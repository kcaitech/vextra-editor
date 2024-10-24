import { Context } from "@/context";
import {
    adapt2Shape,
    ArtboradView,
    layoutShapesOrder,
    LinearApi,
    PageView,
    Shape,
    ShapeView,
} from "@kcdesign/data";
import { StyleManager } from "@/transform/style";
import { hidden_selection } from "@/utils/content";
import { MossError } from "@/basic/error";

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

    constructor(context: Context) {
        this.context = context;

        const page = context.selection.selectedPage!;
        this.page = page;
        this.api = new LinearApi(context.coopRepo, context.data, page);
        this.style = new StyleManager(context);

        document.addEventListener('keydown', this.keydown);
        document.addEventListener('keyup', this.keyup);
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
        if (target && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return false;
        return this.context.readonly;
    }

    private __checkout() {
        const context = this.context;
        this.mode = ActionMode.Flex;

        if (context.workspace.is_path_edit_mode) return this.mode = ActionMode.Edit;
        else if (context.workspace.isEditing) return this.mode = ActionMode.Text;
        else for (const view of context.selection.selectedShapes) {
                if (!(view.parent as ArtboradView).autoLayout) return this.mode = ActionMode.View;
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
        // console.log('---view---')
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

    private __order(env: ArtboradView) {
        const map: Map<Shape, ShapeView> = new Map();
        env.childs.forEach(view => map.set(adapt2Shape(view), view));

        const rows = layoutShapesOrder(Array.from(map.keys()), !!env.autoLayout?.bordersTakeSpace);

        return (() => {
            const order: Map<string, number> = new Map();
            let count = 0;
            for (let y = 0; y < rows.length; y++)
                for (let x = 0; x < rows[y].length; x++) {
                    order.set(rows[y][x].id, count++);
                }
            return order;
        })();
    }

    private __girds(env: ArtboradView) {
        const map: Map<Shape, ShapeView> = new Map();
        env.childs.forEach(view => map.set(adapt2Shape(view), view));

        const rows = layoutShapesOrder(Array.from(map.keys()), !!env.autoLayout?.bordersTakeSpace);

        return (() => {
            const order: Map<string, number> = new Map();
            const grids: { shape: string, order: number, leave?: boolean }[][] = [];
            let count = 0;
            for (let y = 0; y < rows.length; y++) {
                const row: { shape: string, order: number, leave?: boolean }[] = [];
                for (let x = 0; x < rows[y].length; x++) {
                    const shape = rows[y][x];
                    const o = count++;
                    order.set(shape.id, o);
                    row.push({ shape: shape.id, order: o });
                }
                grids.push(row);
            }
            return { order, grids, shapes: rows.flat().map(i => i.id) };
        })();
    }

    private __left() {
        const envs = this.envs as ArtboradView[];
        const selection = this.context.selection.selectedShapes;
        let someFire = false;
        for (const env of envs) {
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
        const envs = this.envs as ArtboradView[];
        const selection = this.context.selection.selectedShapes;
        let someFire = false;
        for (const env of envs) {
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
        const envs = this.envs as ArtboradView[];
        const selection = this.context.selection.selectedShapes;
        let someFire = false;
        const locate = this.__locate;
        for (const env of envs) {
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
        const envs = this.envs as ArtboradView[];
        const selection = this.context.selection.selectedShapes;
        let someFire = false;
        const locate = this.__locate;
        for (const env of envs) {
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
        if (children.length + target.size !== env.childs.length) throw new MossError('wrong match');
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
    }

    private keydown = this.__keydown.bind(this);
    private keyup = this.__keyup.bind(this);

    destroy() {
        this.__clear_timer();

        document.removeEventListener('keydown', this.keydown);
        document.removeEventListener('keyup', this.keyup);
    }

    clear() {
        this.__envs = undefined;
    }
}