
import { Context } from "@/context";

export const permIsEdit = (context: Context) => {
    return Boolean(!context.readonly && !context.tool.isLable);
}