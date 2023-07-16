import { Shape, Watchable } from "@kcdesign/data";

export class Navi extends Watchable(Object) {
  static SEARCH = 1;
  static SEARCH_FINISHED = 2;
  static SEARCH_PRE = 3;
  static SEARCHING = 4;
  static CHANGE_TYPE = 6;
  static TEXT_SELECTION_CHANGE = 7;
  private m_page_need_extend: boolean = false;
  private m_focus_text: Shape | undefined;
  private m_keywords: string = '';
  constructor() {
    super();
  }
  get needExtend() {
    return this.m_page_need_extend;
  }
  set_page_need_extend(v: boolean) {
    this.m_page_need_extend = v;
  }
  set_focus_text(v?: Shape) {
    this.m_focus_text = v;
    this.notify(Navi.TEXT_SELECTION_CHANGE);
  }
  set_keywords(v?: string) {
    this.m_keywords = v || '';
  }
  get focusText() {
    return this.m_focus_text;
  }
  get keywords() {
    return this.m_keywords;
  }
}