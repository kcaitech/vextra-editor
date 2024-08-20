import { Context } from "@/context";
import { Artboard, Page } from "@kcdesign/data";

export interface BoardMenuItem {
    page: Page;
    fold: boolean;
    boards: Artboard[];
    selected: Artboard | undefined;
}

export class BoardLoader {
    private m_context: Context;
    private m_list: BoardMenuItem[];

    constructor(context: Context, list: BoardMenuItem[]) {
        this.m_context = context;
        this.m_list = list;
    }

    async load(resolve: Function, reject: Function) {
        try {
            const list = this.m_list;
            const data = this.m_context.data;
            const mgr = data.pagesMgr;
            const keys = data.pagesList.map(i => i.id);
            const pages: Page[] = [];
            for (const key of keys) {
                const __p = await mgr.get(key);
                if (__p) pages.push(__p);
            }
            if (!pages.length) throw new Error('no page');
            for (const page of pages) {
                const item: BoardMenuItem = {
                    page,
                    fold: true,
                    boards: [],
                    selected: undefined
                }
                const children = page.childs;
                for (const shape of children) {
                    if (shape instanceof Artboard) item.boards.push(shape);
                }
                if (item.boards.length) list.push(item);
            }
            if (!list.length) throw new Error('no board');
            list[0].fold = false;
            list[0].selected = list[0].boards[0];
        } catch (e) {
            console.error(e);
            reject();
        } finally {
            resolve();
        }
    }

    fold(page: Page) {
        for (const li of this.m_list) {
            if (li.page.id === page.id) li.fold = !li.fold;
            else li.fold = true;
        }
    }

    selected(page: Page, board: Artboard) {
        for (const li of this.m_list) {
            if (li.selected?.id === board.id) return;
            if (li.page.id !== page.id) li.selected = undefined;
            else li.selected = board;
        }
    }
}