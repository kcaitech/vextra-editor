import { EL, ShapeView } from "@kcdesign/data";
import { patch } from "./patch";

type Constructor<T = Record<string, any>> = new (...args: any[]) => T;
export const DomBasic = <T extends Constructor>(SuperClass: T) =>
    class A extends SuperClass {
        el?: HTMLElement | SVGElement; // 不要改名，path用到
        m_save_rrender: { tag: string, attr: { [key: string]: string }, childs: (ShapeView | EL)[] } | undefined;

        bind(node: HTMLElement /* old, for reuse */) { // 
            // if (this.el === node) return;
            // if (this.el) this.el.remove();
            if (this.el) throw new Error("already binded");
            this.el = node;
        }

        unbind() {
            // if (this.el && this.el.parentNode) {
            //     this.el.remove();
            // }

            this.el = undefined;

            const unbindel = (c: EL) => {
                (c as any).el = undefined;
                c.childs.forEach((c) => { unbindel(c) });
            }
            // m_save_rrender
            if (this.m_save_rrender) {
                this.m_save_rrender.childs.forEach((c) => {
                    if (c instanceof EL) {
                        unbindel(c);
                    }
                })
                this.m_save_rrender = undefined;
            }
            this.m_children.forEach((c: any) => (c as A).unbind());
        }

        render(): { tag: string, attr: { [key: string]: string }, childs: (ShapeView | EL)[] } | undefined {
            const rrsult = super.render();
            if (rrsult !== this.m_save_rrender || !this.el) {
                this.el = patch(this.el, rrsult, this.m_save_rrender);
                this.m_save_rrender = rrsult;
            }
            return rrsult;
        }
    }
