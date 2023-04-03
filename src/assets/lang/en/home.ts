import { BorderPosition, ShapeType } from "@kcdesign/data/data/typesdefine";

export const system = {
    'illegal_input': 'illegal input!',
    select: 'Select',
    space: '...',
    empty: 'No data',
}

export const home = {
    open_local_file: "Open file",
    open_remote_file: "Open remote file",
    new_file: "New file",
    object_selector: 'Move',
    scale: 'Scale'
}

export const navi = {
    shape: 'Shape',
    comps: 'Compnents',
    resource: 'Resource',
    page: 'Page',
}

export const attr: any = {
    design: 'Design',
    prototype: 'Prototype',
    inspect: 'Inspect',
    constraints: 'Constraints',
    border: 'Border',
    fill: 'Fill',
    'follow_container_scaling': 'Follow container scaling',
    'advanced_stroke': 'Advanced stroke',
    position: 'Position',
    'corner_smoothing': 'Cornor smoothing',
    vertical: 'Vertical',
    horizontal: 'Horizontal',
    fixedLeft: 'Left fixed',
    fixedRight: 'Right fixed',
    withContainer: 'Follow container scaling',
    fixedTop: 'Top fixed',
    fixedBottom: 'Bottom fixed',
    thickness: 'Thickness',
    borderStyle: 'Border style',
    dash: 'Dash',
    solid: 'Solid',
    startMarkerType: 'Start Marker Type',
    endMarkerType: 'End Marker Type',
    background: 'Background',
    color: 'Color',
    alpha: 'Alpha',
    'fixed_left': 'Left fixed',
    'fixed_right': 'Right fixed',
    'fixed_left_right': 'Fixed left and right',
    'center': 'Center',
    'follow_container': 'Follow container',
    'fixed_bottom': 'Bottom fixed',
    'fixed_top': 'Top fixed',
    'fixed_top_bottom': 'Fixed top and bottom'
}
attr[BorderPosition.Inner] = 'Inner';
attr[BorderPosition.Center] = 'Center';
attr[BorderPosition.Outer] = 'Outer';