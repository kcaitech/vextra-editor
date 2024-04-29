import { WatchableObject } from "@kcdesign/data";

export class Attribute extends WatchableObject {
    static HOR_HILP = 1;
    static VER_HILP = 2;
    static ADD_SIZE_CHANGE = 3;
    static MINUS_SIZE_CHANGE = 4;
    static FRAME_CHANGE = 5;
    constructor() {
        super();
    }

    static SELECTION_HIDDEN = 15;
}