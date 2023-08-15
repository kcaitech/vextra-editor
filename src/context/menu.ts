import { Watchable } from "@kcdesign/data";

export class Menu extends Watchable(Object) {
  static SHUTDOWN_MENU = 1;
  static SHUTDOWN_POPOVER = 2;
  static REMOVE_COLOR_PICKER = 3;
  static SHOW_PLACEMENT = 4;
  static HIDE_PLACEMENT = 5;
  static CHANGE_USER_CURSOR = 6;
  private m_menu_mounted: string = '';
  private m_popover: boolean = false;
  private m_color_picker: string | undefined; // 编辑器是否已经有调色板🎨
  private m_user_cursor_visible: boolean = true;
  get isMenuMount() {
    return this.m_menu_mounted;
  }
  get ispopover() {
    return this.m_popover;
  }
  get isUserCursorVisible() {
    return this.m_user_cursor_visible;
  }
  setPopoverVisible(v: boolean) {
    this.m_popover = v;
  }
  menuMount(mount?: string) {
    this.m_menu_mounted = mount || '';
    if (!mount) this.notify(Menu.SHUTDOWN_MENU);
  }
  get isColorPickerMount() {
    return this.m_color_picker;
  }
  setupColorPicker(id: string) {
    this.m_color_picker = id;
  }
  clearColorPickerId() {
    this.m_color_picker = undefined;
  }
  removeColorPicker() {
    if (!this.m_color_picker) return;
    this.notify(Menu.REMOVE_COLOR_PICKER, this.m_color_picker);
    this.m_color_picker = undefined;
  }
  setVisibleCursor(visible: boolean) {
    this.m_user_cursor_visible = visible;
    this.notify(Menu.CHANGE_USER_CURSOR);
  }
}