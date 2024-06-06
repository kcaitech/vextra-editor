import { ScaleType } from "@/context/preview";
import { BlendMode, BorderPosition } from "@kcdesign/data";

export const system = {
    incorrect_input: 'Incorrect input!',
    'illegal_input': 'illegal input!',
    select: 'Select',
    space: '...',
    empty: 'No data',
    paste: 'Paste',
    'paste_here': 'Paste Here',
    'only_text': 'Paste text',
    copy: 'Copy',
    copyAs: 'Copy/Paste as',
    cut: 'Cut',
    replace: 'Replace',
    failed: 'Failed',
    'null_file_name': 'The file name cannot be empty',
    'replace_failed': 'Replacement failed, please try pasting',
    'select_layer': 'Select layer',
    'bring_forward': 'Bring forward',
    'send_backward': 'Send backward',
    'bring_to_top': 'Bring to top',
    'send_to_bottom': 'Send to bottom',
    'visible': 'Visible/Hidden',
    'hidden': 'Hidden',
    'Lock': 'Lock/Unlock',
    'select_all': 'Select all',
    'fit_canvas': 'Adapt to artboard',
    'show_many_cursor': 'Show others cursor',
    'show_comment': 'Show Cutout',
    'show_ruler': 'show ruler',
    'show_pixel_network': 'Show grid',
    'hide_operation_interface': 'Hide UI',
    'creating_groups': 'Create group',
    'create_container': 'Create artboard',
    'un_group': 'Dissolve the group',
    'create_component': 'Create component',
    'unbind_instance': 'Unbind',
    'reset_instance_roperties': 'Reset',
    'edit_component': 'Edit component',
    'wx_login': 'Wechat scan code login',
    'login_read': 'Scanning code indicates that you have read and agreed',
    'read_TOS': 'Service Agreement',
    'read_Privacy': 'Privacy Agreement',
    'product_description': 'An efficient RPD writing tool that supports prototyping, document presentation, and approval management.',
    'login_footer': 'Zhuhai Kuangcai Technology Co., Ltd',
    'placeholder': 'Search file',
    'about': 'About',
    'help_manual': 'Help manual',
    'about_software': 'About Software',
    'personal_center': 'Personal center',
    'login_out': 'Login out',
    'new_file': 'New file',
    'page1': 'Page 1',
    'dissolution': 'Dissolution',
    'content_includes': 'Content includes',
    'title_includes': 'Title includes',
    'license_key': '粤ICP备2023042416号',
    'phonetips': 'Mobile terminal does not support login, please login on the computer side!',
    'btn_login': 'Login',
    'artboart_title_visible': 'Show artboard title',
    sensitive_reminder: 'Contains sensitive information, please re-enter.',
    sensitive_reminder2: 'Contains sensitive information and cannot be shared.',
    sensitive_reminder3: 'Contains sensitive information and cannot be accessed.',
    pixel: 'Pixel Round',
    grid: 'Pixel grid',
    rule: 'Rule',
    uploadMediaFail: 'Image upload failed'
}

export const home = {
    open_local_file: "Open file",
    open_remote_file: "Open remote file",
    new_file: "New file",
    object_selector: 'Move',
    scale: 'Scale',
    automatically_open: 'Automatically open',
    search_file: 'Search file',
    about: 'About',
    help_manual: 'Help manual',
    about_software: 'About software',
    New_file: 'New file',
    recently_opened: 'Recently opened',
    star_file: 'Star file',
    file_shared: 'My files',
    shared_file_received: 'Shared file received',
    file_shared_with_me: 'File shared with me',
    recycling_station: 'Recycling station',
    file_name: 'File name',
    modification_time: 'Recently visited',
    Creation_time: 'Creation time',
    delete_file_time: 'Deletion time',
    size: 'Size',
    operation: 'Operation',
    filelocation: 'File location',
    creator: 'Creator',
    deleter: 'Deleter',
    star_marking: 'Star marking',
    share: 'Share',
    delete: 'Delete',
    delete_ok_tips: 'File moved to trash',
    delete_no_tips: 'Removal failed',
    test: 'Test',
    file_star_marking: 'File has been marked star, can be viewed in the star list!',
    rect: 'Rectangle',
    picture: 'Picture',
    comment: 'Comments',
    groups: 'Group up',
    ungroup: 'Ungroup',
    search_layer: 'Search layer',
    prompt: 'Founder change the file permissions, document is refreshed',
    visit: 'Founder cancelled file access, document will exit',
    delete_file: 'The creator deleted the document and it is about to exit',
    star: 'Star',
    de_star: 'Delete star',
    star_ok: 'Starred document',
    star_cancel: 'Document unstarred',
    de_access_record: 'Delete access record',
    access_record_ok: 'Removed successfully',
    access_record_no: 'Removal failed',
    exit_share: 'Exit share',
    exit_share_success: 'Exit share success',
    exit_share_fail: 'Exit share failed',
    restore: 'Restore',
    completely_delete: 'Completely delete',
    delete_tips: 'After deleting, the file cannot be recovered. Are you sure you want to delete it?',
    delete_ok: 'confirm delete',
    cancel: 'cancel',
    failed_list_tips: 'Failed to get file list',
    restore_ok: 'Restored successfully',
    restore_no: 'Restore failed',
    delete_file_ok: 'Successfully deleted',
    delete_file_no: 'Failed to delete',
    other_tips: 'Please make sure the network connection is normal',
    addComment: 'Add comment',
    rename: 'Rename',
    rename_ok: 'OK',
    page_sort: 'Sort by page',
    login_failed: 'Login failure',
    login_refresh: 'Click refresh QR code',
    invitation_code_tips: 'Please enter the trial invitation code',
    table_empty_tips: 'No content',
    'align_left': 'Align left',
    'align_h_c': 'Align horizontal centers',
    'align_right': 'Align right',
    'align_top': 'Align top',
    'align_v_c': 'Align vertical centers',
    'align_bottom': 'Align bottom',
    'distribute_h': 'Distribute horizontal spacing',
    'distribute_v': 'Distribute vertical spacing',
    people_are_visiting: 'People are visiting:',
    permissions: 'Permissions:',
    contact: 'Contact',
    full: 'Full screen',
    exit_full: 'Exit full screen',
    not_preview_frame: 'There is no demonstrable container'
}

