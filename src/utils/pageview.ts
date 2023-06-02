import { Context } from "@/context";
import { debounce } from "lodash";

function _setToolGroup(context: Context) {
    const workspace = context.workspace;
    const tg = document.querySelector('#tool-group');
    if (tg) {
        workspace.toolGroupMount(tg as SVGAElement);
    }
}
export const setToolGroup = debounce(_setToolGroup, 60);