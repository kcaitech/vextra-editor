import { TableCell, TableCellType } from "@kcdesign/data";
import { Context } from '@/context';

export function imageState(props: {
    shape: TableCell,
    matrix: number[],
    context: Context
}) {

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

    return {
        onMouseDown,
        onMouseUp,
        onMouseMove,
        onMouseEnter,
        onMouseLeave,
        cellType: TableCellType.Image
    }
}