export const search = {
    search_results: 'No matching results',
    search_history: 'No search history',
    search_history_title: 'Historical record',
    search_history_clear: 'Clear',
    result_count: 'xx results'
}


export const navi = {
    shape: 'Shapes',
    comps: 'Compnents',
    resource: 'Resource',
    page: 'Page',
    add_page: 'Add new page',
    copy: 'copy',
    development: 'Functional development…',
    overname: 'The maximum length of filenames is 50 characters'
}

export const frame = {
    custom: 'Custom',
    phone: 'Phone',
    pad: 'Pad',
    deskdop: 'Deskdop',
    presentation: 'Presentation',
    watch: 'Watch',
    paper: 'Paper',
    social_media: 'Social media',
    slide: 'Slide'
}

export const fileMenu = {
    create_new: 'Create new file',
    create_copy: 'Create copy of file',
    save: 'Save file',
    rename: 'Rename file',
    view: 'View',
    guide: 'Shortcut key guide'
}

export const pageMenu = {
    copy_link: 'Copy link to page',
    duplicate: 'Duplicate page',
    rename: 'Rename page',
    delete: 'Delete page'
}

export const attr: any = {
    design: 'Design',
    prototype: 'Prototype',
    inspect: 'Inspect',
    constraints: 'Constraints',
    groupings: 'Groupings',
    border: 'Border',
    opacity: 'Opacity',
    fill: 'Fill',
    text: 'Text',
    table_text: 'Table Text',
    'follow_container_scaling': 'Follow container scaling',
    'advanced_stroke': 'Advanced stroke',
    position: 'Position',
    'corner_smoothing': 'Cornor smoothing',
    vertical: 'Vertical',
    horizontal: 'Horizontal',
    fixedWidth: 'FixedWidth',
    fixedHeight: 'FixedHeight',
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
    'fixed_top_bottom': 'Fixed top and bottom',
    'adapt': 'Resize to fit',
    'mixed': 'Mixed',
    'mixed_lang': 'Click + to replace mixed content.',
    'mixed_cell_lang': 'There are cell Settings, click + set centrally',
    text_advanced_settings: "Text Advanced Settings",
    word_space: 'Word space',
    row_height: 'Line height',
    paragraph_space: 'Paragraph spacing',
    id_style: 'Numbering style',
    letter_case: 'Letter case',
    text_style: 'Text style',
    auto: 'Auto',
    search_for_fonts: 'Search for fonts…',
    bold: 'Bold',
    tilt: 'Tilt',
    underline: 'Underline',
    deleteline: 'Delete line',
    align_left: 'Text align left',
    align_center: 'Text align center',
    align_right: 'Text align right',
    align_the_sides: 'Text align justified',
    align_top: 'Align top',
    align_middle: 'Align middle',
    align_bottom: 'Align bottom',
    none_list: 'No list',
    unordered_list: 'Bulleted list',
    ordered_list: 'Unmbered list',
    as_typed: 'As typed',
    uppercase: 'Uppercase',
    lowercase: 'Lowercase',
    titlecase: 'Title case',
    autowidth: 'Auto width',
    autoheight: 'Auto height',
    fixedsize: 'Fixed size',
    more_value: 'More value',
    used_font: 'Used font',
    no_font_is_currently_in_use: 'No font is currently in use',
    chinese_font: 'Chinese font',
    english_font: 'English font',
    find_the_fonts: "Can't find the fonts",
    font_is_not: 'The font is not present locally. Use the default font effect instead',
    font_color: 'Font color',
    highlight_color: 'Highlight color',
    multiple_colors: 'There are many color values, click + can be unified set',
    unfold: 'Unfold',
    packup: 'Pack up',
    'flip_v': 'Flip Vertical',
    'flip_h': 'Flip Horizontal',
    full_border: 'Full border',
    outer_border: 'border',
    inner_border: 'Inner border',
    exit_path_edit: 'Exit',
    close_path: 'Close',
    de_close_path: 'Open',
    right_angle: "Right Angle",
    completely_symmetrical: "Completely Symmetrical",
    angular_symmetry: "Angular Symmetry",
    asymmetric: "Asymmetric",
    path: 'Path',
    corner: 'corner',
    unilateral: 'unilateral',
    independentCorners: 'Independent corners',
    constrainProportions: 'Constrain proportions',
    frameSize: 'Frame'
}

