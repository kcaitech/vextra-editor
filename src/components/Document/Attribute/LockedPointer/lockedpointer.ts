export class LockedPointer {
    private m_pointer_el: HTMLDivElement | undefined;

    private __append() {
        if (this.m_pointer_el) return;

        const div = document.createElement('div');
        div.classList.add('locked-pointer-moss-0922');

        document.body.append(div);

        this.m_pointer_el = div;
    }

    private __remove() {
        this.m_pointer_el?.remove();
        this.m_pointer_el = undefined;
    }

    private __exe: ((event: MouseEvent) => void) | undefined;
    private __after: Function | undefined;

    private __fixed: { x: number, y: number } = {x: -100, y: -100};
    private __x: number = -100;
    private __y: number = -100;

    private __move(event: MouseEvent) {
        const el = this.m_pointer_el;

        if (el) {
            let x = this.__x + event.movementX;
            let y = this.__y + event.movementY;

            const clientHeight = document.documentElement.clientHeight;
            const clientWidth = document.documentElement.clientWidth;

            x = x < 0 ? clientWidth : x > clientWidth ? 0 : x;
            y = y < 0 ? clientHeight : y > clientHeight ? 0 : y;

            el.style.left = x + 'px';
            el.style.top = y + 'px';

            this.__x = x;
            this.__y = y;
        }

        this.__exe && this.__exe(event);
    }

    private __commit() {
        this.__after && this.__after();

        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('mouseup', this.up);
        document.exitPointerLock();
        window.removeEventListener('blur', this.blur);

        this.__after = undefined;
        this.__exe = undefined;
        this.__remove();
    }

    private __up() {
        this.__commit();
    }

    private __blur() {
        this.__commit();
    }

    private move = this.__move.bind(this);
    private up = this.__up.bind(this);
    private blur = this.__blur.bind(this);

    start(event: MouseEvent, exe: (event: MouseEvent) => void, after: Function) {
        this.__fixed.x = event.clientX;
        this.__fixed.y = event.clientY;
        this.__x = event.clientX;
        this.__y = event.clientY;

        this.__exe = exe;
        this.__after = after;

        this.__append();

        const el = event.target as HTMLElement
        el.requestPointerLock({unadjustedMovement: true});

        document.addEventListener('mousemove', this.move);
        document.addEventListener('mouseup', this.up);
        window.addEventListener('blur', this.blur);
    }
}