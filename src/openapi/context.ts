import { Document } from "@kcdesign/data";
import { INet } from "./net";
import { IPluginsMgr } from "./plugins";
import { ISelection, ITextSelection } from "./selection";
// import { Selection } from "@/context/selection";

export interface IContext {
    get data(): Document;
    get pluginsMgr(): IPluginsMgr;
    setNet(net: INet): void;
    get curAction(): string | undefined;
    setCurAction(uuid: string): void;

    hasPendingSyncCmd(): boolean;

    get selection(): ISelection
    get textSelection(): ITextSelection

    registKeyHandler(keyCode: string, handler: (event: KeyboardEvent, context: IContext) => void): void,
}