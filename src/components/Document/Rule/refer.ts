import { Context } from "@/context";
import { TransformHandler } from "@/transform/handler";
import { ReferHandleApiCaller } from "@kcdesign/data";

export class ReferLineHandler extends TransformHandler {
    private m_direction: "hor" | "ver";
    private m_index: number = -1;

    constructor(context: Context, event: MouseEvent, direction: "hor" | "ver") {
        super(context, event);
        this.m_direction = direction;
    }

    createApiCaller() {
        this.asyncApiCaller = new ReferHandleApiCaller(this.context.coopRepo, this.context.data, this.page);
        this.workspace.translating(true);
    }

    fulfil() {
        this.workspace.translating(false);
        super.fulfil();
    }

    execute(event: MouseEvent) {
        const isSelected = this.context.tool.selectedLine;
        if (!isSelected) {
            const cid = (this.asyncApiCaller as ReferHandleApiCaller).create(this.m_direction);
            if (cid !== undefined) {
                this.m_index = cid;
                this.context.tool.selectLine([this.m_direction, cid]);
            }
        } else {
            const offsetClient = this.workspace.getContentXY(event).y
            const offset = this.workspace.getRootXY(event).y;
            (this.asyncApiCaller as ReferHandleApiCaller).modifyOffset(this.m_direction, this.m_index, offset, offsetClient < 20);
        }
    }

    private __execute() {

    }

}