export const login = {
    login_failure: 'Login failure',
    welcome: 'Welcome',
    name: 'MossDesign',
    describe: 'Online collaborative professional product design software',
    miniprogram:'MiniProgram',
    scan_code:'Scan wechat'
}

export const comment = {
    reply: 'Reply',
    delete: 'Delete',
    settled: 'solve',
    edit_content: 'Edit content',
    quick_reply: 'Quick reply',
    last: 'Last',
    next: 'Next',
    sort: 'Sort by page',
    show_about_me: 'Show about me',
    show_resolved_comments: 'Show resolved comments',
    comment_area: 'Comment section',
    input_comments: 'Input comments',
    reply_comment: 'Reply to comment',
    check: 'check',
    a_few_reply: 'reply',
    month: 'month',
    day: 'day',
    no_comment: 'No comments',
    comments_hide: 'Comments are set to hide',
    show_comments: 'Show comments',
    input_no_perm: 'No permission to comment'
}
export const clipboard = {
    'invalid_data': 'invalid data',
    'not_supported1': 'The current browser does not support it, please use Ctrl C to copy',
    'not_supported2': 'The current browser does not support it, please use ctrl X to cut',
    'copyAsPNGSuccess': 'copied as PNG',
    'copyAsPNGFailed': 'Failed',
    'copyAsPNG': 'copy as PNG'
}
export const opacity: any = {
}
export const message = {
    doc_notopen: "Network anomalies, the document can't open, please try again after checking the network.",
    list_for_failure: 'Network exception, file list acquisition failed, please check the network and try again.',
    retry: 'Retry',
    leave: 'Your changes have not been saved, are you sure you want to leave?',
    network_error: 'Please do not refresh the page or close the document to avoid content loss. The document is trying to save...',
    network_anomaly: 'Network anomaly',
    link_success: 'Network connection successful',
    autosave: 'Automatic document saving',
    cancel: 'Cancel',
    exit_document: 'Exit',
    back_home: 'Back to home',
    unuploaded_msg: 'The document has unuploaded resources. If you exit, content will be lost. Do you want to exit?'
}
export const bool = {
    union: 'Union',
    subtract: 'Subtract',
    intersection: 'Intersect',
    difference: 'Exclude',
    cohere: 'Vector'
}
export const date = {
    just_now: 'Just now',
    s: 's',
}

export const preview: any = {
    actual_size: 'Actual size',
    previous_page: 'Previous page',
    next_page: 'Next page',
    first_page: 'First page',
    preview: 'Preview'
}
attr[BorderPosition.Inner] = 'Inner';
attr[BorderPosition.Center] = 'Center';
attr[BorderPosition.Outer] = 'Outer';

opacity[BlendMode.Normal] = "Normal";
opacity[BlendMode.Darken] = "Become dark";
opacity[BlendMode.Multiply] = "Multiply";
opacity[BlendMode.ColorBurn] = "Color deepening";
opacity[BlendMode.Lighten] = "Become bright";
opacity[BlendMode.Screen] = "Filter";
opacity[BlendMode.ColorDodge] = "Color dodge";
opacity[BlendMode.Overlay] = "Superpose";
opacity[BlendMode.SoftLight] = "Soft light";
opacity[BlendMode.HardLight] = "Strong light";
opacity[BlendMode.Difference] = "Difference";
opacity[BlendMode.Exclusion] = "Exclude";
opacity[BlendMode.Hue] = "Hue";
opacity[BlendMode.Saturation] = "Saturation";
opacity[BlendMode.Color] = "Color";
opacity[BlendMode.Luminosity] = "Lightness";
opacity[BlendMode.PlusDarker] = "Plus darker";
opacity[BlendMode.PlusLighter] = "Plus lighter";

preview[ScaleType.FillScreen] = 'Fill screen'
preview[ScaleType.FitWidth] = 'Fit width'
preview[ScaleType.FitScreen] = 'Fit screen'