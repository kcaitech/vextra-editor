// import { EL } from "@kcdesign/data";
// import { elpatch } from "./patch";

// type Constructor<T = Record<string, any>> = new (...args: any[]) => T;
// export const DomBasic = <T extends Constructor>(SuperClass: T) =>
//     class A extends SuperClass {
//         el?: HTMLElement | SVGElement; // 不要改名，patch用到
//         m_save_version: number = -1;
//         m_save_render: EL = EL.make("");

//         bind(node: HTMLElement /* old, for reuse */) { // 
//             if (this.el) throw new Error("already binded");
//             this.el = node;
//         }

//         unbind() {
//             this.m_save_version = -1;
//             this.m_save_render.reset("");
//             this.el = undefined;
//             // todo 考虑不释放，切换页面就很快
//             // const ub = (el: EL) => {
//             //     delete (el as any).el;
//             //     el.childs.forEach((el) => ub(el));
//             // }
//             // ub(this as any);
//         }

//         render(): number {
//             const version: number = super.render();
//             if (version !== this.m_save_version || !this.el) {
//                 const _this = this as any as EL;
//                 elpatch(_this, this.m_save_render);
//                 this.m_save_version = version;
//                 this.m_save_render.reset(_this.eltag, _this.elattr, _this.elchilds);
//             }
//             return version;
//         }
//     }


export function stringh(tag: string, attrs?: any, childs?: Array<string>): string;
export function stringh(tag: string, childs?: Array<string>): string;
export function stringh(...args: any[]): string {
    const tag = args[0];
    let attrs = args[1];
    let childs = args[2];
    if (args.length === 3) {
        //
    }
    else if (args.length === 2) {
        if (Array.isArray(args[1])) {
            attrs = undefined;
            childs = args[1];
        }
    }
    else {
        throw new Error("args err!");
    }

    if (typeof tag !== 'string') {
        throw new Error("not support:" + tag);
    }

    let ret = '<' + tag;
    if (attrs) for (let a in attrs) {
        const attr = attrs[a];
        if (a === 'style') {
            let style = ""
            for (let b in attr) {
                style += b + ':' + attr[b] + ';';
            }
            ret += ' ' + a + '="' + style + '"';
        }
        else {
            ret += ' ' + a + '="' + attr + '"';
        }
    }
    ret += '>';
    if (childs) for (let i = 0, len = childs.length; i < len; i++) {
        ret += childs[i];
    }
    ret += '</' + tag + '>';
    return ret;
}