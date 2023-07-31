import { Shape, Watchable } from "@kcdesign/data";
interface TextSelection {
  shape: Shape
  slice: [number, number][]
}
export class Navi extends Watchable(Object) {
  static SEARCH = 1;
  static SEARCH_FINISHED = 2;
  static SEARCH_PRE = 3;
  static SEARCHING = 4;
  static CHANGE_TYPE = 6;
  static TEXT_SELECTION_CHANGE = 7;
  static SHAPELIST_UPDATE = 8;
  static ADD_PAGE = 9;
  private m_page_need_extend: boolean = false;
  private m_focus_text: TextSelection | undefined;
  private m_keywords: string = '';
  private m_shapelist_freeze: boolean = false;
  private m_accurate: boolean = false;
  constructor() {
    super();
  }
  get needExtend() {
    return this.m_page_need_extend;
  }
  set_page_need_extend(v: boolean) {
    this.m_page_need_extend = v;
  }
  get focusText() {
    return this.m_focus_text;
  }
  set_focus_text(v?: TextSelection) {
    this.m_focus_text = v;
    this.notify(Navi.TEXT_SELECTION_CHANGE);
  }
  get is_shapelist_freeze() {
    return this.m_shapelist_freeze;
  }
  set_sl_freeze(v?: boolean) {
    this.m_shapelist_freeze = v || false;
  }
  get keywords() {
    return this.m_keywords;
  }
  set_keywords(v?: string) {
    this.m_keywords = v || '';
  }
  get accurate() {
    return this.m_accurate;
  }
  setMode(isAcc: boolean) {
    this.m_accurate = isAcc;
  }
}