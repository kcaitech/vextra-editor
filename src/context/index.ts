import { Matrix } from "@/basic/matrix";
import { Document } from "@/data/document";
import { Repository } from "@/data/transact";
import { Selection } from "./selection";

export class Context {
    private m_data: Document;
    private m_selection: Selection;
    private m_repo: Repository;

    constructor(data: Document, repo: Repository) {
        this.m_data = data;
        this.m_repo = repo;
        this.m_selection = new Selection(data);
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