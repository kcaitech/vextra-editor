/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Document, IWatchable, PageView, Repo } from "@kcaitech/vextra-core";
import { INet } from "./net";
import { IPluginsMgr } from "./plugins";
import { ISelection } from "./selection";
import { IWorkspace } from "./workspace";
import { IToolBox } from "./toolbox";

export interface IEscStack {
    save(key: string, call: () => boolean): void;
    execute(): void;
}

export enum ContextEnvironment  {
    Web,
    Client,
}

export type DocumentRootInfo = {
    id: string;
    name: string;
}

export namespace ContextEvents {
    export const action_change = "action_change"
    export const document_name_change = "document_name_change"
}

export interface IContext extends IWatchable {
    get storage(): Map<string, string>;

    get data(): Document;

    get repo(): Repo.IRepository;

    get pluginsMgr(): IPluginsMgr;

    get curAction(): string | undefined;

    setCurAction(uuid: string): void;

    get selection(): ISelection

    registKeyHandler(keyCode: string, handler: (event: KeyboardEvent, context: IContext) => void): void,

    get workspace(): IWorkspace;

    get escstack(): IEscStack;

    get toolbox(): IToolBox;

    setReadonly(readonly: boolean): void;

    rename(name: string): void;
    
    nextTick(page: PageView, cb: () => void): void;

    setCustomLoading(show: boolean): void;

    inactive: boolean;

    env: ContextEnvironment;

    updateThumbnail(): void;

    setNet(net: INet): void;
}