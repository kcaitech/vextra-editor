/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { WatchableObject } from "@kcdesign/data";
// import { DocSelectionData } from "@/communication/modules/doc_selection_op"
export class TeamWork extends WatchableObject {
    static CHANGE_USER_STATE = 1;

    // private userSelectionList: DocSelectionData[] = []

    constructor() {
        super();
    }

    // get getUserSelection() {
    //     return this.userSelectionList;
    // }
    // userSelectionUpdate(data: DocSelectionData, index: number) {
    //     if(index != -1) {
    //         this.userSelectionList[index] = data
    //     } else {
    //         this.userSelectionList.push(data)
    //     }
    //     this.notify(TeamWork.CHANGE_USER_STATE)
    // }
    // userSelectionExit(index: number) {
    //     if(index >= 0) {
    //         this.userSelectionList.splice(index, 1)
    //     }
    //     this.notify(TeamWork.CHANGE_USER_STATE)
    // }
    
}