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