import { Document } from "@/data/document";
import { Selection } from "./selection";

export class Context {
    private m_data: Document;
    private m_selection: Selection;

    constructor(data: Document) {
        this.m_data = data;
        this.m_selection = new Selection();
    }

    get data() {
        return this.m_data;
    }
    get selection() {
        return this.m_selection;
    }
}