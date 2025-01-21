export class DragEventHandler { /* 左键拖拽事件 */
    private m_down: (event: MouseEvent) => any;
    private m_move: (event: MouseEvent) => any;
    private m_commit: () => any;
    private m_stop: boolean;

    constructor(
        down: (event: MouseEvent) => any, /* 注意这几个函数的this指向 */
        move: (event: MouseEvent) => any,
        commit: () => any,
        stop = true
    ) {
        this.m_down = down;
        this.m_move = move;
        this.m_commit = commit;
        this.m_stop = stop;
    }

    private _move(event: MouseEvent) {
        if (event.button === 0) this.m_move(event);
    }

    private shut() {
        this.m_commit();
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('mouseup', this.up);
        window.removeEventListener('blur', this.blur);
    }

    private _up(event: MouseEvent) {
        if (event.button === 0) this.shut();
    }

    private _blur() {
        this.shut();
    }

    private move = this._move.bind(this);
    private up = this._up.bind(this);
    private blur = this._blur.bind(this);

    start(event: MouseEvent) {
        if (event.button) return;
        if (this.m_stop) event.stopPropagation();
        this.m_down(event);
        document.addEventListener('mousemove', this.move);
        document.addEventListener('mouseup', this.up);
        window.addEventListener('blur', this.blur);
    }
}