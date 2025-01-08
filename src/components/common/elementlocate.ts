export class ElementLocateModifier {
    watch: boolean = true;

    constructor(private element: HTMLElement /* 1个HTML原生元素 */) {
        element.style.position = "fixed"; // 一定是固定定位
    }

    private m_left: number = 0;
    private m_top: number = 0;

    get left() {
        return this.m_left;
    }

    set left(val: number) {
        this.m_left = val;
    }

    get top() {
        return this.m_top;
    }

    set top(val: number) {
        this.m_top = val;
    }

    locate() {
        const element = this.element;
        const rect = element.getBoundingClientRect();
        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;
        const height = rect.height;

        let l = this.left;
        let t = this.top;

        const exceedH = clientHeight - (t + height);
        if (exceedH < 0) t = Math.max(0, t + exceedH);

        element.style.left = `${l}px`;
        element.style.top = `${t}px`;
    }
}