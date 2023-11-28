import { Shape } from "@kcdesign/data";
import { debounce } from "lodash";

export class CommonShapesListener {
    private m_exe: (...args: any[]) => void;
    private m_exe_once: (...args: any[]) => void;
    private watch_shapes = new Map<string, Shape>();
    constructor(exe: (...args: any[]) => void) {
        this.m_exe = exe;
        this.m_exe_once = debounce(this.m_exe, 5);
    }
    watching(shapes: Shape[], once = false) {
        const needWatchShapes = new Map();
        const f = once ? this.m_exe_once : this.m_exe;
        for (let i = 0, len = shapes.length; i < len; i++) {
            const s = shapes[i];
            needWatchShapes.set(s.id, s);
        }
        this.watch_shapes.forEach((v, k) => {
            if (needWatchShapes.has(k)) return;
            v.unwatch(f);
            this.watch_shapes.delete(k);
        })
        needWatchShapes.forEach((v, k) => {
            if (this.watch_shapes.has(k)) return;
            v.watch(f);
            this.watch_shapes.set(k, v);
        })
    }
    disconnect(once = false) {
        const f = once ? this.m_exe_once : this.m_exe;
        this.watch_shapes.forEach((v, k) => {
            v.unwatch(f);
            this.watch_shapes.delete(k);
        })
    }
}