import { Watchable } from "@kcdesign/data";

export class Menu extends Watchable(Object) {
  static SHUTDOWN_MENU = 1;
  static SHUTDOWN_POPOVER = 2;
  static REMOVE_COLOR_PICKER = 3;
  static SHOW_PLACEMENT = 4;
  static HIDE_PLACEMENT = 5;
  private m_menu_mounted: boolean = false;
  private m_popover: boolean = false;
  private m_color_picker: string | undefined; // 编辑器是否已经有调色板🎨
  private invalid_items: string[] = [];
  private m_accurate: boolean = false;
  get isMenuMount() {
    return this.m_menu_mounted;
  }
  get accurate() {
    return this.m_accurate;
  }
  get ispopover() { //xxx
    return this.m_popover;
  }
  get isColorPickerMount() {
    return this.m_color_picker;
  }
  get invalidItems() {
    return this.invalid_items;
  }
  setMode(isAcc: boolean) {
    this.m_accurate = isAcc;
  }
  setInvalidItems(val: string[]) {
    this.invalid_items = [];
    this.invalid_items = val;
  }
  menuMount(mount: boolean) {
    this.m_menu_mounted = mount;
    if (!mount) {
      this.notify(Menu.SHUTDOWN_MENU);
    }
  }
  colorPickerSetup(id: string) { //xxx
    this.m_color_picker = id;
  }
  removeColorPicker() {
    if (this.m_color_picker) {
      this.notify(Menu.REMOVE_COLOR_PICKER);
      this.m_color_picker = undefined;
    }
  }
}