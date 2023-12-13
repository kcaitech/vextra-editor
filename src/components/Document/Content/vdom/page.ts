import { PageView } from "@kcdesign/data";
import { DomBasic } from "./basic";

const MAX_NODE_SUPPORT = 5000;

export class PageDom extends DomBasic(PageView) {

    render(): number {
        const ret = super.render();        
        if (this.nodeCount > MAX_NODE_SUPPORT) {
            //  将一些节点转换成image

        }
        return ret;
    }
}