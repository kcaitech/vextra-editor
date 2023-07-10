import { Watchable } from "@kcdesign/data";

export class Navi extends Watchable(Object) {
  static SEARCH = 1;
  static SEARCH_FINISHED = 2;
  static SEARCH_PRE = 3;
  static SEARCHING = 4;
  private m_page_need_extend: boolean = false;
  constructor() {
    super();
  }
  get needExtend() {
    return this.m_page_need_extend;
  }
  set_page_need_extend(v: boolean) {
    this.m_page_need_extend = v;
  }
}