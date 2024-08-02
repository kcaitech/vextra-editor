import { Context } from "@/context";
import { ShapeType, ShapeView } from "@kcdesign/data";
import { searchCommentShape } from "@/utils/comment";
import { is_part_of_symbol } from "@/utils/symbol";

export enum MenuItemType {
    All,
    Copy,
    CopyAs,
    Cut,

    Paste,
    PasteHere,
    OnlyText,
    Replace,
    Visible,
    Component,
    Lock,

    Forward,
    Back,
    Top,
    Bottom,

    Groups,
    UnGroup,
    Container,
    Dissolution,
    Instance,

    InsertCol,
    DeleteCol,
    SplitCell,
    MergeCell,

    Half,
    Hundred,
    Double,
    Canvas,
    Operation,
    Comment,
    Cursor,
    Title,
    Cutout,

    Layers,
    EditComps,
    Rule,
    Pixel,

    Mask,
    UnMask
}

export enum MountedAreaType { // 不同区域生成不同的菜单项
    Controller,
    TextSelection,
    Group,
    Artboard,
    Component,
    Shape,
    Table,
    TableCell,
    Instance,
    Root,
    Mask
}

export function get_selected_types(context: Context): number {
    let result = 0;
    const shapes = context.selection.selectedShapes;
    for (let i = shapes.length - 1; i > -1; i--) {
        const shape = shapes[i];
        const type = shape.type;
        if (type === ShapeType.Artboard) {
            result = result | 1;
        } else if (type === ShapeType.Group || type === ShapeType.BoolShape) {
            result = result | 2;
        } else if (type === ShapeType.SymbolRef) {
            result = result | 4;
        }
        if (is_part_of_symbol(shape)) {
            result = result | 8;
        }
        if (result >= 15) return result; // 已经得到了最多类型，不可能再有新的类型，不需要继续判断
    }
    return result;
}

export function getArea(context: Context, e: MouseEvent) {
    const rootXY = context.workspace.getRootXY(e);
    let shapes: ShapeView[] = context.selection.getLayers(rootXY);

    if (shapes[0]?.type === ShapeType.Table) {
        const table = context.tableSelection;

        if (table.editingCell) {
            return MountedAreaType.Table;
        } else if (table.tableRowEnd > -1) {
            return MountedAreaType.TableCell;
        }
    }

    const element = e.target as Element;

    if (element.closest('#text-selection') && context.workspace.isEditing) {
        return MountedAreaType.TextSelection;
    }

    if (element.closest('[data-area="controller"]')) {
        return MountedAreaType.Controller;
    }

    const selection = context.selection;

    const shape = context.selection.getShapesByXY(rootXY, false);

    if (shape) {
        const type = shape.type;
        if (type === ShapeType.Group || type === ShapeType.BoolShape) {
            selection.selectShape(shape);
            return MountedAreaType.Group;
        } else if (type === ShapeType.Symbol) {
            selection.selectShape(shape);
            return MountedAreaType.Component;
        } else if (type === ShapeType.SymbolRef) {
            selection.selectShape(shape);
            return MountedAreaType.Instance;
        }
    }

    shapes = searchCommentShape(context, rootXY);
    if (shapes.length) {
        if (shapes[0]?.type === ShapeType.Artboard) {
            selection.selectShape(shapes[0]);
            return MountedAreaType.Artboard;
        } else {
            selection.selectShape(shapes[0]);
            return MountedAreaType.Shape;
        }
    }

    return MountedAreaType.Root;
}

