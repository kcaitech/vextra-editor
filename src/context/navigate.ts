import { Watchable } from "@kcdesign/data";

export class Navi extends Watchable(Object) {
  static SEARCH = 1;
  static SEARCH_FINISHED = 2;
  static SEARCH_PRE = 3;
  static SEARCHING = 4;
}