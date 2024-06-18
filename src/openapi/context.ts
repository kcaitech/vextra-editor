import { Document } from "@kcdesign/data";
import { INet } from "./net";
import { IPluginsMgr } from "./plugins";
import { ISelection, ITextSelection } from "./selection";
import { IWorkspace } from "./workspace";
// import { Selection } from "@/context/selection";

export interface Rect {
    x: number,
    y: number,
    width: number,
    height: number
}

export interface IEscStack {
    save(key: string, call: Function): void;
    remove(key: string): void;
}

export interface IContext {
    get data(): Document;
    get pluginsMgr(): IPluginsMgr;
    setNet(net: INet): void;
    get curAction(): string | undefined;
    setCurAction(uuid: string): void;

    hasPendingSyncCmd(): boolean;

    get selection(): ISelection

    registKeyHandler(keyCode: string, handler: (event: KeyboardEvent, context: IContext) => void): void,

    get workspace(): IWorkspace;
    get escstack(): IEscStack;
}