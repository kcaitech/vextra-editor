import { TableCell, TableCellType } from "@kcdesign/data";
import { Context } from '@/context';

export function noneState(props: {
    shape: TableCell,
    matrix: number[],
    context: Context
}, i18nT: Function) {

    function onMouseDown(e: MouseEvent) {

    }

    function onMouseUp(e: MouseEvent) {

    }

    function onMouseMove(e: MouseEvent) {

    }
    function onMouseEnter() {

    }
    function onMouseLeave() {

    }
    function dispose() {
    }

    return {
        onMouseDown,
        onMouseEnter,
        onMouseLeave,
        dispose,
        cellType: TableCellType.None
    }
}