export function getMenuItems(context: Context, event: MouseEvent, area: MountedAreaType) {
    const BASE_ITEM = [MenuItemType.All, MenuItemType.Copy, MenuItemType.CopyAs];
    const positivePermission = !context.readonly;
    const lable = context.tool.isLable;

    const positive = positivePermission && !lable;

    let contextMenuItems: Set<MenuItemType> = new Set();

    if (area === MountedAreaType.Artboard) {
        if (positive) {
            contextMenuItems = new Set([...BASE_ITEM, MenuItemType.PasteHere, MenuItemType.Replace, MenuItemType.Visible, MenuItemType.Component, MenuItemType.Lock, MenuItemType.Forward, MenuItemType.Back, MenuItemType.Top, MenuItemType.Bottom, MenuItemType.Groups, MenuItemType.Container, MenuItemType.Dissolution]);
        } else {
            contextMenuItems = new Set(BASE_ITEM);
        }
    } else if (area === MountedAreaType.Group) {
        if (positive) {
            contextMenuItems = new Set([...BASE_ITEM, MenuItemType.PasteHere, MenuItemType.Replace, MenuItemType.Visible, MenuItemType.Component, MenuItemType.Lock, MenuItemType.Forward, MenuItemType.Back, MenuItemType.Top, MenuItemType.Bottom, MenuItemType.Groups, MenuItemType.Container, MenuItemType.UnGroup]);
        } else {
            contextMenuItems = new Set(BASE_ITEM);
        }
    } else if (area === MountedAreaType.Component) {
        if (positive) {
            contextMenuItems = new Set([...BASE_ITEM, MenuItemType.PasteHere, MenuItemType.Replace, MenuItemType.Visible, MenuItemType.Lock, MenuItemType.Forward, MenuItemType.Back, MenuItemType.Top, MenuItemType.Bottom, MenuItemType.Groups, MenuItemType.Container]);
        } else {
            contextMenuItems = new Set(BASE_ITEM);
        }
    } else if (area === MountedAreaType.Instance) {
        if (positive) {
            contextMenuItems = new Set([...BASE_ITEM, MenuItemType.PasteHere, MenuItemType.Replace, MenuItemType.Visible, MenuItemType.Component, MenuItemType.Lock, MenuItemType.Forward, MenuItemType.Back, MenuItemType.Top, MenuItemType.Bottom, MenuItemType.Groups, MenuItemType.Container, MenuItemType.Instance]);
        } else {
            contextMenuItems = new Set(BASE_ITEM);
        }
    } else if (area === MountedAreaType.Controller) {
        if (positive) {
            contextMenuItems = new Set([...BASE_ITEM, MenuItemType.PasteHere, MenuItemType.Replace, MenuItemType.Visible, MenuItemType.Component, MenuItemType.Lock, MenuItemType.Forward, MenuItemType.Back, MenuItemType.Top, MenuItemType.Bottom, MenuItemType.Groups, MenuItemType.Container]);

            const type = get_selected_types(context);
            if (type & 1) {
                contextMenuItems.add(MenuItemType.Dissolution);
            } else if (type & 2) {
                contextMenuItems.add(MenuItemType.UnGroup);
            } else if (type & 4) {
                contextMenuItems.add(MenuItemType.Instance);
            } else if (type & 8) {
                contextMenuItems.delete(MenuItemType.Component);
            }
        } else {
            contextMenuItems = new Set(BASE_ITEM);
        }
    } else if (area === MountedAreaType.Shape) {
        if (positive) {
            contextMenuItems = new Set([...BASE_ITEM, MenuItemType.PasteHere, MenuItemType.Replace, MenuItemType.Visible, MenuItemType.Lock, MenuItemType.Forward, MenuItemType.Back, MenuItemType.Top, MenuItemType.Bottom, MenuItemType.Groups, MenuItemType.Container, MenuItemType.Component]);
        } else {
            contextMenuItems = new Set(BASE_ITEM);
        }
    } else if (area === MountedAreaType.TextSelection) {
        if (positive) {
            const selection = context.textSelection;
            if (selection.cursorStart === selection.cursorEnd) {
                contextMenuItems = new Set([MenuItemType.All, MenuItemType.Paste, MenuItemType.OnlyText]);
            } else {
                contextMenuItems = new Set([...BASE_ITEM, MenuItemType.Cut, MenuItemType.Paste, MenuItemType.OnlyText]);
            }
        } else {
            contextMenuItems = new Set(BASE_ITEM);
        }
    } else if (area === MountedAreaType.Table) {
        if (positive) {
            const selection = context.textSelection;
            if (selection.cursorStart === selection.cursorEnd) {
                contextMenuItems = new Set([MenuItemType.All, MenuItemType.Paste, MenuItemType.OnlyText, MenuItemType.InsertCol, MenuItemType.DeleteCol, MenuItemType.SplitCell]);
            } else {
                contextMenuItems = new Set([...BASE_ITEM, MenuItemType.Cut, MenuItemType.Paste, MenuItemType.OnlyText, MenuItemType.InsertCol, MenuItemType.DeleteCol, MenuItemType.SplitCell]);
            }
        } else {
            contextMenuItems = new Set(BASE_ITEM);
        }
    } else if (area === MountedAreaType.TableCell) {
        if (positive) {
            contextMenuItems = new Set([MenuItemType.InsertCol, MenuItemType.DeleteCol, MenuItemType.MergeCell]);
        } else {
            contextMenuItems = new Set(BASE_ITEM);
        }
    } else {
        contextMenuItems = new Set([MenuItemType.All, MenuItemType.Half, MenuItemType.Hundred, MenuItemType.Double, MenuItemType.Double, MenuItemType.Canvas, MenuItemType.Operation, MenuItemType.Comment, MenuItemType.Cursor, MenuItemType.Title, MenuItemType.Cutout]);

        if (positive) {
            contextMenuItems.add(MenuItemType.PasteHere)
        }
    }

    return contextMenuItems;
}