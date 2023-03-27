/*
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-28 10:54:38
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 10:56:36
 * @FilePath: \kcdesign\src\utils\keyboard.ts
 * @Description: keyboard event
 */
import { Watchable } from "@kcdesign/data/data/basic";
import { KEYBOARD } from '@kcdesign/data/data/model';

export class Keyboard extends Watchable(Object) {
    static CHANGE_CURSOR = 1;

    private __control: boolean = false;
    private __rect: boolean = false;
    private __z: boolean = false;
    constructor() {
        super();
    }

    setupKeyboardListener() {
        document.addEventListener('keydown', e => { this.handler(e, this) });
    }
    removeKeyboardListener() {
        document.removeEventListener('keydown', e => { this.handler(e, this) });
    }

    handler(e: KeyboardEvent, keyboard: Keyboard) {                
        switch (e.code) {
            case KEYBOARD.Rect:
                this.__rect = true;              
                keyboard.notify();
                break;
            default:
                break;
        }
    }
    keydown_r() {
        this.__rect = true;
        this.notify();
    }
    get rect(): boolean {
        return this.__rect;
    }
    getStatus() {
        const keyboardStatus = {
            control: this.__control,
            rect: this.__rect,
            z: this.__z
        }
        return keyboardStatus;
    }
}