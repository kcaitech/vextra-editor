import { Watchable } from "@/data/data/basic";
import { Document } from "@/data/data/document";
import { IDocShadow } from "@/data/data/ishadow";
import { Page } from "@/data/data/page";
import { ShapeNaviShadow } from "@/data/data/shadow/shapeNavi";
import { Shape } from "@/data/data/shape";
import { Repository } from "@/data/data/transact";
import { DocEditor, Editor, PageEditor } from "@/data/editor";
import { ShapeEditor } from "@/data/editor/shape";
import { uploadExForm } from "@/data/io/export";
// import { uploadExForm } from "@/data/io/exform/export";
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
    // modify(page: Page, attribute: string, value: any): boolean {
    //     // throw new Error("Method not implemented.");
    //     return true;
    // }
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
    clear() {
        this.__map.clear();
    }
}

export class Context extends Watchable(Object) {
    private m_data: Document;
    private m_selection: Selection;
    private m_shadows: ShapeNaviShadowMgr | undefined;
    private m_editor?: Editor;
    private m_repo: Repository;

    constructor(data: Document, repo: Repository) {
        super();
        this.m_data = data;
        this.m_selection = new Selection(data);
        this.m_repo = repo;
    }

    get editor(): Editor {
        if (this.m_editor === undefined) {
            this.m_editor = new Editor(this.m_data, this.m_repo, this.m_selection);
            this.notify();
        }
        return this.m_editor;
    }

    editor4Doc(): DocEditor {
        return this.editor.editor4Doc();
    }

    editor4Page(page: Page): PageEditor {
        return this.editor.editor4Page(page);
    }

    editor4Shape(shape: Shape): ShapeEditor {
        return this.editor.editor4Shape(shape);
    }
    
    get shadows(): ShapeNaviShadowMgr {
        if (!this.m_shadows) {
            this.m_shadows = new ShapeNaviShadowMgr();
            this.m_data.addShadow(this.m_shadows);
        }
        return this.m_shadows;
    }

    get data() {
        return this.m_data;
    }
    get repo(): Repository | undefined {
        return this.m_editor ? this.m_editor.repo : undefined;
    }
    get selection() {
        return this.m_selection;
    }

    // debug
    upload() {
        uploadExForm(this.m_data, 'ws://localhost:8000', (successed, fid, versionId) => {
            console.log(successed, fid, versionId);
        })
    }
}