import { Watchable } from "@/data/basic";
import { Document } from "@/data/document";
import { IDocShadow } from "@/data/ishadow";
import { Page } from "@/data/page";
import { ShapeNaviShadow } from "@/data/shadow";
import { Repository } from "@/data/transact";
import { DocEditor, PageEditor } from "@/editor";
import { Selection } from "./selection";

class ShapeNaviShadowMgr implements IDocShadow {
    private __map: Map<string, ShapeNaviShadow> = new Map();

    delete(page: Page): boolean {
        // throw new Error("Method not implemented.");
        this.__map.delete(page.id);
        return true;
    }
    insert(index: number, page: Page): boolean {
        // throw new Error("Method not implemented.");
        return true;
    }
    modify(page: Page, attribute: string, value: any): boolean {
        // throw new Error("Method not implemented.");
        return true;
    }
    move(page: Page, index: number): boolean {
        // throw new Error("Method not implemented.");
        return true;
    }
    get(page: Page): ShapeNaviShadow {
        let shadow = this.__map.get(page.id);
        if (!shadow) {
            shadow = new ShapeNaviShadow(page);
            page.addShadow(shadow);
            this.__map.set(page.id, shadow);
        }
        return shadow;
    }
}

export class Context extends Watchable {
    private m_data: Document;
    private m_selection: Selection;
    private m_repo: Repository | undefined;
    private m_shadows: ShapeNaviShadowMgr | undefined;
    private m_docEditor: DocEditor | undefined;
    private m_pageEditors: Map<string, PageEditor> = new Map();

    constructor(data: Document) {
        super();
        this.m_data = data;
        this.m_selection = new Selection(data);
    }

    get docEditor(): DocEditor {
        if (!this.canEdit()) {
            this.preEdit();
        }
        if (this.m_docEditor === undefined) {
            this.m_docEditor = new DocEditor(this.m_repo as Repository, this.m_data.shadows)
        }
        return this.m_docEditor;
    }

    getPageEditor(page: Page): PageEditor {
        let e = this.m_pageEditors.get(page.id);
        if (e) {
            return e;
        }
        if (!this.canEdit()) {
            this.preEdit();
        }
        e = new PageEditor(this.m_repo as Repository, page.shadows);
        this.m_pageEditors.set(page.id, e);
        return e;
    }
    
    get shadows(): ShapeNaviShadowMgr {
        if (!this.m_shadows) {
            this.m_shadows = new ShapeNaviShadowMgr();
            this.m_data.addShadow(this.m_shadows);
        }
        return this.m_shadows;
    }

    canEdit() {
        return this.m_repo !== undefined;
    }
    preEdit() {
        if (!this.canEdit()) {
            this.m_repo = new Repository(this.m_selection);
            this.m_data = this.m_repo.makeProxy(this.m_data);
            this.notify();
        }
    }

    get data() {
        return this.m_data;
    }
    get repo() {
        return this.m_repo;
    }
    get selection() {
        return this.m_selection;
    }

}