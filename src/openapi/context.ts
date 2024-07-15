import { Document, IWatchable, Page, PageView } from "@kcdesign/data";
import { INet } from "./net";
import { IPluginsMgr } from "./plugins";
import { ISelection } from "./selection";
import { IWorkspace } from "./workspace";
import { IToolBox } from "./toolbox";
import { PageDom } from "@/components/Document/Content/vdom/page";
import { DomCtx } from "@/components/Document/Content/vdom/domctx";
// import { Selection } from "@/context/selection";

// export interface Rect {
//     x: number,
//     y: number,
//     width: number,
//     height: number
// }
export interface IEscStack {
    save(key: string, call: () => boolean): void;
    remove(key: string): void;
}

export namespace ContextEvents {
    export const action_change = "action_change"
}

export interface IContext extends IWatchable {

    get data(): Document;
    get pluginsMgr(): IPluginsMgr;
    setNet(net: INet): void;
    get curAction(): string | undefined;
    setCurAction(uuid: string): void;

    hasPendingSyncCmd(): boolean;

    get selection(): ISelection

    registKeyHandler(keyCode: string, handler: (event: KeyboardEvent, context: IContext) => void): void,

    // getPageDom(page: Page | PageView): { dom: PageDom, ctx: DomCtx }

    get workspace(): IWorkspace;
    get escstack(): IEscStack;
    // setEscstack(stack: EscStack): void;

    get toolbox(): IToolBox;

    setReadonly(readonly: boolean): void;
}