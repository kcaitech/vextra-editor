import { Watchable } from "@kcdesign/data";

export class Menu extends Watchable(Object) {
  static SHUTDOWN_MENU = 1;
  static SHUTDOWN_POPOVER = 2;
  static REMOVE_COLOR_PICKER = 3;
  static SHOW_PLACEMENT = 4;
  static HIDE_PLACEMENT = 5;
  private m_menu_mounted: string = '';
  private m_popover: boolean = false;
  private m_color_picker: string | undefined; // 编辑器是否已经有调色板🎨
  get isMenuMount() {
    return this.m_menu_mounted;
  }
  get ispopover() {
    return this.m_popover;
  }
  get isColorPickerMount() {
    return this.m_color_picker;
  }
  menuMount(mount?: string) {
    this.m_menu_mounted = mount || '';
    if (!mount) this.notify(Menu.SHUTDOWN_MENU);
  }
  colorPickerSetup(id: string) {
    this.m_color_picker = id;
  }
  removeColorPicker() {
    if (this.m_color_picker) {
      this.notify(Menu.REMOVE_COLOR_PICKER);
      this.m_color_picker = undefined;
    }
  }
}