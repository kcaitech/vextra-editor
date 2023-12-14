import { EL } from "@kcdesign/data";
import { elpatch } from "./patch";

type Constructor<T = Record<string, any>> = new (...args: any[]) => T;
export const DomBasic = <T extends Constructor>(SuperClass: T) =>
    class A extends SuperClass {
        el?: HTMLElement | SVGElement; // 不要改名，patch用到
        m_save_version: number = -1;
        m_save_render: EL = EL.make("");

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
            this.m_save_version = -1;
            this.m_save_render.reset("");
            // this.m_children.forEach((c: any) => (c as A).unbind());

            this.el = undefined;
            // todo 考虑不释放，切换页面就很快
            // const ub = (el: EL) => {
            //     delete (el as any).el;
            //     el.childs.forEach((el) => ub(el));
            // }
            // ub(this as any);
        }

        render(): number {
            const version: number = super.render();
            if (version !== this.m_save_version || !this.el) {
                const _this = this as any as EL;
                elpatch(_this, this.m_save_render);
                this.m_save_version = version;
                this.m_save_render.reset(_this.eltag, _this.elattr, _this.elchilds);
            }
            return version;
        }
    }
