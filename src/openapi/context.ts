import { Document, IWatchable } from "@kcdesign/data";
import { INet } from "./net";
import { IPluginsMgr } from "./plugins";
import { ISelection } from "./selection";
import { IWorkspace } from "./workspace";
import { IToolBox } from "./toolbox";

export interface IEscStack {
    save(key: string, call: () => boolean): void;

    remove(key: string): void;
}

export namespace ContextEvents {
    export const action_change = "action_change"
}

export interface IContext extends IWatchable {
    get storage(): Map<string, string>;

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

    get toolbox(): IToolBox;

    setReadonly(readonly: boolean): void;

    setDocumentInfo(info: { name: string }): void;

    get documentInfo(): { name: string };
}