import { Watchable } from "@kcdesign/data/data/basic";
import { WorkSpace, Action } from "./workspace";
export enum KeyboardKeys {
    Space = 'Space',
    R = 'KeyR',
    V = 'KeyV',
    L = 'KeyL'
}

export class Keyboard extends Watchable(Object) {
    private __control: boolean = false;
    private __rect: boolean = false;
    private __z: boolean = false;
    private __auto: boolean = true;
    constructor() {
        super();
    }
    keydown_r() {
        this.__rect = true;
    }
    keydown_v() {
        this.__rect = false;
    }
    get rect(): boolean {
        return this.__rect;
    }

    getKeyboardStatus() {
        const keyboardStatus = {
            control: this.__control,
            rect: this.__rect,
            z: this.__z
        }
        return keyboardStatus;
    }
}