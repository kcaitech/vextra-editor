import { Watchable } from "@kcdesign/data/data/basic";
export enum Tools {
    Cursor = 'cursor',
    PattnerR = 'pattern-rectangle',
    PattnerL = 'pattern-line'
}
export class Toolbar extends Watchable(Object) {
    private __current: Tools = Tools.Cursor;
    constructor() {
        super();
    }
    get active() {
        return this.__current;
    }
    setCurrent(value: Tools) {
        this.__current = value;
        this.notify();
    }
}