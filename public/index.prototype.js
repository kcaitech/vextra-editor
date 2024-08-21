!function(){"use strict";try{if("undefined"!=typeof document){var e=document.createElement("style");e.appendChild(document.createTextNode("html,body{margin:0;padding:0;font-family:var(--font-family);position:relative;overflow:hidden;width:100%;height:100vh}html::-webkit-scrollbar,body::-webkit-scrollbar{height:0;width:0}#app{position:absolute;width:100%;height:100%}:root{--default-padding: 16px;--default-padding-half: 8px;--default-padding-quarter: 4px;--default-margin: 16px;--default-margin-half: 8px;--default-margin-quarter: 4px;--default-input-height: 30px;--font-family: BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, PingFang SC, Microsoft Yahei, Hiragino Sans GB, sans-serif, apple color emoji, Noto Color Emoji, segoe ui emoji, segoe ui symbol;--font-default-bold: 500;--font-default-fontsize: 12px;--el-border-width: 1px;--el-border-style: solid;--el-component-size-large: 32px;--el-component-size: 24px;--el-component-size-small: 16px;--default-radius: 6px;color-scheme:light;--left-font-color: #595959;--overlay-bg-color: rgba(0, 0, 0, .25);--title-color: #3D3D3D;--title-weight: 600;--grey-light: #efefef;--grey: #e6e6e6;--grey-dark: #e0e0e0;--theme-color-line: #f0f0f0;--theme-color: #2c2c2c;--theme-color-anti: #ffffff;--input-background: #F4F5F5;--active-color: #3387f5;--component-color: #7F58F9;--el-color-white: #ffffff;--el-color-black: #000000;--el-color-primary: #73767a;--el-color-primary-light-3: #73767a;--el-color-primary-light-5: #73767a;--el-color-primary-light-7: #73767a;--el-color-primary-light-8: #73767a;--el-color-primary-light-9: #73767a;--el-color-primary-dark-2: #73767a;--el-color-success: #67c23a;--el-color-success-light-3: #95d475;--el-color-success-light-5: #b3e19d;--el-color-success-light-7: #d1edc4;--el-color-success-light-8: #e1f3d8;--el-color-success-light-9: #f0f9eb;--el-color-success-dark-2: #529b2e;--el-color-warning: #e6a23c;--el-color-warning-light-3: #eebe77;--el-color-warning-light-5: #f3d19e;--el-color-warning-light-7: #f8e3c5;--el-color-warning-light-8: #faecd8;--el-color-warning-light-9: #fdf6ec;--el-color-warning-dark-2: #b88230;--el-color-danger: #f56c6c;--el-color-danger-light-3: #f89898;--el-color-danger-light-5: #fab6b6;--el-color-danger-light-7: #fcd3d3;--el-color-danger-light-8: #fde2e2;--el-color-danger-light-9: #fef0f0;--el-color-danger-dark-2: #c45656;--el-color-error: #f56c6c;--el-color-error-light-3: #f89898;--el-color-error-light-5: #fab6b6;--el-color-error-light-7: #fcd3d3;--el-color-error-light-8: #fde2e2;--el-color-error-light-9: #fef0f0;--el-color-error-dark-2: #c45656;--el-color-info: #909399;--el-color-info-light-3: #b1b3b8;--el-color-info-light-5: #c8c9cc;--el-color-info-light-7: #dedfe0;--el-color-info-light-8: #e9e9eb;--el-color-info-light-9: #f4f4f5;--el-color-info-dark-2: #73767a;--el-bg-color: #ffffff;--el-bg-color-page: #f2f3f5;--el-bg-color-overlay: #ffffff;--el-text-color-primary: #303133;--el-text-color-regular: #606266;--el-text-color-secondary: #909399;--el-text-color-placeholder: #a8abb2;--el-text-color-disabled: #c0c4cc;--el-border-color: #dcdfe6;--el-border-color-light: #e4e7ed;--el-border-color-lighter: #ebeef5;--el-border-color-extra-light: #f2f6fc;--el-border-color-dark: #d4d7de;--el-border-color-darker: #cdd0d6;--el-fill-color: #f0f2f5;--el-fill-color-light: #f5f7fa;--el-fill-color-lighter: #fafafa;--el-fill-color-extra-light: #fafcff;--el-fill-color-dark: #ebedf0;--el-fill-color-darker: #e6e8eb;--el-fill-color-blank: #ffffff;--el-box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, .04), 0px 8px 20px rgba(0, 0, 0, .08);--el-box-shadow-light: 0px 0px 12px rgba(0, 0, 0, .12);--el-box-shadow-lighter: 0px 0px 6px rgba(0, 0, 0, .12);--el-box-shadow-dark: 0px 16px 48px 16px rgba(0, 0, 0, .08), 0px 12px 32px rgba(0, 0, 0, .12), 0px 8px 16px -8px rgba(0, 0, 0, .16);--el-disabled-bg-color: var(--el-fill-color-light);--el-disabled-text-color: var(--el-text-color-placeholder);--el-disabled-border-color: var(--el-border-color-light);--el-overlay-color: rgba(0, 0, 0, .8);--el-overlay-color-light: rgba(0, 0, 0, .7);--el-overlay-color-lighter: rgba(0, 0, 0, .5);--el-mask-color: rgba(255, 255, 255, .9);--el-mask-color-extra-light: rgba(255, 255, 255, .3);--el-border-color-hover: var(--el-text-color-disabled);--el-border: var(--el-border-width) var(--el-border-style) var(--el-border-color);--el-svg-monochrome-grey: var(--el-border-color);--el-font-size-base: 10px}.network_error_message{position:fixed;font-size:var(--font-default-fontsize);display:flex;align-items:center;top:120px;left:50%;transform:translate(-50%);color:#f1f1f1;background-color:var(--active-color);padding:7px 30px;border:1px solid var(--active-color);border-radius:4px}.network_error_message .loading-spinner>div{border:2px solid transparent;border-top:2px solid #000;border-left:2px solid #000;border-bottom:2px solid #000;border-radius:50%;width:12px;height:12px;color:#000}.network_error_message .loading-spinner{animation:spin 1s linear infinite}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.transition-400{transition:.4s}.active-box-shadow{box-shadow:0 0 4px var(--active-color)}.hard-shadow{box-shadow:0 4px 16px #0000002e}.cursor-copy{cursor:-webkit-image-set(url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABDCAYAAAAs/QNwAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAkJSURBVHgB7VpbbBRVGP633d5b2lqgCojtAkEpCFKRoMbwYMIjJIRnaKIYHwSMwcQnqL4SIRCLQu3lgURAhXh7ISFNhHCRgKRAkEBaoOFSrqWl293t7vH7zp4ps+NuoXYWFpg/+XNmZ8/Mzvf913NmRTzxxBNPPPHEE0888cQTTzzxxBNPPPHEE0888eSRRSnlg1ZDV5hjnzwPYgObFQwGAzhWsVisDcfVPIePnPbskkGA69evz8Khv6amJhef7ygj0Wi05e7du4Fn2hsMuGxoTmVlZRFAX1Q2gTd04tynJMkQ5SSDn+dAq8z95KkijA+7cOFCf1VVVT4+lsL1fydwgFUtLS0JRAwODtYZEiyQPn7Oycl5g6eg68eMGfPC05ZDtPvT+iUlJWNv3bq1nYDXrFlDQGrFihWqo6NjiAiQ0GpyhQa/bNmy7OLi4vESJ4DaAa0z9/VJpucPywNIAICMO3369GcE2tzcbAHSSkKcRFy+fHna1KlT8/B9IfSufb7EiQhY3pCxHuEk4OjRox8S4IkTJxIIoCJM/hMWSJIrA4FAqc/naxdDFOfZrmsVGxHmNyWjhG48YcKEQobAhg0b3iU4WlscBIiNiD179ti94VJdXV07SBgiaN26dc7r6q0kmonewCrAJFiRn5//CrJ+D0GUlZWlJEGS5AeGDRXXK4tEzrFd05mdna0TaUaRQA9gLANwWUFBwcuhUKiLAObMmTMsAZayYtiJQGgMqRVOjrD4GxqwiMgEMrLYBGEshU68c+fOPj64w3rDqjM/mEZqyBssD0mWHyQeFvIkxVdbW5szduzYksLCwpeuXr3abC+FI1ECpMVTEUFPceSHDjH54Yl5gvlhPwnAWHny5Mm1yUrhSNSZH5xhkSQ/dNjygzxu0aWQlYBNzeHDh1emKoUjVeaHZN5gEcFq4giLveLoH9LuGeYHRlQKR6Kp8oNFQor80IKKFFCPK0nS9SZNmlTAXp6l0Hqwh5XCkSirij0sKOghhiubHWJrq9MaGiTAtLXl9lLosIormio/WJKKiHQnSh9LYXl5eUIpXLJkiesEIN9ol7eLM0laYeHwQHvZTFho+WWUQveaOXOmsJ3Fx9jAwEAXz8MDxC0BcEEJ1KMl+B2JRCKCCiBYVuuxp6dHWltbZe/evYK1hv0WBB9A43aRzyhxUrSMmgAKVoJq3LhxvHHs/v37l3lu9uzZMhqBBWX16tWCnkIfUxD3cvv2benr6yPhgt5DkHekt7dXGhoaZMuWLQIPtG7Rm5WV1QxyGjCnG+SEbty44auvr7esr0kYNQF8ELrmuXPnYiiFsZs3b3ZNmTJFEBLyf4RWJnCE0NA5WpbAsecgAKVBUw8cOCCbNm2SgwcPak/ks0BOQNv8fv/P8IobmB/E9dkwUBYIYFKMafRmvishwBuhFHKM4aHOzJ8/f8QeQEsvXrw4wc0JHHsH2uJ0cYDS7r5jxw7t5mfOnNHz8Lt9GP7E+Afm/IXQGATwMBKyQmK2APvgqTJjxgyyFDNkubPrwizb2NiYB1fMD4fDJf39/Yw17QWOWEwqSFqC7K2P6eZXrlyRa9euCRKbBkzgFni6+ubNmy3i+6A/QXdCe3Jzc0MAH4VG8vLywiAhhF2oEJ5joKioKIxqFWlra2O2dJcAsjtt2rTc8+fPc4enGMwfwsNMrK6uls7OTnkU8CQKewOCB5VVq1ZpwFaCAxg90t03btyorwO4BuiPOAwBTBi/R9xhHEfw+2HkhwiuD+O6CI9LS0uj8IDB+OMqK2m7JkOlEC73yKWQixsKvKZv6dKlW3hu+vTpqr29XZ09e1ZduHBBXbp0ScEbFBKc4kNTAbwJc98GuDdB2OvoQl8FQGb6l/G5kk0ZZIzEt9zy2K5LfO9Cl0DXewLekASYH30JD9xEYMOtCi3wsFrv2rVrP4a1PiA4PLxuaLq6utT169cVyFRbt261g/8ewN+CxTVwJMMqWHgCW/GyeLkoYWeKMQfqd+wdpKcZUmZ/EJm2mBZAKHxpNSTDgafs3LnzC7j7e9D3AbCX3+N6hQSokPzUtm3b9DUGfCOtDvAz2O/j/ETuR0p8P6IIms/lOTdqbMAl7WLYpZsV2VeFyNTDgt+3b99XtKalAPkPgR46dEgxgx87dkx3dAb8dsypxT0IvhpEvwi3L+dCTGxunlZLDyM+sm7eEVQgUb1j9eapwO/fv7+eL0ZgzZm0KEcA/YVgm5qa1PHjxxVyih38XAO+il7GcKOrWxZ/UsATCDCxl3RVaAd/5MiRrwGIr8UYwwHOhzWnACh7dp08Cd4Q94PN8lUY+TKlxLyRylYqQzZJ+SBcFdItnavC5cuXD4FHht+O6bT8q5g3ma48fvz4Sl4DAj6XxJD5DVqLuTV2y5vVJ10+c3aImXSSbZDaV2+nTp3aZt4HavAYdeamIIG+CAI+EgMerv8rLW/AV5vXaKwy+fQ2ia/1M0eMK7L06FJobZA6LE9Xfg06mdmbVWPBggUF1vtFVIJ3JU7AX1ASVQNlwqvkfen2BrxrlneVRSQk4aoQDzy0KqTA8o1z5879FodBWDPIER4QhOuHFy1aFEG9Z2sag8U78d0R6CewPOf1U3GvAYyhefPmRXbt2pWwnB2tuEYAl5l41xeDG9N9Y1i9aQLQ0X03a9asrTg3QPBoeIKI4xByRQStaRSLE50n7t27F0XfzlZ1JbQb3WE/vOQ+5gbxfQiWH9y9e3fM7RbWNQK4i8sRAFm2onhZegrLzz1YFX6D00ECwiZGP/p6TQCanSjOx7CiUxUVFVGEAcGHod3o7IIIiX54wQCIDIOAQbctnw7R7/2tP0zwRQnGatOxTbbHMUa/oz3Vr9iYE5gQzfZasTxocNK3nycuCgFheyynu7s7F9bOw64tqwK9IoL4DqPP19YEqJjxGGWega203rBAWJBEriL5nfYSJlG3XT8tYq0JJP7GOMGatLDNmj7ndRIPx2zOYaa3dXdPjyjz9xcc5phmpYAub/oDfypA6sEfIHy2LezHAt71EODIigBX1sfciMQujIp//WAn5iH3UA+b55a4/isqyR8kDZjMj2E3RannC+9TK/8CbhDDlJ3FSjsAAAAASUVORK5CYII=) 2x) 9 12,auto}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}}();
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
/**
 * @vue/shared v3.4.38
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 **/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function makeMap(str, expectsLowerCase) {
  const set2 = new Set(str.split(","));
  return (val) => set2.has(val);
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
    (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$2 = Object.prototype.hasOwnProperty;
const hasOwn$1 = (val, key) => hasOwnProperty$2.call(val, key);
const isArray$1 = Array.isArray;
const isMap = (val) => toTypeString$1(val) === "[object Map]";
const isSet = (val) => toTypeString$1(val) === "[object Set]";
const isFunction$1 = (val) => typeof val === "function";
const isString$2 = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$2 = (val) => val !== null && typeof val === "object";
const isPromise$1 = (val) => {
  return (isObject$2(val) || isFunction$1(val)) && isFunction$1(val.then) && isFunction$1(val.catch);
};
const objectToString$1 = Object.prototype.toString;
const toTypeString$1 = (value) => objectToString$1.call(value);
const toRawType = (value) => {
  return toTypeString$1(value).slice(8, -1);
};
const isPlainObject$1 = (val) => toTypeString$1(val) === "[object Object]";
const isIntegerKey = (key) => isString$2(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
    // the leading comma is intentional so empty string "" is also included
    ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache2 = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache2[str];
    return hit || (cache2[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c2) => c2 ? c2.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
    (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize$1 = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction((str) => {
  const s = str ? `on${capitalize$1(str)}` : ``;
  return s;
});
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg);
  }
};
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
const looseToNumber = (val) => {
  const n2 = parseFloat(val);
  return isNaN(n2) ? val : n2;
};
let _globalThis$1;
const getGlobalThis$1 = () => {
  return _globalThis$1 || (_globalThis$1 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof window !== "undefined" ? window : {});
};
function normalizeStyle(value) {
  if (isArray$1(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString$2(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString$2(value) || isObject$2(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString$2(value)) {
    res = value;
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$2(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this.effects = [];
    this.cleanups = [];
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
      ) - 1;
    }
  }
  get active() {
    return this._active;
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    activeEffectScope = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this._active) {
      let i, l2;
      for (i = 0, l2 = this.effects.length; i < l2; i++) {
        this.effects[i].stop();
      }
      for (i = 0, l2 = this.cleanups.length; i < l2; i++) {
        this.cleanups[i]();
      }
      if (this.scopes) {
        for (i = 0, l2 = this.scopes.length; i < l2; i++) {
          this.scopes[i].stop(true);
        }
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
      this._active = false;
    }
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}
function recordEffectScope(effect2, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect2);
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
let activeEffect;
class ReactiveEffect {
  constructor(fn, trigger2, scheduler, scope) {
    this.fn = fn;
    this.trigger = trigger2;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this._dirtyLevel = 4;
    this._trackId = 0;
    this._runnings = 0;
    this._shouldSchedule = false;
    this._depsLength = 0;
    recordEffectScope(this, scope);
  }
  get dirty() {
    if (this._dirtyLevel === 2 || this._dirtyLevel === 3) {
      this._dirtyLevel = 1;
      pauseTracking();
      for (let i = 0; i < this._depsLength; i++) {
        const dep = this.deps[i];
        if (dep.computed) {
          triggerComputed(dep.computed);
          if (this._dirtyLevel >= 4) {
            break;
          }
        }
      }
      if (this._dirtyLevel === 1) {
        this._dirtyLevel = 0;
      }
      resetTracking();
    }
    return this._dirtyLevel >= 4;
  }
  set dirty(v2) {
    this._dirtyLevel = v2 ? 4 : 0;
  }
  run() {
    this._dirtyLevel = 0;
    if (!this.active) {
      return this.fn();
    }
    let lastShouldTrack = shouldTrack;
    let lastEffect = activeEffect;
    try {
      shouldTrack = true;
      activeEffect = this;
      this._runnings++;
      preCleanupEffect(this);
      return this.fn();
    } finally {
      postCleanupEffect(this);
      this._runnings--;
      activeEffect = lastEffect;
      shouldTrack = lastShouldTrack;
    }
  }
  stop() {
    if (this.active) {
      preCleanupEffect(this);
      postCleanupEffect(this);
      this.onStop && this.onStop();
      this.active = false;
    }
  }
}
function triggerComputed(computed2) {
  return computed2.value;
}
function preCleanupEffect(effect2) {
  effect2._trackId++;
  effect2._depsLength = 0;
}
function postCleanupEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
      cleanupDepEffect(effect2.deps[i], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
function cleanupDepEffect(dep, effect2) {
  const trackId = dep.get(effect2);
  if (trackId !== void 0 && effect2._trackId !== trackId) {
    dep.delete(effect2);
    if (dep.size === 0) {
      dep.cleanup();
    }
  }
}
let shouldTrack = true;
let pauseScheduleStack = 0;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function pauseScheduling() {
  pauseScheduleStack++;
}
function resetScheduling() {
  pauseScheduleStack--;
  while (!pauseScheduleStack && queueEffectSchedulers.length) {
    queueEffectSchedulers.shift()();
  }
}
function trackEffect(effect2, dep, debuggerEventExtraInfo) {
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanupDepEffect(oldDep, effect2);
      }
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
  }
}
const queueEffectSchedulers = [];
function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
  pauseScheduling();
  for (const effect2 of dep.keys()) {
    let tracking;
    if (effect2._dirtyLevel < dirtyLevel && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      effect2._shouldSchedule || (effect2._shouldSchedule = effect2._dirtyLevel === 0);
      effect2._dirtyLevel = dirtyLevel;
    }
    if (effect2._shouldSchedule && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      effect2.trigger();
      if ((!effect2._runnings || effect2.allowRecurse) && effect2._dirtyLevel !== 2) {
        effect2._shouldSchedule = false;
        if (effect2.scheduler) {
          queueEffectSchedulers.push(effect2.scheduler);
        }
      }
    }
  }
  resetScheduling();
}
const createDep = (cleanup, computed2) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.computed = computed2;
  return dep;
};
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep(() => depsMap.delete(key)));
    }
    trackEffect(
        activeEffect,
        dep
    );
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray$1(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || !isSymbol(key2) && key2 >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  pauseScheduling();
  for (const dep of deps) {
    if (dep) {
      triggerEffects(
          dep,
          4
      );
    }
  }
  resetScheduling();
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
    /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l2 = this.length; i < l2; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      pauseScheduling();
      const res = toRaw(this)[key].apply(this, args);
      resetScheduling();
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function hasOwnProperty$1(key) {
  if (!isSymbol(key)) key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
          // this means the receiver is a user proxy of the reactive proxy
          Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray$1(target);
    if (!isReadonly2) {
      if (targetIsArray && hasOwn$1(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty$1;
      }
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject$2(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray$1(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArray$1(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn$1(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn$1(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
        target,
        "iterate",
        isArray$1(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(
    true
);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v2) => Reflect.getPrototypeOf(v2);
function get(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value, _isShallow = false) {
  if (!_isShallow && !isShallow(value) && !isReadonly(value)) {
    value = toRaw(value);
  }
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set(key, value, _isShallow = false) {
  if (!_isShallow && !isShallow(value) && !isReadonly(value)) {
    value = toRaw(value);
  }
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  const oldValue = get2.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  get2 ? get2.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
        rawTarget,
        "iterate",
        isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get(this, key);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has,
    add(value) {
      return add.call(this, value, true);
    },
    set(key, value) {
      return set.call(this, key, value, true);
    },
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(
        method,
        true,
        true
    );
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations
] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
        hasOwn$1(instrumentations, key) && key in target ? instrumentations : target,
        key,
        receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
      target,
      false,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap
  );
}
function shallowReactive(target) {
  return createReactiveObject(
      target,
      false,
      shallowReactiveHandlers,
      shallowCollectionHandlers,
      shallowReactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
      target,
      true,
      readonlyHandlers,
      readonlyCollectionHandlers,
      readonlyMap
  );
}
function shallowReadonly(target) {
  return createReactiveObject(
      target,
      true,
      shallowReadonlyHandlers,
      shallowReadonlyCollectionHandlers,
      shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$2(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
      target,
      targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  if (Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject$2(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$2(value) ? readonly(value) : value;
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this.getter = getter;
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this["__v_isReadonly"] = false;
    this.effect = new ReactiveEffect(
        () => getter(this._value),
        () => triggerRefValue(
            this,
            this.effect._dirtyLevel === 2 ? 2 : 3
        )
    );
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self2 = toRaw(this);
    if ((!self2._cacheable || self2.effect.dirty) && hasChanged(self2._value, self2._value = self2.effect.run())) {
      triggerRefValue(self2, 4);
    }
    trackRefValue(self2);
    if (self2.effect._dirtyLevel >= 2) {
      triggerRefValue(self2, 2);
    }
    return self2._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
  // #region polyfill _dirty for backward compatibility third party code for Vue <= 3.3.x
  get _dirty() {
    return this.effect.dirty;
  }
  set _dirty(v2) {
    this.effect.dirty = v2;
  }
  // #endregion
}
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction$1(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  return cRef;
}
function trackRefValue(ref2) {
  var _a2;
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    trackEffect(
        activeEffect,
        (_a2 = ref2.dep) != null ? _a2 : ref2.dep = createDep(
            () => ref2.dep = void 0,
            ref2 instanceof ComputedRefImpl ? ref2 : void 0
        )
    );
  }
}
function triggerRefValue(ref2, dirtyLevel = 4, newVal, oldVal) {
  ref2 = toRaw(ref2);
  const dep = ref2.dep;
  if (dep) {
    triggerEffects(
        dep,
        dirtyLevel
    );
  }
}
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
}
function shallowRef(value) {
  return createRef(value, true);
}
function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue;
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this, 4);
    }
  }
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
var define_process_env_default$2 = { ALLUSERSPROFILE: "C:\\ProgramData", APPDATA: "C:\\Users\\Zrx\\AppData\\Roaming", ChocolateyInstall: "C:\\ProgramData\\chocolatey", ChocolateyLastPathUpdate: "133219334407372012", COLOR: "1", CommonProgramFiles: "C:\\Program Files\\Common Files", "CommonProgramFiles(x86)": "C:\\Program Files (x86)\\Common Files", CommonProgramW6432: "C:\\Program Files\\Common Files", COMPUTERNAME: "DESKTOP-PQMEM4M", ComSpec: "C:\\WINDOWS\\system32\\cmd.exe", DriverData: "C:\\Windows\\System32\\Drivers\\DriverData", EDITOR: "C:\\WINDOWS\\notepad.exe", EFC_11988: "1", FIG_JETBRAINS_SHELL_INTEGRATION: "1", FPS_BROWSER_APP_PROFILE_STRING: "Internet Explorer", FPS_BROWSER_USER_PROFILE_STRING: "Default", HOME: "C:\\Users\\Zrx", HOMEDRIVE: "C:", HOMEPATH: "\\Users\\Zrx", IDEA_INITIAL_DIRECTORY: "C:\\Program Files\\JetBrains\\WebStorm 2023.2.2\\bin", INIT_CWD: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype", LOCALAPPDATA: "C:\\Users\\Zrx\\AppData\\Local", LOGONSERVER: "\\\\DESKTOP-PQMEM4M", NODE: "C:\\Program Files\\nodejs\\node.exe", NODE_ENV: "production", NODE_EXE: "C:\\Program Files\\nodejs\\\\node.exe", NPM_CLI_JS: "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js", npm_command: "run-script", npm_config_cache: "C:\\Users\\Zrx\\AppData\\Local\\npm-cache", npm_config_globalconfig: "C:\\Program Files\\nodejs\\etc\\npmrc", npm_config_global_prefix: "C:\\Program Files\\nodejs", npm_config_init_module: "C:\\Users\\Zrx\\.npm-init.js", npm_config_local_prefix: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype", npm_config_node_gyp: "C:\\Users\\Zrx\\AppData\\Roaming\\nvm\\v20.14.0\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js", npm_config_noproxy: "", npm_config_npm_version: "10.7.0", npm_config_prefix: "C:\\Program Files\\nodejs", npm_config_registry: "https://packages.aliyun.com/6393d698d690c872dceedcc0/npm/npm-registry/", npm_config_userconfig: "C:\\Users\\Zrx\\.npmrc", npm_config_user_agent: "npm/10.7.0 node/v20.14.0 win32 x64 workspaces/false", npm_execpath: "C:\\Users\\Zrx\\AppData\\Roaming\\nvm\\v20.14.0\\node_modules\\npm\\bin\\npm-cli.js", npm_lifecycle_event: "build", npm_lifecycle_script: "vite build", npm_node_execpath: "C:\\Program Files\\nodejs\\node.exe", npm_package_json: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype\\package.json", npm_package_name: "@kcdesign/editor", npm_package_version: "1.0.24", NPM_PREFIX_JS: "C:\\Program Files\\nodejs\\\\node_modules\\npm\\bin\\npm-prefix.js", NPM_PREFIX_NPM_CLI_JS: "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js", NUMBER_OF_PROCESSORS: "16", NVM_HOME: "C:\\Users\\Zrx\\AppData\\Roaming\\nvm", NVM_SYMLINK: "C:\\Program Files\\nodejs", OneDrive: "C:\\Users\\Zrx\\OneDrive", OS: "Windows_NT", Path: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype\\node_modules\\.bin;C:\\Users\\Zrx\\Desktop\\CODE-BETA\\node_modules\\.bin;C:\\Users\\Zrx\\Desktop\\node_modules\\.bin;C:\\Users\\Zrx\\node_modules\\.bin;C:\\Users\\node_modules\\.bin;C:\\node_modules\\.bin;C:\\Users\\Zrx\\AppData\\Roaming\\nvm\\v20.14.0\\node_modules\\npm\\node_modules\\@npmcli\\run-script\\lib\\node-gyp-bin;C:\\Python311\\Scripts\\;C:\\Python311\\;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\ProgramData\\chocolatey\\bin;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet\\;C:\\Program Files\\Graphviz\\bin;C:\\Program Files\\Docker\\Docker\\resources\\bin;C:\\Users\\Zrx\\AppData\\Roaming\\nvm;C:\\Program Files\\nodejs;C:\\Users\\Zrx\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\Zrx\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Program Files\\JetBrains\\WebStorm 2023.2.2\\bin;;C:\\Users\\Zrx\\AppData\\Roaming\\nvm;C:\\Program Files\\nodejs;C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype\\node_modules\\.bin", PATHEXT: ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.PY;.PYW", PROCESSOR_ARCHITECTURE: "AMD64", PROCESSOR_IDENTIFIER: "Intel64 Family 6 Model 154 Stepping 3, GenuineIntel", PROCESSOR_LEVEL: "6", PROCESSOR_REVISION: "9a03", ProgramData: "C:\\ProgramData", ProgramFiles: "C:\\Program Files", "ProgramFiles(x86)": "C:\\Program Files (x86)", ProgramW6432: "C:\\Program Files", PROMPT: "$P$G", PSModulePath: "C:\\Program Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules", PUBLIC: "C:\\Users\\Public", SESSIONNAME: "Console", SystemDrive: "C:", SystemRoot: "C:\\WINDOWS", TEMP: "C:\\Users\\Zrx\\AppData\\Local\\Temp", TERMINAL_EMULATOR: "JetBrains-JediTerm", TERM_SESSION_ID: "322f102f-fb02-492f-aed4-c4659d397fb2", TMP: "C:\\Users\\Zrx\\AppData\\Local\\Temp", USERDOMAIN: "DESKTOP-PQMEM4M", USERDOMAIN_ROAMINGPROFILE: "DESKTOP-PQMEM4M", USERNAME: "Zrx", USERPROFILE: "C:\\Users\\Zrx", WebStorm: "C:\\Program Files\\JetBrains\\WebStorm 2023.2.2\\bin;", windir: "C:\\WINDOWS", ZES_ENABLE_SYSMAN: "1" };
const stack = [];
let isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
        appWarnHandler,
        instance,
        11,
        [
          // eslint-disable-next-line no-restricted-syntax
          msg + args.map((a2) => {
            var _a2, _b;
            return (_b = (_a2 = a2.toString) == null ? void 0 : _a2.call(a2)) != null ? _b : JSON.stringify(a2);
          }).join(""),
          instance && instance.proxy,
          trace.map(
              ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
          ).join("\n"),
          trace
        ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
        true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
  isWarning = false;
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
      vnode.component,
      vnode.type,
      isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString$2(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction$1(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction$1(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise$1(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray$1(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      pauseTracking();
      callWithErrorHandling(
          appErrorHandler,
          null,
          10,
          [err, exposedInstance, errorInfo]
      );
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
  {
    console.error(err);
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start2 = flushIndex + 1;
  let end2 = queue.length;
  while (start2 < end2) {
    const middle = start2 + end2 >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.pre) {
      start2 = middle + 1;
    } else {
      end2 = middle;
    }
  }
  return start2;
}
function queueJob(job) {
  if (!queue.length || !queue.includes(
      job,
      isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
  )) {
    if (job.id == null) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function invalidateJob(job) {
  const i = queue.indexOf(job);
  if (i > flushIndex) {
    queue.splice(i, 1);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray$1(cb)) {
    if (!activePostFlushCbs || !activePostFlushCbs.includes(
        cb,
        cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex
    )) {
      pendingPostFlushCbs.push(cb);
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen, i = isFlushing ? flushIndex + 1 : 0) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.pre) {
      if (instance && cb.id !== instance.uid) {
        continue;
      }
      queue.splice(i, 1);
      i--;
      cb();
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
        (a2, b2) => getId(a2) - getId(b2)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (cb.active !== false) cb();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a2, b2) => {
  const diff = getId(a2) - getId(b2);
  if (diff === 0) {
    if (a2.pre && !b2.pre) return -1;
    if (b2.pre && !a2.pre) return 1;
  }
  return diff;
};
function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;
  queue.sort(comparator);
  const check = NOOP;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && job.active !== false) {
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && check(job)) ;
        callWithErrorHandling(
            job,
            job.i,
            job.i ? 15 : 14
        );
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    flushPostFlushCbs();
    isFlushing = false;
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
  return isFunction$1(options) ? (
      // #8326: extend call and options.name access are considered side-effects
      // by Rollup, so we have to wrap it in a pure-annotated IIFE.
      /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))()
  ) : options;
}
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
      type,
      hook,
      keepAliveRoot,
      true
      /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") {
    injectHook(lifecycle, (...args) => hook(...args), target);
  }
};
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook(
    "rtg"
);
const onRenderTracked = createHook(
    "rtc"
);
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
const getPublicInstance = (i) => {
  if (!i) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
    // Move PURE marker to new line to workaround compiler discarding it
    // due to type annotation
    /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
      $: (i) => i,
      $el: (i) => i.vnode.el,
      $data: (i) => i.data,
      $props: (i) => i.props,
      $attrs: (i) => i.attrs,
      $slots: (i) => i.slots,
      $refs: (i) => i.refs,
      $parent: (i) => getPublicInstance(i.parent),
      $root: (i) => getPublicInstance(i.root),
      $emit: (i) => i.emit,
      $options: (i) => resolveMergedOptions(i),
      $forceUpdate: (i) => i.f || (i.f = () => {
        i.effect.dirty = true;
        queueJob(i.update);
      }),
      $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
      $watch: (i) => instanceWatch.bind(i)
    })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn$1(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    let normalizedProps;
    if (key[0] !== "$") {
      const n2 = accessCache[key];
      if (n2 !== void 0) {
        switch (n2) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn$1(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (normalizedProps = instance.propsOptions[0]) && hasOwn$1(normalizedProps, key)
      ) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn$1(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
      }
      return publicGetter(instance);
    } else if (
        // css module (injected by vue-loader)
        (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn$1(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
        // global properties
        globalProperties = appContext.config.globalProperties, hasOwn$1(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn$1(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn$1(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
        _: { data, setupState, accessCache, ctx, appContext, propsOptions }
      }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn$1(data, key) || hasSetupBinding(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn$1(normalizedProps, key) || hasOwn$1(ctx, key) || hasOwn$1(publicPropertiesMap, key) || hasOwn$1(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn$1(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray$1(props) ? props.reduce(
      (normalized, p2) => (normalized[p2] = null, normalized),
      {}
  ) : props;
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction$1(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject$2(data)) ;
    else {
      instance.data = reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get2 = isFunction$1(opt) ? opt.bind(publicThis, publicThis) : isFunction$1(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set2 = !isFunction$1(opt) && isFunction$1(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c2 = computed({
        get: get2,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c2.value,
        set: (v2) => c2.value = v2
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction$1(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray$1(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray$1(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray$1(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$2(opt)) {
      if ("default" in opt) {
        injected = inject(
            opt.from || key,
            opt.default,
            true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v2) => injected.value = v2
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook(hook, instance, type) {
  callWithAsyncErrorHandling(
      isArray$1(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
      instance,
      type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString$2(raw)) {
    const handler = ctx[raw];
    if (isFunction$1(handler)) {
      watch(getter, handler);
    }
  } else if (isFunction$1(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject$2(raw)) {
    if (isArray$1(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction$1(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction$1(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache2,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache2.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
          (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject$2(base)) {
    cache2.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
        (m) => mergeOptions(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
        isFunction$1(to) ? to.call(this, this) : to,
        isFunction$1(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray$1(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray$1(to) && isArray$1(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
        /* @__PURE__ */ Object.create(null),
        normalizePropsOrEmits(to),
        normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction$1(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject$2(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    let isMounted = false;
    const app2 = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v2) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) ;
        else if (plugin && isFunction$1(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app2, ...options);
        } else if (isFunction$1(plugin)) {
          installedPlugins.add(plugin);
          plugin(app2, ...options);
        } else ;
        return app2;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app2;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app2;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app2;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          if (isHydrate && hydrate) {
            hydrate(vnode, rootContainer);
          } else {
            render(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app2._container = rootContainer;
          rootContainer.__vue_app__ = app2;
          return getComponentPublicInstance(vnode.component);
        }
      },
      unmount() {
        if (isMounted) {
          render(null, app2._container);
          delete app2._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app2;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app2;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app2;
  };
}
let currentApp = null;
function provide(key, value) {
  if (!currentInstance) ;
  else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance || currentApp) {
    const provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction$1(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else ;
  }
}
const internalObjectProto = {};
const createInternalObject = () => Object.create(internalObjectProto);
const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
      // always force full diff in dev
      // - #1942 if hmr is enabled with sfc component
      // - vite#872 non-sfc component used by sfc component
      (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn$1(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
                options,
                rawCurrentProps,
                camelizedKey,
                value,
                instance,
                false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
          !hasOwn$1(rawProps, key) && // it's possible the original props was passed in as kebab-case
          // and converted to camelCase (#955)
          ((kebabKey = hyphenate(key)) === key || !hasOwn$1(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
              (rawPrevProps[key] !== void 0 || // for kebab-case
                  rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
                options,
                rawCurrentProps,
                key,
                void 0,
                instance,
                true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn$1(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn$1(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
          options,
          rawCurrentProps,
          key,
          castValues[key],
          instance,
          !hasOwn$1(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn$1(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction$1(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
              null,
              props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[
        0
        /* shouldCast */
        ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
          1
          /* shouldCastTrue */
          ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
const mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache2 = asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache2.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys) needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$2(comp)) {
      cache2.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray$1(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$1(opt) || isFunction$1(opt) ? { type: opt } : extend({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray$1(propType)) {
          for (let index = 0; index < propType.length; ++index) {
            const type = propType[index];
            const typeName = isFunction$1(type) && type.name;
            if (typeName === "Boolean") {
              shouldCast = true;
              break;
            } else if (typeName === "String") {
              shouldCastTrue = false;
            }
          }
        } else {
          shouldCast = isFunction$1(propType) && propType.name === "Boolean";
        }
        prop[
            0
            /* shouldCast */
            ] = shouldCast;
        prop[
            1
            /* shouldCastTrue */
            ] = shouldCastTrue;
        if (shouldCast || hasOwn$1(prop, "default")) {
          needCastKeys.push(normalizedKey);
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject$2(comp)) {
    cache2.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}
const isInternalKey = (key) => key[0] === "_" || key === "$stable";
const normalizeSlotValue = (value) => isArray$1(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && currentInstance && (!ctx || ctx.root === currentInstance.root)) ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction$1(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const assignSlots = (slots, children, optimized) => {
  for (const key in children) {
    if (optimized || key !== "_") {
      slots[key] = children[key];
    }
  }
};
const initSlots = (instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) {
        def(slots, "_", type, true);
      }
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        assignSlots(slots, children, optimized);
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray$1(rawRef)) {
    rawRef.forEach(
        (r, i) => setRef(
            r,
            oldRawRef && (isArray$1(oldRawRef) ? oldRawRef[i] : oldRawRef),
            parentSuspense,
            vnode,
            isUnmount
        )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref3 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  if (oldRef != null && oldRef !== ref3) {
    if (isString$2(oldRef)) {
      refs[oldRef] = null;
      if (hasOwn$1(setupState, oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      oldRef.value = null;
    }
  }
  if (isFunction$1(ref3)) {
    callWithErrorHandling(ref3, owner, 12, [value, refs]);
  } else {
    const _isString = isString$2(ref3);
    const _isRef = isRef(ref3);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? hasOwn$1(setupState, ref3) ? setupState[ref3] : refs[ref3] : ref3.value;
          if (isUnmount) {
            isArray$1(existing) && remove(existing, refValue);
          } else {
            if (!isArray$1(existing)) {
              if (_isString) {
                refs[ref3] = [refValue];
                if (hasOwn$1(setupState, ref3)) {
                  setupState[ref3] = refs[ref3];
                }
              } else {
                ref3.value = [refValue];
                if (rawRef.k) refs[rawRef.k] = ref3.value;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref3] = value;
          if (hasOwn$1(setupState, ref3)) {
            setupState[ref3] = value;
          }
        } else if (_isRef) {
          ref3.value = value;
          if (rawRef.k) refs[rawRef.k] = value;
        } else ;
      };
      if (value) {
        doSet.id = -1;
        queuePostRenderEffect(doSet, parentSuspense);
      } else {
        doSet();
      }
    }
  }
}
const TeleportEndKey = Symbol("_vte");
const isTeleport = (type) => type.__isTeleport;
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis$1();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref3, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals
          );
        } else if (shapeFlag & 128) {
          type.process(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals
          );
        } else ;
    }
    if (ref3 != null && parentComponent) {
      setRef(ref3, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
          n2.el = hostCreateText(n2.children),
          container,
          anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
          n2.el = hostCreateComment(n2.children || ""),
          container,
          anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
        n2.children,
        container,
        anchor,
        namespace,
        n2.el,
        n2.anchor
    );
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
      );
    } else {
      patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
      );
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
        vnode.type,
        namespace,
        props && props.is,
        props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
          vnode.children,
          el,
          null,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(vnode, namespace),
          slotScopeIds,
          optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
            el,
            parentVNode,
            parentVNode.scopeId,
            parentVNode.slotScopeIds,
            parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start2 = 0) => {
    for (let i = start2; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(
          null,
          child,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
      hostSetElementText(el, "");
    }
    if (dynamicChildren) {
      patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          el,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(n2, namespace),
          slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
          n1,
          n2,
          el,
          null,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(n2, namespace),
          slotScopeIds,
          false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, namespace, parentComponent);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, oldProps, newProps, parentComponent, namespace);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = (
          // oldVNode may be an errored async setup() component inside Suspense
          // which will not have a mounted element
          oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
          // of the Fragment itself so it can move its children.
          (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
              // which also requires the correct parent container
              !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
              oldVNode.shapeFlag & (6 | 64)) ? hostParentNode(oldVNode.el) : (
              // In other cases, the parent container is not actually used so we
              // just pass the block element here to avoid a DOM parentNode call.
              fallbackContainer
          )
      );
      patch(
          oldVNode,
          newVNode,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          true
      );
    }
  };
  const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
                el,
                key,
                oldProps[key],
                null,
                namespace,
                parentComponent
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, namespace, parentComponent);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
          // #10007
          // such fragment like `<></>` will be compiled into
          // a fragment which doesn't have a children.
          // In this case fallback to an empty array
          n2.children || [],
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
          // of renderSlot() with no valid children
          n1.dynamicChildren) {
        patchBlockChildren(
            n1.dynamicChildren,
            dynamicChildren,
            container,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds
        );
        if (
            // #2080 if the stable fragment has a key, it's a <template v-for> that may
            //  get moved around. Make sure all root level vnodes inherit el.
            // #2134 or if it's a component root, it may also get moved around
            // as the component is being moved.
            n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
              n1,
              n2,
              true
              /* shallow */
          );
        }
      } else {
        patchChildren(
            n1,
            n2,
            container,
            fragmentEndAnchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
            n2,
            container,
            anchor,
            namespace,
            optimized
        );
      } else {
        mountComponent(
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance(
        initialVNode,
        parentComponent,
        parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance, false, optimized);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
      }
    } else {
      setupRenderEffect(
          instance,
          initialVNode,
          container,
          anchor,
          parentSuspense,
          namespace,
          optimized
      );
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        invalidateJob(instance.update);
        instance.effect.dirty = true;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        if (el && hydrateNode) {
          const hydrateSubTree = () => {
            instance.subTree = renderComponentRoot(instance);
            hydrateNode(
                el,
                instance.subTree,
                instance,
                parentSuspense,
                null
            );
          };
          if (isAsyncWrapperVNode) {
            initialVNode.type.__asyncLoader().then(
                // note: we are moving the render call into an async callback,
                // which means it won't track dependencies - but it's ok because
                // a server-rendered async wrapper is already in resolved state
                // and it will never need to change.
                () => !instance.isUnmounted && hydrateSubTree()
            );
          } else {
            hydrateSubTree();
          }
        } else {
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
              null,
              subTree,
              container,
              anchor,
              instance,
              parentSuspense,
              namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
              () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
              parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              if (!instance.isUnmounted) {
                componentUpdateFn();
              }
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
            prevTree,
            nextTree,
            // parent may have changed if it's in a teleport
            hostParentNode(prevTree.el),
            // anchor may have changed if it's in a fragment
            getNextHostNode(prevTree),
            instance,
            parentSuspense,
            namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
              () => invokeVNodeHook(vnodeHook, parent, next, vnode),
              parentSuspense
          );
        }
      }
    };
    const effect2 = instance.effect = new ReactiveEffect(
        componentUpdateFn,
        NOOP,
        () => queueJob(update),
        instance.scope
        // track it in component's effect scope
    );
    const update = instance.update = () => {
      if (effect2.dirty) {
        effect2.run();
      }
    };
    update.i = instance;
    update.id = instance.uid;
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
              c1,
              c2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
              c2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(
          c1[i],
          nextChild,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
          c1,
          parentComponent,
          parentSuspense,
          true,
          false,
          commonLength
      );
    } else {
      mountChildren(
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized,
          commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
            n1,
            n2,
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
            n1,
            n2,
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
              null,
              c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
              prevChild,
              c2[newIndex],
              container,
              null,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
              null,
              nextChild,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = () => hostInsert(el, container, anchor);
        const performLeave = () => {
          leave(el, () => {
            remove22();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref: ref3,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs,
      cacheIndex
    } = vnode;
    if (patchFlag === -2) {
      optimized = false;
    }
    if (ref3 != null) {
      setRef(ref3, null, parentSuspense, vnode, true);
    }
    if (cacheIndex != null) {
      parentComponent.renderCache[cacheIndex] = void 0;
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
            vnode,
            parentComponent,
            parentSuspense,
            internals,
            doRemove
        );
      } else if (dynamicChildren && // #5154
          // when v-once is used inside a block, setBlockTracking(-1) marks the
          // parent block with hasOnce: true
          // so that it doesn't take the fast path during unmount - otherwise
          // components nested in v-once are never unmounted.
          !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
          (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
            dynamicChildren,
            parentComponent,
            parentSuspense,
            false,
            true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end2) => {
    let next;
    while (cur !== end2) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end2);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, update, subTree, um, m, a: a2 } = instance;
    invalidateMount(m);
    invalidateMount(a2);
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (update) {
      update.active = false;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
      parentSuspense.deps--;
      if (parentSuspense.deps === 0) {
        parentSuspense.resolve();
      }
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start2 = 0) => {
    for (let i = start2; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  };
  let isFlushing2 = false;
  const render = (vnode, container, namespace) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(
          container._vnode || null,
          vnode,
          container,
          null,
          null,
          null,
          namespace
      );
    }
    container._vnode = vnode;
    if (!isFlushing2) {
      isFlushing2 = true;
      flushPreFlushCbs();
      flushPostFlushCbs();
      isFlushing2 = false;
    }
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  let hydrateNode;
  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect: effect2, update }, allowed) {
  effect2.allowRecurse = update.allowRecurse = allowed;
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray$1(ch1) && isArray$1(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow && c2.patchFlag !== -2)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v2, c2;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v2 = result.length - 1;
      while (u < v2) {
        c2 = u + v2 >> 1;
        if (arr[result[c2]] < arrI) {
          u = c2 + 1;
        } else {
          v2 = c2;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v2 = result[u - 1];
  while (u-- > 0) {
    result[u] = v2;
    v2 = p2[v2];
  }
  return result;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
function invalidateMount(hooks) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++) hooks[i].active = false;
  }
}
const ssrContextKey = Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, {
  immediate,
  deep,
  flush,
  once,
  onTrack,
  onTrigger
} = EMPTY_OBJ) {
  if (cb && once) {
    const _cb = cb;
    cb = (...args) => {
      _cb(...args);
      unwatch();
    };
  }
  const instance = currentInstance;
  const reactiveGetter = (source2) => deep === true ? source2 : (
      // for deep: false, only traverse root-level properties
      traverse(source2, deep === false ? 1 : void 0)
  );
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray$1(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = () => source.map((s) => {
      if (isRef(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction$1(s)) {
        return callWithErrorHandling(s, instance, 2);
      } else ;
    });
  } else if (isFunction$1(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2);
    } else {
      getter = () => {
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(
            source,
            instance,
            3,
            [onCleanup]
        );
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn) => {
    cleanup = effect2.onStop = () => {
      callWithErrorHandling(fn, instance, 4);
      cleanup = effect2.onStop = void 0;
    };
  };
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    onCleanup = NOOP;
    if (!cb) {
      getter();
    } else if (immediate) {
      callWithAsyncErrorHandling(cb, instance, 3, [
        getter(),
        isMultiSource ? [] : void 0,
        onCleanup
      ]);
    }
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else {
      return NOOP;
    }
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect2.active || !effect2.dirty) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v2, i) => hasChanged(v2, oldValue[i])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect2.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
  } else {
    job.pre = true;
    if (instance) job.id = instance.uid;
    scheduler = () => queueJob(job);
  }
  const effect2 = new ReactiveEffect(getter, NOOP, scheduler);
  const scope = getCurrentScope();
  const unwatch = () => {
    effect2.stop();
    if (scope) {
      remove(scope.effects, effect2);
    }
  };
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect2.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect(
        effect2.run.bind(effect2),
        instance && instance.suspense
    );
  } else {
    effect2.run();
  }
  if (ssrCleanup) ssrCleanup.push(unwatch);
  return unwatch;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString$2(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction$1(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject$2(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  depth--;
  if (isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v2) => {
      traverse(v2, depth, seen);
    });
  } else if (isPlainObject$1(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}
const getModelModifiers = (props, modelName) => {
  return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
  if (modifiers) {
    if (modifiers.trim) {
      args = rawArgs.map((a2) => isString$2(a2) ? a2.trim() : a2);
    }
    if (modifiers.number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
      props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
        handler,
        instance,
        6,
        args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
        onceHandler,
        instance,
        6,
        args
    );
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache2 = appContext.emitsCache;
  const cached = cache2.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$2(comp)) {
      cache2.set(comp, null);
    }
    return null;
  }
  if (isArray$1(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject$2(comp)) {
    cache2.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn$1(options, key[0].toLowerCase() + key.slice(1)) || hasOwn$1(options, hyphenate(key)) || hasOwn$1(options, key);
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance(instance);
  let result;
  let fallthroughAttrs;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = !!(define_process_env_default$2.NODE_ENV !== "production") && setupState.__isScriptSetup ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
              `Property '${String(
                  key
              )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode(
          render.call(
              thisProxy,
              proxyToUse,
              renderCache,
              !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(props) : props,
              setupState,
              data,
              ctx
          )
      );
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && attrs === props) ;
      result = normalizeVNode(
          render2.length > 1 ? render2(
              !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(props) : props,
              !!(define_process_env_default$2.NODE_ENV !== "production") ? {
                get attrs() {
                  markAttrsAccessed();
                  return shallowReadonly(attrs);
                },
                slots,
                emit: emit2
              } : { attrs, slots, emit: emit2 }
          ) : render2(
              !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(props) : props,
              null
          )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
              fallthroughAttrs,
              propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs, false, true);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    root.transition = vnode.transition;
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function updateHOCHostEl({ vnode, parent }, el) {
  while (parent) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) {
      root.el = vnode.el;
    }
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
}
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$1(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
const Fragment = Symbol.for("v-fgt");
const Text = Symbol.for("v-txt");
const Comment = Symbol.for("v-cmt");
const Static = Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock) {
    currentBlock.hasOnce = true;
  }
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
      createBaseVNode(
          type,
          props,
          children,
          patchFlag,
          dynamicProps,
          shapeFlag,
          true
      )
  );
}
function isVNode$1(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
                        ref: ref3,
                        ref_key,
                        ref_for
                      }) => {
  if (typeof ref3 === "number") {
    ref3 = "" + ref3;
  }
  return ref3 != null ? isString$2(ref3) || isRef(ref3) || isFunction$1(ref3) ? { i: currentRenderingInstance, r: ref3, k: ref_key, f: !!ref_for } : ref3 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString$2(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
      !isBlockNode && // has current parent block
      currentBlock && // presence of a patch flag indicates this node needs patching on updates.
      // component nodes also should always be patched, because even if the
      // component doesn't need to update, it needs to persist the instance on to
      // the next vnode so that it can be properly unmounted later.
      (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
      // vnode should not be considered dynamic due to handler caching.
      vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode$1(type)) {
    const cloned = cloneVNode(
        type,
        props,
        true
        /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString$2(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject$2(style)) {
      if (isProxy(style) && !isArray$1(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString$2(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$2(type) ? 4 : isFunction$1(type) ? 2 : 0;
  return createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      isBlockNode,
      true
  );
}
function guardReactiveProps(props) {
  if (!props) return null;
  return isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref: ref3, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
        // #2078 in the case of <component :is="vnode" ref="extra"/>
        // if the vnode itself already has a ref, cloneVNode will need to merge
        // the refs so the single vnode can be set on multiple refs
        mergeRef && ref3 ? isArray$1(ref3) ? ref3.concat(normalizeRef(extraProps)) : [ref3, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref3,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  if (transition && cloneTransition) {
    setTransitionHooks(
        cloned,
        transition.clone(cloned)
    );
  }
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray$1(child)) {
    return createVNode(
        Fragment,
        null,
        // #3666, avoid reference pollution when reusing vnode
        child.slice()
    );
  } else if (typeof child === "object") {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray$1(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction$1(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray$1(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    scope: new EffectScope(
        true
        /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g = getGlobalThis$1();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v2) => {
      if (setters.length > 1) setters.forEach((set2) => set2(v2));
      else setters[0](v2);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
      `__VUE_INSTANCE_SETTERS__`,
      (v2) => currentInstance = v2
  );
  setInSSRSetupState = registerGlobalSetter(
      `__VUE_SSR_SETTERS__`,
      (v2) => isInSSRComponentSetup = v2
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children, optimized);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(
        setup,
        instance,
        0,
        [
          instance.props,
          setupContext
        ]
    );
    resetTracking();
    reset();
    if (isPromise$1(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult, isSSR);
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction$1(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject$2(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else ;
  finishComponentSetup(instance, isSSR);
}
let compile$1;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    if (!isSSR && compile$1 && !Component.render) {
      const template = Component.template || resolveMergedOptions(instance).template;
      if (template) {
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend(
            extend(
                {
                  isCustomElement,
                  delimiters
                },
                compilerOptions
            ),
            componentCompilerOptions
        );
        Component.render = compile$1(template, finalCompilerOptions);
      }
    }
    instance.render = Component.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
const attrsProxyHandlers = {
  get(target, key) {
    track(target, "get", "");
    return target[key];
  }
};
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      attrs: new Proxy(instance.attrs, attrsProxyHandlers),
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, (c2) => c2.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction$1(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance && instance.parent) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(
        instance.components || instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction$1(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  const c2 = computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c2;
};
function h$1(type, propsOrChildren, children) {
  const l2 = arguments.length;
  if (l2 === 2) {
    if (isObject$2(propsOrChildren) && !isArray$1(propsOrChildren)) {
      if (isVNode$1(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l2 > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l2 === 3 && isVNode$1(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
const version = "3.4.38";
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start2, end2) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start2 && (start2 === end2 || start2.nextSibling)) {
      while (true) {
        parent.insertBefore(start2.cloneNode(true), anchor);
        if (start2 === end2 || !(start2 = start2.nextSibling)) break;
      }
    } else {
      templateContainer.innerHTML = namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content;
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
const vtcKey = Symbol("_vtc");
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
const vShowOriginalDisplay = Symbol("_vod");
const vShowHidden = Symbol("_vsh");
const CSS_VAR_TEXT = Symbol("");
const displayRE = /(^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString$2(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString$2(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      setStyle(style, key, next[key]);
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray$1(val)) {
    val.forEach((v2) => setStyle(style, name, v2));
  } else {
    if (val == null) val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
            hyphenate(prefixed),
            val.replace(importantRE, ""),
            "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize$1(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean2 = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (value == null || isBoolean2 && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(
          key,
          isBoolean2 ? "" : isSymbol(value) ? String(value) : value
      );
    }
  }
}
function patchDOMProp(el, key, value, parentComponent) {
  if (key === "innerHTML" || key === "textContent") {
    if (value == null) return;
    el[key] = value;
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
      !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? "" : String(value);
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
          nextValue,
          instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p$1 = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p$1.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    callWithAsyncErrorHandling(
        patchStopImmediatePropagation(e, invoker.value),
        instance,
        5,
        [e]
    );
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e, value) {
  if (isArray$1(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map(
        (fn) => (e2) => !e2._stopped && fn && fn(e2)
    );
  } else {
    return value;
  }
}
const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
    key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
      patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
    }
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction$1(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString$2(value)) {
    return false;
  }
  return key in el;
}
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = (...args) => {
  const app2 = ensureRenderer().createApp(...args);
  const { mount } = app2;
  app2.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app2._component;
    if (!isFunction$1(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    container.innerHTML = "";
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app2;
};
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function normalizeContainer(container) {
  if (isString$2(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "App",
  setup(__props) {
    onMounted(() => {
      console.log("COPY THAT！ 渲染器开始工作");
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, "渲染器开始工作...");
    };
  }
});
const _hoisted_1 = ["xlink:href"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SvgIcon",
  props: {
    iconClass: {},
    className: {}
  },
  setup(__props) {
    const props = __props;
    const iconName = computed(() => {
      return `#icon-${props.iconClass}`;
    });
    const svgClass = computed(() => {
      if (props.className) {
        return "svg-icon " + props.className;
      } else {
        return "svg-icon";
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("svg", {
        class: normalizeClass(svgClass.value),
        "aria-hidden": "true"
      }, [
        createBaseVNode("use", { "xlink:href": iconName.value }, null, 8, _hoisted_1)
      ], 2);
    };
  }
});
/*!
  * shared v9.13.1
  * (c) 2024 kazuya kawaguchi
  * Released under the MIT License.
  */
const inBrowser = typeof window !== "undefined";
const makeSymbol = (name, shareable = false) => !shareable ? Symbol(name) : Symbol.for(name);
const generateFormatCacheKey = (locale2, key, source) => friendlyJSONstringify({ l: locale2, k: key, s: source });
const friendlyJSONstringify = (json) => JSON.stringify(json).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/\u0027/g, "\\u0027");
const isNumber = (val) => typeof val === "number" && isFinite(val);
const isDate = (val) => toTypeString(val) === "[object Date]";
const isRegExp = (val) => toTypeString(val) === "[object RegExp]";
const isEmptyObject = (val) => isPlainObject(val) && Object.keys(val).length === 0;
const assign$1 = Object.assign;
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof window !== "undefined" ? window : {});
};
function escapeHtml(rawText) {
  return rawText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
const isArray = Array.isArray;
const isFunction = (val) => typeof val === "function";
const isString$1 = (val) => typeof val === "string";
const isBoolean = (val) => typeof val === "boolean";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return isObject$1(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const isPlainObject = (val) => {
  if (!isObject$1(val))
    return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto.constructor === Object;
};
const toDisplayString = (val) => {
  return val == null ? "" : isArray(val) || isPlainObject(val) && val.toString === objectToString ? JSON.stringify(val, null, 2) : String(val);
};
function join$1(items, separator = "") {
  return items.reduce((str, item, index) => index === 0 ? str + item : str + separator + item, "");
}
function incrementer(code2) {
  let current = code2;
  return () => ++current;
}
function warn(msg, err) {
  if (typeof console !== "undefined") {
    console.warn(`[intlify] ` + msg);
    if (err) {
      console.warn(err.stack);
    }
  }
}
const isNotObjectOrIsArray = (val) => !isObject$1(val) || isArray(val);
function deepCopy(src, des) {
  if (isNotObjectOrIsArray(src) || isNotObjectOrIsArray(des)) {
    throw new Error("Invalid value");
  }
  const stack2 = [{ src, des }];
  while (stack2.length) {
    const { src: src2, des: des2 } = stack2.pop();
    Object.keys(src2).forEach((key) => {
      if (isNotObjectOrIsArray(src2[key]) || isNotObjectOrIsArray(des2[key])) {
        des2[key] = src2[key];
      } else {
        stack2.push({ src: src2[key], des: des2[key] });
      }
    });
  }
}
/*!
  * message-compiler v9.13.1
  * (c) 2024 kazuya kawaguchi
  * Released under the MIT License.
  */
function createPosition(line, column, offset) {
  return { line, column, offset };
}
function createLocation(start2, end2, source) {
  const loc = { start: start2, end: end2 };
  return loc;
}
const RE_ARGS = /\{([0-9a-zA-Z]+)\}/g;
function format$1(message2, ...args) {
  if (args.length === 1 && isObject(args[0])) {
    args = args[0];
  }
  if (!args || !args.hasOwnProperty) {
    args = {};
  }
  return message2.replace(RE_ARGS, (match, identifier) => {
    return args.hasOwnProperty(identifier) ? args[identifier] : "";
  });
}
const assign = Object.assign;
const isString = (val) => typeof val === "string";
const isObject = (val) => val !== null && typeof val === "object";
function join(items, separator = "") {
  return items.reduce((str, item, index) => index === 0 ? str + item : str + separator + item, "");
}
const CompileWarnCodes = {
  USE_MODULO_SYNTAX: 1,
  __EXTEND_POINT__: 2
};
const warnMessages = {
  [CompileWarnCodes.USE_MODULO_SYNTAX]: `Use modulo before '{{0}}'.`
};
function createCompileWarn(code2, loc, ...args) {
  const msg = format$1(warnMessages[code2], ...args || []);
  const message2 = { message: String(msg), code: code2 };
  if (loc) {
    message2.location = loc;
  }
  return message2;
}
const CompileErrorCodes = {
  // tokenizer error codes
  EXPECTED_TOKEN: 1,
  INVALID_TOKEN_IN_PLACEHOLDER: 2,
  UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER: 3,
  UNKNOWN_ESCAPE_SEQUENCE: 4,
  INVALID_UNICODE_ESCAPE_SEQUENCE: 5,
  UNBALANCED_CLOSING_BRACE: 6,
  UNTERMINATED_CLOSING_BRACE: 7,
  EMPTY_PLACEHOLDER: 8,
  NOT_ALLOW_NEST_PLACEHOLDER: 9,
  INVALID_LINKED_FORMAT: 10,
  // parser error codes
  MUST_HAVE_MESSAGES_IN_PLURAL: 11,
  UNEXPECTED_EMPTY_LINKED_MODIFIER: 12,
  UNEXPECTED_EMPTY_LINKED_KEY: 13,
  UNEXPECTED_LEXICAL_ANALYSIS: 14,
  // generator error codes
  UNHANDLED_CODEGEN_NODE_TYPE: 15,
  // minifier error codes
  UNHANDLED_MINIFIER_NODE_TYPE: 16,
  // Special value for higher-order compilers to pick up the last code
  // to avoid collision of error codes. This should always be kept as the last
  // item.
  __EXTEND_POINT__: 17
};
const errorMessages = {
  // tokenizer error messages
  [CompileErrorCodes.EXPECTED_TOKEN]: `Expected token: '{0}'`,
  [CompileErrorCodes.INVALID_TOKEN_IN_PLACEHOLDER]: `Invalid token in placeholder: '{0}'`,
  [CompileErrorCodes.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER]: `Unterminated single quote in placeholder`,
  [CompileErrorCodes.UNKNOWN_ESCAPE_SEQUENCE]: `Unknown escape sequence: \\{0}`,
  [CompileErrorCodes.INVALID_UNICODE_ESCAPE_SEQUENCE]: `Invalid unicode escape sequence: {0}`,
  [CompileErrorCodes.UNBALANCED_CLOSING_BRACE]: `Unbalanced closing brace`,
  [CompileErrorCodes.UNTERMINATED_CLOSING_BRACE]: `Unterminated closing brace`,
  [CompileErrorCodes.EMPTY_PLACEHOLDER]: `Empty placeholder`,
  [CompileErrorCodes.NOT_ALLOW_NEST_PLACEHOLDER]: `Not allowed nest placeholder`,
  [CompileErrorCodes.INVALID_LINKED_FORMAT]: `Invalid linked format`,
  // parser error messages
  [CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL]: `Plural must have messages`,
  [CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_MODIFIER]: `Unexpected empty linked modifier`,
  [CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_KEY]: `Unexpected empty linked key`,
  [CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS]: `Unexpected lexical analysis in token: '{0}'`,
  // generator error messages
  [CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE]: `unhandled codegen node type: '{0}'`,
  // minimizer error messages
  [CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE]: `unhandled mimifier node type: '{0}'`
};
function createCompileError(code2, loc, options = {}) {
  const { domain, messages, args } = options;
  const msg = format$1((messages || errorMessages)[code2] || "", ...args || []);
  const error = new SyntaxError(String(msg));
  error.code = code2;
  if (loc) {
    error.location = loc;
  }
  error.domain = domain;
  return error;
}
function defaultOnError(error) {
  throw error;
}
const CHAR_SP = " ";
const CHAR_CR = "\r";
const CHAR_LF = "\n";
const CHAR_LS = String.fromCharCode(8232);
const CHAR_PS = String.fromCharCode(8233);
function createScanner(str) {
  const _buf = str;
  let _index = 0;
  let _line = 1;
  let _column = 1;
  let _peekOffset = 0;
  const isCRLF = (index2) => _buf[index2] === CHAR_CR && _buf[index2 + 1] === CHAR_LF;
  const isLF = (index2) => _buf[index2] === CHAR_LF;
  const isPS = (index2) => _buf[index2] === CHAR_PS;
  const isLS = (index2) => _buf[index2] === CHAR_LS;
  const isLineEnd = (index2) => isCRLF(index2) || isLF(index2) || isPS(index2) || isLS(index2);
  const index = () => _index;
  const line = () => _line;
  const column = () => _column;
  const peekOffset = () => _peekOffset;
  const charAt = (offset) => isCRLF(offset) || isPS(offset) || isLS(offset) ? CHAR_LF : _buf[offset];
  const currentChar = () => charAt(_index);
  const currentPeek = () => charAt(_index + _peekOffset);
  function next() {
    _peekOffset = 0;
    if (isLineEnd(_index)) {
      _line++;
      _column = 0;
    }
    if (isCRLF(_index)) {
      _index++;
    }
    _index++;
    _column++;
    return _buf[_index];
  }
  function peek() {
    if (isCRLF(_index + _peekOffset)) {
      _peekOffset++;
    }
    _peekOffset++;
    return _buf[_index + _peekOffset];
  }
  function reset() {
    _index = 0;
    _line = 1;
    _column = 1;
    _peekOffset = 0;
  }
  function resetPeek(offset = 0) {
    _peekOffset = offset;
  }
  function skipToPeek() {
    const target = _index + _peekOffset;
    while (target !== _index) {
      next();
    }
    _peekOffset = 0;
  }
  return {
    index,
    line,
    column,
    peekOffset,
    charAt,
    currentChar,
    currentPeek,
    next,
    peek,
    reset,
    resetPeek,
    skipToPeek
  };
}
const EOF = void 0;
const DOT = ".";
const LITERAL_DELIMITER = "'";
const ERROR_DOMAIN$3 = "tokenizer";
function createTokenizer(source, options = {}) {
  const location = options.location !== false;
  const _scnr = createScanner(source);
  const currentOffset = () => _scnr.index();
  const currentPosition = () => createPosition(_scnr.line(), _scnr.column(), _scnr.index());
  const _initLoc = currentPosition();
  const _initOffset = currentOffset();
  const _context = {
    currentType: 14,
    offset: _initOffset,
    startLoc: _initLoc,
    endLoc: _initLoc,
    lastType: 14,
    lastOffset: _initOffset,
    lastStartLoc: _initLoc,
    lastEndLoc: _initLoc,
    braceNest: 0,
    inLinked: false,
    text: ""
  };
  const context = () => _context;
  const { onError } = options;
  function emitError(code2, pos, offset, ...args) {
    const ctx = context();
    pos.column += offset;
    pos.offset += offset;
    if (onError) {
      const loc = location ? createLocation(ctx.startLoc, pos) : null;
      const err = createCompileError(code2, loc, {
        domain: ERROR_DOMAIN$3,
        args
      });
      onError(err);
    }
  }
  function getToken(context2, type, value) {
    context2.endLoc = currentPosition();
    context2.currentType = type;
    const token = { type };
    if (location) {
      token.loc = createLocation(context2.startLoc, context2.endLoc);
    }
    if (value != null) {
      token.value = value;
    }
    return token;
  }
  const getEndToken = (context2) => getToken(
      context2,
      14
      /* TokenTypes.EOF */
  );
  function eat(scnr, ch) {
    if (scnr.currentChar() === ch) {
      scnr.next();
      return ch;
    } else {
      emitError(CompileErrorCodes.EXPECTED_TOKEN, currentPosition(), 0, ch);
      return "";
    }
  }
  function peekSpaces(scnr) {
    let buf = "";
    while (scnr.currentPeek() === CHAR_SP || scnr.currentPeek() === CHAR_LF) {
      buf += scnr.currentPeek();
      scnr.peek();
    }
    return buf;
  }
  function skipSpaces(scnr) {
    const buf = peekSpaces(scnr);
    scnr.skipToPeek();
    return buf;
  }
  function isIdentifierStart(ch) {
    if (ch === EOF) {
      return false;
    }
    const cc = ch.charCodeAt(0);
    return cc >= 97 && cc <= 122 || // a-z
        cc >= 65 && cc <= 90 || // A-Z
        cc === 95;
  }
  function isNumberStart(ch) {
    if (ch === EOF) {
      return false;
    }
    const cc = ch.charCodeAt(0);
    return cc >= 48 && cc <= 57;
  }
  function isNamedIdentifierStart(scnr, context2) {
    const { currentType } = context2;
    if (currentType !== 2) {
      return false;
    }
    peekSpaces(scnr);
    const ret = isIdentifierStart(scnr.currentPeek());
    scnr.resetPeek();
    return ret;
  }
  function isListIdentifierStart(scnr, context2) {
    const { currentType } = context2;
    if (currentType !== 2) {
      return false;
    }
    peekSpaces(scnr);
    const ch = scnr.currentPeek() === "-" ? scnr.peek() : scnr.currentPeek();
    const ret = isNumberStart(ch);
    scnr.resetPeek();
    return ret;
  }
  function isLiteralStart(scnr, context2) {
    const { currentType } = context2;
    if (currentType !== 2) {
      return false;
    }
    peekSpaces(scnr);
    const ret = scnr.currentPeek() === LITERAL_DELIMITER;
    scnr.resetPeek();
    return ret;
  }
  function isLinkedDotStart(scnr, context2) {
    const { currentType } = context2;
    if (currentType !== 8) {
      return false;
    }
    peekSpaces(scnr);
    const ret = scnr.currentPeek() === ".";
    scnr.resetPeek();
    return ret;
  }
  function isLinkedModifierStart(scnr, context2) {
    const { currentType } = context2;
    if (currentType !== 9) {
      return false;
    }
    peekSpaces(scnr);
    const ret = isIdentifierStart(scnr.currentPeek());
    scnr.resetPeek();
    return ret;
  }
  function isLinkedDelimiterStart(scnr, context2) {
    const { currentType } = context2;
    if (!(currentType === 8 || currentType === 12)) {
      return false;
    }
    peekSpaces(scnr);
    const ret = scnr.currentPeek() === ":";
    scnr.resetPeek();
    return ret;
  }
  function isLinkedReferStart(scnr, context2) {
    const { currentType } = context2;
    if (currentType !== 10) {
      return false;
    }
    const fn = () => {
      const ch = scnr.currentPeek();
      if (ch === "{") {
        return isIdentifierStart(scnr.peek());
      } else if (ch === "@" || ch === "%" || ch === "|" || ch === ":" || ch === "." || ch === CHAR_SP || !ch) {
        return false;
      } else if (ch === CHAR_LF) {
        scnr.peek();
        return fn();
      } else {
        return isTextStart(scnr, false);
      }
    };
    const ret = fn();
    scnr.resetPeek();
    return ret;
  }
  function isPluralStart(scnr) {
    peekSpaces(scnr);
    const ret = scnr.currentPeek() === "|";
    scnr.resetPeek();
    return ret;
  }
  function detectModuloStart(scnr) {
    const spaces = peekSpaces(scnr);
    const ret = scnr.currentPeek() === "%" && scnr.peek() === "{";
    scnr.resetPeek();
    return {
      isModulo: ret,
      hasSpace: spaces.length > 0
    };
  }
  function isTextStart(scnr, reset = true) {
    const fn = (hasSpace = false, prev = "", detectModulo = false) => {
      const ch = scnr.currentPeek();
      if (ch === "{") {
        return prev === "%" ? false : hasSpace;
      } else if (ch === "@" || !ch) {
        return prev === "%" ? true : hasSpace;
      } else if (ch === "%") {
        scnr.peek();
        return fn(hasSpace, "%", true);
      } else if (ch === "|") {
        return prev === "%" || detectModulo ? true : !(prev === CHAR_SP || prev === CHAR_LF);
      } else if (ch === CHAR_SP) {
        scnr.peek();
        return fn(true, CHAR_SP, detectModulo);
      } else if (ch === CHAR_LF) {
        scnr.peek();
        return fn(true, CHAR_LF, detectModulo);
      } else {
        return true;
      }
    };
    const ret = fn();
    reset && scnr.resetPeek();
    return ret;
  }
  function takeChar(scnr, fn) {
    const ch = scnr.currentChar();
    if (ch === EOF) {
      return EOF;
    }
    if (fn(ch)) {
      scnr.next();
      return ch;
    }
    return null;
  }
  function isIdentifier(ch) {
    const cc = ch.charCodeAt(0);
    return cc >= 97 && cc <= 122 || // a-z
        cc >= 65 && cc <= 90 || // A-Z
        cc >= 48 && cc <= 57 || // 0-9
        cc === 95 || // _
        cc === 36;
  }
  function takeIdentifierChar(scnr) {
    return takeChar(scnr, isIdentifier);
  }
  function isNamedIdentifier(ch) {
    const cc = ch.charCodeAt(0);
    return cc >= 97 && cc <= 122 || // a-z
        cc >= 65 && cc <= 90 || // A-Z
        cc >= 48 && cc <= 57 || // 0-9
        cc === 95 || // _
        cc === 36 || // $
        cc === 45;
  }
  function takeNamedIdentifierChar(scnr) {
    return takeChar(scnr, isNamedIdentifier);
  }
  function isDigit(ch) {
    const cc = ch.charCodeAt(0);
    return cc >= 48 && cc <= 57;
  }
  function takeDigit(scnr) {
    return takeChar(scnr, isDigit);
  }
  function isHexDigit(ch) {
    const cc = ch.charCodeAt(0);
    return cc >= 48 && cc <= 57 || // 0-9
        cc >= 65 && cc <= 70 || // A-F
        cc >= 97 && cc <= 102;
  }
  function takeHexDigit(scnr) {
    return takeChar(scnr, isHexDigit);
  }
  function getDigits(scnr) {
    let ch = "";
    let num = "";
    while (ch = takeDigit(scnr)) {
      num += ch;
    }
    return num;
  }
  function readModulo(scnr) {
    skipSpaces(scnr);
    const ch = scnr.currentChar();
    if (ch !== "%") {
      emitError(CompileErrorCodes.EXPECTED_TOKEN, currentPosition(), 0, ch);
    }
    scnr.next();
    return "%";
  }
  function readText(scnr) {
    let buf = "";
    while (true) {
      const ch = scnr.currentChar();
      if (ch === "{" || ch === "}" || ch === "@" || ch === "|" || !ch) {
        break;
      } else if (ch === "%") {
        if (isTextStart(scnr)) {
          buf += ch;
          scnr.next();
        } else {
          break;
        }
      } else if (ch === CHAR_SP || ch === CHAR_LF) {
        if (isTextStart(scnr)) {
          buf += ch;
          scnr.next();
        } else if (isPluralStart(scnr)) {
          break;
        } else {
          buf += ch;
          scnr.next();
        }
      } else {
        buf += ch;
        scnr.next();
      }
    }
    return buf;
  }
  function readNamedIdentifier(scnr) {
    skipSpaces(scnr);
    let ch = "";
    let name = "";
    while (ch = takeNamedIdentifierChar(scnr)) {
      name += ch;
    }
    if (scnr.currentChar() === EOF) {
      emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
    }
    return name;
  }
  function readListIdentifier(scnr) {
    skipSpaces(scnr);
    let value = "";
    if (scnr.currentChar() === "-") {
      scnr.next();
      value += `-${getDigits(scnr)}`;
    } else {
      value += getDigits(scnr);
    }
    if (scnr.currentChar() === EOF) {
      emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
    }
    return value;
  }
  function isLiteral2(ch) {
    return ch !== LITERAL_DELIMITER && ch !== CHAR_LF;
  }
  function readLiteral(scnr) {
    skipSpaces(scnr);
    eat(scnr, `'`);
    let ch = "";
    let literal = "";
    while (ch = takeChar(scnr, isLiteral2)) {
      if (ch === "\\") {
        literal += readEscapeSequence(scnr);
      } else {
        literal += ch;
      }
    }
    const current = scnr.currentChar();
    if (current === CHAR_LF || current === EOF) {
      emitError(CompileErrorCodes.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER, currentPosition(), 0);
      if (current === CHAR_LF) {
        scnr.next();
        eat(scnr, `'`);
      }
      return literal;
    }
    eat(scnr, `'`);
    return literal;
  }
  function readEscapeSequence(scnr) {
    const ch = scnr.currentChar();
    switch (ch) {
      case "\\":
      case `'`:
        scnr.next();
        return `\\${ch}`;
      case "u":
        return readUnicodeEscapeSequence(scnr, ch, 4);
      case "U":
        return readUnicodeEscapeSequence(scnr, ch, 6);
      default:
        emitError(CompileErrorCodes.UNKNOWN_ESCAPE_SEQUENCE, currentPosition(), 0, ch);
        return "";
    }
  }
  function readUnicodeEscapeSequence(scnr, unicode, digits) {
    eat(scnr, unicode);
    let sequence = "";
    for (let i = 0; i < digits; i++) {
      const ch = takeHexDigit(scnr);
      if (!ch) {
        emitError(CompileErrorCodes.INVALID_UNICODE_ESCAPE_SEQUENCE, currentPosition(), 0, `\\${unicode}${sequence}${scnr.currentChar()}`);
        break;
      }
      sequence += ch;
    }
    return `\\${unicode}${sequence}`;
  }
  function isInvalidIdentifier(ch) {
    return ch !== "{" && ch !== "}" && ch !== CHAR_SP && ch !== CHAR_LF;
  }
  function readInvalidIdentifier(scnr) {
    skipSpaces(scnr);
    let ch = "";
    let identifiers = "";
    while (ch = takeChar(scnr, isInvalidIdentifier)) {
      identifiers += ch;
    }
    return identifiers;
  }
  function readLinkedModifier(scnr) {
    let ch = "";
    let name = "";
    while (ch = takeIdentifierChar(scnr)) {
      name += ch;
    }
    return name;
  }
  function readLinkedRefer(scnr) {
    const fn = (buf) => {
      const ch = scnr.currentChar();
      if (ch === "{" || ch === "%" || ch === "@" || ch === "|" || ch === "(" || ch === ")" || !ch) {
        return buf;
      } else if (ch === CHAR_SP) {
        return buf;
      } else if (ch === CHAR_LF || ch === DOT) {
        buf += ch;
        scnr.next();
        return fn(buf);
      } else {
        buf += ch;
        scnr.next();
        return fn(buf);
      }
    };
    return fn("");
  }
  function readPlural(scnr) {
    skipSpaces(scnr);
    const plural = eat(
        scnr,
        "|"
        /* TokenChars.Pipe */
    );
    skipSpaces(scnr);
    return plural;
  }
  function readTokenInPlaceholder(scnr, context2) {
    let token = null;
    const ch = scnr.currentChar();
    switch (ch) {
      case "{":
        if (context2.braceNest >= 1) {
          emitError(CompileErrorCodes.NOT_ALLOW_NEST_PLACEHOLDER, currentPosition(), 0);
        }
        scnr.next();
        token = getToken(
            context2,
            2,
            "{"
            /* TokenChars.BraceLeft */
        );
        skipSpaces(scnr);
        context2.braceNest++;
        return token;
      case "}":
        if (context2.braceNest > 0 && context2.currentType === 2) {
          emitError(CompileErrorCodes.EMPTY_PLACEHOLDER, currentPosition(), 0);
        }
        scnr.next();
        token = getToken(
            context2,
            3,
            "}"
            /* TokenChars.BraceRight */
        );
        context2.braceNest--;
        context2.braceNest > 0 && skipSpaces(scnr);
        if (context2.inLinked && context2.braceNest === 0) {
          context2.inLinked = false;
        }
        return token;
      case "@":
        if (context2.braceNest > 0) {
          emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
        }
        token = readTokenInLinked(scnr, context2) || getEndToken(context2);
        context2.braceNest = 0;
        return token;
      default: {
        let validNamedIdentifier = true;
        let validListIdentifier = true;
        let validLiteral = true;
        if (isPluralStart(scnr)) {
          if (context2.braceNest > 0) {
            emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
          }
          token = getToken(context2, 1, readPlural(scnr));
          context2.braceNest = 0;
          context2.inLinked = false;
          return token;
        }
        if (context2.braceNest > 0 && (context2.currentType === 5 || context2.currentType === 6 || context2.currentType === 7)) {
          emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
          context2.braceNest = 0;
          return readToken(scnr, context2);
        }
        if (validNamedIdentifier = isNamedIdentifierStart(scnr, context2)) {
          token = getToken(context2, 5, readNamedIdentifier(scnr));
          skipSpaces(scnr);
          return token;
        }
        if (validListIdentifier = isListIdentifierStart(scnr, context2)) {
          token = getToken(context2, 6, readListIdentifier(scnr));
          skipSpaces(scnr);
          return token;
        }
        if (validLiteral = isLiteralStart(scnr, context2)) {
          token = getToken(context2, 7, readLiteral(scnr));
          skipSpaces(scnr);
          return token;
        }
        if (!validNamedIdentifier && !validListIdentifier && !validLiteral) {
          token = getToken(context2, 13, readInvalidIdentifier(scnr));
          emitError(CompileErrorCodes.INVALID_TOKEN_IN_PLACEHOLDER, currentPosition(), 0, token.value);
          skipSpaces(scnr);
          return token;
        }
        break;
      }
    }
    return token;
  }
  function readTokenInLinked(scnr, context2) {
    const { currentType } = context2;
    let token = null;
    const ch = scnr.currentChar();
    if ((currentType === 8 || currentType === 9 || currentType === 12 || currentType === 10) && (ch === CHAR_LF || ch === CHAR_SP)) {
      emitError(CompileErrorCodes.INVALID_LINKED_FORMAT, currentPosition(), 0);
    }
    switch (ch) {
      case "@":
        scnr.next();
        token = getToken(
            context2,
            8,
            "@"
            /* TokenChars.LinkedAlias */
        );
        context2.inLinked = true;
        return token;
      case ".":
        skipSpaces(scnr);
        scnr.next();
        return getToken(
            context2,
            9,
            "."
            /* TokenChars.LinkedDot */
        );
      case ":":
        skipSpaces(scnr);
        scnr.next();
        return getToken(
            context2,
            10,
            ":"
            /* TokenChars.LinkedDelimiter */
        );
      default:
        if (isPluralStart(scnr)) {
          token = getToken(context2, 1, readPlural(scnr));
          context2.braceNest = 0;
          context2.inLinked = false;
          return token;
        }
        if (isLinkedDotStart(scnr, context2) || isLinkedDelimiterStart(scnr, context2)) {
          skipSpaces(scnr);
          return readTokenInLinked(scnr, context2);
        }
        if (isLinkedModifierStart(scnr, context2)) {
          skipSpaces(scnr);
          return getToken(context2, 12, readLinkedModifier(scnr));
        }
        if (isLinkedReferStart(scnr, context2)) {
          skipSpaces(scnr);
          if (ch === "{") {
            return readTokenInPlaceholder(scnr, context2) || token;
          } else {
            return getToken(context2, 11, readLinkedRefer(scnr));
          }
        }
        if (currentType === 8) {
          emitError(CompileErrorCodes.INVALID_LINKED_FORMAT, currentPosition(), 0);
        }
        context2.braceNest = 0;
        context2.inLinked = false;
        return readToken(scnr, context2);
    }
  }
  function readToken(scnr, context2) {
    let token = {
      type: 14
      /* TokenTypes.EOF */
    };
    if (context2.braceNest > 0) {
      return readTokenInPlaceholder(scnr, context2) || getEndToken(context2);
    }
    if (context2.inLinked) {
      return readTokenInLinked(scnr, context2) || getEndToken(context2);
    }
    const ch = scnr.currentChar();
    switch (ch) {
      case "{":
        return readTokenInPlaceholder(scnr, context2) || getEndToken(context2);
      case "}":
        emitError(CompileErrorCodes.UNBALANCED_CLOSING_BRACE, currentPosition(), 0);
        scnr.next();
        return getToken(
            context2,
            3,
            "}"
            /* TokenChars.BraceRight */
        );
      case "@":
        return readTokenInLinked(scnr, context2) || getEndToken(context2);
      default: {
        if (isPluralStart(scnr)) {
          token = getToken(context2, 1, readPlural(scnr));
          context2.braceNest = 0;
          context2.inLinked = false;
          return token;
        }
        const { isModulo, hasSpace } = detectModuloStart(scnr);
        if (isModulo) {
          return hasSpace ? getToken(context2, 0, readText(scnr)) : getToken(context2, 4, readModulo(scnr));
        }
        if (isTextStart(scnr)) {
          return getToken(context2, 0, readText(scnr));
        }
        break;
      }
    }
    return token;
  }
  function nextToken() {
    const { currentType, offset, startLoc, endLoc } = _context;
    _context.lastType = currentType;
    _context.lastOffset = offset;
    _context.lastStartLoc = startLoc;
    _context.lastEndLoc = endLoc;
    _context.offset = currentOffset();
    _context.startLoc = currentPosition();
    if (_scnr.currentChar() === EOF) {
      return getToken(
          _context,
          14
          /* TokenTypes.EOF */
      );
    }
    return readToken(_scnr, _context);
  }
  return {
    nextToken,
    currentOffset,
    currentPosition,
    context
  };
}
const ERROR_DOMAIN$2 = "parser";
const KNOWN_ESCAPES = /(?:\\\\|\\'|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;
function fromEscapeSequence(match, codePoint4, codePoint6) {
  switch (match) {
    case `\\\\`:
      return `\\`;
    case `\\'`:
      return `'`;
    default: {
      const codePoint = parseInt(codePoint4 || codePoint6, 16);
      if (codePoint <= 55295 || codePoint >= 57344) {
        return String.fromCodePoint(codePoint);
      }
      return "�";
    }
  }
}
function createParser(options = {}) {
  const location = options.location !== false;
  const { onError, onWarn } = options;
  function emitError(tokenzer, code2, start2, offset, ...args) {
    const end2 = tokenzer.currentPosition();
    end2.offset += offset;
    end2.column += offset;
    if (onError) {
      const loc = location ? createLocation(start2, end2) : null;
      const err = createCompileError(code2, loc, {
        domain: ERROR_DOMAIN$2,
        args
      });
      onError(err);
    }
  }
  function emitWarn(tokenzer, code2, start2, offset, ...args) {
    const end2 = tokenzer.currentPosition();
    end2.offset += offset;
    end2.column += offset;
    if (onWarn) {
      const loc = location ? createLocation(start2, end2) : null;
      onWarn(createCompileWarn(code2, loc, args));
    }
  }
  function startNode(type, offset, loc) {
    const node = { type };
    if (location) {
      node.start = offset;
      node.end = offset;
      node.loc = { start: loc, end: loc };
    }
    return node;
  }
  function endNode(node, offset, pos, type) {
    if (location) {
      node.end = offset;
      if (node.loc) {
        node.loc.end = pos;
      }
    }
  }
  function parseText(tokenizer, value) {
    const context = tokenizer.context();
    const node = startNode(3, context.offset, context.startLoc);
    node.value = value;
    endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
    return node;
  }
  function parseList(tokenizer, index) {
    const context = tokenizer.context();
    const { lastOffset: offset, lastStartLoc: loc } = context;
    const node = startNode(5, offset, loc);
    node.index = parseInt(index, 10);
    tokenizer.nextToken();
    endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
    return node;
  }
  function parseNamed(tokenizer, key, modulo) {
    const context = tokenizer.context();
    const { lastOffset: offset, lastStartLoc: loc } = context;
    const node = startNode(4, offset, loc);
    node.key = key;
    if (modulo === true) {
      node.modulo = true;
    }
    tokenizer.nextToken();
    endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
    return node;
  }
  function parseLiteral(tokenizer, value) {
    const context = tokenizer.context();
    const { lastOffset: offset, lastStartLoc: loc } = context;
    const node = startNode(9, offset, loc);
    node.value = value.replace(KNOWN_ESCAPES, fromEscapeSequence);
    tokenizer.nextToken();
    endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
    return node;
  }
  function parseLinkedModifier(tokenizer) {
    const token = tokenizer.nextToken();
    const context = tokenizer.context();
    const { lastOffset: offset, lastStartLoc: loc } = context;
    const node = startNode(8, offset, loc);
    if (token.type !== 12) {
      emitError(tokenizer, CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_MODIFIER, context.lastStartLoc, 0);
      node.value = "";
      endNode(node, offset, loc);
      return {
        nextConsumeToken: token,
        node
      };
    }
    if (token.value == null) {
      emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
    }
    node.value = token.value || "";
    endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
    return {
      node
    };
  }
  function parseLinkedKey(tokenizer, value) {
    const context = tokenizer.context();
    const node = startNode(7, context.offset, context.startLoc);
    node.value = value;
    endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
    return node;
  }
  function parseLinked(tokenizer) {
    const context = tokenizer.context();
    const linkedNode = startNode(6, context.offset, context.startLoc);
    let token = tokenizer.nextToken();
    if (token.type === 9) {
      const parsed = parseLinkedModifier(tokenizer);
      linkedNode.modifier = parsed.node;
      token = parsed.nextConsumeToken || tokenizer.nextToken();
    }
    if (token.type !== 10) {
      emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
    }
    token = tokenizer.nextToken();
    if (token.type === 2) {
      token = tokenizer.nextToken();
    }
    switch (token.type) {
      case 11:
        if (token.value == null) {
          emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
        }
        linkedNode.key = parseLinkedKey(tokenizer, token.value || "");
        break;
      case 5:
        if (token.value == null) {
          emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
        }
        linkedNode.key = parseNamed(tokenizer, token.value || "");
        break;
      case 6:
        if (token.value == null) {
          emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
        }
        linkedNode.key = parseList(tokenizer, token.value || "");
        break;
      case 7:
        if (token.value == null) {
          emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
        }
        linkedNode.key = parseLiteral(tokenizer, token.value || "");
        break;
      default: {
        emitError(tokenizer, CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_KEY, context.lastStartLoc, 0);
        const nextContext = tokenizer.context();
        const emptyLinkedKeyNode = startNode(7, nextContext.offset, nextContext.startLoc);
        emptyLinkedKeyNode.value = "";
        endNode(emptyLinkedKeyNode, nextContext.offset, nextContext.startLoc);
        linkedNode.key = emptyLinkedKeyNode;
        endNode(linkedNode, nextContext.offset, nextContext.startLoc);
        return {
          nextConsumeToken: token,
          node: linkedNode
        };
      }
    }
    endNode(linkedNode, tokenizer.currentOffset(), tokenizer.currentPosition());
    return {
      node: linkedNode
    };
  }
  function parseMessage(tokenizer) {
    const context = tokenizer.context();
    const startOffset = context.currentType === 1 ? tokenizer.currentOffset() : context.offset;
    const startLoc = context.currentType === 1 ? context.endLoc : context.startLoc;
    const node = startNode(2, startOffset, startLoc);
    node.items = [];
    let nextToken = null;
    let modulo = null;
    do {
      const token = nextToken || tokenizer.nextToken();
      nextToken = null;
      switch (token.type) {
        case 0:
          if (token.value == null) {
            emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
          }
          node.items.push(parseText(tokenizer, token.value || ""));
          break;
        case 6:
          if (token.value == null) {
            emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
          }
          node.items.push(parseList(tokenizer, token.value || ""));
          break;
        case 4:
          modulo = true;
          break;
        case 5:
          if (token.value == null) {
            emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
          }
          node.items.push(parseNamed(tokenizer, token.value || "", !!modulo));
          if (modulo) {
            emitWarn(tokenizer, CompileWarnCodes.USE_MODULO_SYNTAX, context.lastStartLoc, 0, getTokenCaption(token));
            modulo = null;
          }
          break;
        case 7:
          if (token.value == null) {
            emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
          }
          node.items.push(parseLiteral(tokenizer, token.value || ""));
          break;
        case 8: {
          const parsed = parseLinked(tokenizer);
          node.items.push(parsed.node);
          nextToken = parsed.nextConsumeToken || null;
          break;
        }
      }
    } while (context.currentType !== 14 && context.currentType !== 1);
    const endOffset = context.currentType === 1 ? context.lastOffset : tokenizer.currentOffset();
    const endLoc = context.currentType === 1 ? context.lastEndLoc : tokenizer.currentPosition();
    endNode(node, endOffset, endLoc);
    return node;
  }
  function parsePlural(tokenizer, offset, loc, msgNode) {
    const context = tokenizer.context();
    let hasEmptyMessage = msgNode.items.length === 0;
    const node = startNode(1, offset, loc);
    node.cases = [];
    node.cases.push(msgNode);
    do {
      const msg = parseMessage(tokenizer);
      if (!hasEmptyMessage) {
        hasEmptyMessage = msg.items.length === 0;
      }
      node.cases.push(msg);
    } while (context.currentType !== 14);
    if (hasEmptyMessage) {
      emitError(tokenizer, CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL, loc, 0);
    }
    endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
    return node;
  }
  function parseResource(tokenizer) {
    const context = tokenizer.context();
    const { offset, startLoc } = context;
    const msgNode = parseMessage(tokenizer);
    if (context.currentType === 14) {
      return msgNode;
    } else {
      return parsePlural(tokenizer, offset, startLoc, msgNode);
    }
  }
  function parse2(source) {
    const tokenizer = createTokenizer(source, assign({}, options));
    const context = tokenizer.context();
    const node = startNode(0, context.offset, context.startLoc);
    if (location && node.loc) {
      node.loc.source = source;
    }
    node.body = parseResource(tokenizer);
    if (options.onCacheKey) {
      node.cacheKey = options.onCacheKey(source);
    }
    if (context.currentType !== 14) {
      emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, source[context.offset] || "");
    }
    endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
    return node;
  }
  return { parse: parse2 };
}
function getTokenCaption(token) {
  if (token.type === 14) {
    return "EOF";
  }
  const name = (token.value || "").replace(/\r?\n/gu, "\\n");
  return name.length > 10 ? name.slice(0, 9) + "…" : name;
}
function createTransformer(ast, options = {}) {
  const _context = {
    ast,
    helpers: /* @__PURE__ */ new Set()
  };
  const context = () => _context;
  const helper = (name) => {
    _context.helpers.add(name);
    return name;
  };
  return { context, helper };
}
function traverseNodes(nodes, transformer) {
  for (let i = 0; i < nodes.length; i++) {
    traverseNode(nodes[i], transformer);
  }
}
function traverseNode(node, transformer) {
  switch (node.type) {
    case 1:
      traverseNodes(node.cases, transformer);
      transformer.helper(
          "plural"
          /* HelperNameMap.PLURAL */
      );
      break;
    case 2:
      traverseNodes(node.items, transformer);
      break;
    case 6: {
      const linked = node;
      traverseNode(linked.key, transformer);
      transformer.helper(
          "linked"
          /* HelperNameMap.LINKED */
      );
      transformer.helper(
          "type"
          /* HelperNameMap.TYPE */
      );
      break;
    }
    case 5:
      transformer.helper(
          "interpolate"
          /* HelperNameMap.INTERPOLATE */
      );
      transformer.helper(
          "list"
          /* HelperNameMap.LIST */
      );
      break;
    case 4:
      transformer.helper(
          "interpolate"
          /* HelperNameMap.INTERPOLATE */
      );
      transformer.helper(
          "named"
          /* HelperNameMap.NAMED */
      );
      break;
  }
}
function transform(ast, options = {}) {
  const transformer = createTransformer(ast);
  transformer.helper(
      "normalize"
      /* HelperNameMap.NORMALIZE */
  );
  ast.body && traverseNode(ast.body, transformer);
  const context = transformer.context();
  ast.helpers = Array.from(context.helpers);
}
function optimize(ast) {
  const body = ast.body;
  if (body.type === 2) {
    optimizeMessageNode(body);
  } else {
    body.cases.forEach((c2) => optimizeMessageNode(c2));
  }
  return ast;
}
function optimizeMessageNode(message2) {
  if (message2.items.length === 1) {
    const item = message2.items[0];
    if (item.type === 3 || item.type === 9) {
      message2.static = item.value;
      delete item.value;
    }
  } else {
    const values = [];
    for (let i = 0; i < message2.items.length; i++) {
      const item = message2.items[i];
      if (!(item.type === 3 || item.type === 9)) {
        break;
      }
      if (item.value == null) {
        break;
      }
      values.push(item.value);
    }
    if (values.length === message2.items.length) {
      message2.static = join(values);
      for (let i = 0; i < message2.items.length; i++) {
        const item = message2.items[i];
        if (item.type === 3 || item.type === 9) {
          delete item.value;
        }
      }
    }
  }
}
const ERROR_DOMAIN$1 = "minifier";
function minify(node) {
  node.t = node.type;
  switch (node.type) {
    case 0: {
      const resource = node;
      minify(resource.body);
      resource.b = resource.body;
      delete resource.body;
      break;
    }
    case 1: {
      const plural = node;
      const cases = plural.cases;
      for (let i = 0; i < cases.length; i++) {
        minify(cases[i]);
      }
      plural.c = cases;
      delete plural.cases;
      break;
    }
    case 2: {
      const message2 = node;
      const items = message2.items;
      for (let i = 0; i < items.length; i++) {
        minify(items[i]);
      }
      message2.i = items;
      delete message2.items;
      if (message2.static) {
        message2.s = message2.static;
        delete message2.static;
      }
      break;
    }
    case 3:
    case 9:
    case 8:
    case 7: {
      const valueNode = node;
      if (valueNode.value) {
        valueNode.v = valueNode.value;
        delete valueNode.value;
      }
      break;
    }
    case 6: {
      const linked = node;
      minify(linked.key);
      linked.k = linked.key;
      delete linked.key;
      if (linked.modifier) {
        minify(linked.modifier);
        linked.m = linked.modifier;
        delete linked.modifier;
      }
      break;
    }
    case 5: {
      const list = node;
      list.i = list.index;
      delete list.index;
      break;
    }
    case 4: {
      const named = node;
      named.k = named.key;
      delete named.key;
      break;
    }
    default: {
      throw createCompileError(CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE, null, {
        domain: ERROR_DOMAIN$1,
        args: [node.type]
      });
    }
  }
  delete node.type;
}
const ERROR_DOMAIN = "parser";
function createCodeGenerator(ast, options) {
  const { sourceMap, filename, breakLineCode, needIndent: _needIndent } = options;
  const location = options.location !== false;
  const _context = {
    filename,
    code: "",
    column: 1,
    line: 1,
    offset: 0,
    map: void 0,
    breakLineCode,
    needIndent: _needIndent,
    indentLevel: 0
  };
  if (location && ast.loc) {
    _context.source = ast.loc.source;
  }
  const context = () => _context;
  function push(code2, node) {
    _context.code += code2;
  }
  function _newline(n2, withBreakLine = true) {
    const _breakLineCode = withBreakLine ? breakLineCode : "";
    push(_needIndent ? _breakLineCode + `  `.repeat(n2) : _breakLineCode);
  }
  function indent(withNewLine = true) {
    const level = ++_context.indentLevel;
    withNewLine && _newline(level);
  }
  function deindent(withNewLine = true) {
    const level = --_context.indentLevel;
    withNewLine && _newline(level);
  }
  function newline() {
    _newline(_context.indentLevel);
  }
  const helper = (key) => `_${key}`;
  const needIndent = () => _context.needIndent;
  return {
    context,
    push,
    indent,
    deindent,
    newline,
    helper,
    needIndent
  };
}
function generateLinkedNode(generator, node) {
  const { helper } = generator;
  generator.push(`${helper(
      "linked"
      /* HelperNameMap.LINKED */
  )}(`);
  generateNode(generator, node.key);
  if (node.modifier) {
    generator.push(`, `);
    generateNode(generator, node.modifier);
    generator.push(`, _type`);
  } else {
    generator.push(`, undefined, _type`);
  }
  generator.push(`)`);
}
function generateMessageNode(generator, node) {
  const { helper, needIndent } = generator;
  generator.push(`${helper(
      "normalize"
      /* HelperNameMap.NORMALIZE */
  )}([`);
  generator.indent(needIndent());
  const length = node.items.length;
  for (let i = 0; i < length; i++) {
    generateNode(generator, node.items[i]);
    if (i === length - 1) {
      break;
    }
    generator.push(", ");
  }
  generator.deindent(needIndent());
  generator.push("])");
}
function generatePluralNode(generator, node) {
  const { helper, needIndent } = generator;
  if (node.cases.length > 1) {
    generator.push(`${helper(
        "plural"
        /* HelperNameMap.PLURAL */
    )}([`);
    generator.indent(needIndent());
    const length = node.cases.length;
    for (let i = 0; i < length; i++) {
      generateNode(generator, node.cases[i]);
      if (i === length - 1) {
        break;
      }
      generator.push(", ");
    }
    generator.deindent(needIndent());
    generator.push(`])`);
  }
}
function generateResource(generator, node) {
  if (node.body) {
    generateNode(generator, node.body);
  } else {
    generator.push("null");
  }
}
function generateNode(generator, node) {
  const { helper } = generator;
  switch (node.type) {
    case 0:
      generateResource(generator, node);
      break;
    case 1:
      generatePluralNode(generator, node);
      break;
    case 2:
      generateMessageNode(generator, node);
      break;
    case 6:
      generateLinkedNode(generator, node);
      break;
    case 8:
      generator.push(JSON.stringify(node.value), node);
      break;
    case 7:
      generator.push(JSON.stringify(node.value), node);
      break;
    case 5:
      generator.push(`${helper(
          "interpolate"
          /* HelperNameMap.INTERPOLATE */
      )}(${helper(
          "list"
          /* HelperNameMap.LIST */
      )}(${node.index}))`, node);
      break;
    case 4:
      generator.push(`${helper(
          "interpolate"
          /* HelperNameMap.INTERPOLATE */
      )}(${helper(
          "named"
          /* HelperNameMap.NAMED */
      )}(${JSON.stringify(node.key)}))`, node);
      break;
    case 9:
      generator.push(JSON.stringify(node.value), node);
      break;
    case 3:
      generator.push(JSON.stringify(node.value), node);
      break;
    default: {
      throw createCompileError(CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE, null, {
        domain: ERROR_DOMAIN,
        args: [node.type]
      });
    }
  }
}
const generate = (ast, options = {}) => {
  const mode = isString(options.mode) ? options.mode : "normal";
  const filename = isString(options.filename) ? options.filename : "message.intl";
  const sourceMap = !!options.sourceMap;
  const breakLineCode = options.breakLineCode != null ? options.breakLineCode : mode === "arrow" ? ";" : "\n";
  const needIndent = options.needIndent ? options.needIndent : mode !== "arrow";
  const helpers = ast.helpers || [];
  const generator = createCodeGenerator(ast, {
    mode,
    filename,
    sourceMap,
    breakLineCode,
    needIndent
  });
  generator.push(mode === "normal" ? `function __msg__ (ctx) {` : `(ctx) => {`);
  generator.indent(needIndent);
  if (helpers.length > 0) {
    generator.push(`const { ${join(helpers.map((s) => `${s}: _${s}`), ", ")} } = ctx`);
    generator.newline();
  }
  generator.push(`return `);
  generateNode(generator, ast);
  generator.deindent(needIndent);
  generator.push(`}`);
  delete ast.helpers;
  const { code: code2, map } = generator.context();
  return {
    ast,
    code: code2,
    map: map ? map.toJSON() : void 0
    // eslint-disable-line @typescript-eslint/no-explicit-any
  };
};
function baseCompile$1(source, options = {}) {
  const assignedOptions = assign({}, options);
  const jit = !!assignedOptions.jit;
  const enalbeMinify = !!assignedOptions.minify;
  const enambeOptimize = assignedOptions.optimize == null ? true : assignedOptions.optimize;
  const parser = createParser(assignedOptions);
  const ast = parser.parse(source);
  if (!jit) {
    transform(ast, assignedOptions);
    return generate(ast, assignedOptions);
  } else {
    enambeOptimize && optimize(ast);
    enalbeMinify && minify(ast);
    return { ast, code: "" };
  }
}
var define_process_env_default$1 = { ALLUSERSPROFILE: "C:\\ProgramData", APPDATA: "C:\\Users\\Zrx\\AppData\\Roaming", ChocolateyInstall: "C:\\ProgramData\\chocolatey", ChocolateyLastPathUpdate: "133219334407372012", COLOR: "1", CommonProgramFiles: "C:\\Program Files\\Common Files", "CommonProgramFiles(x86)": "C:\\Program Files (x86)\\Common Files", CommonProgramW6432: "C:\\Program Files\\Common Files", COMPUTERNAME: "DESKTOP-PQMEM4M", ComSpec: "C:\\WINDOWS\\system32\\cmd.exe", DriverData: "C:\\Windows\\System32\\Drivers\\DriverData", EDITOR: "C:\\WINDOWS\\notepad.exe", EFC_11988: "1", FIG_JETBRAINS_SHELL_INTEGRATION: "1", FPS_BROWSER_APP_PROFILE_STRING: "Internet Explorer", FPS_BROWSER_USER_PROFILE_STRING: "Default", HOME: "C:\\Users\\Zrx", HOMEDRIVE: "C:", HOMEPATH: "\\Users\\Zrx", IDEA_INITIAL_DIRECTORY: "C:\\Program Files\\JetBrains\\WebStorm 2023.2.2\\bin", INIT_CWD: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype", LOCALAPPDATA: "C:\\Users\\Zrx\\AppData\\Local", LOGONSERVER: "\\\\DESKTOP-PQMEM4M", NODE: "C:\\Program Files\\nodejs\\node.exe", NODE_ENV: "production", NODE_EXE: "C:\\Program Files\\nodejs\\\\node.exe", NPM_CLI_JS: "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js", npm_command: "run-script", npm_config_cache: "C:\\Users\\Zrx\\AppData\\Local\\npm-cache", npm_config_globalconfig: "C:\\Program Files\\nodejs\\etc\\npmrc", npm_config_global_prefix: "C:\\Program Files\\nodejs", npm_config_init_module: "C:\\Users\\Zrx\\.npm-init.js", npm_config_local_prefix: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype", npm_config_node_gyp: "C:\\Users\\Zrx\\AppData\\Roaming\\nvm\\v20.14.0\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js", npm_config_noproxy: "", npm_config_npm_version: "10.7.0", npm_config_prefix: "C:\\Program Files\\nodejs", npm_config_registry: "https://packages.aliyun.com/6393d698d690c872dceedcc0/npm/npm-registry/", npm_config_userconfig: "C:\\Users\\Zrx\\.npmrc", npm_config_user_agent: "npm/10.7.0 node/v20.14.0 win32 x64 workspaces/false", npm_execpath: "C:\\Users\\Zrx\\AppData\\Roaming\\nvm\\v20.14.0\\node_modules\\npm\\bin\\npm-cli.js", npm_lifecycle_event: "build", npm_lifecycle_script: "vite build", npm_node_execpath: "C:\\Program Files\\nodejs\\node.exe", npm_package_json: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype\\package.json", npm_package_name: "@kcdesign/editor", npm_package_version: "1.0.24", NPM_PREFIX_JS: "C:\\Program Files\\nodejs\\\\node_modules\\npm\\bin\\npm-prefix.js", NPM_PREFIX_NPM_CLI_JS: "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js", NUMBER_OF_PROCESSORS: "16", NVM_HOME: "C:\\Users\\Zrx\\AppData\\Roaming\\nvm", NVM_SYMLINK: "C:\\Program Files\\nodejs", OneDrive: "C:\\Users\\Zrx\\OneDrive", OS: "Windows_NT", Path: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype\\node_modules\\.bin;C:\\Users\\Zrx\\Desktop\\CODE-BETA\\node_modules\\.bin;C:\\Users\\Zrx\\Desktop\\node_modules\\.bin;C:\\Users\\Zrx\\node_modules\\.bin;C:\\Users\\node_modules\\.bin;C:\\node_modules\\.bin;C:\\Users\\Zrx\\AppData\\Roaming\\nvm\\v20.14.0\\node_modules\\npm\\node_modules\\@npmcli\\run-script\\lib\\node-gyp-bin;C:\\Python311\\Scripts\\;C:\\Python311\\;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\ProgramData\\chocolatey\\bin;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet\\;C:\\Program Files\\Graphviz\\bin;C:\\Program Files\\Docker\\Docker\\resources\\bin;C:\\Users\\Zrx\\AppData\\Roaming\\nvm;C:\\Program Files\\nodejs;C:\\Users\\Zrx\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\Zrx\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Program Files\\JetBrains\\WebStorm 2023.2.2\\bin;;C:\\Users\\Zrx\\AppData\\Roaming\\nvm;C:\\Program Files\\nodejs;C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype\\node_modules\\.bin", PATHEXT: ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.PY;.PYW", PROCESSOR_ARCHITECTURE: "AMD64", PROCESSOR_IDENTIFIER: "Intel64 Family 6 Model 154 Stepping 3, GenuineIntel", PROCESSOR_LEVEL: "6", PROCESSOR_REVISION: "9a03", ProgramData: "C:\\ProgramData", ProgramFiles: "C:\\Program Files", "ProgramFiles(x86)": "C:\\Program Files (x86)", ProgramW6432: "C:\\Program Files", PROMPT: "$P$G", PSModulePath: "C:\\Program Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules", PUBLIC: "C:\\Users\\Public", SESSIONNAME: "Console", SystemDrive: "C:", SystemRoot: "C:\\WINDOWS", TEMP: "C:\\Users\\Zrx\\AppData\\Local\\Temp", TERMINAL_EMULATOR: "JetBrains-JediTerm", TERM_SESSION_ID: "322f102f-fb02-492f-aed4-c4659d397fb2", TMP: "C:\\Users\\Zrx\\AppData\\Local\\Temp", USERDOMAIN: "DESKTOP-PQMEM4M", USERDOMAIN_ROAMINGPROFILE: "DESKTOP-PQMEM4M", USERNAME: "Zrx", USERPROFILE: "C:\\Users\\Zrx", WebStorm: "C:\\Program Files\\JetBrains\\WebStorm 2023.2.2\\bin;", windir: "C:\\WINDOWS", ZES_ENABLE_SYSMAN: "1" };
function initFeatureFlags$1() {
  if (typeof __INTLIFY_PROD_DEVTOOLS__ !== "boolean") {
    getGlobalThis().__INTLIFY_PROD_DEVTOOLS__ = false;
  }
  if (typeof __INTLIFY_JIT_COMPILATION__ !== "boolean") {
    getGlobalThis().__INTLIFY_JIT_COMPILATION__ = false;
  }
  if (typeof __INTLIFY_DROP_MESSAGE_COMPILER__ !== "boolean") {
    getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = false;
  }
}
const pathStateMachine = [];
pathStateMachine[
    0
    /* States.BEFORE_PATH */
    ] = {
  [
      "w"
      /* PathCharTypes.WORKSPACE */
      ]: [
    0
    /* States.BEFORE_PATH */
  ],
  [
      "i"
      /* PathCharTypes.IDENT */
      ]: [
    3,
    0
    /* Actions.APPEND */
  ],
  [
      "["
      /* PathCharTypes.LEFT_BRACKET */
      ]: [
    4
    /* States.IN_SUB_PATH */
  ],
  [
      "o"
      /* PathCharTypes.END_OF_FAIL */
      ]: [
    7
    /* States.AFTER_PATH */
  ]
};
pathStateMachine[
    1
    /* States.IN_PATH */
    ] = {
  [
      "w"
      /* PathCharTypes.WORKSPACE */
      ]: [
    1
    /* States.IN_PATH */
  ],
  [
      "."
      /* PathCharTypes.DOT */
      ]: [
    2
    /* States.BEFORE_IDENT */
  ],
  [
      "["
      /* PathCharTypes.LEFT_BRACKET */
      ]: [
    4
    /* States.IN_SUB_PATH */
  ],
  [
      "o"
      /* PathCharTypes.END_OF_FAIL */
      ]: [
    7
    /* States.AFTER_PATH */
  ]
};
pathStateMachine[
    2
    /* States.BEFORE_IDENT */
    ] = {
  [
      "w"
      /* PathCharTypes.WORKSPACE */
      ]: [
    2
    /* States.BEFORE_IDENT */
  ],
  [
      "i"
      /* PathCharTypes.IDENT */
      ]: [
    3,
    0
    /* Actions.APPEND */
  ],
  [
      "0"
      /* PathCharTypes.ZERO */
      ]: [
    3,
    0
    /* Actions.APPEND */
  ]
};
pathStateMachine[
    3
    /* States.IN_IDENT */
    ] = {
  [
      "i"
      /* PathCharTypes.IDENT */
      ]: [
    3,
    0
    /* Actions.APPEND */
  ],
  [
      "0"
      /* PathCharTypes.ZERO */
      ]: [
    3,
    0
    /* Actions.APPEND */
  ],
  [
      "w"
      /* PathCharTypes.WORKSPACE */
      ]: [
    1,
    1
    /* Actions.PUSH */
  ],
  [
      "."
      /* PathCharTypes.DOT */
      ]: [
    2,
    1
    /* Actions.PUSH */
  ],
  [
      "["
      /* PathCharTypes.LEFT_BRACKET */
      ]: [
    4,
    1
    /* Actions.PUSH */
  ],
  [
      "o"
      /* PathCharTypes.END_OF_FAIL */
      ]: [
    7,
    1
    /* Actions.PUSH */
  ]
};
pathStateMachine[
    4
    /* States.IN_SUB_PATH */
    ] = {
  [
      "'"
      /* PathCharTypes.SINGLE_QUOTE */
      ]: [
    5,
    0
    /* Actions.APPEND */
  ],
  [
      '"'
      /* PathCharTypes.DOUBLE_QUOTE */
      ]: [
    6,
    0
    /* Actions.APPEND */
  ],
  [
      "["
      /* PathCharTypes.LEFT_BRACKET */
      ]: [
    4,
    2
    /* Actions.INC_SUB_PATH_DEPTH */
  ],
  [
      "]"
      /* PathCharTypes.RIGHT_BRACKET */
      ]: [
    1,
    3
    /* Actions.PUSH_SUB_PATH */
  ],
  [
      "o"
      /* PathCharTypes.END_OF_FAIL */
      ]: 8,
  [
      "l"
      /* PathCharTypes.ELSE */
      ]: [
    4,
    0
    /* Actions.APPEND */
  ]
};
pathStateMachine[
    5
    /* States.IN_SINGLE_QUOTE */
    ] = {
  [
      "'"
      /* PathCharTypes.SINGLE_QUOTE */
      ]: [
    4,
    0
    /* Actions.APPEND */
  ],
  [
      "o"
      /* PathCharTypes.END_OF_FAIL */
      ]: 8,
  [
      "l"
      /* PathCharTypes.ELSE */
      ]: [
    5,
    0
    /* Actions.APPEND */
  ]
};
pathStateMachine[
    6
    /* States.IN_DOUBLE_QUOTE */
    ] = {
  [
      '"'
      /* PathCharTypes.DOUBLE_QUOTE */
      ]: [
    4,
    0
    /* Actions.APPEND */
  ],
  [
      "o"
      /* PathCharTypes.END_OF_FAIL */
      ]: 8,
  [
      "l"
      /* PathCharTypes.ELSE */
      ]: [
    6,
    0
    /* Actions.APPEND */
  ]
};
const literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
function isLiteral(exp) {
  return literalValueRE.test(exp);
}
function stripQuotes(str) {
  const a2 = str.charCodeAt(0);
  const b2 = str.charCodeAt(str.length - 1);
  return a2 === b2 && (a2 === 34 || a2 === 39) ? str.slice(1, -1) : str;
}
function getPathCharType(ch) {
  if (ch === void 0 || ch === null) {
    return "o";
  }
  const code2 = ch.charCodeAt(0);
  switch (code2) {
    case 91:
    case 93:
    case 46:
    case 34:
    case 39:
      return ch;
    case 95:
    case 36:
    case 45:
      return "i";
    case 9:
    case 10:
    case 13:
    case 160:
    case 65279:
    case 8232:
    case 8233:
      return "w";
  }
  return "i";
}
function formatSubPath(path) {
  const trimmed = path.trim();
  if (path.charAt(0) === "0" && isNaN(parseInt(path))) {
    return false;
  }
  return isLiteral(trimmed) ? stripQuotes(trimmed) : "*" + trimmed;
}
function parse(path) {
  const keys = [];
  let index = -1;
  let mode = 0;
  let subPathDepth = 0;
  let c2;
  let key;
  let newChar;
  let type;
  let transition;
  let action;
  let typeMap;
  const actions = [];
  actions[
      0
      /* Actions.APPEND */
      ] = () => {
    if (key === void 0) {
      key = newChar;
    } else {
      key += newChar;
    }
  };
  actions[
      1
      /* Actions.PUSH */
      ] = () => {
    if (key !== void 0) {
      keys.push(key);
      key = void 0;
    }
  };
  actions[
      2
      /* Actions.INC_SUB_PATH_DEPTH */
      ] = () => {
    actions[
        0
        /* Actions.APPEND */
        ]();
    subPathDepth++;
  };
  actions[
      3
      /* Actions.PUSH_SUB_PATH */
      ] = () => {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = 4;
      actions[
          0
          /* Actions.APPEND */
          ]();
    } else {
      subPathDepth = 0;
      if (key === void 0) {
        return false;
      }
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[
            1
            /* Actions.PUSH */
            ]();
      }
    }
  };
  function maybeUnescapeQuote() {
    const nextChar = path[index + 1];
    if (mode === 5 && nextChar === "'" || mode === 6 && nextChar === '"') {
      index++;
      newChar = "\\" + nextChar;
      actions[
          0
          /* Actions.APPEND */
          ]();
      return true;
    }
  }
  while (mode !== null) {
    index++;
    c2 = path[index];
    if (c2 === "\\" && maybeUnescapeQuote()) {
      continue;
    }
    type = getPathCharType(c2);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap[
        "l"
        /* PathCharTypes.ELSE */
        ] || 8;
    if (transition === 8) {
      return;
    }
    mode = transition[0];
    if (transition[1] !== void 0) {
      action = actions[transition[1]];
      if (action) {
        newChar = c2;
        if (action() === false) {
          return;
        }
      }
    }
    if (mode === 7) {
      return keys;
    }
  }
}
const cache = /* @__PURE__ */ new Map();
function resolveWithKeyValue(obj, path) {
  return isObject$1(obj) ? obj[path] : null;
}
function resolveValue(obj, path) {
  if (!isObject$1(obj)) {
    return null;
  }
  let hit = cache.get(path);
  if (!hit) {
    hit = parse(path);
    if (hit) {
      cache.set(path, hit);
    }
  }
  if (!hit) {
    return null;
  }
  const len = hit.length;
  let last = obj;
  let i = 0;
  while (i < len) {
    const val = last[hit[i]];
    if (val === void 0) {
      return null;
    }
    if (isFunction(last)) {
      return null;
    }
    last = val;
    i++;
  }
  return last;
}
const DEFAULT_MODIFIER = (str) => str;
const DEFAULT_MESSAGE = (ctx) => "";
const DEFAULT_MESSAGE_DATA_TYPE = "text";
const DEFAULT_NORMALIZE = (values) => values.length === 0 ? "" : join$1(values);
const DEFAULT_INTERPOLATE = toDisplayString;
function pluralDefault(choice, choicesLength) {
  choice = Math.abs(choice);
  if (choicesLength === 2) {
    return choice ? choice > 1 ? 1 : 0 : 1;
  }
  return choice ? Math.min(choice, 2) : 0;
}
function getPluralIndex(options) {
  const index = isNumber(options.pluralIndex) ? options.pluralIndex : -1;
  return options.named && (isNumber(options.named.count) || isNumber(options.named.n)) ? isNumber(options.named.count) ? options.named.count : isNumber(options.named.n) ? options.named.n : index : index;
}
function normalizeNamed(pluralIndex, props) {
  if (!props.count) {
    props.count = pluralIndex;
  }
  if (!props.n) {
    props.n = pluralIndex;
  }
}
function createMessageContext(options = {}) {
  const locale2 = options.locale;
  const pluralIndex = getPluralIndex(options);
  const pluralRule = isObject$1(options.pluralRules) && isString$1(locale2) && isFunction(options.pluralRules[locale2]) ? options.pluralRules[locale2] : pluralDefault;
  const orgPluralRule = isObject$1(options.pluralRules) && isString$1(locale2) && isFunction(options.pluralRules[locale2]) ? pluralDefault : void 0;
  const plural = (messages) => {
    return messages[pluralRule(pluralIndex, messages.length, orgPluralRule)];
  };
  const _list = options.list || [];
  const list = (index) => _list[index];
  const _named = options.named || {};
  isNumber(options.pluralIndex) && normalizeNamed(pluralIndex, _named);
  const named = (key) => _named[key];
  function message2(key) {
    const msg = isFunction(options.messages) ? options.messages(key) : isObject$1(options.messages) ? options.messages[key] : false;
    return !msg ? options.parent ? options.parent.message(key) : DEFAULT_MESSAGE : msg;
  }
  const _modifier = (name) => options.modifiers ? options.modifiers[name] : DEFAULT_MODIFIER;
  const normalize = isPlainObject(options.processor) && isFunction(options.processor.normalize) ? options.processor.normalize : DEFAULT_NORMALIZE;
  const interpolate = isPlainObject(options.processor) && isFunction(options.processor.interpolate) ? options.processor.interpolate : DEFAULT_INTERPOLATE;
  const type = isPlainObject(options.processor) && isString$1(options.processor.type) ? options.processor.type : DEFAULT_MESSAGE_DATA_TYPE;
  const linked = (key, ...args) => {
    const [arg1, arg2] = args;
    let type2 = "text";
    let modifier = "";
    if (args.length === 1) {
      if (isObject$1(arg1)) {
        modifier = arg1.modifier || modifier;
        type2 = arg1.type || type2;
      } else if (isString$1(arg1)) {
        modifier = arg1 || modifier;
      }
    } else if (args.length === 2) {
      if (isString$1(arg1)) {
        modifier = arg1 || modifier;
      }
      if (isString$1(arg2)) {
        type2 = arg2 || type2;
      }
    }
    const ret = message2(key)(ctx);
    const msg = (
        // The message in vnode resolved with linked are returned as an array by processor.nomalize
        type2 === "vnode" && isArray(ret) && modifier ? ret[0] : ret
    );
    return modifier ? _modifier(modifier)(msg, type2) : msg;
  };
  const ctx = {
    [
        "list"
        /* HelperNameMap.LIST */
        ]: list,
    [
        "named"
        /* HelperNameMap.NAMED */
        ]: named,
    [
        "plural"
        /* HelperNameMap.PLURAL */
        ]: plural,
    [
        "linked"
        /* HelperNameMap.LINKED */
        ]: linked,
    [
        "message"
        /* HelperNameMap.MESSAGE */
        ]: message2,
    [
        "type"
        /* HelperNameMap.TYPE */
        ]: type,
    [
        "interpolate"
        /* HelperNameMap.INTERPOLATE */
        ]: interpolate,
    [
        "normalize"
        /* HelperNameMap.NORMALIZE */
        ]: normalize,
    [
        "values"
        /* HelperNameMap.VALUES */
        ]: assign$1({}, _list, _named)
  };
  return ctx;
}
let devtools = null;
function setDevToolsHook(hook) {
  devtools = hook;
}
function initI18nDevTools(i18n2, version2, meta) {
  devtools && devtools.emit("i18n:init", {
    timestamp: Date.now(),
    i18n: i18n2,
    version: version2,
    meta
  });
}
const translateDevTools = /* @__PURE__ */ createDevToolsHook(
    "function:translate"
    /* IntlifyDevToolsHooks.FunctionTranslate */
);
function createDevToolsHook(hook) {
  return (payloads) => devtools && devtools.emit(hook, payloads);
}
const code$1$1 = CompileWarnCodes.__EXTEND_POINT__;
const inc$1$1 = incrementer(code$1$1);
const CoreWarnCodes = {
  NOT_FOUND_KEY: code$1$1,
  // 2
  FALLBACK_TO_TRANSLATE: inc$1$1(),
  // 3
  CANNOT_FORMAT_NUMBER: inc$1$1(),
  // 4
  FALLBACK_TO_NUMBER_FORMAT: inc$1$1(),
  // 5
  CANNOT_FORMAT_DATE: inc$1$1(),
  // 6
  FALLBACK_TO_DATE_FORMAT: inc$1$1(),
  // 7
  EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER: inc$1$1(),
  // 8
  __EXTEND_POINT__: inc$1$1()
  // 9
};
const code$2 = CompileErrorCodes.__EXTEND_POINT__;
const inc$2 = incrementer(code$2);
const CoreErrorCodes = {
  INVALID_ARGUMENT: code$2,
  // 17
  INVALID_DATE_ARGUMENT: inc$2(),
  // 18
  INVALID_ISO_DATE_ARGUMENT: inc$2(),
  // 19
  NOT_SUPPORT_NON_STRING_MESSAGE: inc$2(),
  // 20
  NOT_SUPPORT_LOCALE_PROMISE_VALUE: inc$2(),
  // 21
  NOT_SUPPORT_LOCALE_ASYNC_FUNCTION: inc$2(),
  // 22
  NOT_SUPPORT_LOCALE_TYPE: inc$2(),
  // 23
  __EXTEND_POINT__: inc$2()
  // 24
};
function createCoreError(code2) {
  return createCompileError(code2, null, void 0);
}
function getLocale(context, options) {
  return options.locale != null ? resolveLocale(options.locale) : resolveLocale(context.locale);
}
let _resolveLocale;
function resolveLocale(locale2) {
  if (isString$1(locale2)) {
    return locale2;
  } else {
    if (isFunction(locale2)) {
      if (locale2.resolvedOnce && _resolveLocale != null) {
        return _resolveLocale;
      } else if (locale2.constructor.name === "Function") {
        const resolve = locale2();
        if (isPromise(resolve)) {
          throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_PROMISE_VALUE);
        }
        return _resolveLocale = resolve;
      } else {
        throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION);
      }
    } else {
      throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_TYPE);
    }
  }
}
function fallbackWithSimple(ctx, fallback, start2) {
  return [.../* @__PURE__ */ new Set([
    start2,
    ...isArray(fallback) ? fallback : isObject$1(fallback) ? Object.keys(fallback) : isString$1(fallback) ? [fallback] : [start2]
  ])];
}
function fallbackWithLocaleChain(ctx, fallback, start2) {
  const startLocale = isString$1(start2) ? start2 : DEFAULT_LOCALE;
  const context = ctx;
  if (!context.__localeChainCache) {
    context.__localeChainCache = /* @__PURE__ */ new Map();
  }
  let chain = context.__localeChainCache.get(startLocale);
  if (!chain) {
    chain = [];
    let block = [start2];
    while (isArray(block)) {
      block = appendBlockToChain(chain, block, fallback);
    }
    const defaults = isArray(fallback) || !isPlainObject(fallback) ? fallback : fallback["default"] ? fallback["default"] : null;
    block = isString$1(defaults) ? [defaults] : defaults;
    if (isArray(block)) {
      appendBlockToChain(chain, block, false);
    }
    context.__localeChainCache.set(startLocale, chain);
  }
  return chain;
}
function appendBlockToChain(chain, block, blocks) {
  let follow = true;
  for (let i = 0; i < block.length && isBoolean(follow); i++) {
    const locale2 = block[i];
    if (isString$1(locale2)) {
      follow = appendLocaleToChain(chain, block[i], blocks);
    }
  }
  return follow;
}
function appendLocaleToChain(chain, locale2, blocks) {
  let follow;
  const tokens = locale2.split("-");
  do {
    const target = tokens.join("-");
    follow = appendItemToChain(chain, target, blocks);
    tokens.splice(-1, 1);
  } while (tokens.length && follow === true);
  return follow;
}
function appendItemToChain(chain, target, blocks) {
  let follow = false;
  if (!chain.includes(target)) {
    follow = true;
    if (target) {
      follow = target[target.length - 1] !== "!";
      const locale2 = target.replace(/!/g, "");
      chain.push(locale2);
      if ((isArray(blocks) || isPlainObject(blocks)) && blocks[locale2]) {
        follow = blocks[locale2];
      }
    }
  }
  return follow;
}
const VERSION$1 = "9.13.1";
const NOT_REOSLVED = -1;
const DEFAULT_LOCALE = "en-US";
const MISSING_RESOLVE_VALUE = "";
const capitalize = (str) => `${str.charAt(0).toLocaleUpperCase()}${str.substr(1)}`;
function getDefaultLinkedModifiers() {
  return {
    upper: (val, type) => {
      return type === "text" && isString$1(val) ? val.toUpperCase() : type === "vnode" && isObject$1(val) && "__v_isVNode" in val ? val.children.toUpperCase() : val;
    },
    lower: (val, type) => {
      return type === "text" && isString$1(val) ? val.toLowerCase() : type === "vnode" && isObject$1(val) && "__v_isVNode" in val ? val.children.toLowerCase() : val;
    },
    capitalize: (val, type) => {
      return type === "text" && isString$1(val) ? capitalize(val) : type === "vnode" && isObject$1(val) && "__v_isVNode" in val ? capitalize(val.children) : val;
    }
  };
}
let _compiler;
function registerMessageCompiler(compiler) {
  _compiler = compiler;
}
let _resolver;
function registerMessageResolver(resolver) {
  _resolver = resolver;
}
let _fallbacker;
function registerLocaleFallbacker(fallbacker) {
  _fallbacker = fallbacker;
}
let _additionalMeta = null;
const setAdditionalMeta = /* @__NO_SIDE_EFFECTS__ */ (meta) => {
  _additionalMeta = meta;
};
const getAdditionalMeta = /* @__NO_SIDE_EFFECTS__ */ () => _additionalMeta;
let _fallbackContext = null;
const setFallbackContext = (context) => {
  _fallbackContext = context;
};
const getFallbackContext = () => _fallbackContext;
let _cid = 0;
function createCoreContext(options = {}) {
  const onWarn = isFunction(options.onWarn) ? options.onWarn : warn;
  const version2 = isString$1(options.version) ? options.version : VERSION$1;
  const locale2 = isString$1(options.locale) || isFunction(options.locale) ? options.locale : DEFAULT_LOCALE;
  const _locale = isFunction(locale2) ? DEFAULT_LOCALE : locale2;
  const fallbackLocale = isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || isString$1(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale;
  const messages = isPlainObject(options.messages) ? options.messages : { [_locale]: {} };
  const datetimeFormats = isPlainObject(options.datetimeFormats) ? options.datetimeFormats : { [_locale]: {} };
  const numberFormats = isPlainObject(options.numberFormats) ? options.numberFormats : { [_locale]: {} };
  const modifiers = assign$1({}, options.modifiers || {}, getDefaultLinkedModifiers());
  const pluralRules = options.pluralRules || {};
  const missing = isFunction(options.missing) ? options.missing : null;
  const missingWarn = isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
  const fallbackWarn = isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
  const fallbackFormat = !!options.fallbackFormat;
  const unresolving = !!options.unresolving;
  const postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
  const processor = isPlainObject(options.processor) ? options.processor : null;
  const warnHtmlMessage = isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
  const escapeParameter = !!options.escapeParameter;
  const messageCompiler = isFunction(options.messageCompiler) ? options.messageCompiler : _compiler;
  const messageResolver = isFunction(options.messageResolver) ? options.messageResolver : _resolver || resolveWithKeyValue;
  const localeFallbacker = isFunction(options.localeFallbacker) ? options.localeFallbacker : _fallbacker || fallbackWithSimple;
  const fallbackContext = isObject$1(options.fallbackContext) ? options.fallbackContext : void 0;
  const internalOptions = options;
  const __datetimeFormatters = isObject$1(internalOptions.__datetimeFormatters) ? internalOptions.__datetimeFormatters : /* @__PURE__ */ new Map();
  const __numberFormatters = isObject$1(internalOptions.__numberFormatters) ? internalOptions.__numberFormatters : /* @__PURE__ */ new Map();
  const __meta = isObject$1(internalOptions.__meta) ? internalOptions.__meta : {};
  _cid++;
  const context = {
    version: version2,
    cid: _cid,
    locale: locale2,
    fallbackLocale,
    messages,
    modifiers,
    pluralRules,
    missing,
    missingWarn,
    fallbackWarn,
    fallbackFormat,
    unresolving,
    postTranslation,
    processor,
    warnHtmlMessage,
    escapeParameter,
    messageCompiler,
    messageResolver,
    localeFallbacker,
    fallbackContext,
    onWarn,
    __meta
  };
  {
    context.datetimeFormats = datetimeFormats;
    context.numberFormats = numberFormats;
    context.__datetimeFormatters = __datetimeFormatters;
    context.__numberFormatters = __numberFormatters;
  }
  if (__INTLIFY_PROD_DEVTOOLS__) {
    initI18nDevTools(context, version2, __meta);
  }
  return context;
}
function handleMissing(context, key, locale2, missingWarn, type) {
  const { missing, onWarn } = context;
  if (missing !== null) {
    const ret = missing(context, locale2, key, type);
    return isString$1(ret) ? ret : key;
  } else {
    return key;
  }
}
function updateFallbackLocale(ctx, locale2, fallback) {
  const context = ctx;
  context.__localeChainCache = /* @__PURE__ */ new Map();
  ctx.localeFallbacker(ctx, fallback, locale2);
}
function isAlmostSameLocale(locale2, compareLocale) {
  if (locale2 === compareLocale)
    return false;
  return locale2.split("-")[0] === compareLocale.split("-")[0];
}
function isImplicitFallback(targetLocale, locales) {
  const index = locales.indexOf(targetLocale);
  if (index === -1) {
    return false;
  }
  for (let i = index + 1; i < locales.length; i++) {
    if (isAlmostSameLocale(targetLocale, locales[i])) {
      return true;
    }
  }
  return false;
}
function format(ast) {
  const msg = (ctx) => formatParts(ctx, ast);
  return msg;
}
function formatParts(ctx, ast) {
  const body = ast.b || ast.body;
  if ((body.t || body.type) === 1) {
    const plural = body;
    const cases = plural.c || plural.cases;
    return ctx.plural(cases.reduce((messages, c2) => [
      ...messages,
      formatMessageParts(ctx, c2)
    ], []));
  } else {
    return formatMessageParts(ctx, body);
  }
}
function formatMessageParts(ctx, node) {
  const _static = node.s || node.static;
  if (_static) {
    return ctx.type === "text" ? _static : ctx.normalize([_static]);
  } else {
    const messages = (node.i || node.items).reduce((acm, c2) => [...acm, formatMessagePart(ctx, c2)], []);
    return ctx.normalize(messages);
  }
}
function formatMessagePart(ctx, node) {
  const type = node.t || node.type;
  switch (type) {
    case 3: {
      const text = node;
      return text.v || text.value;
    }
    case 9: {
      const literal = node;
      return literal.v || literal.value;
    }
    case 4: {
      const named = node;
      return ctx.interpolate(ctx.named(named.k || named.key));
    }
    case 5: {
      const list = node;
      return ctx.interpolate(ctx.list(list.i != null ? list.i : list.index));
    }
    case 6: {
      const linked = node;
      const modifier = linked.m || linked.modifier;
      return ctx.linked(formatMessagePart(ctx, linked.k || linked.key), modifier ? formatMessagePart(ctx, modifier) : void 0, ctx.type);
    }
    case 7: {
      const linkedKey = node;
      return linkedKey.v || linkedKey.value;
    }
    case 8: {
      const linkedModifier = node;
      return linkedModifier.v || linkedModifier.value;
    }
    default:
      throw new Error(`unhandled node type on format message part: ${type}`);
  }
}
const defaultOnCacheKey = (message2) => message2;
let compileCache = /* @__PURE__ */ Object.create(null);
const isMessageAST = (val) => isObject$1(val) && (val.t === 0 || val.type === 0) && ("b" in val || "body" in val);
function baseCompile(message2, options = {}) {
  let detectError = false;
  const onError = options.onError || defaultOnError;
  options.onError = (err) => {
    detectError = true;
    onError(err);
  };
  return { ...baseCompile$1(message2, options), detectError };
}
const compileToFunction = /* @__NO_SIDE_EFFECTS__ */ (message2, context) => {
  if (!isString$1(message2)) {
    throw createCoreError(CoreErrorCodes.NOT_SUPPORT_NON_STRING_MESSAGE);
  }
  {
    isBoolean(context.warnHtmlMessage) ? context.warnHtmlMessage : true;
    const onCacheKey = context.onCacheKey || defaultOnCacheKey;
    const cacheKey = onCacheKey(message2);
    const cached = compileCache[cacheKey];
    if (cached) {
      return cached;
    }
    const { code: code2, detectError } = baseCompile(message2, context);
    const msg = new Function(`return ${code2}`)();
    return !detectError ? compileCache[cacheKey] = msg : msg;
  }
};
function compile(message2, context) {
  if (__INTLIFY_JIT_COMPILATION__ && !__INTLIFY_DROP_MESSAGE_COMPILER__ && isString$1(message2)) {
    isBoolean(context.warnHtmlMessage) ? context.warnHtmlMessage : true;
    const onCacheKey = context.onCacheKey || defaultOnCacheKey;
    const cacheKey = onCacheKey(message2);
    const cached = compileCache[cacheKey];
    if (cached) {
      return cached;
    }
    const { ast, detectError } = baseCompile(message2, {
      ...context,
      location: define_process_env_default$1.NODE_ENV !== "production",
      jit: true
    });
    const msg = format(ast);
    return !detectError ? compileCache[cacheKey] = msg : msg;
  } else {
    const cacheKey = message2.cacheKey;
    if (cacheKey) {
      const cached = compileCache[cacheKey];
      if (cached) {
        return cached;
      }
      return compileCache[cacheKey] = format(message2);
    } else {
      return format(message2);
    }
  }
}
const NOOP_MESSAGE_FUNCTION = () => "";
const isMessageFunction = (val) => isFunction(val);
function translate(context, ...args) {
  const { fallbackFormat, postTranslation, unresolving, messageCompiler, fallbackLocale, messages } = context;
  const [key, options] = parseTranslateArgs(...args);
  const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
  const fallbackWarn = isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
  const escapeParameter = isBoolean(options.escapeParameter) ? options.escapeParameter : context.escapeParameter;
  const resolvedMessage = !!options.resolvedMessage;
  const defaultMsgOrKey = isString$1(options.default) || isBoolean(options.default) ? !isBoolean(options.default) ? options.default : !messageCompiler ? () => key : key : fallbackFormat ? !messageCompiler ? () => key : key : "";
  const enableDefaultMsg = fallbackFormat || defaultMsgOrKey !== "";
  const locale2 = getLocale(context, options);
  escapeParameter && escapeParams(options);
  let [formatScope, targetLocale, message2] = !resolvedMessage ? resolveMessageFormat(context, key, locale2, fallbackLocale, fallbackWarn, missingWarn) : [
    key,
    locale2,
    messages[locale2] || {}
  ];
  let format2 = formatScope;
  let cacheBaseKey = key;
  if (!resolvedMessage && !(isString$1(format2) || isMessageAST(format2) || isMessageFunction(format2))) {
    if (enableDefaultMsg) {
      format2 = defaultMsgOrKey;
      cacheBaseKey = format2;
    }
  }
  if (!resolvedMessage && (!(isString$1(format2) || isMessageAST(format2) || isMessageFunction(format2)) || !isString$1(targetLocale))) {
    return unresolving ? NOT_REOSLVED : key;
  }
  let occurred = false;
  const onError = () => {
    occurred = true;
  };
  const msg = !isMessageFunction(format2) ? compileMessageFormat(context, key, targetLocale, format2, cacheBaseKey, onError) : format2;
  if (occurred) {
    return format2;
  }
  const ctxOptions = getMessageContextOptions(context, targetLocale, message2, options);
  const msgContext = createMessageContext(ctxOptions);
  const messaged = evaluateMessage(context, msg, msgContext);
  const ret = postTranslation ? postTranslation(messaged, key) : messaged;
  if (__INTLIFY_PROD_DEVTOOLS__) {
    const payloads = {
      timestamp: Date.now(),
      key: isString$1(key) ? key : isMessageFunction(format2) ? format2.key : "",
      locale: targetLocale || (isMessageFunction(format2) ? format2.locale : ""),
      format: isString$1(format2) ? format2 : isMessageFunction(format2) ? format2.source : "",
      message: ret
    };
    payloads.meta = assign$1({}, context.__meta, /* @__PURE__ */ getAdditionalMeta() || {});
    translateDevTools(payloads);
  }
  return ret;
}
function escapeParams(options) {
  if (isArray(options.list)) {
    options.list = options.list.map((item) => isString$1(item) ? escapeHtml(item) : item);
  } else if (isObject$1(options.named)) {
    Object.keys(options.named).forEach((key) => {
      if (isString$1(options.named[key])) {
        options.named[key] = escapeHtml(options.named[key]);
      }
    });
  }
}
function resolveMessageFormat(context, key, locale2, fallbackLocale, fallbackWarn, missingWarn) {
  const { messages, onWarn, messageResolver: resolveValue2, localeFallbacker } = context;
  const locales = localeFallbacker(context, fallbackLocale, locale2);
  let message2 = {};
  let targetLocale;
  let format2 = null;
  const type = "translate";
  for (let i = 0; i < locales.length; i++) {
    targetLocale = locales[i];
    message2 = messages[targetLocale] || {};
    if ((format2 = resolveValue2(message2, key)) === null) {
      format2 = message2[key];
    }
    if (isString$1(format2) || isMessageAST(format2) || isMessageFunction(format2)) {
      break;
    }
    if (!isImplicitFallback(targetLocale, locales)) {
      const missingRet = handleMissing(
          context,
          // eslint-disable-line @typescript-eslint/no-explicit-any
          key,
          targetLocale,
          missingWarn,
          type
      );
      if (missingRet !== key) {
        format2 = missingRet;
      }
    }
  }
  return [format2, targetLocale, message2];
}
function compileMessageFormat(context, key, targetLocale, format2, cacheBaseKey, onError) {
  const { messageCompiler, warnHtmlMessage } = context;
  if (isMessageFunction(format2)) {
    const msg2 = format2;
    msg2.locale = msg2.locale || targetLocale;
    msg2.key = msg2.key || key;
    return msg2;
  }
  if (messageCompiler == null) {
    const msg2 = () => format2;
    msg2.locale = targetLocale;
    msg2.key = key;
    return msg2;
  }
  const msg = messageCompiler(format2, getCompileContext(context, targetLocale, cacheBaseKey, format2, warnHtmlMessage, onError));
  msg.locale = targetLocale;
  msg.key = key;
  msg.source = format2;
  return msg;
}
function evaluateMessage(context, msg, msgCtx) {
  const messaged = msg(msgCtx);
  return messaged;
}
function parseTranslateArgs(...args) {
  const [arg1, arg2, arg3] = args;
  const options = {};
  if (!isString$1(arg1) && !isNumber(arg1) && !isMessageFunction(arg1) && !isMessageAST(arg1)) {
    throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
  }
  const key = isNumber(arg1) ? String(arg1) : isMessageFunction(arg1) ? arg1 : arg1;
  if (isNumber(arg2)) {
    options.plural = arg2;
  } else if (isString$1(arg2)) {
    options.default = arg2;
  } else if (isPlainObject(arg2) && !isEmptyObject(arg2)) {
    options.named = arg2;
  } else if (isArray(arg2)) {
    options.list = arg2;
  }
  if (isNumber(arg3)) {
    options.plural = arg3;
  } else if (isString$1(arg3)) {
    options.default = arg3;
  } else if (isPlainObject(arg3)) {
    assign$1(options, arg3);
  }
  return [key, options];
}
function getCompileContext(context, locale2, key, source, warnHtmlMessage, onError) {
  return {
    locale: locale2,
    key,
    warnHtmlMessage,
    onError: (err) => {
      onError && onError(err);
      {
        throw err;
      }
    },
    onCacheKey: (source2) => generateFormatCacheKey(locale2, key, source2)
  };
}
function getMessageContextOptions(context, locale2, message2, options) {
  const { modifiers, pluralRules, messageResolver: resolveValue2, fallbackLocale, fallbackWarn, missingWarn, fallbackContext } = context;
  const resolveMessage = (key) => {
    let val = resolveValue2(message2, key);
    if (val == null && fallbackContext) {
      const [, , message22] = resolveMessageFormat(fallbackContext, key, locale2, fallbackLocale, fallbackWarn, missingWarn);
      val = resolveValue2(message22, key);
    }
    if (isString$1(val) || isMessageAST(val)) {
      let occurred = false;
      const onError = () => {
        occurred = true;
      };
      const msg = compileMessageFormat(context, key, locale2, val, key, onError);
      return !occurred ? msg : NOOP_MESSAGE_FUNCTION;
    } else if (isMessageFunction(val)) {
      return val;
    } else {
      return NOOP_MESSAGE_FUNCTION;
    }
  };
  const ctxOptions = {
    locale: locale2,
    modifiers,
    pluralRules,
    messages: resolveMessage
  };
  if (context.processor) {
    ctxOptions.processor = context.processor;
  }
  if (options.list) {
    ctxOptions.list = options.list;
  }
  if (options.named) {
    ctxOptions.named = options.named;
  }
  if (isNumber(options.plural)) {
    ctxOptions.pluralIndex = options.plural;
  }
  return ctxOptions;
}
function datetime(context, ...args) {
  const { datetimeFormats, unresolving, fallbackLocale, onWarn, localeFallbacker } = context;
  const { __datetimeFormatters } = context;
  const [key, value, options, overrides] = parseDateTimeArgs(...args);
  const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
  isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
  const part = !!options.part;
  const locale2 = getLocale(context, options);
  const locales = localeFallbacker(
      context,
      // eslint-disable-line @typescript-eslint/no-explicit-any
      fallbackLocale,
      locale2
  );
  if (!isString$1(key) || key === "") {
    return new Intl.DateTimeFormat(locale2, overrides).format(value);
  }
  let datetimeFormat = {};
  let targetLocale;
  let format2 = null;
  const type = "datetime format";
  for (let i = 0; i < locales.length; i++) {
    targetLocale = locales[i];
    datetimeFormat = datetimeFormats[targetLocale] || {};
    format2 = datetimeFormat[key];
    if (isPlainObject(format2))
      break;
    handleMissing(context, key, targetLocale, missingWarn, type);
  }
  if (!isPlainObject(format2) || !isString$1(targetLocale)) {
    return unresolving ? NOT_REOSLVED : key;
  }
  let id = `${targetLocale}__${key}`;
  if (!isEmptyObject(overrides)) {
    id = `${id}__${JSON.stringify(overrides)}`;
  }
  let formatter = __datetimeFormatters.get(id);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(targetLocale, assign$1({}, format2, overrides));
    __datetimeFormatters.set(id, formatter);
  }
  return !part ? formatter.format(value) : formatter.formatToParts(value);
}
const DATETIME_FORMAT_OPTIONS_KEYS = [
  "localeMatcher",
  "weekday",
  "era",
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
  "timeZoneName",
  "formatMatcher",
  "hour12",
  "timeZone",
  "dateStyle",
  "timeStyle",
  "calendar",
  "dayPeriod",
  "numberingSystem",
  "hourCycle",
  "fractionalSecondDigits"
];
function parseDateTimeArgs(...args) {
  const [arg1, arg2, arg3, arg4] = args;
  const options = {};
  let overrides = {};
  let value;
  if (isString$1(arg1)) {
    const matches = arg1.match(/(\d{4}-\d{2}-\d{2})(T|\s)?(.*)/);
    if (!matches) {
      throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
    }
    const dateTime = matches[3] ? matches[3].trim().startsWith("T") ? `${matches[1].trim()}${matches[3].trim()}` : `${matches[1].trim()}T${matches[3].trim()}` : matches[1].trim();
    value = new Date(dateTime);
    try {
      value.toISOString();
    } catch (e) {
      throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
    }
  } else if (isDate(arg1)) {
    if (isNaN(arg1.getTime())) {
      throw createCoreError(CoreErrorCodes.INVALID_DATE_ARGUMENT);
    }
    value = arg1;
  } else if (isNumber(arg1)) {
    value = arg1;
  } else {
    throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
  }
  if (isString$1(arg2)) {
    options.key = arg2;
  } else if (isPlainObject(arg2)) {
    Object.keys(arg2).forEach((key) => {
      if (DATETIME_FORMAT_OPTIONS_KEYS.includes(key)) {
        overrides[key] = arg2[key];
      } else {
        options[key] = arg2[key];
      }
    });
  }
  if (isString$1(arg3)) {
    options.locale = arg3;
  } else if (isPlainObject(arg3)) {
    overrides = arg3;
  }
  if (isPlainObject(arg4)) {
    overrides = arg4;
  }
  return [options.key || "", value, options, overrides];
}
function clearDateTimeFormat(ctx, locale2, format2) {
  const context = ctx;
  for (const key in format2) {
    const id = `${locale2}__${key}`;
    if (!context.__datetimeFormatters.has(id)) {
      continue;
    }
    context.__datetimeFormatters.delete(id);
  }
}
function number(context, ...args) {
  const { numberFormats, unresolving, fallbackLocale, onWarn, localeFallbacker } = context;
  const { __numberFormatters } = context;
  const [key, value, options, overrides] = parseNumberArgs(...args);
  const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
  isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
  const part = !!options.part;
  const locale2 = getLocale(context, options);
  const locales = localeFallbacker(
      context,
      // eslint-disable-line @typescript-eslint/no-explicit-any
      fallbackLocale,
      locale2
  );
  if (!isString$1(key) || key === "") {
    return new Intl.NumberFormat(locale2, overrides).format(value);
  }
  let numberFormat = {};
  let targetLocale;
  let format2 = null;
  const type = "number format";
  for (let i = 0; i < locales.length; i++) {
    targetLocale = locales[i];
    numberFormat = numberFormats[targetLocale] || {};
    format2 = numberFormat[key];
    if (isPlainObject(format2))
      break;
    handleMissing(context, key, targetLocale, missingWarn, type);
  }
  if (!isPlainObject(format2) || !isString$1(targetLocale)) {
    return unresolving ? NOT_REOSLVED : key;
  }
  let id = `${targetLocale}__${key}`;
  if (!isEmptyObject(overrides)) {
    id = `${id}__${JSON.stringify(overrides)}`;
  }
  let formatter = __numberFormatters.get(id);
  if (!formatter) {
    formatter = new Intl.NumberFormat(targetLocale, assign$1({}, format2, overrides));
    __numberFormatters.set(id, formatter);
  }
  return !part ? formatter.format(value) : formatter.formatToParts(value);
}
const NUMBER_FORMAT_OPTIONS_KEYS = [
  "localeMatcher",
  "style",
  "currency",
  "currencyDisplay",
  "currencySign",
  "useGrouping",
  "minimumIntegerDigits",
  "minimumFractionDigits",
  "maximumFractionDigits",
  "minimumSignificantDigits",
  "maximumSignificantDigits",
  "compactDisplay",
  "notation",
  "signDisplay",
  "unit",
  "unitDisplay",
  "roundingMode",
  "roundingPriority",
  "roundingIncrement",
  "trailingZeroDisplay"
];
function parseNumberArgs(...args) {
  const [arg1, arg2, arg3, arg4] = args;
  const options = {};
  let overrides = {};
  if (!isNumber(arg1)) {
    throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
  }
  const value = arg1;
  if (isString$1(arg2)) {
    options.key = arg2;
  } else if (isPlainObject(arg2)) {
    Object.keys(arg2).forEach((key) => {
      if (NUMBER_FORMAT_OPTIONS_KEYS.includes(key)) {
        overrides[key] = arg2[key];
      } else {
        options[key] = arg2[key];
      }
    });
  }
  if (isString$1(arg3)) {
    options.locale = arg3;
  } else if (isPlainObject(arg3)) {
    overrides = arg3;
  }
  if (isPlainObject(arg4)) {
    overrides = arg4;
  }
  return [options.key || "", value, options, overrides];
}
function clearNumberFormat(ctx, locale2, format2) {
  const context = ctx;
  for (const key in format2) {
    const id = `${locale2}__${key}`;
    if (!context.__numberFormatters.has(id)) {
      continue;
    }
    context.__numberFormatters.delete(id);
  }
}
{
  initFeatureFlags$1();
}
var define_process_env_default = { ALLUSERSPROFILE: "C:\\ProgramData", APPDATA: "C:\\Users\\Zrx\\AppData\\Roaming", ChocolateyInstall: "C:\\ProgramData\\chocolatey", ChocolateyLastPathUpdate: "133219334407372012", COLOR: "1", CommonProgramFiles: "C:\\Program Files\\Common Files", "CommonProgramFiles(x86)": "C:\\Program Files (x86)\\Common Files", CommonProgramW6432: "C:\\Program Files\\Common Files", COMPUTERNAME: "DESKTOP-PQMEM4M", ComSpec: "C:\\WINDOWS\\system32\\cmd.exe", DriverData: "C:\\Windows\\System32\\Drivers\\DriverData", EDITOR: "C:\\WINDOWS\\notepad.exe", EFC_11988: "1", FIG_JETBRAINS_SHELL_INTEGRATION: "1", FPS_BROWSER_APP_PROFILE_STRING: "Internet Explorer", FPS_BROWSER_USER_PROFILE_STRING: "Default", HOME: "C:\\Users\\Zrx", HOMEDRIVE: "C:", HOMEPATH: "\\Users\\Zrx", IDEA_INITIAL_DIRECTORY: "C:\\Program Files\\JetBrains\\WebStorm 2023.2.2\\bin", INIT_CWD: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype", LOCALAPPDATA: "C:\\Users\\Zrx\\AppData\\Local", LOGONSERVER: "\\\\DESKTOP-PQMEM4M", NODE: "C:\\Program Files\\nodejs\\node.exe", NODE_ENV: "production", NODE_EXE: "C:\\Program Files\\nodejs\\\\node.exe", NPM_CLI_JS: "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js", npm_command: "run-script", npm_config_cache: "C:\\Users\\Zrx\\AppData\\Local\\npm-cache", npm_config_globalconfig: "C:\\Program Files\\nodejs\\etc\\npmrc", npm_config_global_prefix: "C:\\Program Files\\nodejs", npm_config_init_module: "C:\\Users\\Zrx\\.npm-init.js", npm_config_local_prefix: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype", npm_config_node_gyp: "C:\\Users\\Zrx\\AppData\\Roaming\\nvm\\v20.14.0\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js", npm_config_noproxy: "", npm_config_npm_version: "10.7.0", npm_config_prefix: "C:\\Program Files\\nodejs", npm_config_registry: "https://packages.aliyun.com/6393d698d690c872dceedcc0/npm/npm-registry/", npm_config_userconfig: "C:\\Users\\Zrx\\.npmrc", npm_config_user_agent: "npm/10.7.0 node/v20.14.0 win32 x64 workspaces/false", npm_execpath: "C:\\Users\\Zrx\\AppData\\Roaming\\nvm\\v20.14.0\\node_modules\\npm\\bin\\npm-cli.js", npm_lifecycle_event: "build", npm_lifecycle_script: "vite build", npm_node_execpath: "C:\\Program Files\\nodejs\\node.exe", npm_package_json: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype\\package.json", npm_package_name: "@kcdesign/editor", npm_package_version: "1.0.24", NPM_PREFIX_JS: "C:\\Program Files\\nodejs\\\\node_modules\\npm\\bin\\npm-prefix.js", NPM_PREFIX_NPM_CLI_JS: "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js", NUMBER_OF_PROCESSORS: "16", NVM_HOME: "C:\\Users\\Zrx\\AppData\\Roaming\\nvm", NVM_SYMLINK: "C:\\Program Files\\nodejs", OneDrive: "C:\\Users\\Zrx\\OneDrive", OS: "Windows_NT", Path: "C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype\\node_modules\\.bin;C:\\Users\\Zrx\\Desktop\\CODE-BETA\\node_modules\\.bin;C:\\Users\\Zrx\\Desktop\\node_modules\\.bin;C:\\Users\\Zrx\\node_modules\\.bin;C:\\Users\\node_modules\\.bin;C:\\node_modules\\.bin;C:\\Users\\Zrx\\AppData\\Roaming\\nvm\\v20.14.0\\node_modules\\npm\\node_modules\\@npmcli\\run-script\\lib\\node-gyp-bin;C:\\Python311\\Scripts\\;C:\\Python311\\;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\ProgramData\\chocolatey\\bin;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet\\;C:\\Program Files\\Graphviz\\bin;C:\\Program Files\\Docker\\Docker\\resources\\bin;C:\\Users\\Zrx\\AppData\\Roaming\\nvm;C:\\Program Files\\nodejs;C:\\Users\\Zrx\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\Zrx\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Program Files\\JetBrains\\WebStorm 2023.2.2\\bin;;C:\\Users\\Zrx\\AppData\\Roaming\\nvm;C:\\Program Files\\nodejs;C:\\Users\\Zrx\\Desktop\\CODE-BETA\\kcdesign-prototype\\node_modules\\.bin", PATHEXT: ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.PY;.PYW", PROCESSOR_ARCHITECTURE: "AMD64", PROCESSOR_IDENTIFIER: "Intel64 Family 6 Model 154 Stepping 3, GenuineIntel", PROCESSOR_LEVEL: "6", PROCESSOR_REVISION: "9a03", ProgramData: "C:\\ProgramData", ProgramFiles: "C:\\Program Files", "ProgramFiles(x86)": "C:\\Program Files (x86)", ProgramW6432: "C:\\Program Files", PROMPT: "$P$G", PSModulePath: "C:\\Program Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules", PUBLIC: "C:\\Users\\Public", SESSIONNAME: "Console", SystemDrive: "C:", SystemRoot: "C:\\WINDOWS", TEMP: "C:\\Users\\Zrx\\AppData\\Local\\Temp", TERMINAL_EMULATOR: "JetBrains-JediTerm", TERM_SESSION_ID: "322f102f-fb02-492f-aed4-c4659d397fb2", TMP: "C:\\Users\\Zrx\\AppData\\Local\\Temp", USERDOMAIN: "DESKTOP-PQMEM4M", USERDOMAIN_ROAMINGPROFILE: "DESKTOP-PQMEM4M", USERNAME: "Zrx", USERPROFILE: "C:\\Users\\Zrx", WebStorm: "C:\\Program Files\\JetBrains\\WebStorm 2023.2.2\\bin;", windir: "C:\\WINDOWS", ZES_ENABLE_SYSMAN: "1" };
const VERSION = "9.13.1";
function initFeatureFlags() {
  if (typeof __VUE_I18N_FULL_INSTALL__ !== "boolean") {
    getGlobalThis().__VUE_I18N_FULL_INSTALL__ = true;
  }
  if (typeof __VUE_I18N_LEGACY_API__ !== "boolean") {
    getGlobalThis().__VUE_I18N_LEGACY_API__ = true;
  }
  if (typeof __INTLIFY_JIT_COMPILATION__ !== "boolean") {
    getGlobalThis().__INTLIFY_JIT_COMPILATION__ = false;
  }
  if (typeof __INTLIFY_DROP_MESSAGE_COMPILER__ !== "boolean") {
    getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = false;
  }
  if (typeof __INTLIFY_PROD_DEVTOOLS__ !== "boolean") {
    getGlobalThis().__INTLIFY_PROD_DEVTOOLS__ = false;
  }
}
const code$1 = CoreWarnCodes.__EXTEND_POINT__;
const inc$1 = incrementer(code$1);
({
  FALLBACK_TO_ROOT: code$1,
  // 9
  NOT_SUPPORTED_PRESERVE: inc$1(),
  // 10
  NOT_SUPPORTED_FORMATTER: inc$1(),
  // 11
  NOT_SUPPORTED_PRESERVE_DIRECTIVE: inc$1(),
  // 12
  NOT_SUPPORTED_GET_CHOICE_INDEX: inc$1(),
  // 13
  COMPONENT_NAME_LEGACY_COMPATIBLE: inc$1(),
  // 14
  NOT_FOUND_PARENT_SCOPE: inc$1(),
  // 15
  IGNORE_OBJ_FLATTEN: inc$1(),
  // 16
  NOTICE_DROP_ALLOW_COMPOSITION: inc$1(),
  // 17
  NOTICE_DROP_TRANSLATE_EXIST_COMPATIBLE_FLAG: inc$1()
  // 18
});
const code = CoreErrorCodes.__EXTEND_POINT__;
const inc = incrementer(code);
const I18nErrorCodes = {
  // composer module errors
  UNEXPECTED_RETURN_TYPE: code,
  // 24
  // legacy module errors
  INVALID_ARGUMENT: inc(),
  // 25
  // i18n module errors
  MUST_BE_CALL_SETUP_TOP: inc(),
  // 26
  NOT_INSTALLED: inc(),
  // 27
  NOT_AVAILABLE_IN_LEGACY_MODE: inc(),
  // 28
  // directive module errors
  REQUIRED_VALUE: inc(),
  // 29
  INVALID_VALUE: inc(),
  // 30
  // vue-devtools errors
  CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN: inc(),
  // 31
  NOT_INSTALLED_WITH_PROVIDE: inc(),
  // 32
  // unexpected error
  UNEXPECTED_ERROR: inc(),
  // 33
  // not compatible legacy vue-i18n constructor
  NOT_COMPATIBLE_LEGACY_VUE_I18N: inc(),
  // 34
  // bridge support vue 2.x only
  BRIDGE_SUPPORT_VUE_2_ONLY: inc(),
  // 35
  // need to define `i18n` option in `allowComposition: true` and `useScope: 'local' at `useI18n``
  MUST_DEFINE_I18N_OPTION_IN_ALLOW_COMPOSITION: inc(),
  // 36
  // Not available Compostion API in Legacy API mode. Please make sure that the legacy API mode is working properly
  NOT_AVAILABLE_COMPOSITION_IN_LEGACY: inc(),
  // 37
  // for enhancement
  __EXTEND_POINT__: inc()
  // 38
};
function createI18nError(code2, ...args) {
  return createCompileError(code2, null, void 0);
}
const TranslateVNodeSymbol = /* @__PURE__ */ makeSymbol("__translateVNode");
const DatetimePartsSymbol = /* @__PURE__ */ makeSymbol("__datetimeParts");
const NumberPartsSymbol = /* @__PURE__ */ makeSymbol("__numberParts");
const SetPluralRulesSymbol = makeSymbol("__setPluralRules");
const InejctWithOptionSymbol = /* @__PURE__ */ makeSymbol("__injectWithOption");
const DisposeSymbol = /* @__PURE__ */ makeSymbol("__dispose");
function handleFlatJson(obj) {
  if (!isObject$1(obj)) {
    return obj;
  }
  for (const key in obj) {
    if (!hasOwn(obj, key)) {
      continue;
    }
    if (!key.includes(".")) {
      if (isObject$1(obj[key])) {
        handleFlatJson(obj[key]);
      }
    } else {
      const subKeys = key.split(".");
      const lastIndex = subKeys.length - 1;
      let currentObj = obj;
      let hasStringValue = false;
      for (let i = 0; i < lastIndex; i++) {
        if (!(subKeys[i] in currentObj)) {
          currentObj[subKeys[i]] = {};
        }
        if (!isObject$1(currentObj[subKeys[i]])) {
          hasStringValue = true;
          break;
        }
        currentObj = currentObj[subKeys[i]];
      }
      if (!hasStringValue) {
        currentObj[subKeys[lastIndex]] = obj[key];
        delete obj[key];
      }
      if (isObject$1(currentObj[subKeys[lastIndex]])) {
        handleFlatJson(currentObj[subKeys[lastIndex]]);
      }
    }
  }
  return obj;
}
function getLocaleMessages(locale2, options) {
  const { messages, __i18n, messageResolver, flatJson } = options;
  const ret = isPlainObject(messages) ? messages : isArray(__i18n) ? {} : { [locale2]: {} };
  if (isArray(__i18n)) {
    __i18n.forEach((custom) => {
      if ("locale" in custom && "resource" in custom) {
        const { locale: locale22, resource } = custom;
        if (locale22) {
          ret[locale22] = ret[locale22] || {};
          deepCopy(resource, ret[locale22]);
        } else {
          deepCopy(resource, ret);
        }
      } else {
        isString$1(custom) && deepCopy(JSON.parse(custom), ret);
      }
    });
  }
  if (messageResolver == null && flatJson) {
    for (const key in ret) {
      if (hasOwn(ret, key)) {
        handleFlatJson(ret[key]);
      }
    }
  }
  return ret;
}
function getComponentOptions(instance) {
  return instance.type;
}
function adjustI18nResources(gl, options, componentOptions) {
  let messages = isObject$1(options.messages) ? options.messages : {};
  if ("__i18nGlobal" in componentOptions) {
    messages = getLocaleMessages(gl.locale.value, {
      messages,
      __i18n: componentOptions.__i18nGlobal
    });
  }
  const locales = Object.keys(messages);
  if (locales.length) {
    locales.forEach((locale2) => {
      gl.mergeLocaleMessage(locale2, messages[locale2]);
    });
  }
  {
    if (isObject$1(options.datetimeFormats)) {
      const locales2 = Object.keys(options.datetimeFormats);
      if (locales2.length) {
        locales2.forEach((locale2) => {
          gl.mergeDateTimeFormat(locale2, options.datetimeFormats[locale2]);
        });
      }
    }
    if (isObject$1(options.numberFormats)) {
      const locales2 = Object.keys(options.numberFormats);
      if (locales2.length) {
        locales2.forEach((locale2) => {
          gl.mergeNumberFormat(locale2, options.numberFormats[locale2]);
        });
      }
    }
  }
}
function createTextNode(key) {
  return createVNode(Text, null, key, 0);
}
const DEVTOOLS_META = "__INTLIFY_META__";
const NOOP_RETURN_ARRAY = () => [];
const NOOP_RETURN_FALSE = () => false;
let composerID = 0;
function defineCoreMissingHandler(missing) {
  return (ctx, locale2, key, type) => {
    return missing(locale2, key, getCurrentInstance() || void 0, type);
  };
}
const getMetaInfo = /* @__NO_SIDE_EFFECTS__ */ () => {
  const instance = getCurrentInstance();
  let meta = null;
  return instance && (meta = getComponentOptions(instance)[DEVTOOLS_META]) ? { [DEVTOOLS_META]: meta } : null;
};
function createComposer(options = {}, VueI18nLegacy) {
  const { __root, __injectWithOption } = options;
  const _isGlobal = __root === void 0;
  const flatJson = options.flatJson;
  const _ref = inBrowser ? ref : shallowRef;
  const translateExistCompatible = !!options.translateExistCompatible;
  let _inheritLocale = isBoolean(options.inheritLocale) ? options.inheritLocale : true;
  const _locale = _ref(
      // prettier-ignore
      __root && _inheritLocale ? __root.locale.value : isString$1(options.locale) ? options.locale : DEFAULT_LOCALE
  );
  const _fallbackLocale = _ref(
      // prettier-ignore
      __root && _inheritLocale ? __root.fallbackLocale.value : isString$1(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale.value
  );
  const _messages = _ref(getLocaleMessages(_locale.value, options));
  const _datetimeFormats = _ref(isPlainObject(options.datetimeFormats) ? options.datetimeFormats : { [_locale.value]: {} });
  const _numberFormats = _ref(isPlainObject(options.numberFormats) ? options.numberFormats : { [_locale.value]: {} });
  let _missingWarn = __root ? __root.missingWarn : isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
  let _fallbackWarn = __root ? __root.fallbackWarn : isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
  let _fallbackRoot = __root ? __root.fallbackRoot : isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
  let _fallbackFormat = !!options.fallbackFormat;
  let _missing = isFunction(options.missing) ? options.missing : null;
  let _runtimeMissing = isFunction(options.missing) ? defineCoreMissingHandler(options.missing) : null;
  let _postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
  let _warnHtmlMessage = __root ? __root.warnHtmlMessage : isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
  let _escapeParameter = !!options.escapeParameter;
  const _modifiers = __root ? __root.modifiers : isPlainObject(options.modifiers) ? options.modifiers : {};
  let _pluralRules = options.pluralRules || __root && __root.pluralRules;
  let _context;
  const getCoreContext = () => {
    _isGlobal && setFallbackContext(null);
    const ctxOptions = {
      version: VERSION,
      locale: _locale.value,
      fallbackLocale: _fallbackLocale.value,
      messages: _messages.value,
      modifiers: _modifiers,
      pluralRules: _pluralRules,
      missing: _runtimeMissing === null ? void 0 : _runtimeMissing,
      missingWarn: _missingWarn,
      fallbackWarn: _fallbackWarn,
      fallbackFormat: _fallbackFormat,
      unresolving: true,
      postTranslation: _postTranslation === null ? void 0 : _postTranslation,
      warnHtmlMessage: _warnHtmlMessage,
      escapeParameter: _escapeParameter,
      messageResolver: options.messageResolver,
      messageCompiler: options.messageCompiler,
      __meta: { framework: "vue" }
    };
    {
      ctxOptions.datetimeFormats = _datetimeFormats.value;
      ctxOptions.numberFormats = _numberFormats.value;
      ctxOptions.__datetimeFormatters = isPlainObject(_context) ? _context.__datetimeFormatters : void 0;
      ctxOptions.__numberFormatters = isPlainObject(_context) ? _context.__numberFormatters : void 0;
    }
    const ctx = createCoreContext(ctxOptions);
    _isGlobal && setFallbackContext(ctx);
    return ctx;
  };
  _context = getCoreContext();
  updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
  function trackReactivityValues() {
    return [
      _locale.value,
      _fallbackLocale.value,
      _messages.value,
      _datetimeFormats.value,
      _numberFormats.value
    ];
  }
  const locale2 = computed({
    get: () => _locale.value,
    set: (val) => {
      _locale.value = val;
      _context.locale = _locale.value;
    }
  });
  const fallbackLocale = computed({
    get: () => _fallbackLocale.value,
    set: (val) => {
      _fallbackLocale.value = val;
      _context.fallbackLocale = _fallbackLocale.value;
      updateFallbackLocale(_context, _locale.value, val);
    }
  });
  const messages = computed(() => _messages.value);
  const datetimeFormats = /* @__PURE__ */ computed(() => _datetimeFormats.value);
  const numberFormats = /* @__PURE__ */ computed(() => _numberFormats.value);
  function getPostTranslationHandler() {
    return isFunction(_postTranslation) ? _postTranslation : null;
  }
  function setPostTranslationHandler(handler) {
    _postTranslation = handler;
    _context.postTranslation = handler;
  }
  function getMissingHandler() {
    return _missing;
  }
  function setMissingHandler(handler) {
    if (handler !== null) {
      _runtimeMissing = defineCoreMissingHandler(handler);
    }
    _missing = handler;
    _context.missing = _runtimeMissing;
  }
  const wrapWithDeps = (fn, argumentParser, warnType, fallbackSuccess, fallbackFail, successCondition) => {
    trackReactivityValues();
    let ret;
    try {
      if (define_process_env_default.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__) {
        /* @__PURE__ */ setAdditionalMeta(/* @__PURE__ */ getMetaInfo());
      }
      if (!_isGlobal) {
        _context.fallbackContext = __root ? getFallbackContext() : void 0;
      }
      ret = fn(_context);
    } finally {
      if (__INTLIFY_PROD_DEVTOOLS__) ;
      if (!_isGlobal) {
        _context.fallbackContext = void 0;
      }
    }
    if (warnType !== "translate exists" && // for not `te` (e.g `t`)
        isNumber(ret) && ret === NOT_REOSLVED || warnType === "translate exists" && !ret) {
      const [key, arg2] = argumentParser();
      return __root && _fallbackRoot ? fallbackSuccess(__root) : fallbackFail(key);
    } else if (successCondition(ret)) {
      return ret;
    } else {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_RETURN_TYPE);
    }
  };
  function t4(...args) {
    return wrapWithDeps((context) => Reflect.apply(translate, null, [context, ...args]), () => parseTranslateArgs(...args), "translate", (root) => Reflect.apply(root.t, root, [...args]), (key) => key, (val) => isString$1(val));
  }
  function rt(...args) {
    const [arg1, arg2, arg3] = args;
    if (arg3 && !isObject$1(arg3)) {
      throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
    }
    return t4(...[arg1, arg2, assign$1({ resolvedMessage: true }, arg3 || {})]);
  }
  function d2(...args) {
    return wrapWithDeps((context) => Reflect.apply(datetime, null, [context, ...args]), () => parseDateTimeArgs(...args), "datetime format", (root) => Reflect.apply(root.d, root, [...args]), () => MISSING_RESOLVE_VALUE, (val) => isString$1(val));
  }
  function n2(...args) {
    return wrapWithDeps((context) => Reflect.apply(number, null, [context, ...args]), () => parseNumberArgs(...args), "number format", (root) => Reflect.apply(root.n, root, [...args]), () => MISSING_RESOLVE_VALUE, (val) => isString$1(val));
  }
  function normalize(values) {
    return values.map((val) => isString$1(val) || isNumber(val) || isBoolean(val) ? createTextNode(String(val)) : val);
  }
  const interpolate = (val) => val;
  const processor = {
    normalize,
    interpolate,
    type: "vnode"
  };
  function translateVNode(...args) {
    return wrapWithDeps(
        (context) => {
          let ret;
          const _context2 = context;
          try {
            _context2.processor = processor;
            ret = Reflect.apply(translate, null, [_context2, ...args]);
          } finally {
            _context2.processor = null;
          }
          return ret;
        },
        () => parseTranslateArgs(...args),
        "translate",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (root) => root[TranslateVNodeSymbol](...args),
        (key) => [createTextNode(key)],
        (val) => isArray(val)
    );
  }
  function numberParts(...args) {
    return wrapWithDeps(
        (context) => Reflect.apply(number, null, [context, ...args]),
        () => parseNumberArgs(...args),
        "number format",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (root) => root[NumberPartsSymbol](...args),
        NOOP_RETURN_ARRAY,
        (val) => isString$1(val) || isArray(val)
    );
  }
  function datetimeParts(...args) {
    return wrapWithDeps(
        (context) => Reflect.apply(datetime, null, [context, ...args]),
        () => parseDateTimeArgs(...args),
        "datetime format",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (root) => root[DatetimePartsSymbol](...args),
        NOOP_RETURN_ARRAY,
        (val) => isString$1(val) || isArray(val)
    );
  }
  function setPluralRules(rules) {
    _pluralRules = rules;
    _context.pluralRules = _pluralRules;
  }
  function te(key, locale22) {
    return wrapWithDeps(() => {
      if (!key) {
        return false;
      }
      const targetLocale = isString$1(locale22) ? locale22 : _locale.value;
      const message2 = getLocaleMessage(targetLocale);
      const resolved = _context.messageResolver(message2, key);
      return !translateExistCompatible ? isMessageAST(resolved) || isMessageFunction(resolved) || isString$1(resolved) : resolved != null;
    }, () => [key], "translate exists", (root) => {
      return Reflect.apply(root.te, root, [key, locale22]);
    }, NOOP_RETURN_FALSE, (val) => isBoolean(val));
  }
  function resolveMessages(key) {
    let messages2 = null;
    const locales = fallbackWithLocaleChain(_context, _fallbackLocale.value, _locale.value);
    for (let i = 0; i < locales.length; i++) {
      const targetLocaleMessages = _messages.value[locales[i]] || {};
      const messageValue = _context.messageResolver(targetLocaleMessages, key);
      if (messageValue != null) {
        messages2 = messageValue;
        break;
      }
    }
    return messages2;
  }
  function tm(key) {
    const messages2 = resolveMessages(key);
    return messages2 != null ? messages2 : __root ? __root.tm(key) || {} : {};
  }
  function getLocaleMessage(locale22) {
    return _messages.value[locale22] || {};
  }
  function setLocaleMessage(locale22, message2) {
    if (flatJson) {
      const _message = { [locale22]: message2 };
      for (const key in _message) {
        if (hasOwn(_message, key)) {
          handleFlatJson(_message[key]);
        }
      }
      message2 = _message[locale22];
    }
    _messages.value[locale22] = message2;
    _context.messages = _messages.value;
  }
  function mergeLocaleMessage(locale22, message2) {
    _messages.value[locale22] = _messages.value[locale22] || {};
    const _message = { [locale22]: message2 };
    if (flatJson) {
      for (const key in _message) {
        if (hasOwn(_message, key)) {
          handleFlatJson(_message[key]);
        }
      }
    }
    message2 = _message[locale22];
    deepCopy(message2, _messages.value[locale22]);
    _context.messages = _messages.value;
  }
  function getDateTimeFormat(locale22) {
    return _datetimeFormats.value[locale22] || {};
  }
  function setDateTimeFormat(locale22, format2) {
    _datetimeFormats.value[locale22] = format2;
    _context.datetimeFormats = _datetimeFormats.value;
    clearDateTimeFormat(_context, locale22, format2);
  }
  function mergeDateTimeFormat(locale22, format2) {
    _datetimeFormats.value[locale22] = assign$1(_datetimeFormats.value[locale22] || {}, format2);
    _context.datetimeFormats = _datetimeFormats.value;
    clearDateTimeFormat(_context, locale22, format2);
  }
  function getNumberFormat(locale22) {
    return _numberFormats.value[locale22] || {};
  }
  function setNumberFormat(locale22, format2) {
    _numberFormats.value[locale22] = format2;
    _context.numberFormats = _numberFormats.value;
    clearNumberFormat(_context, locale22, format2);
  }
  function mergeNumberFormat(locale22, format2) {
    _numberFormats.value[locale22] = assign$1(_numberFormats.value[locale22] || {}, format2);
    _context.numberFormats = _numberFormats.value;
    clearNumberFormat(_context, locale22, format2);
  }
  composerID++;
  if (__root && inBrowser) {
    watch(__root.locale, (val) => {
      if (_inheritLocale) {
        _locale.value = val;
        _context.locale = val;
        updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
      }
    });
    watch(__root.fallbackLocale, (val) => {
      if (_inheritLocale) {
        _fallbackLocale.value = val;
        _context.fallbackLocale = val;
        updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
      }
    });
  }
  const composer = {
    id: composerID,
    locale: locale2,
    fallbackLocale,
    get inheritLocale() {
      return _inheritLocale;
    },
    set inheritLocale(val) {
      _inheritLocale = val;
      if (val && __root) {
        _locale.value = __root.locale.value;
        _fallbackLocale.value = __root.fallbackLocale.value;
        updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
      }
    },
    get availableLocales() {
      return Object.keys(_messages.value).sort();
    },
    messages,
    get modifiers() {
      return _modifiers;
    },
    get pluralRules() {
      return _pluralRules || {};
    },
    get isGlobal() {
      return _isGlobal;
    },
    get missingWarn() {
      return _missingWarn;
    },
    set missingWarn(val) {
      _missingWarn = val;
      _context.missingWarn = _missingWarn;
    },
    get fallbackWarn() {
      return _fallbackWarn;
    },
    set fallbackWarn(val) {
      _fallbackWarn = val;
      _context.fallbackWarn = _fallbackWarn;
    },
    get fallbackRoot() {
      return _fallbackRoot;
    },
    set fallbackRoot(val) {
      _fallbackRoot = val;
    },
    get fallbackFormat() {
      return _fallbackFormat;
    },
    set fallbackFormat(val) {
      _fallbackFormat = val;
      _context.fallbackFormat = _fallbackFormat;
    },
    get warnHtmlMessage() {
      return _warnHtmlMessage;
    },
    set warnHtmlMessage(val) {
      _warnHtmlMessage = val;
      _context.warnHtmlMessage = val;
    },
    get escapeParameter() {
      return _escapeParameter;
    },
    set escapeParameter(val) {
      _escapeParameter = val;
      _context.escapeParameter = val;
    },
    t: t4,
    getLocaleMessage,
    setLocaleMessage,
    mergeLocaleMessage,
    getPostTranslationHandler,
    setPostTranslationHandler,
    getMissingHandler,
    setMissingHandler,
    [SetPluralRulesSymbol]: setPluralRules
  };
  {
    composer.datetimeFormats = datetimeFormats;
    composer.numberFormats = numberFormats;
    composer.rt = rt;
    composer.te = te;
    composer.tm = tm;
    composer.d = d2;
    composer.n = n2;
    composer.getDateTimeFormat = getDateTimeFormat;
    composer.setDateTimeFormat = setDateTimeFormat;
    composer.mergeDateTimeFormat = mergeDateTimeFormat;
    composer.getNumberFormat = getNumberFormat;
    composer.setNumberFormat = setNumberFormat;
    composer.mergeNumberFormat = mergeNumberFormat;
    composer[InejctWithOptionSymbol] = __injectWithOption;
    composer[TranslateVNodeSymbol] = translateVNode;
    composer[DatetimePartsSymbol] = datetimeParts;
    composer[NumberPartsSymbol] = numberParts;
  }
  return composer;
}
function convertComposerOptions(options) {
  const locale2 = isString$1(options.locale) ? options.locale : DEFAULT_LOCALE;
  const fallbackLocale = isString$1(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : locale2;
  const missing = isFunction(options.missing) ? options.missing : void 0;
  const missingWarn = isBoolean(options.silentTranslationWarn) || isRegExp(options.silentTranslationWarn) ? !options.silentTranslationWarn : true;
  const fallbackWarn = isBoolean(options.silentFallbackWarn) || isRegExp(options.silentFallbackWarn) ? !options.silentFallbackWarn : true;
  const fallbackRoot = isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
  const fallbackFormat = !!options.formatFallbackMessages;
  const modifiers = isPlainObject(options.modifiers) ? options.modifiers : {};
  const pluralizationRules = options.pluralizationRules;
  const postTranslation = isFunction(options.postTranslation) ? options.postTranslation : void 0;
  const warnHtmlMessage = isString$1(options.warnHtmlInMessage) ? options.warnHtmlInMessage !== "off" : true;
  const escapeParameter = !!options.escapeParameterHtml;
  const inheritLocale = isBoolean(options.sync) ? options.sync : true;
  let messages = options.messages;
  if (isPlainObject(options.sharedMessages)) {
    const sharedMessages = options.sharedMessages;
    const locales = Object.keys(sharedMessages);
    messages = locales.reduce((messages2, locale22) => {
      const message2 = messages2[locale22] || (messages2[locale22] = {});
      assign$1(message2, sharedMessages[locale22]);
      return messages2;
    }, messages || {});
  }
  const { __i18n, __root, __injectWithOption } = options;
  const datetimeFormats = options.datetimeFormats;
  const numberFormats = options.numberFormats;
  const flatJson = options.flatJson;
  const translateExistCompatible = options.translateExistCompatible;
  return {
    locale: locale2,
    fallbackLocale,
    messages,
    flatJson,
    datetimeFormats,
    numberFormats,
    missing,
    missingWarn,
    fallbackWarn,
    fallbackRoot,
    fallbackFormat,
    modifiers,
    pluralRules: pluralizationRules,
    postTranslation,
    warnHtmlMessage,
    escapeParameter,
    messageResolver: options.messageResolver,
    inheritLocale,
    translateExistCompatible,
    __i18n,
    __root,
    __injectWithOption
  };
}
function createVueI18n(options = {}, VueI18nLegacy) {
  {
    const composer = createComposer(convertComposerOptions(options));
    const { __extender } = options;
    const vueI18n = {
      // id
      id: composer.id,
      // locale
      get locale() {
        return composer.locale.value;
      },
      set locale(val) {
        composer.locale.value = val;
      },
      // fallbackLocale
      get fallbackLocale() {
        return composer.fallbackLocale.value;
      },
      set fallbackLocale(val) {
        composer.fallbackLocale.value = val;
      },
      // messages
      get messages() {
        return composer.messages.value;
      },
      // datetimeFormats
      get datetimeFormats() {
        return composer.datetimeFormats.value;
      },
      // numberFormats
      get numberFormats() {
        return composer.numberFormats.value;
      },
      // availableLocales
      get availableLocales() {
        return composer.availableLocales;
      },
      // formatter
      get formatter() {
        return {
          interpolate() {
            return [];
          }
        };
      },
      set formatter(val) {
      },
      // missing
      get missing() {
        return composer.getMissingHandler();
      },
      set missing(handler) {
        composer.setMissingHandler(handler);
      },
      // silentTranslationWarn
      get silentTranslationWarn() {
        return isBoolean(composer.missingWarn) ? !composer.missingWarn : composer.missingWarn;
      },
      set silentTranslationWarn(val) {
        composer.missingWarn = isBoolean(val) ? !val : val;
      },
      // silentFallbackWarn
      get silentFallbackWarn() {
        return isBoolean(composer.fallbackWarn) ? !composer.fallbackWarn : composer.fallbackWarn;
      },
      set silentFallbackWarn(val) {
        composer.fallbackWarn = isBoolean(val) ? !val : val;
      },
      // modifiers
      get modifiers() {
        return composer.modifiers;
      },
      // formatFallbackMessages
      get formatFallbackMessages() {
        return composer.fallbackFormat;
      },
      set formatFallbackMessages(val) {
        composer.fallbackFormat = val;
      },
      // postTranslation
      get postTranslation() {
        return composer.getPostTranslationHandler();
      },
      set postTranslation(handler) {
        composer.setPostTranslationHandler(handler);
      },
      // sync
      get sync() {
        return composer.inheritLocale;
      },
      set sync(val) {
        composer.inheritLocale = val;
      },
      // warnInHtmlMessage
      get warnHtmlInMessage() {
        return composer.warnHtmlMessage ? "warn" : "off";
      },
      set warnHtmlInMessage(val) {
        composer.warnHtmlMessage = val !== "off";
      },
      // escapeParameterHtml
      get escapeParameterHtml() {
        return composer.escapeParameter;
      },
      set escapeParameterHtml(val) {
        composer.escapeParameter = val;
      },
      // preserveDirectiveContent
      get preserveDirectiveContent() {
        return true;
      },
      set preserveDirectiveContent(val) {
      },
      // pluralizationRules
      get pluralizationRules() {
        return composer.pluralRules || {};
      },
      // for internal
      __composer: composer,
      // t
      t(...args) {
        const [arg1, arg2, arg3] = args;
        const options2 = {};
        let list = null;
        let named = null;
        if (!isString$1(arg1)) {
          throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
        }
        const key = arg1;
        if (isString$1(arg2)) {
          options2.locale = arg2;
        } else if (isArray(arg2)) {
          list = arg2;
        } else if (isPlainObject(arg2)) {
          named = arg2;
        }
        if (isArray(arg3)) {
          list = arg3;
        } else if (isPlainObject(arg3)) {
          named = arg3;
        }
        return Reflect.apply(composer.t, composer, [
          key,
          list || named || {},
          options2
        ]);
      },
      rt(...args) {
        return Reflect.apply(composer.rt, composer, [...args]);
      },
      // tc
      tc(...args) {
        const [arg1, arg2, arg3] = args;
        const options2 = { plural: 1 };
        let list = null;
        let named = null;
        if (!isString$1(arg1)) {
          throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
        }
        const key = arg1;
        if (isString$1(arg2)) {
          options2.locale = arg2;
        } else if (isNumber(arg2)) {
          options2.plural = arg2;
        } else if (isArray(arg2)) {
          list = arg2;
        } else if (isPlainObject(arg2)) {
          named = arg2;
        }
        if (isString$1(arg3)) {
          options2.locale = arg3;
        } else if (isArray(arg3)) {
          list = arg3;
        } else if (isPlainObject(arg3)) {
          named = arg3;
        }
        return Reflect.apply(composer.t, composer, [
          key,
          list || named || {},
          options2
        ]);
      },
      // te
      te(key, locale2) {
        return composer.te(key, locale2);
      },
      // tm
      tm(key) {
        return composer.tm(key);
      },
      // getLocaleMessage
      getLocaleMessage(locale2) {
        return composer.getLocaleMessage(locale2);
      },
      // setLocaleMessage
      setLocaleMessage(locale2, message2) {
        composer.setLocaleMessage(locale2, message2);
      },
      // mergeLocaleMessage
      mergeLocaleMessage(locale2, message2) {
        composer.mergeLocaleMessage(locale2, message2);
      },
      // d
      d(...args) {
        return Reflect.apply(composer.d, composer, [...args]);
      },
      // getDateTimeFormat
      getDateTimeFormat(locale2) {
        return composer.getDateTimeFormat(locale2);
      },
      // setDateTimeFormat
      setDateTimeFormat(locale2, format2) {
        composer.setDateTimeFormat(locale2, format2);
      },
      // mergeDateTimeFormat
      mergeDateTimeFormat(locale2, format2) {
        composer.mergeDateTimeFormat(locale2, format2);
      },
      // n
      n(...args) {
        return Reflect.apply(composer.n, composer, [...args]);
      },
      // getNumberFormat
      getNumberFormat(locale2) {
        return composer.getNumberFormat(locale2);
      },
      // setNumberFormat
      setNumberFormat(locale2, format2) {
        composer.setNumberFormat(locale2, format2);
      },
      // mergeNumberFormat
      mergeNumberFormat(locale2, format2) {
        composer.mergeNumberFormat(locale2, format2);
      },
      // getChoiceIndex
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getChoiceIndex(choice, choicesLength) {
        return -1;
      }
    };
    vueI18n.__extender = __extender;
    return vueI18n;
  }
}
const baseFormatProps = {
  tag: {
    type: [String, Object]
  },
  locale: {
    type: String
  },
  scope: {
    type: String,
    // NOTE: avoid https://github.com/microsoft/rushstack/issues/1050
    validator: (val) => val === "parent" || val === "global",
    default: "parent"
    /* ComponentI18nScope */
  },
  i18n: {
    type: Object
  }
};
function getInterpolateArg({ slots }, keys) {
  if (keys.length === 1 && keys[0] === "default") {
    const ret = slots.default ? slots.default() : [];
    return ret.reduce((slot, current) => {
      return [
        ...slot,
        // prettier-ignore
        ...current.type === Fragment ? current.children : [current]
      ];
    }, []);
  } else {
    return keys.reduce((arg, key) => {
      const slot = slots[key];
      if (slot) {
        arg[key] = slot();
      }
      return arg;
    }, {});
  }
}
function getFragmentableTag(tag) {
  return Fragment;
}
const TranslationImpl = /* @__PURE__ */ defineComponent({
  /* eslint-disable */
  name: "i18n-t",
  props: assign$1({
    keypath: {
      type: String,
      required: true
    },
    plural: {
      type: [Number, String],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: (val) => isNumber(val) || !isNaN(val)
    }
  }, baseFormatProps),
  /* eslint-enable */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props, context) {
    const { slots, attrs } = context;
    const i18n2 = props.i18n || useI18n({
      useScope: props.scope,
      __useComponent: true
    });
    return () => {
      const keys = Object.keys(slots).filter((key) => key !== "_");
      const options = {};
      if (props.locale) {
        options.locale = props.locale;
      }
      if (props.plural !== void 0) {
        options.plural = isString$1(props.plural) ? +props.plural : props.plural;
      }
      const arg = getInterpolateArg(context, keys);
      const children = i18n2[TranslateVNodeSymbol](props.keypath, arg, options);
      const assignedAttrs = assign$1({}, attrs);
      const tag = isString$1(props.tag) || isObject$1(props.tag) ? props.tag : getFragmentableTag();
      return h$1(tag, assignedAttrs, children);
    };
  }
});
const Translation = TranslationImpl;
function isVNode(target) {
  return isArray(target) && !isString$1(target[0]);
}
function renderFormatter(props, context, slotKeys, partFormatter) {
  const { slots, attrs } = context;
  return () => {
    const options = { part: true };
    let overrides = {};
    if (props.locale) {
      options.locale = props.locale;
    }
    if (isString$1(props.format)) {
      options.key = props.format;
    } else if (isObject$1(props.format)) {
      if (isString$1(props.format.key)) {
        options.key = props.format.key;
      }
      overrides = Object.keys(props.format).reduce((options2, prop) => {
        return slotKeys.includes(prop) ? assign$1({}, options2, { [prop]: props.format[prop] }) : options2;
      }, {});
    }
    const parts = partFormatter(...[props.value, options, overrides]);
    let children = [options.key];
    if (isArray(parts)) {
      children = parts.map((part, index) => {
        const slot = slots[part.type];
        const node = slot ? slot({ [part.type]: part.value, index, parts }) : [part.value];
        if (isVNode(node)) {
          node[0].key = `${part.type}-${index}`;
        }
        return node;
      });
    } else if (isString$1(parts)) {
      children = [parts];
    }
    const assignedAttrs = assign$1({}, attrs);
    const tag = isString$1(props.tag) || isObject$1(props.tag) ? props.tag : getFragmentableTag();
    return h$1(tag, assignedAttrs, children);
  };
}
const NumberFormatImpl = /* @__PURE__ */ defineComponent({
  /* eslint-disable */
  name: "i18n-n",
  props: assign$1({
    value: {
      type: Number,
      required: true
    },
    format: {
      type: [String, Object]
    }
  }, baseFormatProps),
  /* eslint-enable */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props, context) {
    const i18n2 = props.i18n || useI18n({
      useScope: props.scope,
      __useComponent: true
    });
    return renderFormatter(props, context, NUMBER_FORMAT_OPTIONS_KEYS, (...args) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18n2[NumberPartsSymbol](...args)
    ));
  }
});
const NumberFormat = NumberFormatImpl;
const DatetimeFormatImpl = /* @__PURE__ */ defineComponent({
  /* eslint-disable */
  name: "i18n-d",
  props: assign$1({
    value: {
      type: [Number, Date],
      required: true
    },
    format: {
      type: [String, Object]
    }
  }, baseFormatProps),
  /* eslint-enable */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props, context) {
    const i18n2 = props.i18n || useI18n({
      useScope: props.scope,
      __useComponent: true
    });
    return renderFormatter(props, context, DATETIME_FORMAT_OPTIONS_KEYS, (...args) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18n2[DatetimePartsSymbol](...args)
    ));
  }
});
const DatetimeFormat = DatetimeFormatImpl;
function getComposer$2(i18n2, instance) {
  const i18nInternal = i18n2;
  if (i18n2.mode === "composition") {
    return i18nInternal.__getInstance(instance) || i18n2.global;
  } else {
    const vueI18n = i18nInternal.__getInstance(instance);
    return vueI18n != null ? vueI18n.__composer : i18n2.global.__composer;
  }
}
function vTDirective(i18n2) {
  const _process = (binding) => {
    const { instance, modifiers, value } = binding;
    if (!instance || !instance.$) {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
    }
    const composer = getComposer$2(i18n2, instance.$);
    const parsedValue = parseValue(value);
    return [
      Reflect.apply(composer.t, composer, [...makeParams(parsedValue)]),
      composer
    ];
  };
  const register = (el, binding) => {
    const [textContent, composer] = _process(binding);
    if (inBrowser && i18n2.global === composer) {
      el.__i18nWatcher = watch(composer.locale, () => {
        binding.instance && binding.instance.$forceUpdate();
      });
    }
    el.__composer = composer;
    el.textContent = textContent;
  };
  const unregister = (el) => {
    if (inBrowser && el.__i18nWatcher) {
      el.__i18nWatcher();
      el.__i18nWatcher = void 0;
      delete el.__i18nWatcher;
    }
    if (el.__composer) {
      el.__composer = void 0;
      delete el.__composer;
    }
  };
  const update = (el, { value }) => {
    if (el.__composer) {
      const composer = el.__composer;
      const parsedValue = parseValue(value);
      el.textContent = Reflect.apply(composer.t, composer, [
        ...makeParams(parsedValue)
      ]);
    }
  };
  const getSSRProps = (binding) => {
    const [textContent] = _process(binding);
    return { textContent };
  };
  return {
    created: register,
    unmounted: unregister,
    beforeUpdate: update,
    getSSRProps
  };
}
function parseValue(value) {
  if (isString$1(value)) {
    return { path: value };
  } else if (isPlainObject(value)) {
    if (!("path" in value)) {
      throw createI18nError(I18nErrorCodes.REQUIRED_VALUE, "path");
    }
    return value;
  } else {
    throw createI18nError(I18nErrorCodes.INVALID_VALUE);
  }
}
function makeParams(value) {
  const { path, locale: locale2, args, choice, plural } = value;
  const options = {};
  const named = args || {};
  if (isString$1(locale2)) {
    options.locale = locale2;
  }
  if (isNumber(choice)) {
    options.plural = choice;
  }
  if (isNumber(plural)) {
    options.plural = plural;
  }
  return [path, named, options];
}
function apply$2(app2, i18n2, ...options) {
  const pluginOptions = isPlainObject(options[0]) ? options[0] : {};
  const useI18nComponentName = !!pluginOptions.useI18nComponentName;
  const globalInstall = isBoolean(pluginOptions.globalInstall) ? pluginOptions.globalInstall : true;
  if (globalInstall) {
    [!useI18nComponentName ? Translation.name : "i18n", "I18nT"].forEach((name) => app2.component(name, Translation));
    [NumberFormat.name, "I18nN"].forEach((name) => app2.component(name, NumberFormat));
    [DatetimeFormat.name, "I18nD"].forEach((name) => app2.component(name, DatetimeFormat));
  }
  {
    app2.directive("t", vTDirective(i18n2));
  }
}
function defineMixin(vuei18n, composer, i18n2) {
  return {
    beforeCreate() {
      const instance = getCurrentInstance();
      if (!instance) {
        throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
      }
      const options = this.$options;
      if (options.i18n) {
        const optionsI18n = options.i18n;
        if (options.__i18n) {
          optionsI18n.__i18n = options.__i18n;
        }
        optionsI18n.__root = composer;
        if (this === this.$root) {
          this.$i18n = mergeToGlobal(vuei18n, optionsI18n);
        } else {
          optionsI18n.__injectWithOption = true;
          optionsI18n.__extender = i18n2.__vueI18nExtend;
          this.$i18n = createVueI18n(optionsI18n);
          const _vueI18n = this.$i18n;
          if (_vueI18n.__extender) {
            _vueI18n.__disposer = _vueI18n.__extender(this.$i18n);
          }
        }
      } else if (options.__i18n) {
        if (this === this.$root) {
          this.$i18n = mergeToGlobal(vuei18n, options);
        } else {
          this.$i18n = createVueI18n({
            __i18n: options.__i18n,
            __injectWithOption: true,
            __extender: i18n2.__vueI18nExtend,
            __root: composer
          });
          const _vueI18n = this.$i18n;
          if (_vueI18n.__extender) {
            _vueI18n.__disposer = _vueI18n.__extender(this.$i18n);
          }
        }
      } else {
        this.$i18n = vuei18n;
      }
      if (options.__i18nGlobal) {
        adjustI18nResources(composer, options, options);
      }
      this.$t = (...args) => this.$i18n.t(...args);
      this.$rt = (...args) => this.$i18n.rt(...args);
      this.$tc = (...args) => this.$i18n.tc(...args);
      this.$te = (key, locale2) => this.$i18n.te(key, locale2);
      this.$d = (...args) => this.$i18n.d(...args);
      this.$n = (...args) => this.$i18n.n(...args);
      this.$tm = (key) => this.$i18n.tm(key);
      i18n2.__setInstance(instance, this.$i18n);
    },
    mounted() {
    },
    unmounted() {
      const instance = getCurrentInstance();
      if (!instance) {
        throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
      }
      const _vueI18n = this.$i18n;
      delete this.$t;
      delete this.$rt;
      delete this.$tc;
      delete this.$te;
      delete this.$d;
      delete this.$n;
      delete this.$tm;
      if (_vueI18n.__disposer) {
        _vueI18n.__disposer();
        delete _vueI18n.__disposer;
        delete _vueI18n.__extender;
      }
      i18n2.__deleteInstance(instance);
      delete this.$i18n;
    }
  };
}
function mergeToGlobal(g, options) {
  g.locale = options.locale || g.locale;
  g.fallbackLocale = options.fallbackLocale || g.fallbackLocale;
  g.missing = options.missing || g.missing;
  g.silentTranslationWarn = options.silentTranslationWarn || g.silentFallbackWarn;
  g.silentFallbackWarn = options.silentFallbackWarn || g.silentFallbackWarn;
  g.formatFallbackMessages = options.formatFallbackMessages || g.formatFallbackMessages;
  g.postTranslation = options.postTranslation || g.postTranslation;
  g.warnHtmlInMessage = options.warnHtmlInMessage || g.warnHtmlInMessage;
  g.escapeParameterHtml = options.escapeParameterHtml || g.escapeParameterHtml;
  g.sync = options.sync || g.sync;
  g.__composer[SetPluralRulesSymbol](options.pluralizationRules || g.pluralizationRules);
  const messages = getLocaleMessages(g.locale, {
    messages: options.messages,
    __i18n: options.__i18n
  });
  Object.keys(messages).forEach((locale2) => g.mergeLocaleMessage(locale2, messages[locale2]));
  if (options.datetimeFormats) {
    Object.keys(options.datetimeFormats).forEach((locale2) => g.mergeDateTimeFormat(locale2, options.datetimeFormats[locale2]));
  }
  if (options.numberFormats) {
    Object.keys(options.numberFormats).forEach((locale2) => g.mergeNumberFormat(locale2, options.numberFormats[locale2]));
  }
  return g;
}
const I18nInjectionKey = /* @__PURE__ */ makeSymbol("global-vue-i18n");
function createI18n(options = {}, VueI18nLegacy) {
  const __legacyMode = __VUE_I18N_LEGACY_API__ && isBoolean(options.legacy) ? options.legacy : __VUE_I18N_LEGACY_API__;
  const __globalInjection = isBoolean(options.globalInjection) ? options.globalInjection : true;
  const __allowComposition = __VUE_I18N_LEGACY_API__ && __legacyMode ? !!options.allowComposition : true;
  const __instances = /* @__PURE__ */ new Map();
  const [globalScope, __global] = createGlobal(options, __legacyMode);
  const symbol = /* @__PURE__ */ makeSymbol("");
  function __getInstance(component) {
    return __instances.get(component) || null;
  }
  function __setInstance(component, instance) {
    __instances.set(component, instance);
  }
  function __deleteInstance(component) {
    __instances.delete(component);
  }
  {
    const i18n2 = {
      // mode
      get mode() {
        return __VUE_I18N_LEGACY_API__ && __legacyMode ? "legacy" : "composition";
      },
      // allowComposition
      get allowComposition() {
        return __allowComposition;
      },
      // install plugin
      async install(app2, ...options2) {
        app2.__VUE_I18N_SYMBOL__ = symbol;
        app2.provide(app2.__VUE_I18N_SYMBOL__, i18n2);
        if (isPlainObject(options2[0])) {
          const opts = options2[0];
          i18n2.__composerExtend = opts.__composerExtend;
          i18n2.__vueI18nExtend = opts.__vueI18nExtend;
        }
        let globalReleaseHandler = null;
        if (!__legacyMode && __globalInjection) {
          globalReleaseHandler = injectGlobalFields(app2, i18n2.global);
        }
        if (__VUE_I18N_FULL_INSTALL__) {
          apply$2(app2, i18n2, ...options2);
        }
        if (__VUE_I18N_LEGACY_API__ && __legacyMode) {
          app2.mixin(defineMixin(__global, __global.__composer, i18n2));
        }
        const unmountApp = app2.unmount;
        app2.unmount = () => {
          globalReleaseHandler && globalReleaseHandler();
          i18n2.dispose();
          unmountApp();
        };
      },
      // global accessor
      get global() {
        return __global;
      },
      dispose() {
        globalScope.stop();
      },
      // @internal
      __instances,
      // @internal
      __getInstance,
      // @internal
      __setInstance,
      // @internal
      __deleteInstance
    };
    return i18n2;
  }
}
function useI18n(options = {}) {
  const instance = getCurrentInstance();
  if (instance == null) {
    throw createI18nError(I18nErrorCodes.MUST_BE_CALL_SETUP_TOP);
  }
  if (!instance.isCE && instance.appContext.app != null && !instance.appContext.app.__VUE_I18N_SYMBOL__) {
    throw createI18nError(I18nErrorCodes.NOT_INSTALLED);
  }
  const i18n2 = getI18nInstance(instance);
  const gl = getGlobalComposer(i18n2);
  const componentOptions = getComponentOptions(instance);
  const scope = getScope(options, componentOptions);
  if (__VUE_I18N_LEGACY_API__) {
    if (i18n2.mode === "legacy" && !options.__useComponent) {
      if (!i18n2.allowComposition) {
        throw createI18nError(I18nErrorCodes.NOT_AVAILABLE_IN_LEGACY_MODE);
      }
      return useI18nForLegacy(instance, scope, gl, options);
    }
  }
  if (scope === "global") {
    adjustI18nResources(gl, options, componentOptions);
    return gl;
  }
  if (scope === "parent") {
    let composer2 = getComposer(i18n2, instance, options.__useComponent);
    if (composer2 == null) {
      composer2 = gl;
    }
    return composer2;
  }
  const i18nInternal = i18n2;
  let composer = i18nInternal.__getInstance(instance);
  if (composer == null) {
    const composerOptions = assign$1({}, options);
    if ("__i18n" in componentOptions) {
      composerOptions.__i18n = componentOptions.__i18n;
    }
    if (gl) {
      composerOptions.__root = gl;
    }
    composer = createComposer(composerOptions);
    if (i18nInternal.__composerExtend) {
      composer[DisposeSymbol] = i18nInternal.__composerExtend(composer);
    }
    setupLifeCycle(i18nInternal, instance, composer);
    i18nInternal.__setInstance(instance, composer);
  }
  return composer;
}
function createGlobal(options, legacyMode, VueI18nLegacy) {
  const scope = effectScope();
  {
    const obj = __VUE_I18N_LEGACY_API__ && legacyMode ? scope.run(() => createVueI18n(options)) : scope.run(() => createComposer(options));
    if (obj == null) {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
    }
    return [scope, obj];
  }
}
function getI18nInstance(instance) {
  {
    const i18n2 = inject(!instance.isCE ? instance.appContext.app.__VUE_I18N_SYMBOL__ : I18nInjectionKey);
    if (!i18n2) {
      throw createI18nError(!instance.isCE ? I18nErrorCodes.UNEXPECTED_ERROR : I18nErrorCodes.NOT_INSTALLED_WITH_PROVIDE);
    }
    return i18n2;
  }
}
function getScope(options, componentOptions) {
  return isEmptyObject(options) ? "__i18n" in componentOptions ? "local" : "global" : !options.useScope ? "local" : options.useScope;
}
function getGlobalComposer(i18n2) {
  return i18n2.mode === "composition" ? i18n2.global : i18n2.global.__composer;
}
function getComposer(i18n2, target, useComponent = false) {
  let composer = null;
  const root = target.root;
  let current = getParentComponentInstance(target, useComponent);
  while (current != null) {
    const i18nInternal = i18n2;
    if (i18n2.mode === "composition") {
      composer = i18nInternal.__getInstance(current);
    } else {
      if (__VUE_I18N_LEGACY_API__) {
        const vueI18n = i18nInternal.__getInstance(current);
        if (vueI18n != null) {
          composer = vueI18n.__composer;
          if (useComponent && composer && !composer[InejctWithOptionSymbol]) {
            composer = null;
          }
        }
      }
    }
    if (composer != null) {
      break;
    }
    if (root === current) {
      break;
    }
    current = current.parent;
  }
  return composer;
}
function getParentComponentInstance(target, useComponent = false) {
  if (target == null) {
    return null;
  }
  {
    return !useComponent ? target.parent : target.vnode.ctx || target.parent;
  }
}
function setupLifeCycle(i18n2, target, composer) {
  {
    onMounted(() => {
    }, target);
    onUnmounted(() => {
      const _composer = composer;
      i18n2.__deleteInstance(target);
      const dispose = _composer[DisposeSymbol];
      if (dispose) {
        dispose();
        delete _composer[DisposeSymbol];
      }
    }, target);
  }
}
function useI18nForLegacy(instance, scope, root, options = {}) {
  const isLocalScope = scope === "local";
  const _composer = shallowRef(null);
  if (isLocalScope && instance.proxy && !(instance.proxy.$options.i18n || instance.proxy.$options.__i18n)) {
    throw createI18nError(I18nErrorCodes.MUST_DEFINE_I18N_OPTION_IN_ALLOW_COMPOSITION);
  }
  const _inheritLocale = isBoolean(options.inheritLocale) ? options.inheritLocale : !isString$1(options.locale);
  const _locale = ref(
      // prettier-ignore
      !isLocalScope || _inheritLocale ? root.locale.value : isString$1(options.locale) ? options.locale : DEFAULT_LOCALE
  );
  const _fallbackLocale = ref(
      // prettier-ignore
      !isLocalScope || _inheritLocale ? root.fallbackLocale.value : isString$1(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale.value
  );
  const _messages = ref(getLocaleMessages(_locale.value, options));
  const _datetimeFormats = ref(isPlainObject(options.datetimeFormats) ? options.datetimeFormats : { [_locale.value]: {} });
  const _numberFormats = ref(isPlainObject(options.numberFormats) ? options.numberFormats : { [_locale.value]: {} });
  const _missingWarn = isLocalScope ? root.missingWarn : isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
  const _fallbackWarn = isLocalScope ? root.fallbackWarn : isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
  const _fallbackRoot = isLocalScope ? root.fallbackRoot : isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
  const _fallbackFormat = !!options.fallbackFormat;
  const _missing = isFunction(options.missing) ? options.missing : null;
  const _postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
  const _warnHtmlMessage = isLocalScope ? root.warnHtmlMessage : isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
  const _escapeParameter = !!options.escapeParameter;
  const _modifiers = isLocalScope ? root.modifiers : isPlainObject(options.modifiers) ? options.modifiers : {};
  const _pluralRules = options.pluralRules || isLocalScope && root.pluralRules;
  function trackReactivityValues() {
    return [
      _locale.value,
      _fallbackLocale.value,
      _messages.value,
      _datetimeFormats.value,
      _numberFormats.value
    ];
  }
  const locale2 = computed({
    get: () => {
      return _composer.value ? _composer.value.locale.value : _locale.value;
    },
    set: (val) => {
      if (_composer.value) {
        _composer.value.locale.value = val;
      }
      _locale.value = val;
    }
  });
  const fallbackLocale = computed({
    get: () => {
      return _composer.value ? _composer.value.fallbackLocale.value : _fallbackLocale.value;
    },
    set: (val) => {
      if (_composer.value) {
        _composer.value.fallbackLocale.value = val;
      }
      _fallbackLocale.value = val;
    }
  });
  const messages = computed(() => {
    if (_composer.value) {
      return _composer.value.messages.value;
    } else {
      return _messages.value;
    }
  });
  const datetimeFormats = computed(() => _datetimeFormats.value);
  const numberFormats = computed(() => _numberFormats.value);
  function getPostTranslationHandler() {
    return _composer.value ? _composer.value.getPostTranslationHandler() : _postTranslation;
  }
  function setPostTranslationHandler(handler) {
    if (_composer.value) {
      _composer.value.setPostTranslationHandler(handler);
    }
  }
  function getMissingHandler() {
    return _composer.value ? _composer.value.getMissingHandler() : _missing;
  }
  function setMissingHandler(handler) {
    if (_composer.value) {
      _composer.value.setMissingHandler(handler);
    }
  }
  function warpWithDeps(fn) {
    trackReactivityValues();
    return fn();
  }
  function t4(...args) {
    return _composer.value ? warpWithDeps(() => Reflect.apply(_composer.value.t, null, [...args])) : warpWithDeps(() => "");
  }
  function rt(...args) {
    return _composer.value ? Reflect.apply(_composer.value.rt, null, [...args]) : "";
  }
  function d2(...args) {
    return _composer.value ? warpWithDeps(() => Reflect.apply(_composer.value.d, null, [...args])) : warpWithDeps(() => "");
  }
  function n2(...args) {
    return _composer.value ? warpWithDeps(() => Reflect.apply(_composer.value.n, null, [...args])) : warpWithDeps(() => "");
  }
  function tm(key) {
    return _composer.value ? _composer.value.tm(key) : {};
  }
  function te(key, locale22) {
    return _composer.value ? _composer.value.te(key, locale22) : false;
  }
  function getLocaleMessage(locale22) {
    return _composer.value ? _composer.value.getLocaleMessage(locale22) : {};
  }
  function setLocaleMessage(locale22, message2) {
    if (_composer.value) {
      _composer.value.setLocaleMessage(locale22, message2);
      _messages.value[locale22] = message2;
    }
  }
  function mergeLocaleMessage(locale22, message2) {
    if (_composer.value) {
      _composer.value.mergeLocaleMessage(locale22, message2);
    }
  }
  function getDateTimeFormat(locale22) {
    return _composer.value ? _composer.value.getDateTimeFormat(locale22) : {};
  }
  function setDateTimeFormat(locale22, format2) {
    if (_composer.value) {
      _composer.value.setDateTimeFormat(locale22, format2);
      _datetimeFormats.value[locale22] = format2;
    }
  }
  function mergeDateTimeFormat(locale22, format2) {
    if (_composer.value) {
      _composer.value.mergeDateTimeFormat(locale22, format2);
    }
  }
  function getNumberFormat(locale22) {
    return _composer.value ? _composer.value.getNumberFormat(locale22) : {};
  }
  function setNumberFormat(locale22, format2) {
    if (_composer.value) {
      _composer.value.setNumberFormat(locale22, format2);
      _numberFormats.value[locale22] = format2;
    }
  }
  function mergeNumberFormat(locale22, format2) {
    if (_composer.value) {
      _composer.value.mergeNumberFormat(locale22, format2);
    }
  }
  const wrapper = {
    get id() {
      return _composer.value ? _composer.value.id : -1;
    },
    locale: locale2,
    fallbackLocale,
    messages,
    datetimeFormats,
    numberFormats,
    get inheritLocale() {
      return _composer.value ? _composer.value.inheritLocale : _inheritLocale;
    },
    set inheritLocale(val) {
      if (_composer.value) {
        _composer.value.inheritLocale = val;
      }
    },
    get availableLocales() {
      return _composer.value ? _composer.value.availableLocales : Object.keys(_messages.value);
    },
    get modifiers() {
      return _composer.value ? _composer.value.modifiers : _modifiers;
    },
    get pluralRules() {
      return _composer.value ? _composer.value.pluralRules : _pluralRules;
    },
    get isGlobal() {
      return _composer.value ? _composer.value.isGlobal : false;
    },
    get missingWarn() {
      return _composer.value ? _composer.value.missingWarn : _missingWarn;
    },
    set missingWarn(val) {
      if (_composer.value) {
        _composer.value.missingWarn = val;
      }
    },
    get fallbackWarn() {
      return _composer.value ? _composer.value.fallbackWarn : _fallbackWarn;
    },
    set fallbackWarn(val) {
      if (_composer.value) {
        _composer.value.missingWarn = val;
      }
    },
    get fallbackRoot() {
      return _composer.value ? _composer.value.fallbackRoot : _fallbackRoot;
    },
    set fallbackRoot(val) {
      if (_composer.value) {
        _composer.value.fallbackRoot = val;
      }
    },
    get fallbackFormat() {
      return _composer.value ? _composer.value.fallbackFormat : _fallbackFormat;
    },
    set fallbackFormat(val) {
      if (_composer.value) {
        _composer.value.fallbackFormat = val;
      }
    },
    get warnHtmlMessage() {
      return _composer.value ? _composer.value.warnHtmlMessage : _warnHtmlMessage;
    },
    set warnHtmlMessage(val) {
      if (_composer.value) {
        _composer.value.warnHtmlMessage = val;
      }
    },
    get escapeParameter() {
      return _composer.value ? _composer.value.escapeParameter : _escapeParameter;
    },
    set escapeParameter(val) {
      if (_composer.value) {
        _composer.value.escapeParameter = val;
      }
    },
    t: t4,
    getPostTranslationHandler,
    setPostTranslationHandler,
    getMissingHandler,
    setMissingHandler,
    rt,
    d: d2,
    n: n2,
    tm,
    te,
    getLocaleMessage,
    setLocaleMessage,
    mergeLocaleMessage,
    getDateTimeFormat,
    setDateTimeFormat,
    mergeDateTimeFormat,
    getNumberFormat,
    setNumberFormat,
    mergeNumberFormat
  };
  function sync(composer) {
    composer.locale.value = _locale.value;
    composer.fallbackLocale.value = _fallbackLocale.value;
    Object.keys(_messages.value).forEach((locale22) => {
      composer.mergeLocaleMessage(locale22, _messages.value[locale22]);
    });
    Object.keys(_datetimeFormats.value).forEach((locale22) => {
      composer.mergeDateTimeFormat(locale22, _datetimeFormats.value[locale22]);
    });
    Object.keys(_numberFormats.value).forEach((locale22) => {
      composer.mergeNumberFormat(locale22, _numberFormats.value[locale22]);
    });
    composer.escapeParameter = _escapeParameter;
    composer.fallbackFormat = _fallbackFormat;
    composer.fallbackRoot = _fallbackRoot;
    composer.fallbackWarn = _fallbackWarn;
    composer.missingWarn = _missingWarn;
    composer.warnHtmlMessage = _warnHtmlMessage;
  }
  onBeforeMount(() => {
    if (instance.proxy == null || instance.proxy.$i18n == null) {
      throw createI18nError(I18nErrorCodes.NOT_AVAILABLE_COMPOSITION_IN_LEGACY);
    }
    const composer = _composer.value = instance.proxy.$i18n.__composer;
    if (scope === "global") {
      _locale.value = composer.locale.value;
      _fallbackLocale.value = composer.fallbackLocale.value;
      _messages.value = composer.messages.value;
      _datetimeFormats.value = composer.datetimeFormats.value;
      _numberFormats.value = composer.numberFormats.value;
    } else if (isLocalScope) {
      sync(composer);
    }
  });
  return wrapper;
}
const globalExportProps = [
  "locale",
  "fallbackLocale",
  "availableLocales"
];
const globalExportMethods = ["t", "rt", "d", "n", "tm", "te"];
function injectGlobalFields(app2, composer) {
  const i18n2 = /* @__PURE__ */ Object.create(null);
  globalExportProps.forEach((prop) => {
    const desc = Object.getOwnPropertyDescriptor(composer, prop);
    if (!desc) {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
    }
    const wrap = isRef(desc.value) ? {
      get() {
        return desc.value.value;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set(val) {
        desc.value.value = val;
      }
    } : {
      get() {
        return desc.get && desc.get();
      }
    };
    Object.defineProperty(i18n2, prop, wrap);
  });
  app2.config.globalProperties.$i18n = i18n2;
  globalExportMethods.forEach((method) => {
    const desc = Object.getOwnPropertyDescriptor(composer, method);
    if (!desc || !desc.value) {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
    }
    Object.defineProperty(app2.config.globalProperties, `$${method}`, desc);
  });
  const dispose = () => {
    delete app2.config.globalProperties.$i18n;
    globalExportMethods.forEach((method) => {
      delete app2.config.globalProperties[`$${method}`];
    });
  };
  return dispose;
}
{
  initFeatureFlags();
}
if (__INTLIFY_JIT_COMPILATION__) {
  registerMessageCompiler(compile);
} else {
  registerMessageCompiler(compileToFunction);
}
registerMessageResolver(resolveValue);
registerLocaleFallbacker(fallbackWithLocaleChain);
if (__INTLIFY_PROD_DEVTOOLS__) {
  const target = getGlobalThis();
  target.__INTLIFY__ = true;
  setDevToolsHook(target.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__);
}
function fixLocale(locale2) {
  locale2 = locale2.toLowerCase();
  if (locale2.startsWith("zh")) return "zh";
  return "en";
}
const locale = fixLocale(localStorage.getItem("locale") || navigator.language || "en");
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = {
  randomUUID
};
function v4(options, buf, offset) {
  if (native.randomUUID && !buf && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return unsafeStringify(rnds);
}
var int32 = new Int32Array(1);
new Float32Array(int32.buffer);
var UZIP = { exports: {} };
(function(module) {
  var UZIP2 = {};
  module.exports = UZIP2;
  UZIP2["parse"] = function(buf, onlyNames) {
    var rUs = UZIP2.bin.readUshort, rUi = UZIP2.bin.readUint, o2 = 0, out = {};
    var data = new Uint8Array(buf);
    var eocd = data.length - 4;
    while (rUi(data, eocd) != 101010256) eocd--;
    var o2 = eocd;
    o2 += 4;
    o2 += 4;
    var cnu = rUs(data, o2);
    o2 += 2;
    rUs(data, o2);
    o2 += 2;
    var csize = rUi(data, o2);
    o2 += 4;
    var coffs = rUi(data, o2);
    o2 += 4;
    o2 = coffs;
    for (var i = 0; i < cnu; i++) {
      rUi(data, o2);
      o2 += 4;
      o2 += 4;
      o2 += 4;
      o2 += 4;
      rUi(data, o2);
      o2 += 4;
      var csize = rUi(data, o2);
      o2 += 4;
      var usize = rUi(data, o2);
      o2 += 4;
      var nl = rUs(data, o2), el = rUs(data, o2 + 2), cl = rUs(data, o2 + 4);
      o2 += 6;
      o2 += 8;
      var roff = rUi(data, o2);
      o2 += 4;
      o2 += nl + el + cl;
      UZIP2._readLocal(data, roff, out, csize, usize, onlyNames);
    }
    return out;
  };
  UZIP2._readLocal = function(data, o2, out, csize, usize, onlyNames) {
    var rUs = UZIP2.bin.readUshort, rUi = UZIP2.bin.readUint;
    rUi(data, o2);
    o2 += 4;
    rUs(data, o2);
    o2 += 2;
    rUs(data, o2);
    o2 += 2;
    var cmpr = rUs(data, o2);
    o2 += 2;
    rUi(data, o2);
    o2 += 4;
    rUi(data, o2);
    o2 += 4;
    o2 += 8;
    var nlen = rUs(data, o2);
    o2 += 2;
    var elen = rUs(data, o2);
    o2 += 2;
    var name = UZIP2.bin.readUTF8(data, o2, nlen);
    o2 += nlen;
    o2 += elen;
    if (onlyNames) {
      out[name] = { size: usize, csize };
      return;
    }
    var file = new Uint8Array(data.buffer, o2);
    if (cmpr == 0) out[name] = new Uint8Array(file.buffer.slice(o2, o2 + csize));
    else if (cmpr == 8) {
      var buf = new Uint8Array(usize);
      UZIP2.inflateRaw(file, buf);
      out[name] = buf;
    } else throw "unknown compression method: " + cmpr;
  };
  UZIP2.inflateRaw = function(file, buf) {
    return UZIP2.F.inflate(file, buf);
  };
  UZIP2.inflate = function(file, buf) {
    file[0];
    file[1];
    return UZIP2.inflateRaw(new Uint8Array(file.buffer, file.byteOffset + 2, file.length - 6), buf);
  };
  UZIP2.deflate = function(data, opts) {
    if (opts == null) opts = { level: 6 };
    var off = 0, buf = new Uint8Array(50 + Math.floor(data.length * 1.1));
    buf[off] = 120;
    buf[off + 1] = 156;
    off += 2;
    off = UZIP2.F.deflateRaw(data, buf, off, opts.level);
    var crc = UZIP2.adler(data, 0, data.length);
    buf[off + 0] = crc >>> 24 & 255;
    buf[off + 1] = crc >>> 16 & 255;
    buf[off + 2] = crc >>> 8 & 255;
    buf[off + 3] = crc >>> 0 & 255;
    return new Uint8Array(buf.buffer, 0, off + 4);
  };
  UZIP2.deflateRaw = function(data, opts) {
    if (opts == null) opts = { level: 6 };
    var buf = new Uint8Array(50 + Math.floor(data.length * 1.1));
    var off = UZIP2.F.deflateRaw(data, buf, off, opts.level);
    return new Uint8Array(buf.buffer, 0, off);
  };
  UZIP2.encode = function(obj, noCmpr) {
    if (noCmpr == null) noCmpr = false;
    var tot = 0, wUi = UZIP2.bin.writeUint, wUs = UZIP2.bin.writeUshort;
    var zpd = {};
    for (var p2 in obj) {
      var cpr = !UZIP2._noNeed(p2) && !noCmpr, buf = obj[p2], crc = UZIP2.crc.crc(buf, 0, buf.length);
      zpd[p2] = { cpr, usize: buf.length, crc, file: cpr ? UZIP2.deflateRaw(buf) : buf };
    }
    for (var p2 in zpd) tot += zpd[p2].file.length + 30 + 46 + 2 * UZIP2.bin.sizeUTF8(p2);
    tot += 22;
    var data = new Uint8Array(tot), o2 = 0;
    var fof = [];
    for (var p2 in zpd) {
      var file = zpd[p2];
      fof.push(o2);
      o2 = UZIP2._writeHeader(data, o2, p2, file, 0);
    }
    var i = 0, ioff = o2;
    for (var p2 in zpd) {
      var file = zpd[p2];
      fof.push(o2);
      o2 = UZIP2._writeHeader(data, o2, p2, file, 1, fof[i++]);
    }
    var csize = o2 - ioff;
    wUi(data, o2, 101010256);
    o2 += 4;
    o2 += 4;
    wUs(data, o2, i);
    o2 += 2;
    wUs(data, o2, i);
    o2 += 2;
    wUi(data, o2, csize);
    o2 += 4;
    wUi(data, o2, ioff);
    o2 += 4;
    o2 += 2;
    return data.buffer;
  };
  UZIP2._noNeed = function(fn) {
    var ext = fn.split(".").pop().toLowerCase();
    return "png,jpg,jpeg,zip".indexOf(ext) != -1;
  };
  UZIP2._writeHeader = function(data, o2, p2, obj, t4, roff) {
    var wUi = UZIP2.bin.writeUint, wUs = UZIP2.bin.writeUshort;
    var file = obj.file;
    wUi(data, o2, t4 == 0 ? 67324752 : 33639248);
    o2 += 4;
    if (t4 == 1) o2 += 2;
    wUs(data, o2, 20);
    o2 += 2;
    wUs(data, o2, 0);
    o2 += 2;
    wUs(data, o2, obj.cpr ? 8 : 0);
    o2 += 2;
    wUi(data, o2, 0);
    o2 += 4;
    wUi(data, o2, obj.crc);
    o2 += 4;
    wUi(data, o2, file.length);
    o2 += 4;
    wUi(data, o2, obj.usize);
    o2 += 4;
    wUs(data, o2, UZIP2.bin.sizeUTF8(p2));
    o2 += 2;
    wUs(data, o2, 0);
    o2 += 2;
    if (t4 == 1) {
      o2 += 2;
      o2 += 2;
      o2 += 6;
      wUi(data, o2, roff);
      o2 += 4;
    }
    var nlen = UZIP2.bin.writeUTF8(data, o2, p2);
    o2 += nlen;
    if (t4 == 0) {
      data.set(file, o2);
      o2 += file.length;
    }
    return o2;
  };
  UZIP2.crc = {
    table: function() {
      var tab = new Uint32Array(256);
      for (var n2 = 0; n2 < 256; n2++) {
        var c2 = n2;
        for (var k2 = 0; k2 < 8; k2++) {
          if (c2 & 1) c2 = 3988292384 ^ c2 >>> 1;
          else c2 = c2 >>> 1;
        }
        tab[n2] = c2;
      }
      return tab;
    }(),
    update: function(c2, buf, off, len) {
      for (var i = 0; i < len; i++) c2 = UZIP2.crc.table[(c2 ^ buf[off + i]) & 255] ^ c2 >>> 8;
      return c2;
    },
    crc: function(b2, o2, l2) {
      return UZIP2.crc.update(4294967295, b2, o2, l2) ^ 4294967295;
    }
  };
  UZIP2.adler = function(data, o2, len) {
    var a2 = 1, b2 = 0;
    var off = o2, end2 = o2 + len;
    while (off < end2) {
      var eend = Math.min(off + 5552, end2);
      while (off < eend) {
        a2 += data[off++];
        b2 += a2;
      }
      a2 = a2 % 65521;
      b2 = b2 % 65521;
    }
    return b2 << 16 | a2;
  };
  UZIP2.bin = {
    readUshort: function(buff, p2) {
      return buff[p2] | buff[p2 + 1] << 8;
    },
    writeUshort: function(buff, p2, n2) {
      buff[p2] = n2 & 255;
      buff[p2 + 1] = n2 >> 8 & 255;
    },
    readUint: function(buff, p2) {
      return buff[p2 + 3] * (256 * 256 * 256) + (buff[p2 + 2] << 16 | buff[p2 + 1] << 8 | buff[p2]);
    },
    writeUint: function(buff, p2, n2) {
      buff[p2] = n2 & 255;
      buff[p2 + 1] = n2 >> 8 & 255;
      buff[p2 + 2] = n2 >> 16 & 255;
      buff[p2 + 3] = n2 >> 24 & 255;
    },
    readASCII: function(buff, p2, l2) {
      var s = "";
      for (var i = 0; i < l2; i++) s += String.fromCharCode(buff[p2 + i]);
      return s;
    },
    writeASCII: function(data, p2, s) {
      for (var i = 0; i < s.length; i++) data[p2 + i] = s.charCodeAt(i);
    },
    pad: function(n2) {
      return n2.length < 2 ? "0" + n2 : n2;
    },
    readUTF8: function(buff, p2, l2) {
      var s = "", ns;
      for (var i = 0; i < l2; i++) s += "%" + UZIP2.bin.pad(buff[p2 + i].toString(16));
      try {
        ns = decodeURIComponent(s);
      } catch (e) {
        return UZIP2.bin.readASCII(buff, p2, l2);
      }
      return ns;
    },
    writeUTF8: function(buff, p2, str) {
      var strl = str.length, i = 0;
      for (var ci = 0; ci < strl; ci++) {
        var code2 = str.charCodeAt(ci);
        if ((code2 & 4294967295 - (1 << 7) + 1) == 0) {
          buff[p2 + i] = code2;
          i++;
        } else if ((code2 & 4294967295 - (1 << 11) + 1) == 0) {
          buff[p2 + i] = 192 | code2 >> 6;
          buff[p2 + i + 1] = 128 | code2 >> 0 & 63;
          i += 2;
        } else if ((code2 & 4294967295 - (1 << 16) + 1) == 0) {
          buff[p2 + i] = 224 | code2 >> 12;
          buff[p2 + i + 1] = 128 | code2 >> 6 & 63;
          buff[p2 + i + 2] = 128 | code2 >> 0 & 63;
          i += 3;
        } else if ((code2 & 4294967295 - (1 << 21) + 1) == 0) {
          buff[p2 + i] = 240 | code2 >> 18;
          buff[p2 + i + 1] = 128 | code2 >> 12 & 63;
          buff[p2 + i + 2] = 128 | code2 >> 6 & 63;
          buff[p2 + i + 3] = 128 | code2 >> 0 & 63;
          i += 4;
        } else throw "e";
      }
      return i;
    },
    sizeUTF8: function(str) {
      var strl = str.length, i = 0;
      for (var ci = 0; ci < strl; ci++) {
        var code2 = str.charCodeAt(ci);
        if ((code2 & 4294967295 - (1 << 7) + 1) == 0) {
          i++;
        } else if ((code2 & 4294967295 - (1 << 11) + 1) == 0) {
          i += 2;
        } else if ((code2 & 4294967295 - (1 << 16) + 1) == 0) {
          i += 3;
        } else if ((code2 & 4294967295 - (1 << 21) + 1) == 0) {
          i += 4;
        } else throw "e";
      }
      return i;
    }
  };
  UZIP2.F = {};
  UZIP2.F.deflateRaw = function(data, out, opos, lvl) {
    var opts = [
      /*
      	 ush good_length; /* reduce lazy search above this match length
      	 ush max_lazy;    /* do not perform lazy search above this match length
              ush nice_length; /* quit search above this match length
      */
      /*      good lazy nice chain */
      /* 0 */
      [0, 0, 0, 0, 0],
      /* store only */
      /* 1 */
      [4, 4, 8, 4, 0],
      /* max speed, no lazy matches */
      /* 2 */
      [4, 5, 16, 8, 0],
      /* 3 */
      [4, 6, 16, 16, 0],
      /* 4 */
      [4, 10, 16, 32, 0],
      /* lazy matches */
      /* 5 */
      [8, 16, 32, 32, 0],
      /* 6 */
      [8, 16, 128, 128, 0],
      /* 7 */
      [8, 32, 128, 256, 0],
      /* 8 */
      [32, 128, 258, 1024, 1],
      /* 9 */
      [32, 258, 258, 4096, 1]
    ];
    var opt = opts[lvl];
    var U2 = UZIP2.F.U, goodIndex = UZIP2.F._goodIndex;
    UZIP2.F._hash;
    var putsE = UZIP2.F._putsE;
    var i = 0, pos = opos << 3, cvrd = 0, dlen = data.length;
    if (lvl == 0) {
      while (i < dlen) {
        var len = Math.min(65535, dlen - i);
        putsE(out, pos, i + len == dlen ? 1 : 0);
        pos = UZIP2.F._copyExact(data, i, len, out, pos + 8);
        i += len;
      }
      return pos >>> 3;
    }
    var lits = U2.lits, strt = U2.strt, prev = U2.prev, li = 0, lc = 0, bs = 0, ebits = 0, c2 = 0, nc = 0;
    if (dlen > 2) {
      nc = UZIP2.F._hash(data, 0);
      strt[nc] = 0;
    }
    for (i = 0; i < dlen; i++) {
      c2 = nc;
      if (i + 1 < dlen - 2) {
        nc = UZIP2.F._hash(data, i + 1);
        var ii2 = i + 1 & 32767;
        prev[ii2] = strt[nc];
        strt[nc] = ii2;
      }
      if (cvrd <= i) {
        if ((li > 14e3 || lc > 26697) && dlen - i > 100) {
          if (cvrd < i) {
            lits[li] = i - cvrd;
            li += 2;
            cvrd = i;
          }
          pos = UZIP2.F._writeBlock(i == dlen - 1 || cvrd == dlen ? 1 : 0, lits, li, ebits, data, bs, i - bs, out, pos);
          li = lc = ebits = 0;
          bs = i;
        }
        var mch = 0;
        if (i < dlen - 2) mch = UZIP2.F._bestMatch(data, i, prev, c2, Math.min(opt[2], dlen - i), opt[3]);
        var len = mch >>> 16, dst = mch & 65535;
        if (mch != 0) {
          var len = mch >>> 16, dst = mch & 65535;
          var lgi = goodIndex(len, U2.of0);
          U2.lhst[257 + lgi]++;
          var dgi = goodIndex(dst, U2.df0);
          U2.dhst[dgi]++;
          ebits += U2.exb[lgi] + U2.dxb[dgi];
          lits[li] = len << 23 | i - cvrd;
          lits[li + 1] = dst << 16 | lgi << 8 | dgi;
          li += 2;
          cvrd = i + len;
        } else {
          U2.lhst[data[i]]++;
        }
        lc++;
      }
    }
    if (bs != i || data.length == 0) {
      if (cvrd < i) {
        lits[li] = i - cvrd;
        li += 2;
        cvrd = i;
      }
      pos = UZIP2.F._writeBlock(1, lits, li, ebits, data, bs, i - bs, out, pos);
      li = 0;
      lc = 0;
      li = lc = ebits = 0;
      bs = i;
    }
    while ((pos & 7) != 0) pos++;
    return pos >>> 3;
  };
  UZIP2.F._bestMatch = function(data, i, prev, c2, nice, chain) {
    var ci = i & 32767, pi2 = prev[ci];
    var dif = ci - pi2 + (1 << 15) & 32767;
    if (pi2 == ci || c2 != UZIP2.F._hash(data, i - dif)) return 0;
    var tl = 0, td = 0;
    var dlim = Math.min(32767, i);
    while (dif <= dlim && --chain != 0 && pi2 != ci) {
      if (tl == 0 || data[i + tl] == data[i + tl - dif]) {
        var cl = UZIP2.F._howLong(data, i, dif);
        if (cl > tl) {
          tl = cl;
          td = dif;
          if (tl >= nice) break;
          if (dif + 2 < cl) cl = dif + 2;
          var maxd = 0;
          for (var j = 0; j < cl - 2; j++) {
            var ei2 = i - dif + j + (1 << 15) & 32767;
            var li = prev[ei2];
            var curd = ei2 - li + (1 << 15) & 32767;
            if (curd > maxd) {
              maxd = curd;
              pi2 = ei2;
            }
          }
        }
      }
      ci = pi2;
      pi2 = prev[ci];
      dif += ci - pi2 + (1 << 15) & 32767;
    }
    return tl << 16 | td;
  };
  UZIP2.F._howLong = function(data, i, dif) {
    if (data[i] != data[i - dif] || data[i + 1] != data[i + 1 - dif] || data[i + 2] != data[i + 2 - dif]) return 0;
    var oi2 = i, l2 = Math.min(data.length, i + 258);
    i += 3;
    while (i < l2 && data[i] == data[i - dif]) i++;
    return i - oi2;
  };
  UZIP2.F._hash = function(data, i) {
    return (data[i] << 8 | data[i + 1]) + (data[i + 2] << 4) & 65535;
  };
  UZIP2.saved = 0;
  UZIP2.F._writeBlock = function(BFINAL, lits, li, ebits, data, o0, l0, out, pos) {
    var U2 = UZIP2.F.U, putsF = UZIP2.F._putsF, putsE = UZIP2.F._putsE;
    var T2, ML, MD, MH, numl, numd, numh, lset, dset;
    U2.lhst[256]++;
    T2 = UZIP2.F.getTrees();
    ML = T2[0];
    MD = T2[1];
    MH = T2[2];
    numl = T2[3];
    numd = T2[4];
    numh = T2[5];
    lset = T2[6];
    dset = T2[7];
    var cstSize = ((pos + 3 & 7) == 0 ? 0 : 8 - (pos + 3 & 7)) + 32 + (l0 << 3);
    var fxdSize = ebits + UZIP2.F.contSize(U2.fltree, U2.lhst) + UZIP2.F.contSize(U2.fdtree, U2.dhst);
    var dynSize = ebits + UZIP2.F.contSize(U2.ltree, U2.lhst) + UZIP2.F.contSize(U2.dtree, U2.dhst);
    dynSize += 14 + 3 * numh + UZIP2.F.contSize(U2.itree, U2.ihst) + (U2.ihst[16] * 2 + U2.ihst[17] * 3 + U2.ihst[18] * 7);
    for (var j = 0; j < 286; j++) U2.lhst[j] = 0;
    for (var j = 0; j < 30; j++) U2.dhst[j] = 0;
    for (var j = 0; j < 19; j++) U2.ihst[j] = 0;
    var BTYPE = cstSize < fxdSize && cstSize < dynSize ? 0 : fxdSize < dynSize ? 1 : 2;
    putsF(out, pos, BFINAL);
    putsF(out, pos + 1, BTYPE);
    pos += 3;
    if (BTYPE == 0) {
      while ((pos & 7) != 0) pos++;
      pos = UZIP2.F._copyExact(data, o0, l0, out, pos);
    } else {
      var ltree, dtree;
      if (BTYPE == 1) {
        ltree = U2.fltree;
        dtree = U2.fdtree;
      }
      if (BTYPE == 2) {
        UZIP2.F.makeCodes(U2.ltree, ML);
        UZIP2.F.revCodes(U2.ltree, ML);
        UZIP2.F.makeCodes(U2.dtree, MD);
        UZIP2.F.revCodes(U2.dtree, MD);
        UZIP2.F.makeCodes(U2.itree, MH);
        UZIP2.F.revCodes(U2.itree, MH);
        ltree = U2.ltree;
        dtree = U2.dtree;
        putsE(out, pos, numl - 257);
        pos += 5;
        putsE(out, pos, numd - 1);
        pos += 5;
        putsE(out, pos, numh - 4);
        pos += 4;
        for (var i = 0; i < numh; i++) putsE(out, pos + i * 3, U2.itree[(U2.ordr[i] << 1) + 1]);
        pos += 3 * numh;
        pos = UZIP2.F._codeTiny(lset, U2.itree, out, pos);
        pos = UZIP2.F._codeTiny(dset, U2.itree, out, pos);
      }
      var off = o0;
      for (var si2 = 0; si2 < li; si2 += 2) {
        var qb = lits[si2], len = qb >>> 23, end2 = off + (qb & (1 << 23) - 1);
        while (off < end2) pos = UZIP2.F._writeLit(data[off++], ltree, out, pos);
        if (len != 0) {
          var qc = lits[si2 + 1], dst = qc >> 16, lgi = qc >> 8 & 255, dgi = qc & 255;
          pos = UZIP2.F._writeLit(257 + lgi, ltree, out, pos);
          putsE(out, pos, len - U2.of0[lgi]);
          pos += U2.exb[lgi];
          pos = UZIP2.F._writeLit(dgi, dtree, out, pos);
          putsF(out, pos, dst - U2.df0[dgi]);
          pos += U2.dxb[dgi];
          off += len;
        }
      }
      pos = UZIP2.F._writeLit(256, ltree, out, pos);
    }
    return pos;
  };
  UZIP2.F._copyExact = function(data, off, len, out, pos) {
    var p8 = pos >>> 3;
    out[p8] = len;
    out[p8 + 1] = len >>> 8;
    out[p8 + 2] = 255 - out[p8];
    out[p8 + 3] = 255 - out[p8 + 1];
    p8 += 4;
    out.set(new Uint8Array(data.buffer, off, len), p8);
    return pos + (len + 4 << 3);
  };
  UZIP2.F.getTrees = function() {
    var U2 = UZIP2.F.U;
    var ML = UZIP2.F._hufTree(U2.lhst, U2.ltree, 15);
    var MD = UZIP2.F._hufTree(U2.dhst, U2.dtree, 15);
    var lset = [], numl = UZIP2.F._lenCodes(U2.ltree, lset);
    var dset = [], numd = UZIP2.F._lenCodes(U2.dtree, dset);
    for (var i = 0; i < lset.length; i += 2) U2.ihst[lset[i]]++;
    for (var i = 0; i < dset.length; i += 2) U2.ihst[dset[i]]++;
    var MH = UZIP2.F._hufTree(U2.ihst, U2.itree, 7);
    var numh = 19;
    while (numh > 4 && U2.itree[(U2.ordr[numh - 1] << 1) + 1] == 0) numh--;
    return [ML, MD, MH, numl, numd, numh, lset, dset];
  };
  UZIP2.F.getSecond = function(a2) {
    var b2 = [];
    for (var i = 0; i < a2.length; i += 2) b2.push(a2[i + 1]);
    return b2;
  };
  UZIP2.F.nonZero = function(a2) {
    var b2 = "";
    for (var i = 0; i < a2.length; i += 2) if (a2[i + 1] != 0) b2 += (i >> 1) + ",";
    return b2;
  };
  UZIP2.F.contSize = function(tree, hst) {
    var s = 0;
    for (var i = 0; i < hst.length; i++) s += hst[i] * tree[(i << 1) + 1];
    return s;
  };
  UZIP2.F._codeTiny = function(set2, tree, out, pos) {
    for (var i = 0; i < set2.length; i += 2) {
      var l2 = set2[i], rst = set2[i + 1];
      pos = UZIP2.F._writeLit(l2, tree, out, pos);
      var rsl = l2 == 16 ? 2 : l2 == 17 ? 3 : 7;
      if (l2 > 15) {
        UZIP2.F._putsE(out, pos, rst, rsl);
        pos += rsl;
      }
    }
    return pos;
  };
  UZIP2.F._lenCodes = function(tree, set2) {
    var len = tree.length;
    while (len != 2 && tree[len - 1] == 0) len -= 2;
    for (var i = 0; i < len; i += 2) {
      var l2 = tree[i + 1], nxt = i + 3 < len ? tree[i + 3] : -1, nnxt = i + 5 < len ? tree[i + 5] : -1, prv = i == 0 ? -1 : tree[i - 1];
      if (l2 == 0 && nxt == l2 && nnxt == l2) {
        var lz = i + 5;
        while (lz + 2 < len && tree[lz + 2] == l2) lz += 2;
        var zc = Math.min(lz + 1 - i >>> 1, 138);
        if (zc < 11) set2.push(17, zc - 3);
        else set2.push(18, zc - 11);
        i += zc * 2 - 2;
      } else if (l2 == prv && nxt == l2 && nnxt == l2) {
        var lz = i + 5;
        while (lz + 2 < len && tree[lz + 2] == l2) lz += 2;
        var zc = Math.min(lz + 1 - i >>> 1, 6);
        set2.push(16, zc - 3);
        i += zc * 2 - 2;
      } else set2.push(l2, 0);
    }
    return len >>> 1;
  };
  UZIP2.F._hufTree = function(hst, tree, MAXL) {
    var list = [], hl = hst.length, tl = tree.length, i = 0;
    for (i = 0; i < tl; i += 2) {
      tree[i] = 0;
      tree[i + 1] = 0;
    }
    for (i = 0; i < hl; i++) if (hst[i] != 0) list.push({ lit: i, f: hst[i] });
    var end2 = list.length, l2 = list.slice(0);
    if (end2 == 0) return 0;
    if (end2 == 1) {
      var lit = list[0].lit, l2 = lit == 0 ? 1 : 0;
      tree[(lit << 1) + 1] = 1;
      tree[(l2 << 1) + 1] = 1;
      return 1;
    }
    list.sort(function(a3, b3) {
      return a3.f - b3.f;
    });
    var a2 = list[0], b2 = list[1], i0 = 0, i1 = 1, i2 = 2;
    list[0] = { lit: -1, f: a2.f + b2.f, l: a2, r: b2, d: 0 };
    while (i1 != end2 - 1) {
      if (i0 != i1 && (i2 == end2 || list[i0].f < list[i2].f)) {
        a2 = list[i0++];
      } else {
        a2 = list[i2++];
      }
      if (i0 != i1 && (i2 == end2 || list[i0].f < list[i2].f)) {
        b2 = list[i0++];
      } else {
        b2 = list[i2++];
      }
      list[i1++] = { lit: -1, f: a2.f + b2.f, l: a2, r: b2 };
    }
    var maxl = UZIP2.F.setDepth(list[i1 - 1], 0);
    if (maxl > MAXL) {
      UZIP2.F.restrictDepth(l2, MAXL, maxl);
      maxl = MAXL;
    }
    for (i = 0; i < end2; i++) tree[(l2[i].lit << 1) + 1] = l2[i].d;
    return maxl;
  };
  UZIP2.F.setDepth = function(t4, d2) {
    if (t4.lit != -1) {
      t4.d = d2;
      return d2;
    }
    return Math.max(UZIP2.F.setDepth(t4.l, d2 + 1), UZIP2.F.setDepth(t4.r, d2 + 1));
  };
  UZIP2.F.restrictDepth = function(dps, MD, maxl) {
    var i = 0, bCost = 1 << maxl - MD, dbt = 0;
    dps.sort(function(a2, b2) {
      return b2.d == a2.d ? a2.f - b2.f : b2.d - a2.d;
    });
    for (i = 0; i < dps.length; i++) if (dps[i].d > MD) {
      var od = dps[i].d;
      dps[i].d = MD;
      dbt += bCost - (1 << maxl - od);
    } else break;
    dbt = dbt >>> maxl - MD;
    while (dbt > 0) {
      var od = dps[i].d;
      if (od < MD) {
        dps[i].d++;
        dbt -= 1 << MD - od - 1;
      } else i++;
    }
    for (; i >= 0; i--) if (dps[i].d == MD && dbt < 0) {
      dps[i].d--;
      dbt++;
    }
    if (dbt != 0) console.log("debt left");
  };
  UZIP2.F._goodIndex = function(v2, arr) {
    var i = 0;
    if (arr[i | 16] <= v2) i |= 16;
    if (arr[i | 8] <= v2) i |= 8;
    if (arr[i | 4] <= v2) i |= 4;
    if (arr[i | 2] <= v2) i |= 2;
    if (arr[i | 1] <= v2) i |= 1;
    return i;
  };
  UZIP2.F._writeLit = function(ch, ltree, out, pos) {
    UZIP2.F._putsF(out, pos, ltree[ch << 1]);
    return pos + ltree[(ch << 1) + 1];
  };
  UZIP2.F.inflate = function(data, buf) {
    var u8 = Uint8Array;
    if (data[0] == 3 && data[1] == 0) return buf ? buf : new u8(0);
    var F2 = UZIP2.F, bitsF = F2._bitsF, bitsE = F2._bitsE, decodeTiny = F2._decodeTiny, makeCodes = F2.makeCodes, codes2map = F2.codes2map, get17 = F2._get17;
    var U2 = F2.U;
    var noBuf = buf == null;
    if (noBuf) buf = new u8(data.length >>> 2 << 3);
    var BFINAL = 0, BTYPE = 0, HLIT = 0, HDIST = 0, HCLEN = 0, ML = 0, MD = 0;
    var off = 0, pos = 0;
    var lmap, dmap;
    while (BFINAL == 0) {
      BFINAL = bitsF(data, pos, 1);
      BTYPE = bitsF(data, pos + 1, 2);
      pos += 3;
      if (BTYPE == 0) {
        if ((pos & 7) != 0) pos += 8 - (pos & 7);
        var p8 = (pos >>> 3) + 4, len = data[p8 - 4] | data[p8 - 3] << 8;
        if (noBuf) buf = UZIP2.F._check(buf, off + len);
        buf.set(new u8(data.buffer, data.byteOffset + p8, len), off);
        pos = p8 + len << 3;
        off += len;
        continue;
      }
      if (noBuf) buf = UZIP2.F._check(buf, off + (1 << 17));
      if (BTYPE == 1) {
        lmap = U2.flmap;
        dmap = U2.fdmap;
        ML = (1 << 9) - 1;
        MD = (1 << 5) - 1;
      }
      if (BTYPE == 2) {
        HLIT = bitsE(data, pos, 5) + 257;
        HDIST = bitsE(data, pos + 5, 5) + 1;
        HCLEN = bitsE(data, pos + 10, 4) + 4;
        pos += 14;
        for (var i = 0; i < 38; i += 2) {
          U2.itree[i] = 0;
          U2.itree[i + 1] = 0;
        }
        var tl = 1;
        for (var i = 0; i < HCLEN; i++) {
          var l2 = bitsE(data, pos + i * 3, 3);
          U2.itree[(U2.ordr[i] << 1) + 1] = l2;
          if (l2 > tl) tl = l2;
        }
        pos += 3 * HCLEN;
        makeCodes(U2.itree, tl);
        codes2map(U2.itree, tl, U2.imap);
        lmap = U2.lmap;
        dmap = U2.dmap;
        pos = decodeTiny(U2.imap, (1 << tl) - 1, HLIT + HDIST, data, pos, U2.ttree);
        var mx0 = F2._copyOut(U2.ttree, 0, HLIT, U2.ltree);
        ML = (1 << mx0) - 1;
        var mx1 = F2._copyOut(U2.ttree, HLIT, HDIST, U2.dtree);
        MD = (1 << mx1) - 1;
        makeCodes(U2.ltree, mx0);
        codes2map(U2.ltree, mx0, lmap);
        makeCodes(U2.dtree, mx1);
        codes2map(U2.dtree, mx1, dmap);
      }
      while (true) {
        var code2 = lmap[get17(data, pos) & ML];
        pos += code2 & 15;
        var lit = code2 >>> 4;
        if (lit >>> 8 == 0) {
          buf[off++] = lit;
        } else if (lit == 256) {
          break;
        } else {
          var end2 = off + lit - 254;
          if (lit > 264) {
            var ebs = U2.ldef[lit - 257];
            end2 = off + (ebs >>> 3) + bitsE(data, pos, ebs & 7);
            pos += ebs & 7;
          }
          var dcode = dmap[get17(data, pos) & MD];
          pos += dcode & 15;
          var dlit = dcode >>> 4;
          var dbs = U2.ddef[dlit], dst = (dbs >>> 4) + bitsF(data, pos, dbs & 15);
          pos += dbs & 15;
          if (noBuf) buf = UZIP2.F._check(buf, off + (1 << 17));
          while (off < end2) {
            buf[off] = buf[off++ - dst];
            buf[off] = buf[off++ - dst];
            buf[off] = buf[off++ - dst];
            buf[off] = buf[off++ - dst];
          }
          off = end2;
        }
      }
    }
    return buf.length == off ? buf : buf.slice(0, off);
  };
  UZIP2.F._check = function(buf, len) {
    var bl = buf.length;
    if (len <= bl) return buf;
    var nbuf = new Uint8Array(Math.max(bl << 1, len));
    nbuf.set(buf, 0);
    return nbuf;
  };
  UZIP2.F._decodeTiny = function(lmap, LL, len, data, pos, tree) {
    var bitsE = UZIP2.F._bitsE, get17 = UZIP2.F._get17;
    var i = 0;
    while (i < len) {
      var code2 = lmap[get17(data, pos) & LL];
      pos += code2 & 15;
      var lit = code2 >>> 4;
      if (lit <= 15) {
        tree[i] = lit;
        i++;
      } else {
        var ll = 0, n2 = 0;
        if (lit == 16) {
          n2 = 3 + bitsE(data, pos, 2);
          pos += 2;
          ll = tree[i - 1];
        } else if (lit == 17) {
          n2 = 3 + bitsE(data, pos, 3);
          pos += 3;
        } else if (lit == 18) {
          n2 = 11 + bitsE(data, pos, 7);
          pos += 7;
        }
        var ni2 = i + n2;
        while (i < ni2) {
          tree[i] = ll;
          i++;
        }
      }
    }
    return pos;
  };
  UZIP2.F._copyOut = function(src, off, len, tree) {
    var mx = 0, i = 0, tl = tree.length >>> 1;
    while (i < len) {
      var v2 = src[i + off];
      tree[i << 1] = 0;
      tree[(i << 1) + 1] = v2;
      if (v2 > mx) mx = v2;
      i++;
    }
    while (i < tl) {
      tree[i << 1] = 0;
      tree[(i << 1) + 1] = 0;
      i++;
    }
    return mx;
  };
  UZIP2.F.makeCodes = function(tree, MAX_BITS) {
    var U2 = UZIP2.F.U;
    var max_code = tree.length;
    var code2, bits, n2, i, len;
    var bl_count = U2.bl_count;
    for (var i = 0; i <= MAX_BITS; i++) bl_count[i] = 0;
    for (i = 1; i < max_code; i += 2) bl_count[tree[i]]++;
    var next_code = U2.next_code;
    code2 = 0;
    bl_count[0] = 0;
    for (bits = 1; bits <= MAX_BITS; bits++) {
      code2 = code2 + bl_count[bits - 1] << 1;
      next_code[bits] = code2;
    }
    for (n2 = 0; n2 < max_code; n2 += 2) {
      len = tree[n2 + 1];
      if (len != 0) {
        tree[n2] = next_code[len];
        next_code[len]++;
      }
    }
  };
  UZIP2.F.codes2map = function(tree, MAX_BITS, map) {
    var max_code = tree.length;
    var U2 = UZIP2.F.U, r15 = U2.rev15;
    for (var i = 0; i < max_code; i += 2) if (tree[i + 1] != 0) {
      var lit = i >> 1;
      var cl = tree[i + 1], val = lit << 4 | cl;
      var rest = MAX_BITS - cl, i0 = tree[i] << rest, i1 = i0 + (1 << rest);
      while (i0 != i1) {
        var p0 = r15[i0] >>> 15 - MAX_BITS;
        map[p0] = val;
        i0++;
      }
    }
  };
  UZIP2.F.revCodes = function(tree, MAX_BITS) {
    var r15 = UZIP2.F.U.rev15, imb = 15 - MAX_BITS;
    for (var i = 0; i < tree.length; i += 2) {
      var i0 = tree[i] << MAX_BITS - tree[i + 1];
      tree[i] = r15[i0] >>> imb;
    }
  };
  UZIP2.F._putsE = function(dt2, pos, val) {
    val = val << (pos & 7);
    var o2 = pos >>> 3;
    dt2[o2] |= val;
    dt2[o2 + 1] |= val >>> 8;
  };
  UZIP2.F._putsF = function(dt2, pos, val) {
    val = val << (pos & 7);
    var o2 = pos >>> 3;
    dt2[o2] |= val;
    dt2[o2 + 1] |= val >>> 8;
    dt2[o2 + 2] |= val >>> 16;
  };
  UZIP2.F._bitsE = function(dt2, pos, length) {
    return (dt2[pos >>> 3] | dt2[(pos >>> 3) + 1] << 8) >>> (pos & 7) & (1 << length) - 1;
  };
  UZIP2.F._bitsF = function(dt2, pos, length) {
    return (dt2[pos >>> 3] | dt2[(pos >>> 3) + 1] << 8 | dt2[(pos >>> 3) + 2] << 16) >>> (pos & 7) & (1 << length) - 1;
  };
  UZIP2.F._get17 = function(dt2, pos) {
    return (dt2[pos >>> 3] | dt2[(pos >>> 3) + 1] << 8 | dt2[(pos >>> 3) + 2] << 16) >>> (pos & 7);
  };
  UZIP2.F._get25 = function(dt2, pos) {
    return (dt2[pos >>> 3] | dt2[(pos >>> 3) + 1] << 8 | dt2[(pos >>> 3) + 2] << 16 | dt2[(pos >>> 3) + 3] << 24) >>> (pos & 7);
  };
  UZIP2.F.U = function() {
    var u16 = Uint16Array, u32 = Uint32Array;
    return {
      next_code: new u16(16),
      bl_count: new u16(16),
      ordr: [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
      of0: [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999],
      exb: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0],
      ldef: new u16(32),
      df0: [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 65535, 65535],
      dxb: [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0],
      ddef: new u32(32),
      flmap: new u16(512),
      fltree: [],
      fdmap: new u16(32),
      fdtree: [],
      lmap: new u16(32768),
      ltree: [],
      ttree: [],
      dmap: new u16(32768),
      dtree: [],
      imap: new u16(512),
      itree: [],
      //rev9 : new u16(  512)
      rev15: new u16(1 << 15),
      lhst: new u32(286),
      dhst: new u32(30),
      ihst: new u32(19),
      lits: new u32(15e3),
      strt: new u16(1 << 16),
      prev: new u16(1 << 15)
    };
  }();
  (function() {
    var U2 = UZIP2.F.U;
    var len = 1 << 15;
    for (var i = 0; i < len; i++) {
      var x = i;
      x = (x & 2863311530) >>> 1 | (x & 1431655765) << 1;
      x = (x & 3435973836) >>> 2 | (x & 858993459) << 2;
      x = (x & 4042322160) >>> 4 | (x & 252645135) << 4;
      x = (x & 4278255360) >>> 8 | (x & 16711935) << 8;
      U2.rev15[i] = (x >>> 16 | x << 16) >>> 17;
    }
    function pushV(tgt, n2, sv) {
      while (n2-- != 0) tgt.push(0, sv);
    }
    for (var i = 0; i < 32; i++) {
      U2.ldef[i] = U2.of0[i] << 3 | U2.exb[i];
      U2.ddef[i] = U2.df0[i] << 4 | U2.dxb[i];
    }
    pushV(U2.fltree, 144, 8);
    pushV(U2.fltree, 255 - 143, 9);
    pushV(U2.fltree, 279 - 255, 7);
    pushV(U2.fltree, 287 - 279, 8);
    UZIP2.F.makeCodes(U2.fltree, 9);
    UZIP2.F.codes2map(U2.fltree, 9, U2.flmap);
    UZIP2.F.revCodes(U2.fltree, 9);
    pushV(U2.fdtree, 32, 5);
    UZIP2.F.makeCodes(U2.fdtree, 5);
    UZIP2.F.codes2map(U2.fdtree, 5, U2.fdmap);
    UZIP2.F.revCodes(U2.fdtree, 5);
    pushV(U2.itree, 19, 0);
    pushV(U2.ltree, 286, 0);
    pushV(U2.dtree, 30, 0);
    pushV(U2.ttree, 320, 0);
  })();
})(UZIP);
function n(t4, e) {
  return [t4[0] * e[0] + t4[2] * e[1], t4[1] * e[0] + t4[3] * e[1], t4[0] * e[2] + t4[2] * e[3], t4[1] * e[2] + t4[3] * e[3], t4[0] * e[4] + t4[2] * e[5] + t4[4], t4[1] * e[4] + t4[3] * e[5] + t4[5]];
}
let o = class t {
  constructor(...e) {
    __publicField(this, "m_matrix");
    this.m_matrix = 0 === e.length ? [1, 0, 0, 1, 0, 0] : e[0] instanceof Array ? e[0] : e[0] instanceof t ? this.m_matrix = e[0].toArray() : [...e];
  }
  multiAtLeft(e) {
    const i = this.m_matrix, s = e instanceof t ? e.m_matrix : e;
    this.m_matrix = n(s, i);
  }
  multi(e) {
    const i = this.m_matrix, s = e instanceof t ? e.m_matrix : e;
    this.m_matrix = n(i, s);
  }
  trans(t4, e) {
    this.multiAtLeft([1, 0, 0, 1, t4, e]);
  }
  preTrans(t4, e) {
    this.multi([1, 0, 0, 1, t4, e]);
  }
  scale(t4, e) {
    this.multiAtLeft([t4, 0, 0, e ?? t4, 0, 0]);
  }
  preScale(t4, e) {
    this.multi([t4, 0, 0, e ?? t4, 0, 0]);
  }
  skewX(t4) {
    this.multiAtLeft([1, 0, Math.tan(t4), 1, 0, 0]);
  }
  scaleX(t4) {
    this.multiAtLeft([t4, 0, 0, 1, 0, 0]);
  }
  scaleY(t4) {
    this.multiAtLeft([1, 0, 0, t4, 0, 0]);
  }
  rotate(t4, e, i) {
    (e || i) && this.trans(-(e || 0), -(i || 0));
    const s = Math.cos(t4), r = Math.sin(t4);
    this.multiAtLeft([s, r, -r, s, 0, 0]), (e || i) && this.trans(e || 0, i || 0);
  }
  computeCoord(t4, e) {
    const i = "object" == typeof t4, s = i ? t4.x : t4, r = i ? t4.y : e, n2 = this.m_matrix;
    return { x: n2[0] * s + n2[2] * r + n2[4], y: n2[1] * s + n2[3] * r + n2[5] };
  }
  computeCoord2(t4, e) {
    const i = this.m_matrix;
    return { x: i[0] * t4 + i[2] * e + i[4], y: i[1] * t4 + i[3] * e + i[5] };
  }
  computeCoord3(t4) {
    const e = this.m_matrix, i = t4.x, s = t4.y;
    return { x: e[0] * i + e[2] * s + e[4], y: e[1] * i + e[3] * s + e[5] };
  }
  computeRef(t4, e) {
    const i = this.m_matrix;
    return { x: i[0] * t4 + i[2] * e, y: i[1] * t4 + i[3] * e };
  }
  get inverse() {
    const t4 = this.m_matrix, e = t4[0] * t4[3] - t4[1] * t4[2];
    return [t4[3] / e, -t4[1] / e, -t4[2] / e, t4[0] / e, (t4[2] * t4[5] - t4[4] * t4[3]) / e, (t4[1] * t4[4] - t4[5] * t4[0]) / e];
  }
  inverseCoord(t4, e) {
    const i = "object" == typeof t4, s = i ? t4.x : t4, r = i ? t4.y : e, n2 = this.inverse;
    return { x: n2[0] * s + n2[2] * r + n2[4], y: n2[1] * s + n2[3] * r + n2[5] };
  }
  inverseRef(t4, e) {
    const i = this.inverse;
    return { x: i[0] * t4 + i[2] * e, y: i[1] * t4 + i[3] * e };
  }
  equals(t4) {
    for (let e = 0; e < 6; e++) if (Math.abs(this.m_matrix[e] - t4.m_matrix[e]) > 1e-7) return false;
    return true;
  }
  reset(...e) {
    if (0 === e.length) {
      const t4 = this.m_matrix;
      t4[0] = 1, t4[1] = 0, t4[2] = 0, t4[3] = 1, t4[4] = 0, t4[5] = 0;
    } else this.m_matrix = e[0] instanceof Array ? e[0] : e[0] instanceof t ? this.m_matrix = e[0].toArray() : [...e];
  }
  toString() {
    return "matrix(" + this.m_matrix.join(",") + ")";
  }
  toArray() {
    return this.m_matrix.slice(0);
  }
  get m00() {
    return this.m_matrix[0];
  }
  get m01() {
    return this.m_matrix[2];
  }
  get m02() {
    return this.m_matrix[4];
  }
  get m10() {
    return this.m_matrix[1];
  }
  get m11() {
    return this.m_matrix[3];
  }
  get m12() {
    return this.m_matrix[5];
  }
  flipVert(t4) {
    t4 && this.trans(0, -t4), this.multiAtLeft([1, 0, 0, -1, 0, 0]), t4 && this.trans(0, t4);
  }
  flipHoriz(t4) {
    t4 && this.trans(-t4, 0), this.multiAtLeft([-1, 0, 0, 1, 0, 0]), t4 && this.trans(t4, 0);
  }
  get identity() {
    return [1, 0, 0, 1, 0, 0];
  }
  isIdentity() {
    const t4 = this.identity, e = this.m_matrix;
    for (let i = 0, s = e.length; i < s; i++) if (Math.abs(e[i] - t4[i]) > 1e-7) return false;
    return true;
  }
  isValid() {
    const t4 = this.m_matrix;
    for (let e = 0, i = t4.length; e < i; e++) {
      const i2 = t4[e];
      if (Number.isNaN(i2) || !Number.isFinite(i2)) return false;
    }
    return true;
  }
  checkValid() {
    if (!this.isValid()) throw new Error("Wrong Matrix: " + this.m_matrix);
  }
  clone() {
    return new t(this);
  }
}, a = 0;
const h = "__id_684FF842426D409B89503DB15A3042AE";
function l(t4) {
  return t4[h] ?? (t4[h] = a++);
}
var c, d;
!function(t4) {
  t4[t4.MITER = 0] = "MITER", t4[t4.ROUND = 1] = "ROUND", t4[t4.BEVEL = 2] = "BEVEL";
}(c || (c = {})), function(t4) {
  t4[t4.BUTT = 0] = "BUTT", t4[t4.ROUND = 1] = "ROUND", t4[t4.SQUARE = 2] = "SQUARE";
}(d || (d = {}));
const p = { text: { textMeasure: (t4, e) => {
    }, getTextPath: (t4, e, i, s, r) => "" }, boolop: { difference: (t4, e) => "", intersection: (t4, e) => "", subtract: (t4, e) => "", union: (t4, e) => "", stroke: () => "" }, makePalPath: (t4) => {
    throw new Error("not implemented");
  } };
const y = 1e-7;
function w(t4, e) {
  return t4 === e || Math.abs(t4 - e) < y;
}
function b(t4) {
  return w(t4, 0);
}
function M(t4) {
  return w(t4, 1);
}
class v {
  constructor(t4, e = 0, i = false) {
    __publicField(this, "dimension");
    __publicField(this, "sizeForDimension");
    __publicField(this, "data");
    if (-1 !== t4.findIndex((t5) => t5 < 0)) throw new Error("各维度的大小不能为负数");
    this.dimension = t4.length, this.sizeForDimension = [...t4];
    const s = t4.reduce((t5, e2) => t5 * e2, 1);
    if (Array.isArray(e)) {
      if (e.length !== s) throw new Error("填充数组长度不匹配");
      if (!i && -1 !== e.findIndex((t5) => "number" != typeof t5)) throw new Error("填充数组元素类型不匹配");
      this.data = e;
    } else {
      if ("number" != typeof e) throw new Error("填充值类型不匹配");
      this.data = new Array(s).fill(e);
    }
  }
  getIndex(t4) {
    if (t4.length !== this.dimension) throw new Error("维数不匹配");
    let e = 0;
    for (let i = 0; i < t4.length; i++) {
      const s = t4[i];
      if (s < 0 || s >= this.sizeForDimension[i]) throw new Error("索引越界");
      e = e * this.sizeForDimension[i] + s;
    }
    return e;
  }
  get(t4) {
    return this.data[this.getIndex(t4)];
  }
  set(t4, e) {
    this.data[this.getIndex(t4)] = e;
  }
  clone() {
    const t4 = new this.constructor(this.sizeForDimension);
    return t4.data = this.data.slice(), t4;
  }
  resize(t4, e = 0) {
    if (-1 !== t4.findIndex((t5) => t5 < 0)) throw new Error("各维度的大小不能为负数");
    const i = t4.reduce((t5, e2) => t5 * e2, 1);
    return i < this.data.length ? this.data = this.data.slice(0, i) : i > this.data.length && (this.data = this.data.concat(new Array(i - this.data.length).fill(e))), this.dimension = t4.length, this.sizeForDimension = [...t4], this;
  }
  _toString(t4) {
    if (t4.length > this.dimension) throw new Error("维数不匹配");
    if (t4.length === this.dimension) return this.get(t4).toString();
    let e = "\n";
    return t4.length > 0 && (e += " ".repeat(2 * t4.length)), (0 === t4.length ? "" : e) + "[" + Array.from({ length: this.sizeForDimension[t4.length] }, (e2, i) => this._toString([...t4, i])).join("," + (t4.length === this.dimension - 1 ? " " : "")) + (t4.length === this.dimension - 1 ? "" : ",") + (t4.length === this.dimension - 1 ? "" : e) + "]";
  }
  toString() {
    return this._toString([]);
  }
}
class S extends v {
  constructor(t4, e = 0, i = false) {
    if (2 !== t4.length) throw new Error("必须为2维");
    super(t4, e, i);
  }
  getIndex(t4) {
    if (2 !== t4.length) throw new Error("维数不匹配");
    return t4[0] * this.sizeForDimension[1] + t4[1];
  }
  equals(t4) {
    if (this.sizeForDimension.length !== t4.sizeForDimension.length) return false;
    for (let e = 0; e < this.sizeForDimension.length; e++) if (this.sizeForDimension[e] !== t4.sizeForDimension[e]) return false;
    if (this.data.length !== t4.data.length) return false;
    for (let e = 0; e < this.data.length; e++) if (!w(this.data[e], t4.data[e])) return false;
    return true;
  }
  static FromNumberArray(t4) {
    if (t4 instanceof S) return t4;
    if (2 !== t4.dimension) throw new Error("numberArray必须是二维数组");
    return new S(t4.sizeForDimension, t4.data, true);
  }
  static BuildIdentity(t4) {
    const e = t4[0], i = t4[1];
    if (2 === e && 2 === i) return new S([2, 2], [1, 0, 0, 1], true);
    if (3 === e && 3 === i) return new S([3, 3], [1, 0, 0, 0, 1, 0, 0, 0, 1], true);
    if (4 === e && 4 === i) return new S([4, 4], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], true);
    const s = new S(t4, 0), r = Math.min(e, i);
    for (let t5 = 0; t5 < r; t5++) s.set([t5, t5], 1);
    return s;
  }
  get rowCount() {
    return this.sizeForDimension[0];
  }
  get colCount() {
    return this.sizeForDimension[1];
  }
  rows(t4, e) {
    if (2 !== this.dimension) throw new Error("data必须是二维数组");
    const [i, s] = this.sizeForDimension;
    if (void 0 === e && (e = i - t4), t4 < 0 || t4 + e > i) throw new Error("行索引越界");
    if (e < 0) throw new Error("行数范围错误");
    return this.data.slice(t4 * s, (t4 + e) * s);
  }
  row(t4) {
    return this.rows(t4, 1);
  }
  cols(t4, e) {
    if (2 !== this.dimension) throw new Error("data必须是二维数组");
    const [i, s] = this.sizeForDimension;
    if (void 0 === e && (e = s - t4), t4 < 0 || t4 + e > s) throw new Error("列索引越界");
    if (e < 0) throw new Error("列数范围错误");
    const r = [];
    for (let s2 = t4; s2 < t4 + e; s2++) for (let t5 = 0; t5 < i; t5++) r.push(this.get([t5, s2]));
    return r;
  }
  col(t4) {
    return this.cols(t4, 1);
  }
  insertRows(t4, e, i = false) {
    if (2 !== this.dimension) throw new Error("data必须是二维数组");
    if (t4 instanceof S && (t4 = t4.data), t4.length % this.sizeForDimension[1] != 0) throw new Error("行数据长度不匹配");
    if (void 0 === e && (e = this.sizeForDimension[0]), e < 0 || e > this.sizeForDimension[0]) throw new Error("行索引越界");
    if (!i && -1 !== t4.findIndex((t5) => "number" != typeof t5)) throw new Error("填充数组元素类型不匹配");
    return this.data.splice(e * this.sizeForDimension[1], 0, ...t4), this.sizeForDimension[0] += t4.length / this.sizeForDimension[1], this;
  }
  insertCols(t4, e, i = false) {
    if (2 !== this.dimension) throw new Error("data必须是二维数组");
    const [s, r] = this.sizeForDimension;
    if (!(t4 instanceof S)) {
      if (t4.length % s != 0) throw new Error("列数据长度不匹配");
      t4 = new S([s, t4.length / s], t4, i);
    }
    if (void 0 === e && (e = r), e < 0 || e > r) throw new Error("列索引越界");
    for (let i2 = t4.sizeForDimension[1] - 1, n2 = 0; i2 >= 0; i2--, n2++) for (let o2 = s - 1; o2 >= 0; o2--) this.data.splice(o2 * (r + n2) + e, 0, t4.get([o2, i2]));
    return this.sizeForDimension[1] += t4.sizeForDimension[1], this;
  }
  deleteRow(t4, e = 1) {
    if (2 !== this.dimension) throw new Error("data必须是二维数组");
    const [i, s] = this.sizeForDimension;
    if (void 0 === t4 && (t4 = i - 1), t4 < 0 || t4 + e > i) throw new Error("行索引越界");
    return this.data.splice(t4 * s, e * s), this.sizeForDimension[0] -= e, this;
  }
  deleteCol(t4, e = 1) {
    if (2 !== this.dimension) throw new Error("data必须是二维数组");
    const [i, s] = this.sizeForDimension;
    if (void 0 === t4 && (t4 = s - 1), t4 < 0 || t4 + e > s) throw new Error("列索引越界");
    for (let r = i - 1; r >= 0; r--) this.data.splice(r * s + t4, e);
    return this.sizeForDimension[1] -= e, this;
  }
  get m00() {
    return this.get([0, 0]);
  }
  set m00(t4) {
    this.set([0, 0], t4);
  }
  get m01() {
    return this.get([0, 1]);
  }
  set m01(t4) {
    this.set([0, 1], t4);
  }
  get m02() {
    return this.get([0, 2]);
  }
  set m02(t4) {
    this.set([0, 2], t4);
  }
  get m03() {
    return this.get([0, 3]);
  }
  set m03(t4) {
    this.set([0, 3], t4);
  }
  get m10() {
    return this.get([1, 0]);
  }
  set m10(t4) {
    this.set([1, 0], t4);
  }
  get m11() {
    return this.get([1, 1]);
  }
  set m11(t4) {
    this.set([1, 1], t4);
  }
  get m12() {
    return this.get([1, 2]);
  }
  set m12(t4) {
    this.set([1, 2], t4);
  }
  get m13() {
    return this.get([1, 3]);
  }
  set m13(t4) {
    this.set([1, 3], t4);
  }
  get m20() {
    return this.get([2, 0]);
  }
  set m20(t4) {
    this.set([2, 0], t4);
  }
  get m21() {
    return this.get([2, 1]);
  }
  set m21(t4) {
    this.set([2, 1], t4);
  }
  get m22() {
    return this.get([2, 2]);
  }
  set m22(t4) {
    this.set([2, 2], t4);
  }
  get m23() {
    return this.get([2, 3]);
  }
  set m23(t4) {
    this.set([2, 3], t4);
  }
  get m30() {
    return this.get([3, 0]);
  }
  set m30(t4) {
    this.set([3, 0], t4);
  }
  get m31() {
    return this.get([3, 1]);
  }
  set m31(t4) {
    this.set([3, 1], t4);
  }
  get m32() {
    return this.get([3, 2]);
  }
  set m32(t4) {
    this.set([3, 2], t4);
  }
  get m33() {
    return this.get([3, 3]);
  }
  set m33(t4) {
    this.set([3, 3], t4);
  }
}
class C {
  constructor(t4, e = 0, i = false) {
    __publicField(this, "data");
    if (t4 instanceof S || (t4 = new S(t4, e, i)), 2 !== t4.dimension) throw new Error("data必须是二维数组");
    this.data = t4;
  }
  static Build(t4, e) {
    return new C(new S(t4, e));
  }
  static BuildIdentity(t4) {
    return new C(S.BuildIdentity(t4));
  }
  static FromMatrix(t4) {
    return new C(t4.data);
  }
  get(t4) {
    return this.data.get(t4);
  }
  set(t4, e) {
    this.data.set(t4, e);
  }
  clone() {
    return new this.constructor(this.data.clone());
  }
  equals(t4) {
    return this.data.equals(t4.data);
  }
  get rawData() {
    return this.data.data;
  }
  get m00() {
    return this.data.m00;
  }
  set m00(t4) {
    this.data.m00 = t4;
  }
  get m01() {
    return this.data.m01;
  }
  set m01(t4) {
    this.data.m01 = t4;
  }
  get m02() {
    return this.data.m02;
  }
  set m02(t4) {
    this.data.m02 = t4;
  }
  get m03() {
    return this.data.m03;
  }
  set m03(t4) {
    this.data.m03 = t4;
  }
  get m10() {
    return this.data.m10;
  }
  set m10(t4) {
    this.data.m10 = t4;
  }
  get m11() {
    return this.data.m11;
  }
  set m11(t4) {
    this.data.m11 = t4;
  }
  get m12() {
    return this.data.m12;
  }
  set m12(t4) {
    this.data.m12 = t4;
  }
  get m13() {
    return this.data.m13;
  }
  set m13(t4) {
    this.data.m13 = t4;
  }
  get m20() {
    return this.data.m20;
  }
  set m20(t4) {
    this.data.m20 = t4;
  }
  get m21() {
    return this.data.m21;
  }
  set m21(t4) {
    this.data.m21 = t4;
  }
  get m22() {
    return this.data.m22;
  }
  set m22(t4) {
    this.data.m22 = t4;
  }
  get m23() {
    return this.data.m23;
  }
  set m23(t4) {
    this.data.m23 = t4;
  }
  get m30() {
    return this.data.m30;
  }
  set m30(t4) {
    this.data.m30 = t4;
  }
  get m31() {
    return this.data.m31;
  }
  set m31(t4) {
    this.data.m31 = t4;
  }
  get m32() {
    return this.data.m32;
  }
  set m32(t4) {
    this.data.m32 = t4;
  }
  get m33() {
    return this.data.m33;
  }
  set m33(t4) {
    this.data.m33 = t4;
  }
  get size() {
    return [...this.data.sizeForDimension];
  }
  get rowCount() {
    return this.size[0];
  }
  get colCount() {
    return this.size[1];
  }
  get isSquare() {
    return this.rowCount === this.colCount;
  }
  get isIdentity() {
    const [t4, e] = this.size;
    if (t4 !== e) return false;
    for (let i = 0; i < t4; i++) for (let t5 = 0; t5 < e; t5++) if (!w(this.get([i, t5]), i === t5 ? 1 : 0)) return false;
    return true;
  }
  get isDiagonal() {
    const [t4, e] = this.size;
    if (t4 !== e) return false;
    for (let i = 0; i < t4; i++) for (let t5 = 0; t5 < e; t5++) if (i !== t5 && !b(this.get([i, t5]))) return false;
    return true;
  }
  get isSymmetric() {
    const [t4, e] = this.size;
    if (t4 !== e) return false;
    for (let e2 = 0; e2 < t4; e2++) for (let i = e2 + 1; i < t4; i++) if (!w(this.get([e2, i]), this.get([i, e2]))) return false;
    return true;
  }
  get isUpperTriangular() {
    const [t4, e] = this.size;
    if (t4 !== e) return false;
    for (let e2 = 0; e2 < t4; e2++) for (let t5 = 0; t5 < e2; t5++) if (!b(this.get([e2, t5]))) return false;
    return true;
  }
  get isLowerTriangular() {
    const [t4, e] = this.size;
    if (t4 !== e) return false;
    for (let i = 0; i < t4; i++) for (let t5 = i + 1; t5 < e; t5++) if (!b(this.get([i, t5]))) return false;
    return true;
  }
  resize(t4, e = 0) {
    const [i, s] = this.size, [r, n2] = t4;
    return i > r ? this.data.deleteRow(r, i - r) : i < r && this.data.insertRows(new S([r - i, n2], e), i, true), s > n2 ? this.data.deleteCol(n2, s - n2) : s < n2 && this.data.insertCols(new S([r, n2 - s], e), s, true), this;
  }
  forEach(t4) {
    const [e, i] = this.size;
    for (let s = 0; s < e; s++) for (let e2 = 0; e2 < i; e2++) t4(this.get([s, e2]), [s, e2]);
  }
  flat() {
    return this.data.data.slice();
  }
  static FromCols(t4) {
    const e = t4.length, i = t4[0].size[0], s = new S([i, e]);
    for (let r = 0; r < e; r++) {
      const e2 = t4[r];
      if (e2.size[0] !== i) throw new Error("列向量的维度不匹配");
      for (let t5 = 0; t5 < i; t5++) s.set([t5, r], e2.get([t5, 0]));
    }
    return new C(s);
  }
  static FromRows(t4) {
    const e = t4.length, i = t4[0].size[1], s = new S([e, i]);
    for (let r = 0; r < e; r++) {
      const e2 = t4[r];
      if (e2.size[1] !== i) throw new Error("行向量的维度不匹配");
      for (let t5 = 0; t5 < i; t5++) s.set([r, t5], e2.get([0, t5]));
    }
    return new C(s);
  }
  col(t4) {
    const [e, i] = this.size;
    if (t4 < 0 || t4 >= i) throw new Error("列数越界");
    return new k(this.data.col(t4));
  }
  cols(t4, e) {
    const [i, s] = this.size;
    if (void 0 === e && (e = s - t4), t4 < 0 || t4 + e > s) throw new Error("列索引越界");
    if (e < 0) throw new Error("列数范围错误");
    const r = [];
    for (let i2 = t4; i2 < t4 + e; i2++) r.push(this.col(i2));
    return r;
  }
  allCol() {
    return this.cols(0);
  }
  mapCol(t4) {
    const [e, i] = this.size, s = [];
    for (let e2 = 0; e2 < i; e2++) s.push(t4(this.col(e2), e2, this));
    return s;
  }
  row(t4) {
    if (t4 < 0 || t4 >= this.size[0]) throw new Error("行数越界");
    return new F(this.data.row(t4));
  }
  rows(t4, e) {
    const [i, s] = this.size;
    if (void 0 === e && (e = i - t4), t4 < 0 || t4 + e > i) throw new Error("行索引越界");
    if (e < 0) throw new Error("行数范围错误");
    const r = [];
    for (let i2 = t4; i2 < t4 + e; i2++) r.push(this.row(i2));
    return r;
  }
  allRow() {
    return this.rows(0);
  }
  mapRow(t4) {
    const [e, i] = this.size, s = [];
    for (let i2 = 0; i2 < e; i2++) s.push(t4(this.row(i2), i2));
    return s;
  }
  subMatrix(t4, e = [0, 0]) {
    const i = e[0], s = e[1], [r, n2] = this.size, [o2, a2] = t4;
    if (o2 < 0 || a2 < 0) throw new Error("子矩阵大小不能为负");
    if (i < 0 || s < 0 || i + o2 > r || s + a2 > n2) throw new Error("子矩阵范围越界");
    const h2 = new S(t4);
    for (let t5 = 0; t5 < o2; t5++) for (let e2 = 0; e2 < a2; e2++) h2.set([t5, e2], this.get([t5 + i, e2 + s]));
    return new C(h2);
  }
  setSubMatrix(t4, e = [0, 0]) {
    const i = e[0], s = e[1], [r, n2] = this.size, [o2, a2] = t4.size;
    if (i < 0 || s < 0 || i + o2 > r || s + a2 > n2) throw new Error("子矩阵范围越界");
    for (let e2 = 0; e2 < o2; e2++) for (let r2 = 0; r2 < a2; r2++) this.set([e2 + i, r2 + s], t4.get([e2, r2]));
    return this;
  }
  get col0() {
    return this.col(0);
  }
  set col0(t4) {
    t4 instanceof k || (t4 = new k(t4)), this.setSubMatrix(t4);
  }
  get col1() {
    return this.col(1);
  }
  set col1(t4) {
    t4 instanceof k || (t4 = new k(t4)), this.setSubMatrix(t4, [0, 1]);
  }
  get col2() {
    return this.col(2);
  }
  set col2(t4) {
    t4 instanceof k || (t4 = new k(t4)), this.setSubMatrix(t4, [0, 2]);
  }
  get col3() {
    return this.col(3);
  }
  set col3(t4) {
    t4 instanceof k || (t4 = new k(t4)), this.setSubMatrix(t4, [0, 3]);
  }
  get row0() {
    return this.row(0);
  }
  set row0(t4) {
    t4 instanceof F || (t4 = new F(t4)), this.setSubMatrix(t4);
  }
  get row1() {
    return this.row(1);
  }
  set row1(t4) {
    t4 instanceof F || (t4 = new F(t4)), this.setSubMatrix(t4, [1, 0]);
  }
  get row2() {
    return this.row(2);
  }
  set row2(t4) {
    t4 instanceof F || (t4 = new F(t4)), this.setSubMatrix(t4, [2, 0]);
  }
  get row3() {
    return this.row(3);
  }
  set row3(t4) {
    t4 instanceof F || (t4 = new F(t4)), this.setSubMatrix(t4, [3, 0]);
  }
  insertCols(t4, e) {
    return t4 instanceof k ? t4 = t4.data : Array.isArray(t4) && t4[0] instanceof k && (t4 = t4.reduce((t5, e2) => (t5.push(...e2.data.data), t5), [])), this.data.insertCols(t4, e, true), this;
  }
  insertRows(t4, e) {
    return t4 instanceof F ? t4 = t4.data : Array.isArray(t4) && t4[0] instanceof F && (t4 = t4.reduce((t5, e2) => (t5.push(...e2.data.data), t5), [])), this.data.insertRows(t4, e, true), this;
  }
  deleteCol(t4, e = 1) {
    return this.data.deleteCol(t4, e), this;
  }
  deleteRow(t4, e = 1) {
    return this.data.deleteRow(t4, e), this;
  }
  transpose() {
    const [t4, e] = this.size;
    for (let i = 0; i < t4; i++) for (let t5 = i + 1; t5 < e; t5++) {
      const e2 = this.get([i, t5]);
      this.set([i, t5], this.get([t5, i])), this.set([t5, i], e2);
    }
    return new C(this.data);
  }
  transposeSubMatrix(t4, e = [0, 0]) {
    const i = e[0], s = e[1], [r, n2] = this.size, o2 = t4, a2 = t4;
    if (o2 < 0) throw new Error("子矩阵大小不能为负");
    if (i < 0 || s < 0 || i + o2 > r || s + a2 > n2) throw new Error("子矩阵范围越界");
    for (let t5 = 0; t5 < o2; t5++) for (let e2 = t5 + 1; e2 < a2; e2++) {
      const r2 = this.get([t5 + i, e2 + s]);
      this.set([t5 + i, e2 + s], this.get([e2 + i, t5 + s])), this.set([e2 + i, t5 + s], r2);
    }
    return this;
  }
  add(t4, e = [0, 0]) {
    const i = e[0], s = e[1], [r, n2] = this.size, [o2, a2] = t4.size;
    if (i < 0 || s < 0 || i + o2 > r || s + a2 > n2) throw new Error("子矩阵范围越界");
    for (let e2 = 0; e2 < o2; e2++) for (let r2 = 0; r2 < a2; r2++) this.set([e2 + i, r2 + s], this.get([e2 + i, r2 + s]) + t4.get([e2, r2]));
    return this;
  }
  subtract(t4, e = [0, 0]) {
    const i = e[0], s = e[1], [r, n2] = this.size, [o2, a2] = t4.size;
    if (i < 0 || s < 0 || i + o2 > r || s + a2 > n2) throw new Error("子矩阵范围越界");
    for (let e2 = 0; e2 < o2; e2++) for (let r2 = 0; r2 < a2; r2++) this.set([e2 + i, r2 + s], this.get([e2 + i, r2 + s]) - t4.get([e2, r2]));
    return this;
  }
  multiplyByNumber(t4) {
    const [e, i] = this.size;
    for (let s = 0; s < e; s++) for (let e2 = 0; e2 < i; e2++) this.set([s, e2], this.get([s, e2]) * t4);
    return this;
  }
  multiplyByNumberSubMatrix(t4, e, i = [0, 0]) {
    const s = i[0], r = i[1], [n2, o2] = this.size, [a2, h2] = e;
    if (a2 < 0 || h2 < 0) throw new Error("子矩阵大小不能为负");
    if (s < 0 || r < 0 || s + a2 > n2 || r + h2 > o2) throw new Error("子矩阵范围越界");
    for (let e2 = 0; e2 < a2; e2++) for (let i2 = 0; i2 < h2; i2++) this.set([e2 + s, i2 + r], this.get([e2 + s, i2 + r]) * t4);
    return this;
  }
  _getMultiply(t4) {
    const [e, i] = this.size, [s, r] = t4.size;
    if (i !== s) throw new Error("矩阵阶数不匹配，无法相乘");
    const n2 = new S([e, r]), o2 = this.isSquare, a2 = t4.isSquare, h2 = this.isDiagonal, l2 = t4.isDiagonal;
    if (o2 && a2 && h2 && l2) {
      for (let i2 = 0; i2 < e; i2++) n2.set([i2, i2], this.get([i2, i2]) * t4.get([i2, i2]));
      return n2;
    }
    if (h2) {
      for (let i2 = 0; i2 < e; i2++) for (let e2 = 0; e2 < r; e2++) n2.set([i2, e2], this.get([i2, i2]) * t4.get([i2, e2]));
      return n2;
    }
    if (l2) {
      for (let i2 = 0; i2 < e; i2++) for (let e2 = 0; e2 < r; e2++) n2.set([i2, e2], t4.get([e2, e2]) * this.get([i2, e2]));
      return n2;
    }
    for (let s2 = 0; s2 < e; s2++) for (let e2 = 0; e2 < r; e2++) {
      let r2 = 0;
      for (let n3 = 0; n3 < i; n3++) r2 += this.get([s2, n3]) * t4.get([n3, e2]);
      n2.set([s2, e2], r2);
    }
    return n2;
  }
  multiply(t4) {
    return this.data = this._getMultiply(t4), this;
  }
  getMultiply(t4) {
    return this.clone().multiply(t4);
  }
  multiplySubMatrix(t4, e, i = [0, 0]) {
    const s = i[0], r = i[1], [n2, o2] = this.size, [a2, h2] = t4.size;
    void 0 === e && (e = [a2, a2]);
    const [l2, c2] = e;
    if (l2 < 0 || c2 < 0) throw new Error("子矩阵大小不能为负");
    if (s < 0 || r < 0 || s + l2 > n2 || r + c2 > o2) throw new Error("子矩阵范围越界");
    if (a2 < c2 || h2 < c2) throw new Error("矩阵阶数不匹配，无法相乘");
    return this.setSubMatrix(this.subMatrix(e, i).multiply(t4.clone().resize([c2, c2])), i), this;
  }
  getMultiplySubMatrix(t4, e, i = [0, 0]) {
    return this.clone().multiplySubMatrix(t4, e, i);
  }
  multiplyRight(t4) {
    return this.multiply(t4);
  }
  multiplyRightSubMatrix(t4, e, i = [0, 0]) {
    return this.multiplySubMatrix(t4, e, i);
  }
  multiplyLeft(t4) {
    return this.data = C.FromMatrix(t4.clone()).multiply(this).data, this;
  }
  multiplyLeftSubMatrix(t4, e, i = [0, 0]) {
    const s = i[0], r = i[1], [n2, o2] = this.size, [a2, h2] = t4.size;
    void 0 === e && (e = [h2, h2]);
    const [l2, c2] = e;
    if (l2 < 0 || c2 < 0) throw new Error("子矩阵大小不能为负");
    if (s < 0 || r < 0 || s + l2 > n2 || r + c2 > o2) throw new Error("子矩阵范围越界");
    if (a2 < l2 || h2 < l2) throw new Error("矩阵阶数不匹配，无法相乘");
    return this.setSubMatrix(C.FromMatrix(t4.clone().resize([l2, l2])).multiply(this.subMatrix(e, i)), i), this;
  }
  getInverse() {
    if (!this.isSquare) throw new Error("矩阵不是方阵，无逆矩阵");
    const t4 = this.size[0];
    if (this.isDiagonal) {
      const e2 = new S([t4, t4]);
      for (let i2 = 0; i2 < t4; i2++) {
        const t5 = this.get([i2, i2]);
        if (b(t5)) return;
        e2.set([i2, i2], 1 / t5);
      }
      return new C(e2);
    }
    if (3 === t4) {
      const t5 = this.determinant();
      if (b(t5)) return;
      return new C(new S([3, 3], [(this.m11 * this.m22 - this.m12 * this.m21) / t5, (this.m02 * this.m21 - this.m01 * this.m22) / t5, (this.m01 * this.m12 - this.m02 * this.m11) / t5, (this.m12 * this.m20 - this.m10 * this.m22) / t5, (this.m00 * this.m22 - this.m02 * this.m20) / t5, (this.m02 * this.m10 - this.m00 * this.m12) / t5, (this.m10 * this.m21 - this.m11 * this.m20) / t5, (this.m01 * this.m20 - this.m00 * this.m21) / t5, (this.m00 * this.m11 - this.m01 * this.m10) / t5], true));
    }
    if (2 === t4) {
      const t5 = this.determinant();
      if (b(t5)) return;
      return new C(new S([2, 2], [this.m11 / t5, -this.m01 / t5, -this.m10 / t5, this.m00 / t5], true));
    }
    if (1 === t4) return new C(new S([1, 1], 1 / this.get([0, 0])));
    const e = S.BuildIdentity([t4, t4]), i = this.data.clone();
    for (let s = 0; s < t4; s++) {
      if (b(i.get([s, s]))) {
        let r2 = s + 1;
        for (; r2 < t4 && b(i.get([r2, s])); r2++) ;
        if (r2 === t4) return;
        for (let n2 = 0; n2 < t4; n2++) {
          let t5 = i.get([s, n2]);
          i.set([s, n2], i.get([r2, n2])), i.set([r2, n2], t5), t5 = e.get([s, n2]), e.set([s, n2], e.get([r2, n2])), e.set([r2, n2], t5);
        }
      }
      const r = i.get([s, s]);
      if (!M(r)) {
        i.set([s, s], 1);
        for (let e2 = s + 1; e2 < t4; e2++) i.set([s, e2], i.get([s, e2]) / r);
        for (let i2 = 0; i2 < t4; i2++) e.set([s, i2], e.get([s, i2]) / r);
      }
      for (let r2 = 0; r2 < t4; r2++) {
        if (r2 === s) continue;
        const n2 = i.get([r2, s]);
        if (!b(n2)) {
          i.set([r2, s], 0);
          for (let e2 = s + 1; e2 < t4; e2++) i.set([r2, e2], i.get([r2, e2]) - i.get([s, e2]) * n2);
          for (let i2 = 0; i2 < t4; i2++) e.set([r2, i2], e.get([r2, i2]) - e.get([s, i2]) * n2);
        }
      }
    }
    return new C(e);
  }
  negate() {
    return this.multiplyByNumber(-1);
  }
  getNegate() {
    return this.clone().negate();
  }
  rank() {
    const [t4, e] = this.size, i = this.data.clone(), s = Math.min(t4, e);
    let r = 0;
    for (let n2 = 0; n2 < e; n2++) {
      let o2 = r;
      for (; o2 < t4 && b(i.get([o2, n2])); o2++) ;
      if (o2 === t4) continue;
      if (o2 !== r) for (let t5 = 0; t5 < e; t5++) {
        const e2 = i.get([r, t5]);
        i.set([r, t5], i.get([o2, t5])), i.set([o2, t5], e2);
      }
      const a2 = i.get([r, n2]);
      if (!M(a2)) {
        i.set([r, n2], 1);
        for (let t5 = n2 + 1; t5 < e; t5++) i.set([r, t5], i.get([r, t5]) / a2);
      }
      for (let s2 = 0; s2 < t4; s2++) {
        if (s2 === r) continue;
        const t5 = i.get([s2, n2]);
        if (!b(t5)) {
          i.set([s2, n2], 0);
          for (let o3 = n2 + 1; o3 < e; o3++) i.set([s2, o3], i.get([s2, o3]) - i.get([r, o3]) * t5);
        }
      }
      if (++r === s) break;
    }
    return r;
  }
  determinant() {
    if (!this.isSquare) throw new Error("矩阵不是方阵，无行列式");
    const [t4, e] = this.size;
    if (3 === t4) return this.m00 * this.m11 * this.m22 + this.m01 * this.m12 * this.m20 + this.m02 * this.m10 * this.m21 - this.m02 * this.m11 * this.m20 - this.m01 * this.m10 * this.m22 - this.m00 * this.m12 * this.m21;
    if (2 === t4) return this.m00 * this.m11 - this.m01 * this.m10;
    if (1 === t4) return this.m00;
    let i = 0;
    for (let t5 = 0; t5 < e; t5++) {
      const e2 = this.get([0, t5]);
      if (b(e2)) continue;
      i += (t5 % 2 == 0 ? 1 : -1) * e2 * this.clone().deleteRow(0).deleteCol(t5).determinant();
    }
    return i;
  }
  getAdjoint() {
    if (!this.isSquare) throw new Error("矩阵不是方阵，无伴随矩阵");
    const [t4, e] = this.size, i = new S([t4, e]);
    for (let s = 0; s < t4; s++) for (let t5 = 0; t5 < e; t5++) {
      const e2 = this.clone().deleteRow(s).deleteCol(t5).determinant();
      i.set([s, t5], (s + t5) % 2 == 0 ? e2 : -e2);
    }
    return new C(i);
  }
  normalize() {
    const [t4, e] = this.size;
    for (let i = 0; i < e; i++) {
      let e2 = 0;
      for (let s = 0; s < t4; s++) e2 += this.get([s, i]) ** 2;
      if (e2 = Math.sqrt(e2), !b(e2)) for (let s = 0; s < t4; s++) this.set([s, i], this.get([s, i]) / e2);
    }
    return this;
  }
  normalizeRow() {
    return this.transpose().normalize().transpose();
  }
  toString() {
    return this.data.toString();
  }
}
class T extends C {
  constructor(t4) {
    if (super(t4), 1 !== this.rowCount && 1 !== this.colCount) throw new Error("向量的大小必须是n * 1或1 * n");
  }
  static FromMatrix(t4, e = true) {
    return new T(t4.data.resize(e ? [t4.data.data.length, 1] : [1, t4.data.data.length]));
  }
  dot(t4) {
    const [e, i] = this.size, [s, r] = t4.size;
    if (e !== s || i !== r) throw new Error("向量维度不匹配");
    let n2 = 0;
    for (let i2 = 0; i2 < e; i2++) n2 += this.get([i2, 0]) * t4.get([i2, 0]);
    return n2;
  }
  cross(t4) {
    const [e, i] = this.size, [s, r] = t4.size;
    if (e !== s || i !== r) throw new Error("向量维度不匹配");
    const n2 = 1 !== e ? e : i;
    if (2 !== n2 && 3 !== n2) throw new Error("叉积只能用于二维向量或三维向量");
    return 1 === i ? 2 === n2 ? this.m00 * t4.m10 - t4.m00 * this.m10 : new E([this.m10 * t4.m20 - t4.m10 * this.m20, this.m20 * t4.m00 - t4.m20 * this.m00, this.m00 * t4.m10 - t4.m00 * this.m10]) : 2 === n2 ? this.m00 * t4.m01 - t4.m00 * this.m01 : new E([this.m01 * t4.m02 - t4.m01 * this.m02, this.m02 * t4.m00 - t4.m02 * this.m00, this.m00 * t4.m01 - t4.m00 * this.m01]);
  }
  get norm() {
    return Math.sqrt(this.dot(this));
  }
  angleTo(t4) {
    const [e, i] = this.size, [s, r] = t4.size;
    if (e !== s || i !== r) throw new Error("向量维度不匹配");
    const n2 = this.dot(t4);
    return Math.acos(n2 / (this.norm * t4.norm));
  }
  get isZero() {
    return this.data.data.every(b);
  }
}
class k extends T {
  constructor(t4) {
    if (t4 instanceof S || (t4 = new S([t4.length, 1], t4, true)), super(t4), 1 !== t4.colCount) throw new Error("列向量必须是n * 1的矩阵");
  }
  static FromMatrix(t4) {
    return t4 instanceof k ? t4 : new k(t4.data.resize([t4.data.data.length, 1]));
  }
  get x() {
    return this.m00;
  }
  set x(t4) {
    this.m00 = t4;
  }
  get y() {
    return this.m10;
  }
  set y(t4) {
    this.m10 = t4;
  }
  get z() {
    return this.m20;
  }
  set z(t4) {
    this.m20 = t4;
  }
  get m0() {
    return this.m00;
  }
  set m0(t4) {
    this.m00 = t4;
  }
  get m1() {
    return this.m10;
  }
  set m1(t4) {
    this.m10 = t4;
  }
  get m2() {
    return this.m20;
  }
  set m2(t4) {
    this.m20 = t4;
  }
  get m3() {
    return this.m30;
  }
  set m3(t4) {
    this.m30 = t4;
  }
}
class E extends k {
  constructor(t4) {
    if (super(t4), 3 !== this.size[0]) throw new Error("三维列向量必须是3 * 1的矩阵");
  }
  static FromMatrix(t4) {
    return t4 instanceof E ? t4 : new E(t4.data.resize([3, 1]));
  }
  static FromXY(t4, e) {
    return new E([t4, e, 0]);
  }
  static FromXYZ(t4, e, i) {
    return new E([t4, e, i]);
  }
}
class F extends T {
  constructor(t4) {
    if (t4 instanceof S || (t4 = new S([1, t4.length], t4, true)), super(t4), 1 !== t4.rowCount) throw new Error("行向量必须是1 * n的矩阵");
  }
  static FromMatrix(t4) {
    return t4 instanceof F ? t4 : new F(t4.data.resize([1, t4.data.data.length]));
  }
  get x() {
    return this.m00;
  }
  set x(t4) {
    this.m00 = t4;
  }
  get y() {
    return this.m01;
  }
  set y(t4) {
    this.m01 = t4;
  }
  get z() {
    return this.m02;
  }
  set z(t4) {
    this.m02 = t4;
  }
  get m0() {
    return this.m00;
  }
  set m0(t4) {
    this.m00 = t4;
  }
  get m1() {
    return this.m01;
  }
  set m1(t4) {
    this.m01 = t4;
  }
  get m2() {
    return this.m02;
  }
  set m2(t4) {
    this.m02 = t4;
  }
  get m3() {
    return this.m03;
  }
  set m3(t4) {
    this.m03 = t4;
  }
}
var A;
!function(t4) {
  t4[t4.Local = 0] = "Local", t4[t4.Global = 1] = "Global";
}(A || (A = {}));
class R extends C {
  getInverse() {
    return new C(new S([4, 4], [1, 0, 0, -this.m03, 0, 1, 0, -this.m13, 0, 0, 1, -this.m23, 0, 0, 0, 1], true));
  }
  multiply(t4) {
    const [e, i] = this.size, [s, r] = t4.size;
    if (i !== s) throw new Error("矩阵阶数不匹配，无法相乘");
    return C.FromMatrix(t4.clone().add(this.col3.deleteRow(3), [0, 3]));
  }
  static FromMatrix(t4) {
    return t4 instanceof R ? t4 : new R(t4.data);
  }
  buildMatrix() {
    return new C(new S([4, 4], [1, 0, 0, this.m03, 0, 1, 0, this.m13, 0, 0, 1, this.m23, 0, 0, 0, 1], true));
  }
}
class L extends C {
  getInverse() {
    if (b(this.m20) && b(this.m21) && b(this.m02) && b(this.m12)) {
      const t4 = this.m00 * this.m11 - this.m01 * this.m10;
      if (b(t4)) return;
      return new C(new S([4, 4], [this.m11 / t4, -this.m01 / t4, 0, 0, -this.m10 / t4, this.m00 / t4, 0, 0, 0, 0, 1 / this.m22, 0, 0, 0, 0, 1], true));
    }
    return super.getInverse();
  }
  multiply(t4) {
    const [e, i] = this.size, [s, r] = t4.size;
    if (i !== s) throw new Error("矩阵阶数不匹配，无法相乘");
    const n2 = this.subMatrix([3, 3]);
    return t4.clone().multiplyLeftSubMatrix(n2).multiplyLeftSubMatrix(n2, [3, 1], [0, 3]), C.FromMatrix(t4);
  }
  static FromMatrix(t4) {
    return t4 instanceof L ? t4 : new L(t4.data);
  }
  buildMatrix() {
    return new C(new S([4, 4], [this.m00, this.m01, this.m02, 0, this.m10, this.m11, this.m12, 0, this.m20, this.m21, this.m22, 0, 0, 0, 0, 1], true));
  }
}
class P extends C {
  getInverse() {
    return new C(new S([4, 4], [1 / this.m00, 0, 0, 0, 0, 1 / this.m11, 0, 0, 0, 0, 1 / this.m22, 0, 0, 0, 0, 1], true));
  }
  multiply(t4) {
    const [e, i] = this.size, [s, r] = t4.size;
    if (i !== s) throw new Error("矩阵阶数不匹配，无法相乘");
    const n2 = this.m00, o2 = this.m11, a2 = this.m11;
    return new C(new S([4, 4], [n2 * t4.m00, n2 * t4.m01, n2 * t4.m02, n2 * t4.m03, o2 * t4.m10, o2 * t4.m11, o2 * t4.m12, o2 * t4.m13, a2 * t4.m20, a2 * t4.m21, a2 * t4.m22, a2 * t4.m23, 0, 0, 0, 1], true));
  }
  static FromMatrix(t4) {
    return t4 instanceof P ? t4 : new P(t4.data);
  }
  buildMatrix() {
    return new C(new S([4, 4], [this.m00, 0, 0, 0, 0, this.m11, 0, 0, 0, 0, this.m22, 0, 0, 0, 0, 1], true));
  }
}
let B = class t2 {
  constructor(t4) {
    __publicField(this, "matrix");
    __publicField(this, "translateMatrix");
    __publicField(this, "rotateMatrix");
    __publicField(this, "skewMatrix");
    __publicField(this, "scaleMatrix");
    __publicField(this, "onChange", () => {
    });
    __publicField(this, "decomposeTranslateCache");
    __publicField(this, "decomposeEulerCache");
    __publicField(this, "decomposeSkewCache");
    __publicField(this, "decomposeScaleCache");
    __publicField(this, "inverseCache");
    __publicField(this, "_isMatrixLatest", true);
    __publicField(this, "_isSubMatrixLatest", true);
    var _a2, _b, _c, _d;
    if (this.matrix = (t4 == null ? void 0 : t4.matrix) || C.BuildIdentity([4, 4]), 4 !== this.matrix.rowCount || 4 !== this.matrix.colCount) throw new Error("矩阵数据错误：matrix不是4x4矩阵");
    if (this.translateMatrix = R.FromMatrix(((_a2 = t4 == null ? void 0 : t4.subMatrix) == null ? void 0 : _a2.translate) || C.BuildIdentity([4, 4])), 4 !== this.translateMatrix.rowCount || 4 !== this.translateMatrix.colCount) throw new Error("矩阵数据错误：translateMatrix必须为4x4矩阵");
    if (this.rotateMatrix = L.FromMatrix(((_b = t4 == null ? void 0 : t4.subMatrix) == null ? void 0 : _b.rotate) || C.BuildIdentity([4, 4])), 4 !== this.rotateMatrix.rowCount || 4 !== this.rotateMatrix.colCount) throw new Error("矩阵数据错误：rotateMatrix必须为4x4矩阵");
    if (this.skewMatrix = ((_c = t4 == null ? void 0 : t4.subMatrix) == null ? void 0 : _c.skew) || C.BuildIdentity([4, 4]), 4 !== this.skewMatrix.rowCount || 4 !== this.skewMatrix.colCount) throw new Error("矩阵数据错误：skewMatrix必须为4x4矩阵");
    if (this.scaleMatrix = P.FromMatrix(((_d = t4 == null ? void 0 : t4.subMatrix) == null ? void 0 : _d.scale) || C.BuildIdentity([4, 4])), 4 !== this.scaleMatrix.rowCount || 4 !== this.scaleMatrix.colCount) throw new Error("矩阵数据错误：scaleMatrix必须为4x4矩阵");
    ((t4 == null ? void 0 : t4.matrix) || (t4 == null ? void 0 : t4.subMatrix)) && (this.isMatrixLatest = !!(t4 == null ? void 0 : t4.matrix), this.isSubMatrixLatest = !!(t4 == null ? void 0 : t4.subMatrix));
  }
  clearDecomposeCache() {
    this.decomposeTranslateCache = void 0, this.decomposeEulerCache = void 0, this.decomposeSkewCache = void 0, this.decomposeScaleCache = void 0;
  }
  clearInverseCache() {
    this.inverseCache = void 0;
  }
  clearCache() {
    this.clearDecomposeCache(), this.clearInverseCache();
  }
  get isMatrixLatest() {
    return this._isMatrixLatest;
  }
  set isMatrixLatest(t4) {
    t4 || this.clearCache(), this._isMatrixLatest = t4;
  }
  get isSubMatrixLatest() {
    return this._isSubMatrixLatest;
  }
  set isSubMatrixLatest(t4) {
    t4 || this.clearCache(), this._isSubMatrixLatest = t4;
  }
  updateMatrix() {
    if (!this.isMatrixLatest || !this.isSubMatrixLatest) {
      if (this.isMatrixLatest) {
        this.translateMatrix = R.FromMatrix(C.BuildIdentity([4, 3]).insertCols(this.matrix.col3));
        const t4 = this.matrix.clone().resize([3, 3]);
        let e = t4.col0.cross(t4.col1);
        const i = e.dot(t4.col2) < 0;
        let s = t4.col0.angleTo(t4.col1);
        i && (s = Math.PI - s, e.negate());
        const r = s - 0.5 * Math.PI, { x: n2, y: o2, z: a2 } = e.cross(t4.col2), h2 = e.angleTo(t4.col2), l2 = Math.sin(h2), c2 = 1 - Math.cos(h2);
        this.skewMatrix = new C(new S([4, 4], [1, -Math.sin(r), -o2 * l2 + n2 * a2 * c2, 0, 0, Math.cos(r), n2 + o2 * a2 * c2, 0, 0, 0, 1 + c2 * (a2 ** 2 - 1), 0, 0, 0, 0, 1], true));
        const d2 = this.matrix.col0.norm, p2 = this.matrix.col1.norm * (i ? -1 : 1), u = this.matrix.col2.norm;
        this.scaleMatrix = P.FromMatrix(new C(new S([4, 4], [d2, 0, 0, 0, 0, p2, 0, 0, 0, 0, u, 0, 0, 0, 0, 1], true)));
        const f = this.translateMatrix.isIdentity ? this.matrix.clone() : this.translateMatrix.getInverse().multiply(this.matrix);
        this.scaleMatrix.isIdentity || f.multiply(this.scaleMatrix.getInverse()), this.skewMatrix.isIdentity || f.multiply(this.skewMatrix.getInverse()), this.rotateMatrix = L.FromMatrix(f);
      } else this.matrix = this.translateMatrix.clone().multiply(this.rotateMatrix).multiply(this.skewMatrix).multiply(this.scaleMatrix);
      this.isMatrixLatest = true, this.isSubMatrixLatest = true;
    }
  }
  clone() {
    var _a2, _b, _c, _d;
    this.updateMatrix();
    const t4 = new this.constructor({ matrix: this.matrix.clone(), subMatrix: { translate: this.translateMatrix.clone(), rotate: this.rotateMatrix.clone(), skew: this.skewMatrix.clone(), scale: this.scaleMatrix.clone() } });
    return t4.decomposeTranslateCache = (_a2 = this.decomposeTranslateCache) == null ? void 0 : _a2.clone(), t4.decomposeEulerCache = (_b = this.decomposeEulerCache) == null ? void 0 : _b.clone(), t4.decomposeScaleCache = (_c = this.decomposeScaleCache) == null ? void 0 : _c.clone(), t4.inverseCache = (_d = this.inverseCache) == null ? void 0 : _d.clone(), this.decomposeSkewCache && (t4.decomposeSkewCache = { x: { axis: this.decomposeSkewCache.x.axis.clone(), angle: this.decomposeSkewCache.x.angle }, y: { axis: this.decomposeSkewCache.y.axis.clone(), angle: this.decomposeSkewCache.y.angle }, z: { axis: this.decomposeSkewCache.z.axis.clone(), angle: this.decomposeSkewCache.z.angle } }), t4;
  }
  equals(t4) {
    let e = this.isMatrixLatest && t4.isMatrixLatest, i = this.isSubMatrixLatest && t4.isSubMatrixLatest;
    return e || i || this.updateMatrix(), e = this.isMatrixLatest && t4.isMatrixLatest, i = this.isSubMatrixLatest && t4.isSubMatrixLatest, e ? this.matrix.equals(t4.matrix) : this.translateMatrix.equals(t4.translateMatrix) && this.rotateMatrix.equals(t4.rotateMatrix) && this.skewMatrix.equals(t4.skewMatrix) && this.scaleMatrix.equals(t4.scaleMatrix);
  }
  reset() {
    this.matrix = C.BuildIdentity([4, 4]), this.translateMatrix = R.FromMatrix(C.BuildIdentity([4, 4])), this.rotateMatrix = L.FromMatrix(C.BuildIdentity([4, 4])), this.skewMatrix = C.BuildIdentity([4, 4]), this.scaleMatrix = P.FromMatrix(C.BuildIdentity([4, 4])), this.isMatrixLatest = true, this.isSubMatrixLatest = true, this.onChange(this);
  }
  setMatrix(t4) {
    if (4 !== t4.rowCount || 4 !== t4.colCount) throw new Error("矩阵数据错误：matrix不是4x4矩阵");
    this.matrix = t4, this.isMatrixLatest = true, this.isSubMatrixLatest = false, this.onChange(this);
  }
  setSubMatrix(t4) {
    if (this.isSubMatrixLatest || this.updateMatrix(), t4.translate) {
      if (4 !== t4.translate.rowCount || 4 !== t4.translate.colCount) throw new Error("矩阵数据错误：translate必须为4x4矩阵");
      this.translateMatrix = R.FromMatrix(t4.translate);
    }
    if (t4.rotate) {
      if (4 !== t4.rotate.rowCount || 4 !== t4.rotate.colCount) throw new Error("矩阵数据错误：rotate必须为4x4矩阵");
      this.rotateMatrix = L.FromMatrix(t4.rotate);
    }
    if (t4.skew) {
      if (4 !== t4.skew.rowCount || 4 !== t4.skew.colCount) throw new Error("矩阵数据错误：skew必须为4x4矩阵");
      this.skewMatrix = t4.skew;
    }
    if (t4.scale) {
      if (4 !== t4.scale.rowCount || 4 !== t4.scale.colCount) throw new Error("矩阵数据错误：scale必须为4x4矩阵");
      this.scaleMatrix = P.FromMatrix(t4.scale);
    }
    this.isMatrixLatest = false, this.isSubMatrixLatest = true, this.onChange(this);
  }
  getInverse() {
    if (this.inverseCache) return this.inverseCache.clone();
    this.isMatrixLatest || this.updateMatrix();
    const e = this.matrix.getInverse();
    if (!e) throw new Error("矩阵不可逆");
    return this.inverseCache = new t2({ matrix: e }), this.inverseCache.clone();
  }
  static FromVectorToVector(e, i) {
    if (e.isZero || i.isZero) throw new Error("不能为零向量");
    const s = e.clone().normalize(), r = i.clone().normalize(), n2 = new t2();
    if (e.equals(i)) return n2;
    const o2 = s.cross(r), a2 = s.angleTo(r);
    return b(a2) || n2.rotateAt({ axis: new O(o2), angle: a2 }), n2;
  }
  static FromLineToLine(e, i) {
    return t2.FromVectorToVector(e.direction, i.direction).translate(i.point.clone().subtract(e.point));
  }
  static FromPlaneToPlane(e, i) {
    return t2.FromVectorToVector(e.normal, i.normal).translateAt({ axis: i.normal, distance: i.d - e.d });
  }
  _getMatrixEl(t4) {
    return this.isMatrixLatest || this.updateMatrix(), this.matrix[t4];
  }
  _setMatrixEl(t4, e) {
    this.isMatrixLatest || this.updateMatrix(), this.matrix[t4] = e, this.isSubMatrixLatest = false, this.onChange(this);
  }
  get m00() {
    return this._getMatrixEl("m00");
  }
  set m00(t4) {
    this._setMatrixEl("m00", t4);
  }
  get m01() {
    return this._getMatrixEl("m01");
  }
  set m01(t4) {
    this._setMatrixEl("m01", t4);
  }
  get m02() {
    return this._getMatrixEl("m02");
  }
  set m02(t4) {
    this._setMatrixEl("m02", t4);
  }
  get m03() {
    return this._getMatrixEl("m03");
  }
  set m03(t4) {
    this._setMatrixEl("m03", t4);
  }
  get m10() {
    return this._getMatrixEl("m10");
  }
  set m10(t4) {
    this._setMatrixEl("m10", t4);
  }
  get m11() {
    return this._getMatrixEl("m11");
  }
  set m11(t4) {
    this._setMatrixEl("m11", t4);
  }
  get m12() {
    return this._getMatrixEl("m12");
  }
  set m12(t4) {
    this._setMatrixEl("m12", t4);
  }
  get m13() {
    return this._getMatrixEl("m13");
  }
  set m13(t4) {
    this._setMatrixEl("m13", t4);
  }
  get m20() {
    return this._getMatrixEl("m20");
  }
  set m20(t4) {
    this._setMatrixEl("m20", t4);
  }
  get m21() {
    return this._getMatrixEl("m21");
  }
  set m21(t4) {
    this._setMatrixEl("m21", t4);
  }
  get m22() {
    return this._getMatrixEl("m22");
  }
  set m22(t4) {
    this._setMatrixEl("m22", t4);
  }
  get m23() {
    return this._getMatrixEl("m23");
  }
  set m23(t4) {
    this._setMatrixEl("m23", t4);
  }
  get m30() {
    return this._getMatrixEl("m30");
  }
  set m30(t4) {
    this._setMatrixEl("m30", t4);
  }
  get m31() {
    return this._getMatrixEl("m31");
  }
  set m31(t4) {
    this._setMatrixEl("m31", t4);
  }
  get m32() {
    return this._getMatrixEl("m32");
  }
  set m32(t4) {
    this._setMatrixEl("m32", t4);
  }
  get m33() {
    return this._getMatrixEl("m33");
  }
  set m33(t4) {
    this._setMatrixEl("m33", t4);
  }
  transform(t4) {
    Array.isArray(t4) && (t4 = C.FromCols(t4));
    const [e, i] = t4.size;
    if (3 !== e) throw new Error("点必须是3维列向量");
    return this.isMatrixLatest || this.updateMatrix(), this.matrix.clone().multiply(t4.clone().insertRows(new S([1, i], 1))).deleteRow();
  }
  transformLine(t4) {
    return t4.clone().transform(this);
  }
  transformPlane(t4) {
    return t4.clone().transform(this);
  }
  transformCol(t4) {
    return E.FromMatrix(this.transform(t4));
  }
  translate(t4) {
    const e = new C(new S([4, 4], [1, 0, 0, t4.x, 0, 1, 0, t4.y, 0, 0, 1, t4.z, 0, 0, 0, 1], true));
    return this.isMatrixLatest ? (this.matrix = e.multiply(this.matrix), this.isSubMatrixLatest = false) : (this.translateMatrix = R.FromMatrix(e.multiply(this.translateMatrix)), this.isMatrixLatest = false), this.onChange(this), this;
  }
  translateAt(t4) {
    return this.translate(t4.axis.clone().normalize().multiplyByNumber(t4.distance));
  }
  translateInLocal(t4) {
    this.isMatrixLatest || this.updateMatrix();
    const e = this.matrix.clone().resize([3, 3]).normalize();
    return this.translate(e.multiply(t4).col0);
  }
  translateX(t4) {
    this.translate(E.FromXYZ(t4, 0, 0));
  }
  translateY(t4) {
    this.translate(E.FromXYZ(0, t4, 0));
  }
  translateZ(t4) {
    this.translate(E.FromXYZ(0, 0, t4));
  }
  preTranslate(t4) {
    this.isMatrixLatest || this.updateMatrix();
    const e = new C(new S([4, 4], [1, 0, 0, t4.x, 0, 1, 0, t4.y, 0, 0, 1, t4.z, 0, 0, 0, 1], true));
    return this.matrix.multiply(e), this.isSubMatrixLatest = false, this.onChange(this), this;
  }
  preTranslateX(t4) {
    this.preTranslate(new E([t4, 0, 0]));
  }
  preTranslateY(t4) {
    this.preTranslate(new E([0, t4, 0]));
  }
  preTranslateZ(t4) {
    this.preTranslate(new E([0, 0, t4]));
  }
  setTranslate(t4) {
    return this.isSubMatrixLatest || this.updateMatrix(), this.translateMatrix = R.FromMatrix(new C(new S([4, 4], [1, 0, 0, t4.x, 0, 1, 0, t4.y, 0, 0, 1, t4.z, 0, 0, 0, 1], true))), this.isMatrixLatest = false, this.onChange(this), this;
  }
  setTranslateX(t4) {
    const e = this.decomposeTranslate();
    this.setTranslate(new E([t4, e.y, e.z]));
  }
  setTranslateY(t4) {
    const e = this.decomposeTranslate();
    this.setTranslate(new E([e.x, t4, e.z]));
  }
  setTranslateZ(t4) {
    const e = this.decomposeTranslate();
    this.setTranslate(new E([e.x, e.y, t4]));
  }
  hasTranslate() {
    return this.isSubMatrixLatest || this.updateMatrix(), b(this.translateMatrix.m03) && b(this.translateMatrix.m13) && b(this.translateMatrix.m23);
  }
  onlyTranslate() {
    return this.isMatrixLatest || this.updateMatrix(), this.matrix.clone().resize([3, 3]).isIdentity;
  }
  scale(t4) {
    void 0 === t4.mode && (t4.mode = A.Global), (t4.mode === A.Local && !this.isSubMatrixLatest || t4.mode === A.Global && !this.isMatrixLatest) && this.updateMatrix();
    const e = new C(new S([4, 4], [t4.vector.x, 0, 0, 0, 0, t4.vector.y, 0, 0, 0, 0, t4.vector.z, 0, 0, 0, 0, 1], true));
    if (t4.mode === A.Local) {
      if (t4.point) {
        const i = this.scaleMatrix.buildMatrix().resize([3, 3]);
        this.scaleMatrix = P.FromMatrix(e.multiply(this.scaleMatrix));
        const s = this.scaleMatrix.buildMatrix().resize([3, 3]).subtract(i).multiply(t4.point.clone().negate()).col0;
        this.translate(s);
      } else this.scaleMatrix = P.FromMatrix(e.multiply(this.scaleMatrix));
      this.isMatrixLatest = false;
    } else t4.point && this.translate(t4.point.getNegate()), this.matrix = e.multiply(this.matrix), this.isSubMatrixLatest = false, t4.point && this.translate(t4.point);
    return this.onChange(this), this;
  }
  scaleX(t4) {
    return this.scale({ point: t4.point, vector: new E([t4.value, 1, 1]), mode: t4.mode });
  }
  scaleY(t4) {
    return this.scale({ point: t4.point, vector: new E([1, t4.value, 1]), mode: t4.mode });
  }
  scaleZ(t4) {
    return this.scale({ point: t4.point, vector: new E([1, 1, t4.value]), mode: t4.mode });
  }
  preScale(t4) {
    this.isMatrixLatest || this.updateMatrix();
    const e = new C(new S([4, 4], [t4.vector.x, 0, 0, 0, 0, t4.vector.y, 0, 0, 0, 0, t4.vector.z, 0, 0, 0, 0, 1], true));
    return t4.point && this.translate(t4.point.getNegate()), this.matrix.multiply(e), this.isSubMatrixLatest = false, t4.point && this.translate(t4.point), this.onChange(this), this;
  }
  preScaleX(t4) {
    return this.preScale({ vector: new E([t4.value, 1, 1]) });
  }
  preScaleY(t4) {
    return this.preScale({ vector: new E([1, t4.value, 1]) });
  }
  preScaleZ(t4) {
    return this.preScale({ vector: new E([1, 1, t4.value]) });
  }
  setScale(t4) {
    return this.isSubMatrixLatest || this.updateMatrix(), this.scaleMatrix = P.FromMatrix(new C(new S([4, 4], [t4.x, 0, 0, 0, 0, t4.y, 0, 0, 0, 0, t4.z, 0, 0, 0, 0, 1], true))), this.isMatrixLatest = false, this.onChange(this), this;
  }
  setScaleX(t4) {
    const e = this.decomposeScale();
    this.setScale(new E([t4, e.y, e.z]));
  }
  setScaleY(t4) {
    const e = this.decomposeScale();
    this.setScale(new E([e.x, t4, e.z]));
  }
  setScaleZ(t4) {
    const e = this.decomposeScale();
    this.setScale(new E([e.x, e.y, t4]));
  }
  hasScale() {
    return this.isSubMatrixLatest || this.updateMatrix(), !this.scaleMatrix.isIdentity;
  }
  onlyScale() {
    return !this.hasTranslate() && !this.hasSkew() && !this.hasRotation();
  }
  rotateX(t4) {
    void 0 === t4.mode && (t4.mode = A.Global), (t4.mode === A.Local && !this.isSubMatrixLatest || t4.mode === A.Global && !this.isMatrixLatest) && this.updateMatrix();
    const e = Math.sin(t4.angle), i = Math.cos(t4.angle), s = new C(new S([4, 4], [1, 0, 0, 0, 0, i, -e, 0, 0, e, i, 0, 0, 0, 0, 1], true));
    return t4.mode === A.Local ? (this.rotateMatrix = L.FromMatrix(s.multiply(this.rotateMatrix)), this.isMatrixLatest = false) : (this.matrix = s.multiply(this.matrix), this.isSubMatrixLatest = false), this.onChange(this), this;
  }
  preRotateX(t4) {
    this.isMatrixLatest || this.updateMatrix();
    const e = Math.sin(t4), i = Math.cos(t4), s = new C(new S([4, 4], [1, 0, 0, 0, 0, i, -e, 0, 0, e, i, 0, 0, 0, 0, 1], true));
    return this.matrix.multiply(s), this.isSubMatrixLatest = false, this.onChange(this), this;
  }
  rotateY(t4) {
    void 0 === t4.mode && (t4.mode = A.Global), (t4.mode === A.Local && !this.isSubMatrixLatest || t4.mode === A.Global && !this.isMatrixLatest) && this.updateMatrix();
    const e = Math.sin(t4.angle), i = Math.cos(t4.angle), s = new C(new S([4, 4], [i, 0, e, 0, 0, 1, 0, 0, -e, 0, i, 0, 0, 0, 0, 1], true));
    return t4.mode === A.Local ? (this.rotateMatrix = L.FromMatrix(s.multiply(this.rotateMatrix)), this.isMatrixLatest = false) : (this.matrix = s.multiply(this.matrix), this.isSubMatrixLatest = false), this.onChange(this), this;
  }
  preRotateY(t4) {
    this.isMatrixLatest || this.updateMatrix();
    const e = Math.sin(t4), i = Math.cos(t4), s = new C(new S([4, 4], [i, 0, e, 0, 0, 1, 0, 0, -e, 0, i, 0, 0, 0, 0, 1], true));
    return this.matrix.multiply(s), this.isSubMatrixLatest = false, this.onChange(this), this;
  }
  rotateZ(t4) {
    void 0 === t4.mode && (t4.mode = A.Global), (t4.mode === A.Local && !this.isSubMatrixLatest || t4.mode === A.Global && !this.isMatrixLatest) && this.updateMatrix();
    const e = Math.sin(t4.angle), i = Math.cos(t4.angle), s = new C(new S([4, 4], [i, -e, 0, 0, e, i, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], true));
    return t4.mode === A.Local ? (this.rotateMatrix = L.FromMatrix(s.multiply(this.rotateMatrix)), this.isMatrixLatest = false) : (this.matrix = s.multiply(this.matrix), this.isSubMatrixLatest = false), this.onChange(this), this;
  }
  preRotateZ(t4) {
    this.isMatrixLatest || this.updateMatrix();
    const e = Math.sin(t4), i = Math.cos(t4), s = new C(new S([4, 4], [i, -e, 0, 0, e, i, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], true));
    return this.matrix.multiply(s), this.isSubMatrixLatest = false, this.onChange(this), this;
  }
  rotate(t4) {
    void 0 === t4.mode && (t4.mode = A.Global), (t4.mode === A.Local && !this.isSubMatrixLatest || t4.mode === A.Global && !this.isMatrixLatest) && this.updateMatrix(), void 0 === t4.axis && (t4.axis = N.FromPoints(E.FromXYZ(0, 0, 1)));
    let [e, i, s] = t4.axis.direction.rawData;
    const r = -t4.angle, n2 = Math.cos(r), o2 = Math.sin(r), a2 = 1 - n2, h2 = new C(new S([4, 4], [1 + a2 * (e ** 2 - 1), s * o2 + e * i * a2, -i * o2 + e * s * a2, 0, -s * o2 + e * i * a2, 1 + a2 * (i ** 2 - 1), e * o2 + i * s * a2, 0, i * o2 + e * s * a2, -e * o2 + i * s * a2, 1 + a2 * (s ** 2 - 1), 0, 0, 0, 0, 1], true));
    return t4.mode === A.Local ? (this.rotateMatrix = L.FromMatrix(h2.multiply(this.rotateMatrix)), this.isMatrixLatest = false) : (this.matrix = h2.multiply(this.matrix), this.isSubMatrixLatest = false), this.onChange(this), this;
  }
  preRotate(t4) {
    this.isMatrixLatest || this.updateMatrix(), void 0 === t4.axis && (t4.axis = N.FromPoints(E.FromXYZ(0, 0, 1)));
    let [e, i, s] = t4.axis.direction.rawData;
    s = -s;
    const r = Math.cos(t4.angle), n2 = Math.sin(t4.angle), o2 = 1 - r, a2 = new C(new S([4, 4], [1 + o2 * (e ** 2 - 1), s * n2 + e * i * o2, -i * n2 + e * s * o2, 0, -s * n2 + e * i * o2, 1 + o2 * (i ** 2 - 1), e * n2 + i * s * o2, 0, i * n2 + e * s * o2, -e * n2 + i * s * o2, 1 + o2 * (s ** 2 - 1), 0, 0, 0, 0, 1], true));
    return this.matrix.multiply(a2), this.isSubMatrixLatest = false, this.onChange(this), this;
  }
  rotateAt(t4) {
    var _a2;
    void 0 === t4.mode && (t4.mode = A.Global), (t4.mode === A.Local && !this.isSubMatrixLatest || t4.mode === A.Global && !this.isMatrixLatest) && this.updateMatrix();
    const e = (_a2 = t4.axis) == null ? void 0 : _a2.point;
    if (t4.mode === A.Local) if (e) {
      let i = e.clone();
      this.scaleMatrix.isIdentity || (i = this.scaleMatrix.buildMatrix().resize([3, 3]).multiply(i)), this.skewMatrix.isIdentity || (i = this.skewMatrix.clone().resize([3, 3]).multiply(i));
      const s = this.rotateMatrix.buildMatrix().resize([3, 3]);
      this.rotate(t4);
      const r = this.rotateMatrix.buildMatrix().resize([3, 3]).subtract(s).multiply(i.negate()).col0;
      this.translate(r);
    } else this.rotate(t4);
    else e && this.translate(e.getNegate()), this.rotate(t4), e && this.translate(e);
    return this.onChange(this), this;
  }
  preRotateAt(t4) {
    return this.isMatrixLatest || this.updateMatrix(), t4.axis && this.preTranslate(t4.axis.point), this.preRotate(t4), t4.axis && this.preTranslate(t4.axis.point.clone().getNegate()), this.onChange(this), this;
  }
  setRotate(t4) {
    this.isSubMatrixLatest || this.updateMatrix();
    const [e, i, s] = t4.rawData, r = Math.cos(e), n2 = Math.sin(e), o2 = Math.cos(i), a2 = Math.sin(i), h2 = Math.cos(s), l2 = Math.sin(s);
    return this.rotateMatrix = L.FromMatrix(new C(new S([4, 4], [h2 * o2 - l2 * n2 * a2, -r * l2, h2 * a2 + o2 * l2 * n2, 0, o2 * l2 + h2 * n2 * a2, h2 * r, l2 * a2 - h2 * o2 * n2, 0, -r * a2, n2, r * o2, 0, 0, 0, 0, 1], true))), this.isMatrixLatest = false, this.onChange(this), this;
  }
  setRotateX(t4) {
    return this.setRotate(new E([t4, 0, 0]));
  }
  setRotateY(t4) {
    return this.setRotate(new E([0, t4, 0]));
  }
  setRotateZ(t4) {
    return this.setRotate(new E([0, 0, t4]));
  }
  hasRotation() {
    return this.isSubMatrixLatest || this.updateMatrix(), !this.rotateMatrix.isIdentity;
  }
  onlyRotation() {
    return !this.hasTranslate() && !this.hasSkew() && !this.hasScale();
  }
  _getSkewMatrix(t4) {
    function e(t5, e2) {
      const i2 = -t5.angle, s2 = Math.cos(i2), r2 = Math.sin(i2), n2 = 1 - s2, [o2, a2, h2] = t5.axis.rawData;
      return [() => E.FromXYZ(1 + n2 * (o2 ** 2 - 1), -h2 * r2 + o2 * a2 * n2, a2 * r2 + o2 * h2 * n2), () => E.FromXYZ(h2 * r2 + o2 * a2 * n2, 1 + n2 * (a2 ** 2 - 1), -o2 * r2 + a2 * h2 * n2), () => E.FromXYZ(-a2 * r2 + o2 * h2 * n2, o2 * r2 + a2 * h2 * n2, 1 + n2 * (h2 ** 2 - 1))][e2]();
    }
    const i = void 0 === t4.x || 0 === t4.x.angle ? E.FromXYZ(1, 0, 0) : e(t4.x, 0), s = void 0 === t4.y || 0 === t4.y.angle ? E.FromXYZ(0, 1, 0) : e(t4.y, 1), r = void 0 === t4.z || 0 === t4.z.angle ? E.FromXYZ(0, 0, 1) : e(t4.z, 2);
    return C.FromCols([i, s, r]).insertCols([0, 0, 0]).insertRows([0, 0, 0, 1]);
  }
  skew(t4) {
    void 0 === t4.mode && (t4.mode = A.Global), (t4.mode === A.Local && !this.isSubMatrixLatest || t4.mode === A.Global && !this.isMatrixLatest) && this.updateMatrix();
    let e = C.BuildIdentity([4, 4]);
    return void 0 !== t4.skew ? e = this._getSkewMatrix(t4.skew) : void 0 !== t4.skewAxis && (void 0 !== t4.skewAxis.x && e.setSubMatrix(t4.skewAxis.x, [0, 0]), void 0 !== t4.skewAxis.y && e.setSubMatrix(t4.skewAxis.y, [0, 1]), void 0 !== t4.skewAxis.z && e.setSubMatrix(t4.skewAxis.z, [0, 2])), t4.mode === A.Local ? (this.skewMatrix = e.multiply(this.skewMatrix), this.isMatrixLatest = false) : (this.matrix = e.multiply(this.matrix), this.isSubMatrixLatest = false), this.onChange(this), this;
  }
  preSkew(t4) {
    this.isMatrixLatest || this.updateMatrix();
    let e = C.BuildIdentity([4, 4]);
    return void 0 !== t4.skew ? e = this._getSkewMatrix(t4.skew) : void 0 !== t4.skewAxis && (void 0 !== t4.skewAxis.x && e.setSubMatrix(t4.skewAxis.x, [0, 0]), void 0 !== t4.skewAxis.y && e.setSubMatrix(t4.skewAxis.y, [0, 1]), void 0 !== t4.skewAxis.z && e.setSubMatrix(t4.skewAxis.z, [0, 2])), this.matrix.multiply(e), this.isSubMatrixLatest = false, this.onChange(this), this;
  }
  setSkew(t4) {
    this.isSubMatrixLatest || this.updateMatrix();
    let e = C.BuildIdentity([4, 4]);
    return void 0 !== t4.skew ? e = this._getSkewMatrix(t4.skew) : void 0 !== t4.skewAxis && (void 0 !== t4.skewAxis.x && e.setSubMatrix(t4.skewAxis.x.normalize(), [0, 0]), void 0 !== t4.skewAxis.y && e.setSubMatrix(t4.skewAxis.y.normalize(), [0, 1]), void 0 !== t4.skewAxis.z && e.setSubMatrix(t4.skewAxis.z.normalize(), [0, 2])), this.skewMatrix = e, this.isMatrixLatest = false, this.onChange(this), this;
  }
  hasSkew() {
    return this.isSubMatrixLatest || this.updateMatrix(), !this.skewMatrix.isIdentity;
  }
  onlySkew() {
    return !this.hasTranslate() && !this.hasRotation() && !this.hasScale();
  }
  addTransform(t4) {
    return t4.isMatrixLatest || t4.updateMatrix(), this.isMatrixLatest || this.updateMatrix(), this.matrix = t4.matrix.clone().multiply(this.matrix), this.isSubMatrixLatest = false, this.onChange(this), this;
  }
  addPreTransform(t4) {
    return t4.isMatrixLatest || t4.updateMatrix(), this.isMatrixLatest || this.updateMatrix(), this.matrix = this.matrix.clone().multiply(t4.matrix), this.isSubMatrixLatest = false, this.onChange(this), this;
  }
  mirrorX(t4) {
    return this.scaleX({ point: E.FromXYZ(t4 || 0, 0, 0), value: -1 });
  }
  mirrorY(t4) {
    return this.scaleY({ point: E.FromXYZ(0, t4 || 0, 0), value: -1 });
  }
  mirrorZ(t4) {
    return this.scaleZ({ point: E.FromXYZ(0, 0, t4 || 0), value: -1 });
  }
  flip(e) {
    const i = t2.FromPlaneToPlane(e, z.FromVerticalX());
    return this.addTransform(i).mirrorX().addTransform(i.getInverse());
  }
  preFlip(e) {
    const i = t2.FromPlaneToPlane(e, z.FromVerticalX());
    return this.addPreTransform(i.clone().mirrorX().addTransform(i.getInverse()));
  }
  flipH(t4) {
    return this.flip(new z(E.FromXYZ(1, 0, 0), t4 || 0));
  }
  preFlipH(t4) {
    return this.preFlip(new z(E.FromXYZ(1, 0, 0), t4 || 0));
  }
  flipV(t4) {
    return this.flip(new z(E.FromXYZ(0, 1, 0), t4 || 0));
  }
  preFlipV(t4) {
    return this.preFlip(new z(E.FromXYZ(0, 1, 0), t4 || 0));
  }
  decomposeTranslate() {
    if (void 0 !== this.decomposeTranslateCache) return this.decomposeTranslateCache.clone();
    const t4 = this.isMatrixLatest ? this.matrix : this.translateMatrix;
    return this.decomposeTranslateCache = t4.col3.deleteRow(), this.decomposeTranslateCache.clone();
  }
  decomposeEuler() {
    return void 0 !== this.decomposeEulerCache || (this.isSubMatrixLatest || this.updateMatrix(), this.decomposeEulerCache = t2.DecomposeEuler(this.rotateMatrix)), this.decomposeEulerCache.clone();
  }
  decomposeScale() {
    return void 0 !== this.decomposeScaleCache || (this.isSubMatrixLatest || this.updateMatrix(), this.decomposeScaleCache = new E([this.scaleMatrix.m00, this.scaleMatrix.m11, this.scaleMatrix.m22])), this.decomposeScaleCache.clone();
  }
  decomposeSkew() {
    if (void 0 === this.decomposeSkewCache) {
      this.isSubMatrixLatest || this.updateMatrix();
      const t4 = this.skewMatrix.col0.deleteRow(), e = this.skewMatrix.col1.deleteRow(), i = this.skewMatrix.col2.deleteRow(), s = E.FromXYZ(1, 0, 0), r = E.FromXYZ(0, 1, 0), n2 = E.FromXYZ(0, 0, 1), o2 = Math.asin(-this.skewMatrix.m01), a2 = { x: { axis: n2.clone(), angle: 0 }, y: { axis: n2.clone(), angle: o2 }, z: { axis: n2.cross(i), angle: n2.angleTo(i) } };
      t4.equals(s) || (a2.x = { axis: s.cross(t4), angle: s.angleTo(t4) }), e.equals(r) || (a2.y = { axis: r.cross(e), angle: r.angleTo(e) }), this.decomposeSkewCache = a2;
    }
    return { x: { axis: this.decomposeSkewCache.x.axis.clone(), angle: this.decomposeSkewCache.x.angle }, y: { axis: this.decomposeSkewCache.y.axis.clone(), angle: this.decomposeSkewCache.y.angle }, z: { axis: this.decomposeSkewCache.z.axis.clone(), angle: this.decomposeSkewCache.z.angle } };
  }
  static DecomposeEuler(t4) {
    const e = Math.asin(t4.m21);
    let i, s;
    return e === Math.PI / 2 || e === -Math.PI / 2 ? (i = Math.atan2(t4.m10, t4.m00), s = 0) : (i = Math.atan2(-t4.m20, t4.m22), s = Math.atan2(-t4.m01, t4.m11)), new E([e, i, s]);
  }
  decompose() {
    return { translate: this.decomposeTranslate(), rotate: this.decomposeEuler(), scale: this.decomposeScale(), skew: this.decomposeSkew() };
  }
  clearRotation() {
    return this.isSubMatrixLatest || this.updateMatrix(), this.rotateMatrix = L.FromMatrix(C.BuildIdentity([4, 4])), this.isMatrixLatest = false, this.onChange(this), this;
  }
  clearSkew() {
    return this.isSubMatrixLatest || this.updateMatrix(), this.skewMatrix = C.BuildIdentity([4, 4]), this.isMatrixLatest = false, this.onChange(this), this;
  }
  clearSkewAndResetScale() {
    return this.isSubMatrixLatest || this.updateMatrix(), this.scaleMatrix.multiplyByNumberSubMatrix(this.skewMatrix.m00, [3, 1], [0, 0]).multiplyByNumberSubMatrix(this.skewMatrix.m11, [3, 1], [0, 1]).multiplyByNumberSubMatrix(this.skewMatrix.m22, [3, 1], [0, 2]), this.isMatrixLatest = false, this.onChange(this), this;
  }
  clearScale() {
    return this.isSubMatrixLatest || this.updateMatrix(), this.scaleMatrix = P.FromMatrix(C.BuildIdentity([4, 4])), this.isMatrixLatest = false, this.onChange(this), this;
  }
  clearScaleAndKeepSkew() {
    this.isSubMatrixLatest || this.updateMatrix();
    const t4 = 1 / this.skewMatrix.m00, e = 1 / this.skewMatrix.m11, i = 1 / this.skewMatrix.m22;
    return this.scaleMatrix = P.FromMatrix(new C(new S([4, 4], [t4, 0, 0, 0, 0, e, 0, 0, 0, 0, i, 0, 0, 0, 0, 1], true))), this.isMatrixLatest = false, this.onChange(this), this;
  }
  clearScaleSize() {
    const t4 = this.decomposeScale();
    return this.setScale(E.FromXYZ(t4.x < 0 ? -1 : 1, t4.y < 0 ? -1 : 1, t4.z < 0 ? -1 : 1)), this;
  }
  clearScaleSizeAndKeepSkew() {
    this.isSubMatrixLatest || this.updateMatrix();
    const t4 = this.decomposeScale(), e = (t4.x < 0 ? -1 : 1) / this.skewMatrix.m00, i = (t4.y < 0 ? -1 : 1) / this.skewMatrix.m11, s = (t4.z < 0 ? -1 : 1) / this.skewMatrix.m22;
    return this.scaleMatrix = P.FromMatrix(new C(new S([4, 4], [e, 0, 0, 0, 0, i, 0, 0, 0, 0, s, 0, 0, 0, 0, 1], true))), this.isMatrixLatest = false, this.onChange(this), this;
  }
  clearRKS() {
    return this.isSubMatrixLatest || this.updateMatrix(), this.rotateMatrix = L.FromMatrix(C.BuildIdentity([4, 4])), this.skewMatrix = C.BuildIdentity([4, 4]), this.scaleMatrix = P.FromMatrix(C.BuildIdentity([4, 4])), this.isMatrixLatest = false, this.onChange(this), this;
  }
  clearTranslate() {
    return this.isSubMatrixLatest || this.updateMatrix(), this.translateMatrix = R.FromMatrix(C.BuildIdentity([4, 4])), this.isMatrixLatest = false, this.onChange(this), this;
  }
  makeFromRotateMatrix() {
    return new t2({ matrix: C.FromMatrix(this.rotateMatrix.clone()) });
  }
  makeFromTranslateMatrix() {
    return new t2({ matrix: C.FromMatrix(this.translateMatrix.clone()) });
  }
  makeFromSkewMatrix() {
    return new t2({ matrix: C.FromMatrix(this.skewMatrix.clone()) });
  }
  makeFromScaleMatrix() {
    return new t2({ matrix: C.FromMatrix(this.scaleMatrix.clone()) });
  }
  getMatrix() {
    return this.isMatrixLatest || this.updateMatrix(), this.matrix.clone();
  }
  getCoordinateSystemMatrix() {
    return this.isMatrixLatest || this.updateMatrix(), this.matrix.clone().resize([3, 4]);
  }
  toString() {
    return this.isMatrixLatest || this.updateMatrix(), this.matrix.toString();
  }
}, O = class t3 {
  constructor(t4, e) {
    __publicField(this, "direction");
    __publicField(this, "point");
    this.direction = t4.clone().normalize(), this.point = e ? e.clone() : E.FromXYZ(0, 0, 0);
  }
  static FromPoints(e, i) {
    return void 0 === i && ([e, i] = [E.FromXYZ(0, 0, 0), e]), new t3(i.subtract(e), i);
  }
  static FromParallelX(e) {
    return e && (e.x = 0), new t3(E.FromXYZ(1, 0, 0), e);
  }
  static FromParallelY(e) {
    return e && (e.y = 0), new t3(E.FromXYZ(0, 1, 0), e);
  }
  static FromParallelZ(e) {
    return e && (e.z = 0), new t3(E.FromXYZ(0, 0, 1), e);
  }
  clone() {
    return new t3(this.direction.clone(), this.point.clone());
  }
  transform(t4) {
    return this.direction = t4.transform(this.direction).col0, this.point = t4.transform(this.point).col0, this;
  }
  distanceToPoint(t4) {
    return this.direction.cross(t4.subtract(this.point)).norm;
  }
  projectionPoint(t4) {
    const e = this.direction.dot(t4.subtract(this.point));
    return this.point.add(this.direction.clone().multiplyByNumber(e));
  }
  isPointOnLine(t4) {
    return b(this.direction.cross(t4.subtract(this.point)).norm);
  }
  isLineParallel(t4) {
    return b(this.direction.cross(t4.direction).norm);
  }
  isLineVertical(t4) {
    return b(this.direction.dot(t4.direction));
  }
  intersectionWithLine(t4) {
    const e = this.direction, i = t4.direction, s = this.point, r = t4.point, n2 = C.FromCols([e, i.clone().negate()]), o2 = r.clone().subtract(s), a2 = n2.getInverse();
    if (void 0 === a2) return;
    const { x: h2, y: l2 } = a2.multiply(o2).col0;
    return s.clone().add(e.clone().multiplyByNumber(h2));
  }
  isLineIntersect(t4) {
    return !!this.intersectionWithLine(t4);
  }
  equals(t4) {
    return this.isLineParallel(t4) && this.isPointOnLine(t4.point);
  }
  toString() {
    return `x = ${this.point.m0} + ${this.direction.m0}t, y = ${this.point.m1} + ${this.direction.m1}t, z = ${this.point.m2} + ${this.direction.m2}t`;
  }
};
class N extends O {
  constructor(t4) {
    super(t4, E.FromXYZ(0, 0, 0));
  }
  static FromPoints(t4) {
    return new O(t4);
  }
  static FromXAxis() {
    return new O(E.FromXYZ(1, 0, 0));
  }
  static FromYAxis() {
    return new O(E.FromXYZ(0, 1, 0));
  }
  static FromZAxis() {
    return new O(E.FromXYZ(0, 0, 1));
  }
}
class z {
  constructor(t4, e) {
    __publicField(this, "normal");
    __publicField(this, "d");
    this.normal = t4.clone().normalize(), this.d = e;
  }
  static FromPointAndNormal(t4, e) {
    return new z(e, -e.dot(t4));
  }
  static FromPoints(t4, e, i) {
    const s = e.subtract(t4), r = i.subtract(t4), n2 = s.cross(r);
    if (0 === n2.norm) throw new Error("三点共线");
    return new z(n2.normalize(), -n2.dot(t4));
  }
  static FromVerticalX(t4 = 0) {
    return new z(E.FromXYZ(1, 0, 0), t4);
  }
  static FromVerticalY(t4 = 0) {
    return new z(E.FromXYZ(0, 1, 0), t4);
  }
  static FromVerticalZ(t4 = 0) {
    return new z(E.FromXYZ(0, 0, 1), t4);
  }
  clone() {
    return new z(this.normal.clone(), this.d);
  }
  transform(t4) {
    return this.normal = t4.transform(this.normal).col0, this.d = t4.transform(this.normal.clone().multiplyByNumber(this.d)).col0.norm, this;
  }
  distanceToPointDirect(t4) {
    return this.normal.dot(t4) + this.d;
  }
  distanceToPoint(t4) {
    return Math.abs(this.distanceToPointDirect(t4));
  }
  projectionPoint(t4) {
    const e = this.distanceToPointDirect(t4);
    return t4.subtract(this.normal.clone().multiplyByNumber(e));
  }
  intersectionWithLine(t4) {
    if (this.isLineParallel(t4)) return;
    const e = (this.d + this.normal.dot(this.normal)) / this.normal.dot(t4.direction);
    return t4.point.add(t4.direction.clone().multiplyByNumber(e));
  }
  intersectionWithPlane(t4) {
    if (this.isPlaneParallel(t4)) return;
    const e = this.normal.cross(t4.normal);
    return new O(e, this.intersectionWithLine(new O(e, this.normal.multiplyByNumber(this.d))));
  }
  isPointOnPlane(t4) {
    return b(this.distanceToPoint(t4));
  }
  isLineOnPlane(t4) {
    return this.isPointOnPlane(t4.point) && b(this.normal.dot(t4.direction));
  }
  isLineParallel(t4) {
    return b(this.normal.dot(t4.direction));
  }
  isLineVertical(t4) {
    return t4.isLineParallel(new O(this.normal));
  }
  isPlaneParallel(t4) {
    return b(this.normal.cross(t4.normal).norm);
  }
  isPlaneVertical(t4) {
    return b(this.normal.dot(t4.normal));
  }
  equals(t4) {
    return this.isPlaneParallel(t4) && this.isPointOnPlane(t4.normal.multiplyByNumber(t4.d));
  }
  toString() {
    return `${this.normal.m0}x + ${this.normal.m1}y + ${this.normal.m2}z + ${this.d} = 0`;
  }
}
const D = "8BC00DB1-35BD-1B62-F81F-23E231443680";
class X {
  constructor() {
    __publicField(this, "__uuid", D);
    __publicField(this, "typeId", "");
    __publicField(this, "__parent");
    __publicField(this, "__propKey");
  }
  get parent() {
    return this.__parent;
  }
  notify(...t4) {
    this.__parent && this.__parent.notify(this.__propKey, ...t4);
  }
  onRollback(t4) {
    this.__parent && this.__parent.onRollback(t4);
  }
  clone() {
    throw new Error("not implemented");
  }
  getCrdtPath() {
    if (!this.__parent) return [];
    if (Array.isArray(this.__parent)) {
      const t4 = this.__parent.getCrdtPath(), e = this.id;
      return e && t4.push(e), t4;
    }
    return this.__parent.getCrdtPath().concat(this.__propKey);
  }
  getOpTarget(t4) {
    let e = this;
    for (let i = 0; i < t4.length; i++) {
      const s = t4[i];
      if (e = e instanceof Map ? e.get(s) : e instanceof Array ? e.find((t5) => t5.id === s) : e[s], !e) return;
      if (e instanceof X) return e.getOpTarget(t4.slice(i + 1));
    }
    return e;
  }
}
class G extends Array {
  constructor() {
    super(...arguments);
    __publicField(this, "__uuid", D);
    __publicField(this, "typeId", "array");
    __publicField(this, "__parent");
    __publicField(this, "__propKey");
  }
  get parent() {
    return this.__parent;
  }
  notify(...t4) {
    this.__parent && this.__parent.notify(this.__propKey, ...t4);
  }
  onRollback(t4) {
    this.__parent && this.__parent.onRollback(t4);
  }
  getCrdtPath() {
    return this.__parent ? this.__parent.getCrdtPath().concat(this.__propKey) : [];
  }
}
class Y extends Map {
  constructor() {
    super(...arguments);
    __publicField(this, "__uuid", D);
    __publicField(this, "typeId", "map");
    __publicField(this, "__parent");
    __publicField(this, "__propKey");
  }
  get parent() {
    return this.__parent;
  }
  notify(...t4) {
    this.__parent && this.__parent.notify(this.__propKey, ...t4);
  }
  onRollback(t4) {
    this.__parent && this.__parent.onRollback(t4);
  }
  getCrdtPath() {
    return this.__parent ? this.__parent.getCrdtPath().concat(this.__propKey) : [];
  }
  toJSON() {
    const t4 = {};
    for (let [e, i] of this) t4[e] = i;
    return t4;
  }
}
class U extends X {
  constructor() {
    super(...arguments);
    __publicField(this, "__watcher", /* @__PURE__ */ new Set());
  }
  watch(t4) {
    return this.__watcher.add(t4), () => {
      this.__watcher.delete(t4);
    };
  }
  unwatch(t4) {
    return this.__watcher.delete(t4);
  }
  notify(...t4) {
    0 !== this.__watcher.size && Array.from(this.__watcher).forEach((e) => {
      e(...t4);
    });
  }
}
var nt, ot, at, ht, lt, ct, dt, pt, ut, ft, gt, mt, _t, xt, yt, wt, bt, Mt, vt, St, Ct, Tt, kt, It, Et, Ft, At, Rt, Lt, Pt, Bt, Ot, Nt, zt, Vt, Dt, Ht;
!function(t4) {
  t4.Normal = "normal", t4.Darken = "darken", t4.Multiply = "multiply", t4.ColorBurn = "color-burn", t4.Lighten = "lighten", t4.Screen = "screen", t4.ColorDodge = "color-dodge", t4.Overlay = "overlay", t4.SoftLight = "soft-light", t4.HardLight = "hard-light", t4.Difference = "difference", t4.Exclusion = "exclusion", t4.Hue = "hue", t4.Saturation = "saturation", t4.Color = "color", t4.Luminosity = "luminosity", t4.PlusDarker = "plus-darker", t4.PlusLighter = "plus-lighter";
}(nt || (nt = {})), function(t4) {
  t4.Gaussian = "gaussian", t4.Motion = "motion", t4.Zoom = "zoom", t4.Background = "background";
}(ot || (ot = {})), function(t4) {
  t4.None = "none", t4.Union = "union", t4.Subtract = "subtract", t4.Intersect = "intersect", t4.Diff = "diff";
}(at || (at = {})), function(t4) {
  t4.Inner = "inner", t4.Center = "center", t4.Outer = "outer";
}(ht || (ht = {})), function(t4) {
  t4.Inherit = "inherit", t4.Renew = "renew";
}(lt || (lt = {})), function(t4) {
  t4.None = "none", t4.Ordered1Ai = "ordered-1ai", t4.Disorded = "disorded";
}(ct || (ct = {})), function(t4) {
  t4.From = "from", t4.To = "to";
}(dt || (dt = {})), function(t4) {
  t4.Top = "top", t4.Right = "right", t4.Bottom = "bottom", t4.Left = "left";
}(pt || (pt = {})), function(t4) {
  t4.Miter = "miter", t4.Bevel = "bevel", t4.Round = "round";
}(ut || (ut = {})), function(t4) {
  t4.None = "none", t4.Straight = "straight", t4.Mirrored = "mirrored", t4.Asymmetric = "asymmetric", t4.Disconnected = "disconnected";
}(ft || (ft = {})), function(t4) {
  t4.Png = "png", t4.Jpg = "jpg", t4.Tiff = "tiff", t4.Eps = "eps", t4.Pdf = "pdf", t4.Webp = "webp", t4.Svg = "svg";
}(gt || (gt = {})), function(t4) {
  t4.Suffix = "suffix", t4.Prefix = "prefix";
}(mt || (mt = {})), function(t4) {
  t4.Scale = "scale", t4.Width = "width", t4.Height = "height";
}(_t || (_t = {})), function(t4) {
  t4.Nonzero = "nonzero", t4.Evenodd = "evenodd";
}(xt || (xt = {})), function(t4) {
  t4.SolidColor = "solid-color", t4.Gradient = "gradient", t4.Pattern = "pattern";
}(yt || (yt = {})), function(t4) {
  t4.Linear = "linear", t4.Radial = "radial", t4.Angular = "angular";
}(wt || (wt = {})), function(t4) {
  t4.X = "X", t4.Y = "Y";
}(bt || (bt = {})), function(t4) {
  t4.Fill = "fill", t4.Stretch = "stretch", t4.Fit = "fit", t4.Crop = "crop", t4.Tile = "tile";
}(Mt || (Mt = {})), function(t4) {
  t4.Butt = "butt", t4.Round = "round", t4.Projecting = "projecting";
}(vt || (vt = {})), function(t4) {
  t4.Miter = "miter", t4.Round = "round", t4.Bevel = "bevel";
}(St || (St = {})), function(t4) {
  t4.Line = "line", t4.FilledArrow = "filled-arrow", t4.OpenArrow = "open-arrow", t4.FilledCircle = "filled-circle", t4.FilledSquare = "filled-square", t4.Round = "round", t4.Square = "square";
}(Ct || (Ct = {})), function(t4) {
  t4.Name = "name", t4.Text = "text", t4.Image = "image", t4.Fills = "fills", t4.Borders = "borders", t4.Shadows = "shadows", t4.Visible = "visible", t4.Lock = "lock", t4.Variable = "variable", t4.SymbolID = "symbolID", t4.ContextSettings = "contextSettings", t4.TableCell = "tableCell", t4.StartMarkerType = "startMarkerType", t4.EndMarkerType = "endMarkerType", t4.ExportOptions = "exportOptions", t4.CornerRadius = "cornerRadius", t4.Blur = "blur";
}(Tt || (Tt = {})), function(t4) {
  t4.Exposure = "exposure", t4.Contrast = "contrast", t4.Saturation = "saturation", t4.Temperature = "temperature", t4.Tint = "tint", t4.Shadow = "shadow", t4.Hue = "hue";
}(kt || (kt = {})), function(t4) {
  t4.Stretch = "stretch", t4.PinToEdge = "pinToEdge", t4.Resize = "resize", t4.Float = "float";
}(It || (It = {})), function(t4) {
  t4.Inner = "inner", t4.Outer = "outer";
}(Et || (Et = {})), function(t4) {
  t4.Path = "path", t4.Path2 = "path2", t4.Group = "group", t4.Artboard = "artboard", t4.Image = "image", t4.Page = "page", t4.Text = "text", t4.SymbolRef = "symbol-ref", t4.Symbol = "symbol", t4.SymbolUnion = "symbol-union", t4.Rectangle = "rectangle", t4.Triangle = "triangle", t4.Star = "star", t4.Polygon = "polygon", t4.Oval = "oval", t4.Line = "line", t4.Table = "table", t4.TableCell = "table-cell", t4.Contact = "contact", t4.Cutout = "cutout", t4.BoolShape = "bool-shape";
}(Ft || (Ft = {})), function(t4) {
  t4.Normal = "normal", t4.Top = "top", t4.Bottom = "bottom", t4.Left = "left", t4.Right = "right", t4.Custom = "custom";
}(At || (At = {})), function(t4) {
  t4.None = "none", t4.Single = "single", t4.Double = "double";
}(Rt || (Rt = {})), function(t4) {
  t4.None = "none", t4.Text = "text", t4.Image = "image";
}(Lt || (Lt = {})), function(t4) {
  t4.Flexible = "flexible", t4.Fixed = "fixed", t4.FixWidthAndHeight = "fixWidthAndHeight";
}(Pt || (Pt = {})), function(t4) {
  t4.Left = "left", t4.Right = "right", t4.Centered = "centered", t4.Justified = "justified", t4.Natural = "natural";
}(Bt || (Bt = {})), function(t4) {
  t4.Horizontal = "horizontal", t4.Vertical = "vertical";
}(Ot || (Ot = {})), function(t4) {
  t4.None = "none", t4.Uppercase = "uppercase", t4.Lowercase = "lowercase", t4.UppercaseFirst = "uppercase-first";
}(Nt || (Nt = {})), function(t4) {
  t4.Top = "top", t4.Middle = "middle", t4.Bottom = "bottom";
}(zt || (zt = {})), function(t4) {
  t4.None = "none", t4.Single = "single", t4.Double = "double";
}(Vt || (Vt = {})), function(t4) {
  t4.Name = "name", t4.Color = "color", t4.Gradient = "gradient", t4.Text = "text", t4.Visible = "visible", t4.Lock = "lock", t4.SymbolRef = "symbolRef", t4.Status = "status", t4.ImageRef = "imageRef", t4.Fills = "fills", t4.Borders = "borders", t4.Shadows = "shadows", t4.Style = "style", t4.ContextSettings = "contextSettings", t4.TableCell = "tableCell", t4.MarkerType = "markerType", t4.ExportOptions = "exportOptions", t4.CornerRadius = "cornerRadius", t4.Blur = "blur";
}(Dt || (Dt = {})), function(t4) {
  t4.NonZero = "non-zero", t4.EvenOdd = "even-odd";
}(Ht || (Ht = {}));
class $t extends X {
  constructor(t4) {
    super();
    __publicField(this, "typeId", "bullet-numbers");
    __publicField(this, "type");
    __publicField(this, "behavior");
    __publicField(this, "offset");
    this.type = t4;
  }
}
let Gt = class extends X {
  constructor(t4 = 0, e = 0, i = 0, s = 0) {
    super();
    __publicField(this, "typeId", "color");
    __publicField(this, "alpha");
    __publicField(this, "red");
    __publicField(this, "green");
    __publicField(this, "blue");
    this.alpha = t4, this.red = e, this.green = i, this.blue = s;
  }
};
class Yt extends X {
  constructor(t4, e = 1) {
    super();
    __publicField(this, "typeId", "context-settings");
    __publicField(this, "blenMode");
    __publicField(this, "opacity");
    this.blenMode = t4, this.opacity = e;
  }
}
class Zt extends X {
  constructor(t4, e, i, s, r) {
    super();
    __publicField(this, "typeId", "curve-point");
    __publicField(this, "crdtidx");
    __publicField(this, "id");
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "mode");
    __publicField(this, "radius");
    __publicField(this, "fromX");
    __publicField(this, "fromY");
    __publicField(this, "toX");
    __publicField(this, "toY");
    __publicField(this, "hasFrom");
    __publicField(this, "hasTo");
    this.crdtidx = t4, this.id = e, this.x = i, this.y = s, this.mode = r;
  }
}
class qt extends X {
  constructor() {
    super(...arguments);
    __publicField(this, "typeId", "padding");
    __publicField(this, "left");
    __publicField(this, "top");
    __publicField(this, "right");
    __publicField(this, "bottom");
  }
}
class se extends X {
  constructor(t4 = 0, e = 0) {
    super();
    __publicField(this, "typeId", "point-2d");
    __publicField(this, "x");
    __publicField(this, "y");
    this.x = t4, this.y = e;
  }
}
class ne extends X {
  constructor(t4 = 0, e = 0, i = 0, s = 0) {
    super();
    __publicField(this, "typeId", "shape-frame");
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "width");
    __publicField(this, "height");
    this.x = t4, this.y = e, this.width = i, this.height = s;
  }
}
class oe extends X {
  constructor(t4 = 0, e = 0) {
    super();
    __publicField(this, "typeId", "shape-size");
    __publicField(this, "width");
    __publicField(this, "height");
    this.width = t4, this.height = e;
  }
}
class ae extends X {
  constructor(t4, e, i, s) {
    super();
    __publicField(this, "typeId", "stop");
    __publicField(this, "crdtidx");
    __publicField(this, "id");
    __publicField(this, "position");
    __publicField(this, "color");
    this.crdtidx = t4, this.id = e, this.position = i, this.color = s;
  }
}
let he = class extends X {
  constructor(t4 = 1, e = 0, i = 0, s = 0, r = 1, n2 = 0) {
    super();
    __publicField(this, "typeId", "transform");
    __publicField(this, "m00");
    __publicField(this, "m01");
    __publicField(this, "m02");
    __publicField(this, "m10");
    __publicField(this, "m11");
    __publicField(this, "m12");
    this.m00 = t4, this.m01 = e, this.m02 = i, this.m10 = s, this.m11 = r, this.m12 = n2;
  }
};
class ge extends X {
  constructor(t4, e = 0, i = false, s = false, r = false, n2 = false) {
    super();
    __publicField(this, "typeId", "export-options");
    __publicField(this, "exportFormats");
    __publicField(this, "childOptions");
    __publicField(this, "shouldTrim");
    __publicField(this, "trimTransparent");
    __publicField(this, "canvasBackground");
    __publicField(this, "unfold");
    this.exportFormats = t4, this.childOptions = e, this.shouldTrim = i, this.trimTransparent = s, this.canvasBackground = r, this.unfold = n2;
  }
}
const Me = [new Zt([0], "f9bbacab-970e-4bb6-9df2-32b02ea26ccc", 0, 0, ft.Straight), new Zt([1], "114f9903-1a14-4534-a7bf-ae10c77c39ff", 1, 0, ft.Straight), new Zt([2], "a22094f2-6e4d-4d64-ab35-13fe5452f3a5", 1, 1, ft.Straight), new Zt([3], "9407a2d0-e77b-4a44-a064-90f611342e39", 0, 1, ft.Straight)];
var ve, Se;
!function(t4) {
  t4[t4.Fixed = 0] = "Fixed", t4[t4.Editable = 1] = "Editable";
}(ve || (ve = {})), function(t4) {
  t4[t4.None = 0] = "None", t4[t4.Fixed = 1] = "Fixed", t4[t4.Rect = 2] = "Rect";
}(Se || (Se = {}));
const Ce = 0.135, Te = 1e-7, ke = {};
function Ie(t4, e, i) {
  return t4.computeCoord(e, i);
}
function Ee(t4, e, i) {
  const s = t4.computeCoord(e, i);
  return s.x -= t4.m02, s.y -= t4.m12, s;
}
function Fe(t4, e) {
  const i = Ie(t4, e[1], e[2]);
  e[1] = i.x, e[2] = i.y;
}
function Ae(t4, e) {
  const i = Ee(t4, e[1], e[2]);
  e[1] = i.x, e[2] = i.y;
}
ke.M = Fe, ke.m = Ae, ke.L = Fe, ke.l = Ae, ke.A = function(t4, e) {
  let i = Ee(t4, e[1], e[2]);
  e[1] = i.x, e[2] = i.y, i = Ie(t4, e[6], e[7]), e[6] = i.x, e[7] = i.y;
}, ke.a = function(t4, e) {
  let i = Ee(t4, e[1], e[2]);
  e[1] = i.x, e[2] = i.y, i = Ee(t4, e[6], e[7]), e[6] = i.x, e[7] = i.y;
}, ke.H = function(t4, e) {
  const i = Ie(t4, e[1], 0);
  e[1] = i.x;
}, ke.h = function(t4, e) {
  const i = Ee(t4, e[1], 0);
  e[1] = i.x;
}, ke.V = function(t4, e) {
  const i = Ie(t4, 0, e[1]);
  e[1] = i.y;
}, ke.v = function(t4, e) {
  const i = Ee(t4, 0, e[1]);
  e[1] = i.y;
}, ke.C = function(t4, e) {
  let i;
  i = Ie(t4, e[1], e[2]), e[1] = i.x, e[2] = i.y, i = Ie(t4, e[3], e[4]), e[3] = i.x, e[4] = i.y, i = Ie(t4, e[5], e[6]), e[5] = i.x, e[6] = i.y;
}, ke.c = function(t4, e) {
  let i;
  i = Ee(t4, e[1], e[2]), e[1] = i.x, e[2] = i.y, i = Ee(t4, e[3], e[4]), e[3] = i.x, e[4] = i.y, i = Ee(t4, e[5], e[6]), e[5] = i.x, e[6] = i.y;
}, ke.Q = function(t4, e) {
  let i;
  i = Ie(t4, e[1], e[2]), e[1] = i.x, e[2] = i.y, i = Ie(t4, e[3], e[4]), e[3] = i.x, e[4] = i.y;
}, ke.q = function(t4, e) {
  let i;
  i = Ee(t4, e[1], e[2]), e[1] = i.x, e[2] = i.y, i = Ee(t4, e[3], e[4]), e[3] = i.x, e[4] = i.y;
}, ke.Z = function(t4, e) {
}, ke.z = function(t4, e) {
};
const Re = {};
function Le(t4, e) {
  t4.minX > e ? t4.minX = e : t4.maxX < e && (t4.maxX = e);
}
function Pe(t4, e) {
  t4.minY > e ? t4.minY = e : t4.maxY < e && (t4.maxY = e);
}
function Be(t4, e, i, s, r) {
  const n2 = 1 - t4;
  return n2 * n2 * n2 * e + 3 * n2 * n2 * t4 * i + 3 * n2 * t4 * t4 * s + t4 * t4 * t4 * r;
}
function Oe(t4, e, i, s, r, n2, o2, a2) {
  const h2 = { minX: Math.min(t4, o2), minY: Math.min(e, a2), maxX: Math.max(t4, o2), maxY: Math.max(e, a2) }, l2 = i - t4, c2 = s - e, d2 = n2 - s, p2 = o2 - r, u = a2 - n2;
  if (i < h2.minX || i > h2.maxX || r < h2.minX || r > h2.maxX) {
    let e2 = r - i;
    l2 + p2 !== 2 * e2 && (e2 += 1e-4);
    const s2 = 2 * (l2 - e2);
    let n3 = 2 * (l2 - 2 * e2 + p2);
    0 === n3 && (n3 = 1e-4);
    const a3 = (2 * e2 - 2 * l2) * (2 * e2 - 2 * l2) - 2 * l2 * n3, c3 = Math.sqrt(a3), d3 = (s2 + c3) / n3, u2 = (s2 - c3) / n3;
    0 < d3 && d3 < 1 && Le(h2, Be(d3, t4, i, r, o2)), 0 < u2 && u2 < 1 && Le(h2, Be(u2, t4, i, r, o2));
  }
  if (s < h2.minY || s > h2.maxY || n2 < h2.minY || n2 > h2.maxY) {
    let t5 = d2;
    c2 + u !== 2 * t5 && (t5 += 1e-4);
    const i2 = 2 * (c2 - t5);
    let r2 = 2 * (c2 - 2 * t5 + u);
    0 === r2 && (r2 = 1e-4);
    const o3 = (2 * t5 - 2 * c2) * (2 * t5 - 2 * c2) - 2 * c2 * r2, l3 = Math.sqrt(o3), p3 = (i2 + l3) / r2, f = (i2 - l3) / r2;
    0 < p3 && p3 < 1 && Pe(h2, Be(p3, e, s, n2, a2)), 0 < f && f < 1 && Pe(h2, Be(f, e, s, n2, a2));
  }
  return h2;
}
Re.M = function(t4, e, i) {
  t4[1] += e, t4[2] += i;
}, Re.m = function(t4, e, i) {
}, Re.L = function(t4, e, i) {
  t4[1] += e, t4[2] += i;
}, Re.l = function(t4, e, i) {
}, Re.A = function(t4, e, i) {
  t4[6] += e, t4[7] += i;
}, Re.a = function(t4, e, i) {
}, Re.H = function(t4, e, i) {
  t4[1] += e;
}, Re.h = function(t4, e, i) {
}, Re.V = function(t4, e, i) {
  t4[1] += i;
}, Re.v = function(t4, e, i) {
}, Re.C = function(t4, e, i) {
  t4[1] += e, t4[2] += i, t4[3] += e, t4[4] += i, t4[5] += e, t4[6] += i;
}, Re.c = function(t4, e, i) {
}, Re.S = function(t4, e, i) {
  t4[1] += e, t4[2] += i, t4[3] += e, t4[4] += i;
}, Re.s = function(t4, e, i) {
}, Re.Q = function(t4, e, i) {
  t4[1] += e, t4[2] += i, t4[3] += e, t4[4] += i;
}, Re.q = function(t4, e, i) {
}, Re.T = function(t4, e, i) {
  t4[1] += e, t4[2] += i;
}, Re.t = function(t4, e, i) {
}, Re.Z = function(t4, e, i) {
}, Re.z = function(t4, e, i) {
};
const Ne = 2 * Math.PI;
function ze(t4, e, i, s, r, n2, o2, a2) {
  return { x: r * (t4 *= i) - n2 * (e *= s) + o2, y: n2 * t4 + r * e + a2 };
}
function Ve(t4, e) {
  const i = 4 / 3 * Math.tan(e / 4), s = Math.cos(t4), r = Math.sin(t4), n2 = Math.cos(t4 + e), o2 = Math.sin(t4 + e);
  return [{ x: s - r * i, y: r + s * i }, { x: n2 + o2 * i, y: o2 - n2 * i }, { x: n2, y: o2 }];
}
function De(t4, e, i, s) {
  const r = t4 * s - e * i < 0 ? -1 : 1;
  let n2 = (t4 * i + e * s) / (Math.sqrt(t4 * t4 + e * e) * Math.sqrt(t4 * t4 + e * e));
  return n2 > 1 && (n2 = 1), n2 < -1 && (n2 = -1), r * Math.acos(n2);
}
function He(t4, e) {
  const i = t4.x, s = t4.y, r = e[5], n2 = e[6];
  let o2 = e[0], a2 = e[1];
  const h2 = e[2], l2 = e[3], c2 = e[4], d2 = [];
  if (0 === o2 || 0 === a2) return null;
  const p2 = Math.sin(h2 * Math.PI / 180), u = Math.cos(h2 * Math.PI / 180), f = u * (i - r) / 2 + p2 * (s - n2) / 2, g = -p2 * (i - r) / 2 + u * (s - n2) / 2;
  if (0 === f && 0 === g) return null;
  const m = Math.pow(f, 2) / Math.pow(o2, 2) + Math.pow(g, 2) / Math.pow(a2, 2);
  m > 1 && (o2 *= Math.sqrt(m), a2 *= Math.sqrt(m));
  const _ = function(t5, e2, i2, s2, r2, n3, o3, a3, h3, l3, c3, d3) {
    const p3 = Math.pow(r2, 2), u2 = Math.pow(n3, 2), f2 = Math.pow(c3, 2), g2 = Math.pow(d3, 2);
    let m2 = p3 * u2 - p3 * g2 - u2 * f2;
    m2 < 0 && (m2 = 0), m2 /= p3 * g2 + u2 * f2, m2 = Math.sqrt(m2) * (o3 === a3 ? -1 : 1);
    const _2 = m2 * r2 / n3 * d3, x2 = m2 * -n3 / r2 * c3, y3 = l3 * _2 - h3 * x2 + (t5 + i2) / 2, w3 = h3 * _2 + l3 * x2 + (e2 + s2) / 2, b3 = (c3 - _2) / r2, M3 = (d3 - x2) / n3, v2 = (-c3 - _2) / r2, S2 = (-d3 - x2) / n3, C2 = De(1, 0, b3, M3);
    let T2 = De(b3, M3, v2, S2);
    return 0 === a3 && T2 > 0 && (T2 -= Ne), 1 === a3 && T2 < 0 && (T2 += Ne), [y3, w3, C2, T2];
  }(i, s, r, n2, o2, a2, l2, c2, p2, u, f, g), x = _[0], y2 = _[1];
  let w2 = _[2], b2 = _[3];
  const M2 = Math.max(Math.ceil(Math.abs(b2) / (Ne / 4)), 1);
  b2 /= M2;
  for (let t5 = 0; t5 < M2; t5++) d2.push(Ve(w2, b2)), w2 += b2;
  return d2.map(function(t5) {
    const e2 = ze(t5[0].x, t5[0].y, o2, a2, u, p2, x, y2), i2 = ze(t5[1].x, t5[1].y, o2, a2, u, p2, x, y2), s2 = ze(t5[2].x, t5[2].y, o2, a2, u, p2, x, y2);
    return [e2.x, e2.y, i2.x, i2.y, s2.x, s2.y];
  });
}
const We = {};
function $e(t4, e, i) {
  t4.boundsinited || (t4.boundsinited = true, t4.bounds.minX = t4.bounds.maxX = t4.prepoint.x, t4.bounds.minY = t4.bounds.maxY = t4.prepoint.y), Le(t4.bounds, e), Pe(t4.bounds, i);
}
We.M = (t4, e) => {
  const i = e[1], s = e[2];
  t4.beginpoint.x = i, t4.beginpoint.y = s, t4.prepoint.x = i, t4.prepoint.y = s, $e(t4, t4.prepoint.x, t4.prepoint.y);
}, We.m = (t4, e) => {
  const i = t4.prepoint.x + e[1], s = t4.prepoint.y + e[2];
  t4.beginpoint.x = i, t4.beginpoint.y = s, t4.prepoint.x = i, t4.prepoint.y = s, $e(t4, t4.prepoint.x, t4.prepoint.y);
}, We.L = (t4, e) => {
  const i = e[1], s = e[2];
  $e(t4, i, s), t4.prepoint.x = i, t4.prepoint.y = s;
}, We.l = (t4, e) => {
  const i = t4.prepoint.x + e[1], s = t4.prepoint.y + e[2];
  $e(t4, i, s), t4.prepoint.x = i, t4.prepoint.y = s;
}, We.A = (t4, e) => {
  const i = e[6], s = e[7], r = He(t4.prepoint, e.slice(1));
  if (r) for (let i2 = 0, s2 = r.length; i2 < s2; i2++) {
    const s3 = (e = ["C", ...r[i2]])[5], n2 = e[6], o2 = e[1], a2 = e[2], h2 = e[3], l2 = e[4], c2 = Oe(t4.prepoint.x, t4.prepoint.y, o2, a2, h2, l2, s3, n2);
    $e(t4, c2.minX, c2.minY), $e(t4, c2.maxX, c2.maxY);
  }
  t4.prepoint.x = i, t4.prepoint.y = s;
}, We.a = (t4, e) => {
  const i = t4.prepoint.x + e[6], s = t4.prepoint.y + e[7];
  (e = e.slice(0))[0] = "A", e[6] = i, e[7] = s;
  const r = He(t4.prepoint, e.slice(1));
  if (r) for (let i2 = 0, s2 = r.length; i2 < s2; i2++) {
    const s3 = (e = ["C", ...r[i2]])[5], n2 = e[6], o2 = e[1], a2 = e[2], h2 = e[3], l2 = e[4], c2 = Oe(t4.prepoint.x, t4.prepoint.y, o2, a2, h2, l2, s3, n2);
    $e(t4, c2.minX, c2.minY), $e(t4, c2.maxX, c2.maxY);
  }
  t4.prepoint.x = i, t4.prepoint.y = s;
}, We.H = (t4, e) => {
  const i = e[1], s = t4.prepoint.y;
  $e(t4, t4.prepoint.x, t4.prepoint.y), t4.prepoint.x = i, t4.prepoint.y = s;
}, We.h = (t4, e) => {
  const i = t4.prepoint.x + e[1], s = t4.prepoint.y;
  $e(t4, t4.prepoint.x, t4.prepoint.y), t4.prepoint.x = i, t4.prepoint.y = s;
}, We.V = (t4, e) => {
  const i = t4.prepoint.x, s = e[1];
  $e(t4, t4.prepoint.x, t4.prepoint.y), t4.prepoint.x = i, t4.prepoint.y = s;
}, We.v = (t4, e) => {
  const i = t4.prepoint.x, s = t4.prepoint.y + e[1];
  $e(t4, t4.prepoint.x, t4.prepoint.y), t4.prepoint.x = i, t4.prepoint.y = s;
}, We.C = (t4, e) => {
  const i = e[5], s = e[6], r = e[1], n2 = e[2], o2 = e[3], a2 = e[4], h2 = Oe(t4.prepoint.x, t4.prepoint.y, r, n2, o2, a2, i, s);
  $e(t4, h2.minX, h2.minY), $e(t4, h2.maxX, h2.maxY), t4.prepoint.x = i, t4.prepoint.y = s;
}, We.c = (t4, e) => {
  const i = t4.prepoint.x + e[5], s = t4.prepoint.y + e[6], r = t4.prepoint.x + e[1], n2 = t4.prepoint.y + e[2], o2 = t4.prepoint.x + e[3], a2 = t4.prepoint.y + e[4], h2 = Oe(t4.prepoint.x, t4.prepoint.y, r, n2, o2, a2, i, s);
  $e(t4, h2.minX, h2.minY), $e(t4, h2.maxX, h2.maxY), t4.prepoint.x = i, t4.prepoint.y = s;
}, We.Z = (t4, e) => {
  $e(t4, t4.prepoint.x, t4.prepoint.y), t4.prepoint.x = t4.beginpoint.x, t4.prepoint.y = t4.beginpoint.y;
}, We.z = (t4, e) => {
  $e(t4, t4.prepoint.x, t4.prepoint.y), t4.prepoint.x = t4.beginpoint.x, t4.prepoint.y = t4.beginpoint.y;
}, We.Q = (t4, e) => {
}, We.q = (t4, e) => {
};
const Xe = /([achlmrqstvz])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?\s*,?\s*)+)/gi, Ge = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s*,?\s*/gi;
const Ye = {};
function Ue(e, i, s) {
  if (!e.points.length) {
    const i2 = new Zt([0], v4(), e.beginpoint.x, e.beginpoint.y, ft.Straight);
    e.points.push(i2);
  }
  const r = new Zt([e.points.length], v4(), i, s, ft.Straight);
  e.points.push(r), e.prepoint.x = i, e.prepoint.y = s;
}
function Ze(e, i, s, r, n2, o2, a2) {
  const h2 = e.points.length;
  if (h2) {
    const t4 = e.points[e.points.length - 1];
    t4.hasFrom = true, t4.fromX = i, t4.fromY = s;
  } else {
    const r2 = new Zt([0], v4(), e.beginpoint.x, e.beginpoint.y, ft.Asymmetric);
    r2.hasFrom = true, r2.fromX = i, r2.fromY = s, e.points.push(r2);
  }
  const l2 = new Zt([h2], v4(), o2, a2, ft.Asymmetric);
  l2.hasTo = true, l2.toX = r, l2.toY = n2, e.prepoint = { x: o2, y: a2 }, e.preHandle = { x: r, y: n2 }, e.points.push(l2);
}
function je(e, i, s, r, n2) {
  const o2 = e.points.length;
  if (o2) {
    const t4 = e.points[e.points.length - 1];
    t4.hasFrom = true, t4.fromX = i, t4.fromY = s;
  } else {
    const r2 = new Zt([0], v4(), e.beginpoint.x, e.beginpoint.y, ft.Asymmetric);
    r2.hasFrom = true, r2.fromX = i, r2.fromY = s, e.points.push(r2);
  }
  e.prepoint = { x: r, y: n2 }, e.preHandle = { x: i, y: s }, e.points.push(new Zt([o2], v4(), r, n2, ft.Asymmetric));
}
Ye.M = (t4, e) => {
  const i = e[1], s = e[2], r = { beginpoint: { x: i, y: s }, prepoint: { x: i, y: s }, points: [], preHandle: { x: i, y: s }, lastCommand: "M" };
  t4.segs.push(r);
}, Ye.m = (t4, e) => {
  if (1 === t4.segs.length) return Ye.M(t4, e);
  const i = t4.segs[t4.segs.length - 1], s = (i.prepoint.x || 0) + e[1], r = (i.prepoint.y || 0) + e[2], n2 = { beginpoint: { x: s, y: r }, prepoint: { x: s, y: r }, points: [], preHandle: { x: s, y: r }, lastCommand: "M" };
  t4.segs.push(n2);
}, Ye.L = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  Ue(i, e[1], e[2]), i.lastCommand = "L";
}, Ye.l = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  Ue(i, i.prepoint.x + e[1], i.prepoint.y + e[2]), i.lastCommand = "L";
}, Ye.A = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1], s = e[6], r = e[7], n2 = He(i.prepoint, e.slice(1));
  if (n2) for (let t5 = 0, s2 = n2.length; t5 < s2; t5++) {
    const s3 = (e = ["C", ...n2[t5]])[5], r2 = e[6];
    Ze(i, e[1], e[2], e[3], e[4], s3, r2);
  }
  i.prepoint.x = s, i.prepoint.y = r, i.lastCommand = "C";
}, Ye.a = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1], s = i.prepoint.x + e[6], r = i.prepoint.y + e[7];
  (e = e.slice(0))[0] = "A", e[6] = s, e[7] = r;
  const n2 = He(i.prepoint, e.slice(1));
  if (n2) for (let t5 = 0, s2 = n2.length; t5 < s2; t5++) {
    const s3 = (e = ["C", ...n2[t5]])[5], r2 = e[6];
    Ze(i, e[1], e[2], e[3], e[4], s3, r2);
  }
  i.prepoint.x = s, i.prepoint.y = r, i.lastCommand = "C";
}, Ye.H = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  Ue(i, e[1], i.prepoint.y), i.lastCommand = "H";
}, Ye.h = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  Ue(i, i.prepoint.x + e[1], i.prepoint.y), i.lastCommand = "H";
}, Ye.V = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  Ue(i, i.prepoint.x, e[1]), i.lastCommand = "V";
}, Ye.v = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  Ue(i, i.prepoint.x, i.prepoint.y + e[1]), i.lastCommand = "V";
}, Ye.C = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1], s = e[5], r = e[6];
  Ze(i, e[1], e[2], e[3], e[4], s, r), i.lastCommand = "C";
}, Ye.c = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1], s = i.prepoint.x + e[5], r = i.prepoint.y + e[6];
  Ze(i, i.prepoint.x + e[1], i.prepoint.y + e[2], i.prepoint.x + e[3], i.prepoint.y + e[4], s, r), i.lastCommand = "C";
}, Ye.S = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  if ("C" === i.lastCommand) {
    Ze(i, 2 * i.prepoint.x - i.preHandle.x, 2 * i.prepoint.y - i.preHandle.y, e[1], e[2], e[3], e[4]);
  } else {
    const t5 = e[1], s = e[2];
    e[1], e[2];
    je(i, t5, s, e[3], e[4]);
  }
  e[0] = "C", i.lastCommand = "C";
}, Ye.s = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  if ("C" === i.lastCommand) {
    Ze(i, 2 * i.prepoint.x - i.preHandle.x, 2 * i.prepoint.y - i.preHandle.y, i.prepoint.x + e[1], i.prepoint.y + e[2], i.prepoint.x + e[3], i.prepoint.y + e[4]);
  } else {
    je(i, i.prepoint.x + e[1], i.prepoint.y + e[2], i.prepoint.x + e[3], i.prepoint.y + e[4]);
  }
  e[0] = "C", i.lastCommand = "C";
}, Ye.Q = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1], s = e[3], r = e[4];
  je(i, e[1], e[2], s, r), e[0] = "C", i.lastCommand = "C";
}, Ye.q = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1], s = i.prepoint.x + e[3], r = i.prepoint.y + e[4];
  je(i, i.prepoint.x + e[1], i.prepoint.y + e[2], s, r), e[0] = "C", i.lastCommand = "C";
}, Ye.T = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  if ("C" === i.lastCommand) {
    je(i, 2 * i.prepoint.x - i.preHandle.x, 2 * i.prepoint.y - i.preHandle.y, e[1], e[2]), e[0] = "C", i.lastCommand = "C";
  } else {
    Ue(i, e[1], e[2]), i.lastCommand = "L";
  }
}, Ye.t = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  if ("C" === i.lastCommand) {
    je(i, 2 * i.prepoint.x - i.preHandle.x, 2 * i.prepoint.y - i.preHandle.y, e[1] + i.prepoint.x, e[2] + i.prepoint.y), e[0] = "C", i.lastCommand = "C";
  } else {
    Ue(i, i.prepoint.x + e[1], i.prepoint.y + e[2]), i.lastCommand = "L";
  }
}, Ye.Z = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  i.isClosed = true, i.prepoint.x = i.beginpoint.x, i.prepoint.y = i.beginpoint.y, i.lastCommand = "Z";
}, Ye.z = (t4, e) => {
  const i = t4.segs[t4.segs.length - 1];
  i.isClosed = true, i.prepoint.x = i.beginpoint.x, i.prepoint.y = i.beginpoint.y, i.lastCommand = "Z";
};
class Je {
  constructor(t4) {
    __publicField(this, "m_segs");
    __publicField(this, "__bounds");
    this.m_segs = "string" == typeof t4 ? function(t5) {
      if (!t5) return [];
      const e = { a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0 }, i = [];
      return t5.replace(Xe, function(t6, s, r) {
        const n2 = [];
        let o2 = s.toLowerCase();
        if (r.replace(Ge, function(t7, e2) {
          return e2 && n2.push(+e2), "";
        }), "m" == o2 && n2.length > 2 && (i.push([s].concat(n2.splice(0, 2))), o2 = "l", s = "m" == s ? "l" : "L"), "r" == o2) i.push([s].concat(n2));
        else for (; n2.length >= e[o2] && (i.push([s].concat(n2.splice(0, e[o2]))), e[o2]); ) ;
        return "";
      }), i;
    }(t4) : t4 || [];
  }
  get length() {
    return this.m_segs.length;
  }
  push(...t4) {
    t4.forEach((t5) => {
      t5 && this.m_segs.push(...t5.m_segs);
    }), this.__bounds = void 0;
  }
  clone() {
    const t4 = [];
    this.m_segs.forEach((e2) => {
      t4.push(e2.slice());
    });
    const e = new Je(t4);
    return e.__bounds = this.__bounds, e;
  }
  translate(t4, e) {
    var _a2;
    "m" === ((_a2 = this.m_segs[0]) == null ? void 0 : _a2[0]) && (this.m_segs[0][0] = "M"), this.m_segs = this.m_segs.map(/* @__PURE__ */ function(t5, e2) {
      return (i) => (Re[i[0]](i, t5, e2), i);
    }(t4, e)), this.__bounds && (this.__bounds.maxX += t4, this.__bounds.minX += t4, this.__bounds.maxY += e, this.__bounds.minY += e);
  }
  transform(t4) {
    var e;
    this.m_segs = this.m_segs.map((e = t4, (t5) => {
      const i = ke[t5[0]];
      if (!i) throw console.error(t5), new Error();
      return i(e, t5), t5;
    })), this.__bounds = void 0;
  }
  toString() {
    return this.m_segs.map((t4) => t4.join(" ")).join(" ");
  }
  calcBounds() {
    return this.__bounds || (this.__bounds = function(t4) {
      const e = { beginpoint: { x: 0, y: 0 }, prepoint: { x: 0, y: 0 }, bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }, boundsinited: false };
      for (let i = 0, s = t4.length; i < s; i++) {
        const s2 = t4[i], r = We[s2[0]];
        if (!r) throw new Error("no bounds handler for " + s2[0]);
        r(e, s2);
      }
      return t4.length > 0 && "z" !== t4[t4.length - 1][0].toString().toLowerCase() && We.z(e, t4[t4.length - 1]), e.bounds;
    }(this.m_segs)), this.__bounds;
  }
  toCurvePoints(t4, e) {
    return function(t5, e2, i) {
      const s = { width: e2, height: i, segs: [] };
      s.segs.push({ beginpoint: { x: 0, y: 0 }, prepoint: { x: 0, y: 0 }, points: [], preHandle: { x: 0, y: 0 }, lastCommand: "M" });
      for (let e3 = 0, i2 = t5.length; e3 < i2; e3++) {
        const i3 = t5[e3];
        Ye[i3[0]](s, i3);
      }
      for (let t6 = 0, e3 = s.segs.length; t6 < e3; t6++) {
        const e4 = s.segs[t6], i2 = e4.points.length;
        if (i2 <= 1) continue;
        const r2 = e4.points[0], n2 = e4.points[i2 - 1];
        Math.abs(n2.x - r2.x) < Te && Math.abs(n2.y - r2.y) < Te && (e4.isClosed = true, n2.hasTo && (r2.hasTo = true, r2.toX = n2.toX, r2.toY = n2.toY), e4.points.splice(i2 - 1, 1));
      }
      const r = [];
      for (let t6 = 0, e3 = s.segs.length; t6 < e3; t6++) {
        const e4 = s.segs[t6];
        e4.points.length <= 1 || r.push({ points: e4.points, isClosed: !!e4.isClosed });
      }
      return r.forEach((t6) => {
        t6.points = t6.points.map((t7) => (t7.hasFrom && (t7.fromX = (t7.fromX || 0) / e2, t7.fromY = (t7.fromY || 0) / i), t7.hasTo && (t7.toX = (t7.toX || 0) / e2, t7.toY = (t7.toY || 0) / i), t7.x /= e2, t7.y /= i, t7));
      }), r;
    }(this.m_segs, t4, e);
  }
  freeze() {
    this.m_segs.forEach((t4) => Object.freeze(t4)), Object.freeze(this.m_segs);
  }
}
function Ke(t4, e, i) {
  return { x: t4.x + (e.x - t4.x) * i, y: t4.y + (e.y - t4.y) * i };
}
function qe(t4, e, i, s, r) {
  const n2 = Ke(t4, e, r), o2 = Ke(e, i, r), a2 = Ke(i, s, r), h2 = Ke(n2, o2, r), l2 = Ke(o2, a2, r), c2 = Ke(h2, l2, r);
  return [[t4, n2, h2, c2], [c2, l2, a2, s]];
}
function Qe(t4, e, i, s, r) {
  return { x: Math.pow(1 - t4, 3) * e.x + 3 * Math.pow(1 - t4, 2) * t4 * i.x + 3 * (1 - t4) * Math.pow(t4, 2) * s.x + Math.pow(t4, 3) * r.x, y: Math.pow(1 - t4, 3) * e.y + 3 * Math.pow(1 - t4, 2) * t4 * i.y + 3 * (1 - t4) * Math.pow(t4, 2) * s.y + Math.pow(t4, 3) * r.y };
}
function ti(t4, e, i, s, r) {
  const n2 = 3 * (e.x - t4.x), o2 = 3 * (e.y - t4.y), a2 = 3 * (i.x - e.x) - n2, h2 = 3 * (i.y - e.y) - o2, l2 = r * (n2 + r * (a2 + r * (s.x - t4.x - n2 - a2))), c2 = r * (o2 + r * (h2 + r * (s.y - t4.y - o2 - h2)));
  return Math.sqrt(l2 * l2 + c2 * c2);
}
function ei(t4, e, i, s, r, n2 = 1e-5) {
  let o2 = 0, a2 = 1, h2 = 0.5;
  for (; o2 <= a2; ) {
    const l2 = ti(t4, e, i, s, h2);
    if (Math.abs(l2 - r) < n2) return h2;
    l2 < r ? (o2 = h2, h2 += 0.5 * (a2 - h2)) : (a2 = h2, h2 -= 0.5 * (h2 - o2));
  }
  return null;
}
function ii(t4, e) {
  return Math.hypot(t4.x - e.x, t4.y - e.y);
}
function si(t4, e) {
  return { x: t4.x - e.x, y: t4.y - e.y };
}
function ri(t4) {
  const e = Math.hypot(t4.x, t4.y);
  return { x: t4.x / e, y: t4.y / e };
}
function ni(t4, e) {
  return { x: t4.x * e, y: t4.y * e };
}
function oi(t4, e) {
  return { x: t4.x + e.x, y: t4.y + e.y };
}
function ai(t4, e, i, s, r = 0) {
  let n2 = false;
  const o2 = t4.length;
  if (o2 < 2) return [];
  const a2 = {}, h2 = [], l2 = (t5, e2, i2, s2, r2, n3) => {
    h2.push(["C", t5, e2, i2, s2, r2, n3]);
  }, c2 = (t5, e2) => ({ x: t5 * i, y: e2 * s }), d2 = t4.map((t5) => c2(t5.x, t5.y));
  for (let t5 = 0; t5 < o2 - 1; t5++) f(t5, t5 + 1);
  function p2(i2) {
    const s2 = t4[i2];
    return !s2.hasFrom && !s2.hasTo && ((s2.radius || 0) > 0 || r > 0);
  }
  function u(e2) {
    if (a2[e2]) return a2[e2];
    const i2 = 0 === e2 ? o2 - 1 : e2 - 1, s2 = e2 === o2 - 1 ? 0 : e2 + 1, n3 = t4[i2], h3 = t4[e2], l3 = t4[s2], p3 = d2[i2], u2 = d2[e2], f2 = d2[s2], g = ii(u2, p3), m = ii(u2, f2), _ = function(t5, e3, i3) {
      const s3 = ii(t5, e3), r2 = ii(e3, i3), n4 = ii(i3, t5);
      return Math.acos((r2 * r2 + s3 * s3 - n4 * n4) / (2 * r2 * s3));
    }(p3, u2, f2);
    if (Number.isNaN(_)) return;
    let x = h3.radius || r;
    const y2 = Math.tan(_ / 2);
    let w2 = x / y2;
    const b2 = Math.min((n3.radius || r) > 0 ? g / 2 : g, (l3.radius || r) > 0 ? m / 2 : m);
    w2 > b2 && (w2 = b2, x = w2 * y2);
    const M2 = ri(si(p3, u2)), v2 = ri(si(f2, u2));
    let S2 = oi(ni(M2, w2), u2), C2 = oi(ni(v2, w2), u2);
    const T2 = 4 / 3 * Math.tan((Math.PI - _) / 4);
    let k2 = oi(ni(M2, -x * T2), S2), I = oi(ni(v2, -x * T2), C2), E2 = [], F2 = [];
    if (n3.hasFrom) {
      const t5 = c2(n3.fromX || 0, n3.fromY || 0), e3 = ei(u2, u2, t5, p3, w2);
      if (null !== e3) {
        const i3 = Qe(e3, u2, u2, t5, p3);
        S2 = i3 || S2, E2 = qe(u2, u2, t5, p3, e3), k2 = E2[0][2];
      }
    }
    if (l3.hasTo) {
      const t5 = c2(l3.toX || 0, l3.toY || 0), e3 = ei(u2, u2, t5, f2, w2);
      if (null !== e3) {
        const i3 = Qe(e3, u2, u2, t5, f2);
        C2 = i3 || C2, F2 = qe(u2, u2, t5, f2, e3), I = F2[0][2];
      }
    }
    return a2[e2] = { curPoint: u2, preTangent: S2, nextTangent: C2, preHandle: k2, nextHandle: I, preSlices: E2, nextSlices: F2 }, a2[e2];
  }
  function f(e2, i2) {
    let s2, r2, o3, a3, f2, g = true;
    if (p2(e2) && (f2 = u(e2))) {
      const { nextTangent: t5, nextSlices: e3 } = f2;
      s2 = t5, e3.length && (r2 = e3[1][1], a3 = e3[1][2]), g = false;
    } else {
      const i3 = t4[e2];
      s2 = d2[e2], r2 = i3.hasFrom ? c2(i3.fromX || 0, i3.fromY || 0) : void 0;
    }
    var m, _;
    n2 || (n2 = true, m = s2.x, _ = s2.y, h2.push(["M", m, _]));
    const x = p2(i2);
    if (x && (f2 = u(i2))) {
      const { preTangent: t5, preSlices: e3 } = f2;
      o3 = t5, e3.length && (r2 = e3[1][2], a3 = e3[1][1]);
    } else {
      const e3 = t4[i2];
      o3 = d2[i2], g && (a3 = e3.hasTo ? c2(e3.toX || 0, e3.toY || 0) : void 0);
    }
    if (r2 || a3 ? l2((r2 == null ? void 0 : r2.x) ?? (s2 == null ? void 0 : s2.x), (r2 == null ? void 0 : r2.y) ?? s2.y, (a3 == null ? void 0 : a3.x) ?? o3.x, (a3 == null ? void 0 : a3.y) ?? o3.y, o3.x, o3.y) : ((t5, e3) => {
      h2.push(["L", t5, e3]);
    })(o3.x, o3.y), x && f2) {
      const { nextTangent: t5, preHandle: e3, nextHandle: i3 } = f2;
      l2(e3.x, e3.y, i3.x, i3.y, t5.x, t5.y);
    }
  }
  return f(o2 - 1, 0), h2.push(["Z"]), h2;
}
new he();
function pi(t4) {
  return new B({ matrix: new C([4, 4], [t4.m00, t4.m01, 0, t4.m02, t4.m10, t4.m11, 0, t4.m12, 0, 0, 1, 0, 0, 0, 0, 1], true) });
}
class _i extends X {
  constructor(t4, e, i, s, r, n2) {
    super();
    __publicField(this, "__watcher", /* @__PURE__ */ new Set());
    __publicField(this, "__bubblewatcher", /* @__PURE__ */ new Set());
    __publicField(this, "typeId", "shape");
    __publicField(this, "crdtidx");
    __publicField(this, "id");
    __publicField(this, "type");
    __publicField(this, "style");
    __publicField(this, "transform");
    __publicField(this, "boolOp");
    __publicField(this, "isFixedToViewport");
    __publicField(this, "isLocked");
    __publicField(this, "isVisible");
    __publicField(this, "exportOptions");
    __publicField(this, "name");
    __publicField(this, "nameIsFixed");
    __publicField(this, "resizingConstraint");
    __publicField(this, "resizingType");
    __publicField(this, "constrainerProportions");
    __publicField(this, "clippingMaskMode");
    __publicField(this, "hasClippingMask");
    __publicField(this, "shouldBreakMaskChain");
    __publicField(this, "varbinds");
    __publicField(this, "haveEdit");
    __publicField(this, "mask");
    this.crdtidx = t4, this.id = e, this.name = i, this.type = s, this.transform = r, this.style = n2;
  }
  watch(t4) {
    return this.__watcher.add(t4), () => {
      this.__watcher.delete(t4);
    };
  }
  unwatch(t4) {
    return this.__watcher.delete(t4);
  }
  notify(...t4) {
    var _a2;
    this.__watcher.size > 0 && Array.from(this.__watcher).forEach((e) => {
      e(...t4);
    }), (_a2 = this.parent) == null ? void 0 : _a2.bubblenotify(...t4);
  }
  bubblewatch(t4) {
    return this.__bubblewatcher.add(t4), () => {
      this.__bubblewatcher.delete(t4);
    };
  }
  bubbleunwatch(t4) {
    return this.__bubblewatcher.delete(t4);
  }
  bubblenotify(...t4) {
    var _a2;
    this.__bubblewatcher.size > 0 && Array.from(this.__bubblewatcher).forEach((e) => {
      e(...t4);
    }), (_a2 = this.parent) == null ? void 0 : _a2.bubblenotify(...t4);
  }
  getCrdtPath() {
    const t4 = this.getPage();
    return t4 && t4 !== this ? [t4.id, this.id] : [this.id];
  }
  getOpTarget(t4) {
    const e = t4[0];
    return "style" === e ? this.style.getOpTarget(t4.slice(1)) : ("varbinds" !== e || this.varbinds || (this.varbinds = new Y()), "exportOptions" !== e || this.exportOptions || (this.exportOptions = new ge(new G(), 0, false, false, false, false)), super.getOpTarget(t4));
  }
  get naviChilds() {
  }
  get isVirtualShape() {
    return false;
  }
  get isSymbolShape() {
    return false;
  }
  get rotation() {
    return 180 * pi(this.transform).decomposeEuler().z / Math.PI;
  }
  get x() {
    return this.transform.m02;
  }
  set x(t4) {
    this.transform.m02 = t4;
  }
  get y() {
    return this.transform.m12;
  }
  set y(t4) {
    this.transform.m12 = t4;
  }
  get size() {
    return new oe();
  }
  set size(t4) {
  }
  get frame() {
    const { width: t4, height: e } = this.size;
    return new ne(0, 0, t4, e);
  }
  hasSize() {
    return false;
  }
  getPathOfSize(t4, e) {
    return new Je();
  }
  getPath(t4) {
    return this.getPathOfSize(this.frame, t4);
  }
  getPathStr(t4) {
    return this.getPath(t4).toString();
  }
  getPage() {
    let t4 = this;
    for (; t4 && t4.type !== Ft.Page; ) t4 = t4.parent;
    return t4;
  }
  get parent() {
    let t4 = this.__parent;
    for (; t4 && !(t4 instanceof _i); ) t4 = t4.parent;
    return t4;
  }
  realXY() {
    return this.frame2Root();
  }
  frame2Root() {
    const t4 = this.frame, e = this.matrix2Root(), i = e.computeCoord(t4.x, t4.y), s = e.computeCoord(t4.x + t4.width, t4.y + t4.height);
    return new ne(i.x, i.y, s.x - i.x, s.y - i.y);
  }
  frame2Parent() {
    const t4 = this.frame;
    if (this.isNoTransform()) return new ne(this.transform.m02 + t4.x, this.transform.m12 + t4.y, t4.width, t4.height);
    const e = this.transform, i = e.computeCoord(t4.x, t4.y), s = e.computeCoord(t4.x + t4.width, t4.y + t4.height);
    return new ne(i.x, i.y, s.x - i.x, s.y - i.y);
  }
  matrix2Root() {
    let t4 = this;
    const e = new o();
    for (; t4; ) t4.matrix2Parent(e), t4 = t4.parent;
    return e;
  }
  isNoTransform() {
    const t4 = this.transform;
    return 1 == t4.m00 && 0 === t4.m01 && 0 === t4.m10 && 1 === t4.m11;
  }
  matrix2Parent(t4) {
    const e = this.transform.toMatrix();
    return t4 ? (t4.multiAtLeft(e), t4) : e;
  }
  boundingBox() {
    if (this.isNoTransform()) {
      const t5 = this.transform, e2 = this.frame;
      return new ne(t5.translateX, t5.translateY, e2.width, e2.height);
    }
    const t4 = this.getPath();
    if (t4.length > 0) {
      const e2 = this.transform;
      t4.transform(e2);
      const i2 = t4.calcBounds();
      return new ne(i2.minX, i2.minY, i2.maxX - i2.minX, i2.maxY - i2.minY);
    }
    const e = this.frame, i = this.transform, s = [{ x: e.x, y: e.y }, { x: e.x + e.width, y: e.y }, { x: e.x + e.width, y: e.y + e.height }, { x: e.x, y: e.y + e.height }].map((t5) => i.computeCoord(t5)), r = s.reduce((t5, e2) => Math.min(t5, e2.x), s[0].x), n2 = s.reduce((t5, e2) => Math.max(t5, e2.x), s[0].x), o2 = s.reduce((t5, e2) => Math.min(t5, e2.y), s[0].y), a2 = s.reduce((t5, e2) => Math.max(t5, e2.y), s[0].y);
    return new ne(r, o2, n2 - r, a2 - o2);
  }
  boundingBox2() {
    const t4 = this.frame, e = this.transform, i = [{ x: t4.x, y: t4.y }, { x: t4.x + t4.width, y: t4.y }, { x: t4.x + t4.width, y: t4.y + t4.height }, { x: t4.x, y: t4.y + t4.height }].map((t5) => e.computeCoord(t5)), s = i.reduce((t5, e2) => Math.min(t5, e2.x), i[0].x), r = i.reduce((t5, e2) => Math.max(t5, e2.x), i[0].x), n2 = i.reduce((t5, e2) => Math.min(t5, e2.y), i[0].y), o2 = i.reduce((t5, e2) => Math.max(t5, e2.y), i[0].y);
    return new ne(s, n2, r - s, o2 - n2);
  }
  boundingBox3() {
    const t4 = this.getPath();
    if (t4.length > 0) {
      const e = t4.calcBounds();
      return new ne(e.minX, e.minY, e.maxX - e.minX, e.maxY - e.minY);
    }
  }
  findVar(t4, e) {
    var _a2;
    (_a2 = this.parent) == null ? void 0 : _a2.findVar(t4, e);
  }
  getVisible() {
    if (!this.varbinds) return !!this.isVisible;
    if (this.isVirtualShape) return !!this.isVisible;
    const t4 = this.varbinds.get(Tt.Visible);
    if (!t4) return !!this.isVisible;
    const e = [];
    this.findVar(t4, e);
    const i = e[e.length - 1];
    return i && i.type === Dt.Visible ? !!i.value : !!this.isVisible;
  }
  onAdded() {
  }
  onRemoved() {
  }
  getFills() {
    return this.style.fills;
  }
  getBorders() {
    return this.style.borders;
  }
  getShadows() {
    return this.style.shadows;
  }
  get isContainer() {
    return false;
  }
  get pathType() {
    return ve.Editable;
  }
  get isPathIcon() {
    return true;
  }
  get radius() {
    return [0];
  }
  get radiusType() {
    return Se.None;
  }
  get isClosed() {
    return true;
  }
  get isStraight() {
    return false;
  }
  getImageFill() {
    const t4 = this.getFills();
    return !!t4.length && t4.some((t5) => t5.fillType === yt.Pattern);
  }
}
class xi extends _i {
  constructor(t4, e, i, s, r, n2, o2) {
    super(t4, e, i, s, r, n2);
    __publicField(this, "typeId", "group-shape");
    __publicField(this, "childs");
    __publicField(this, "fixedRadius");
    this.childs = o2;
  }
  get naviChilds() {
    return this.childs;
  }
  removeChild(t4) {
    const e = this.indexOfChild(t4);
    return e >= 0 && this.childs.splice(e, 1), e >= 0;
  }
  removeChildAt(t4) {
    if (t4 >= 0) {
      const e = this.childs.splice(t4, 1);
      if (e.length > 0) return e[0];
    }
  }
  addChild(t4) {
    this.childs.push(t4);
  }
  addChildAt(t4, e) {
    if (e && e > this.childs.length) throw new Error("add child at outside index: " + e + " , childs length: " + this.childs.length);
    const i = e ?? this.childs.length;
    return this.childs.splice(i, 0, t4), this.childs[i];
  }
  indexOfChild(t4) {
    return this.childs.findIndex((e) => e.id == t4.id);
  }
  findChildById(t4) {
    return this.childs.find((e) => {
      if (e.id == t4) return e;
    });
  }
  getPathOfSize(t4, e) {
    const i = t4.width, s = t4.height;
    return new Je([["M", 0, 0], ["l", i, 0], ["l", 0, s], ["l", -i, 0], ["z"]]);
  }
  get pathType() {
    return ve.Fixed;
  }
  get isPathIcon() {
    return false;
  }
  get radiusType() {
    return Se.Fixed;
  }
  getImageFill() {
    return false;
  }
  get size() {
    return this.frame;
  }
  set size(t4) {
  }
  get frame() {
    const t4 = this.childs.map((t5) => t5.frame2Parent()).reduce((t5, e2, i2) => (0 === i2 ? (t5.minx = e2.x, t5.maxx = e2.x + e2.width, t5.miny = e2.y, t5.maxy = e2.y + e2.height) : (t5.minx = Math.min(t5.minx, e2.x), t5.maxx = Math.max(t5.maxx, e2.x + e2.width), t5.miny = Math.min(t5.miny, e2.y), t5.maxy = Math.max(t5.maxy, e2.y + e2.height)), t5), { minx: 0, miny: 0, maxx: 0, maxy: 0 }), { minx: e, miny: i, maxx: s, maxy: r } = t4;
    return new ne(e, i, s - e, r - i);
  }
}
class Ei extends _i {
  constructor(t4, e, i, s, r, n2, o2, a2) {
    super(t4, e, i, s, r, n2);
    __publicField(this, "typeId", "text-shape");
    __publicField(this, "size");
    __publicField(this, "text");
    __publicField(this, "fixedRadius");
    this.size = o2, this.text = a2;
  }
  get frame() {
    return new ne(0, 0, this.size.width, this.size.height);
  }
  hasSize() {
    return true;
  }
  getOpTarget(t4) {
    return 0 === t4.length ? this : "text" === t4[0] ? this.text.getOpTarget(t4.slice(1)) : super.getOpTarget(t4);
  }
  getPathOfSize(t4, e) {
    const i = t4.width, s = t4.height;
    if (e = this.fixedRadius ?? e) {
      const t5 = ai(Me, true, i, s, e);
      return new Je(t5);
    }
    return new Je([["M", 0, 0], ["l", i, 0], ["l", 0, s], ["l", -i, 0], ["z"]]);
  }
  getLayout() {
    return this.text.getLayout2(this.size);
  }
  get pathType() {
    return ve.Fixed;
  }
  get isPathIcon() {
    return false;
  }
  getImageFill() {
    return false;
  }
}
const _Pi = class _Pi extends Gt {
  toRGBA() {
    return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";
  }
  toRGB() {
    return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
  }
  toHex() {
    const t4 = (t5) => 1 === t5.toString(16).toUpperCase().length ? `0${t5.toString(16).toUpperCase()}` : t5.toString(16).toUpperCase();
    return "#" + t4(this.red) + t4(this.green) + t4(this.blue);
  }
  equals(t4) {
    return this.alpha === t4.alpha && this.blue === t4.blue && this.green === t4.green && this.red === t4.red;
  }
  clone() {
    return new _Pi(this.alpha, this.red, this.green, this.blue);
  }
};
__publicField(_Pi, "DefaultColor", new _Pi(0, 0, 0, 0));
let Pi = _Pi;
class Bi extends U {
  constructor() {
    super();
  }
}
class Oi extends xi {
  constructor(t4, e, i, s, r, n2, o2, a2, h2) {
    super(t4, e, i, Ft.Page, r, n2, o2);
    __publicField(this, "typeId", "page");
    __publicField(this, "backgroundColor");
    __publicField(this, "artboards", /* @__PURE__ */ new Map());
    __publicField(this, "shapes", /* @__PURE__ */ new Map());
    __publicField(this, "__allshapes", /* @__PURE__ */ new Map());
    __publicField(this, "__collect", new Bi());
    __publicField(this, "__symbolshapes", /* @__PURE__ */ new Map());
    __publicField(this, "isReserveLib");
    __publicField(this, "cutouts", /* @__PURE__ */ new Map());
    __publicField(this, "guides");
    o2.forEach((t5) => this.onAddShape(t5)), this.isReserveLib = !!a2, this.guides = h2;
  }
  getOpTarget(t4) {
    if (0 === t4.length) throw new Error("path is empty");
    const e = t4[0];
    if (1 === t4.length) {
      if (e === this.id) return this;
      throw new Error("The shape is not found");
    }
    const i = t4[1], s = this.getShape(i, true);
    return s ? s.getOpTarget(t4.slice(2)) : ("guides" !== i || this.guides || (this.guides = new G()), super.getOpTarget(t4.slice(1)));
  }
  onAddShape(t4, e = true) {
    if (this.shapes.has(t4.id)) throw new Error("The same shape id already exists");
    if (this.shapes.set(t4.id, t4), this.__allshapes.set(t4.id, new WeakRef(t4)), t4.type === Ft.Artboard && this.artboards.set(t4.id, t4), t4.type === Ft.Symbol && this.__symbolshapes.set(t4.id, t4), t4.type === Ft.Cutout && this.cutouts.set(t4.id, t4), t4.onAdded(), e && t4 instanceof xi) {
      t4.childs.forEach((t5) => this.onAddShape(t5));
    }
  }
  onRemoveShape(t4, e = true) {
    if (this.shapes.delete(t4.id), t4.type === Ft.Artboard && this.artboards.delete(t4.id), t4.type === Ft.Symbol && this.__symbolshapes.delete(t4.id), t4.type === Ft.Cutout && this.cutouts.delete(t4.id), t4.onRemoved(), e && t4 instanceof xi) {
      t4.childs.forEach((t5) => this.onRemoveShape(t5));
    }
  }
  getShape(t4, e) {
    let i;
    if (e) {
      if (i = this.shapes.get(t4), !i) {
        const e2 = this.__allshapes.get(t4);
        i = e2 == null ? void 0 : e2.deref();
      }
    } else i = this.shapes.get(t4);
    return i || t4 !== this.id || (i = this), i;
  }
  get artboardList() {
    return Array.from(this.artboards.values());
  }
  getUsedFontNames(t4) {
    const e = t4 ?? /* @__PURE__ */ new Set(), i = [this];
    for (; i.length > 0; ) {
      const t5 = i.pop();
      t5 instanceof xi ? i.push(...t5.childs) : (t5 instanceof Ei || t5 instanceof ia) && t5.text && t5.text.getUsedFontNames(e);
    }
    return e;
  }
  get cutoutList() {
    return Array.from(this.cutouts.values());
  }
  get isContainer() {
    return true;
  }
}
__publicField(Oi, "defaultBGColor", new Pi(1, 239, 239, 239));
class Ni extends X {
  constructor(t4, e, i, s, r, n2) {
    super();
    __publicField(this, "typeId", "gradient");
    __publicField(this, "elipseLength");
    __publicField(this, "from");
    __publicField(this, "to");
    __publicField(this, "stops");
    __publicField(this, "gradientType");
    __publicField(this, "gradientOpacity");
    this.from = t4, this.to = e, this.gradientType = i, this.stops = s, this.elipseLength = r, this.gradientOpacity = n2;
  }
}
class Di extends X {
  constructor(t4, e, i) {
    super();
    __publicField(this, "typeId", "style");
    __publicField(this, "miterLimit");
    __publicField(this, "windingRule");
    __publicField(this, "blur");
    __publicField(this, "borderOptions");
    __publicField(this, "borders");
    __publicField(this, "colorControls");
    __publicField(this, "contextSettings");
    __publicField(this, "fills");
    __publicField(this, "innerShadows");
    __publicField(this, "shadows");
    __publicField(this, "contacts");
    __publicField(this, "startMarkerType");
    __publicField(this, "endMarkerType");
    __publicField(this, "varbinds");
    this.borders = t4, this.fills = e, this.shadows = i;
  }
  getOpTarget(t4) {
    const e = t4[0];
    return "contacts" !== e || this.contacts || (this.contacts = new G()), "contextSettings" !== e || this.contextSettings || (this.contextSettings = new Yt(nt.Normal, 1)), super.getOpTarget(t4);
  }
  findVar(t4, e) {
    var _a2;
    return !!((_a2 = this.__parent) == null ? void 0 : _a2.findVar(t4, e));
  }
  getFills() {
    if (!this.varbinds) return this.fills;
    const t4 = this.varbinds.get(Tt.Fills);
    if (!t4) return this.fills;
    const e = [];
    this.findVar(t4, e);
    const i = e[e.length - 1];
    return i && i.type === Dt.Fills ? i.value : this.fills;
  }
  getBorders() {
    if (!this.varbinds) return this.borders;
    const t4 = this.varbinds.get(Tt.Borders);
    if (!t4) return this.borders;
    const e = [];
    this.findVar(t4, e);
    const i = e[e.length - 1];
    return i && i.type === Dt.Borders ? i.value : this.borders;
  }
}
__publicField(Di, "DefaultWindingRule", Ht.EvenOdd);
function ur(t4) {
  const e = t4.charCodeAt(0);
  return e >= 97 && e <= 122 ? String.fromCharCode(e - 32) : t4;
}
function fr(t4, e, i) {
  if (!i) return t4;
  switch (i) {
    case Nt.Lowercase:
      return function(t5) {
        const e2 = t5.charCodeAt(0);
        return e2 >= 65 && e2 <= 90 ? String.fromCharCode(e2 + 32) : t5;
      }(t4);
    case Nt.Uppercase:
      return ur(t4);
    case Nt.UppercaseFirst:
      if (e) return ur(t4);
  }
  return t4;
}
const gr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"], mr = gr.length;
const _r = [["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"], ["X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"], ["C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"], ["M", "MM", "MMM"]];
const xr = ["•", "◦", "▪"];
var yr;
function wr(t4, e) {
  switch (t4 % 3) {
    case 0:
      return e + 1 + ".";
    case 1:
      return function(t5) {
        if (t5 < 0) return "";
        const e2 = [];
        for (let i = 0; ; i++) {
          const s = Math.floor(t5 / mr);
          if (!(s >= 1)) {
            i > 0 ? e2.push(gr[t5 % mr - 1]) : e2.push(gr[t5 % mr]);
            break;
          }
          e2.push(gr[t5 % mr]), t5 = s;
        }
        return e2.reverse().join("");
      }(e) + ".";
    case 2:
      return function(t5) {
        if (t5 <= 0) return "";
        t5 > 3999 && (t5 %= 3999);
        const e2 = "" + t5;
        let i = "";
        for (let t6 = 0; t6 < e2.length; t6++) {
          const s = e2.charAt(t6);
          "0" != s && (i += _r[e2.length - t6 - 1][parseInt(s) - 1]);
        }
        return i;
      }(e + 1) + ".";
  }
  return "";
}
!function(t4) {
  t4[t4.Number = 0] = "Number", t4[t4.Letter = 1] = "Letter", t4[t4.Roman = 2] = "Roman";
}(yr || (yr = {}));
const br = /* @__PURE__ */ new Map();
function Mr(t4, e, i) {
  const s = i.weight || 400, r = (i.italic ? "italic " : "normal ") + s + " " + e + "px " + i.fontName, n2 = t4[0] + "#" + r;
  if (br.has(n2)) return br.get(n2);
  const o2 = (0, p.text.textMeasure)(t4[0], r);
  return br.set(n2, o2), o2;
}
function vr(t4, e, i, s) {
  var _a2;
  const r = ((_a2 = t4.attr) == null ? void 0 : _a2.indent) || 0;
  let n2, o2 = "", a2 = 0;
  const h2 = e.fontSize || 0;
  if (i.type === ct.Disorded) {
    o2 = function(t6) {
      return xr[t6 % xr.length];
    }(r);
    const t5 = 2, i2 = h2, s2 = e.fontSize ? 0.6 * e.fontSize : 10;
    n2 = { char: o2, metrics: Mr(o2, h2, e), cw: 2 * s2 - t5, ch: i2, index: 0, x: t5, cc: 1 };
  } else {
    if (i.type !== ct.Ordered1Ai) throw new Error("unknow bullet numbers type: " + i.type);
    {
      if (i.behavior === lt.Renew) a2 = i.offset || 0;
      else for (let t6 = s.length - 1; t6 >= 0; t6--) {
        const e2 = s[t6];
        if (e2.level < r) break;
        if (!(e2.level > r)) {
          if (e2.type !== ct.Ordered1Ai) break;
          a2 = e2.index + 1;
          break;
        }
      }
      const t5 = function(t6) {
        switch (t6 % 3) {
          case 0:
            return yr.Number;
          case 1:
            return yr.Letter;
          case 2:
            return yr.Roman;
        }
        throw new Error("getOrderedType error");
      }(r);
      o2 = wr(r, a2);
      const l3 = e.transform, c2 = h2, d2 = e.fontSize ? 0.6 * e.fontSize : 10;
      let u = 0;
      if (l3 && l3 === Nt.Uppercase) {
        let t6 = "";
        for (let e2 = 0, i2 = o2.length; e2 < i2; e2++) {
          t6 += fr(o2.charAt(e2), false, l3);
        }
        o2 = t6;
      }
      if (u = d2 * o2.length, t5 === yr.Roman) {
        const t6 = "normal " + (e.fontSize || 10) + "px " + e.fontName, i2 = Math.ceil(function(t7, e2) {
          const i3 = p.text.textMeasure;
          return t7.split("").reduce((t8, s2) => {
            const r2 = i3(s2.charAt(0), e2);
            return t8 + ((r2 == null ? void 0 : r2.width) ?? 0);
          }, 0);
        }(o2, t6) / d2);
        u = Math.max(2, i2) * d2;
      }
      n2 = { char: o2, metrics: Mr(o2, h2, e), cw: u, ch: c2, index: 0, x: 0, cc: 1 }, t5 === yr.Number && 0 === a2 && (n2.x = 0.2 * d2, n2.cw = n2.cw - n2.x);
    }
  }
  const l2 = new kr(n2);
  return l2.index = a2, l2.level = r, l2.text = o2, l2.type = i.type, s.push(l2), l2;
}
const Sr = 28;
class Cr extends Array {
  constructor() {
    super(...arguments);
    __publicField(this, "attr");
    __publicField(this, "charCount", 0);
  }
  get graphCount() {
    return this.length;
  }
  push(...t4) {
    return 1 === t4.length ? this.charCount += t4[0].cc : this.charCount += t4.reduce((t5, e) => t5 + e.cc, 0), super.push(...t4);
  }
}
class Tr extends Array {
  constructor() {
    super(...arguments);
    __publicField(this, "maxFontSize", 0);
    __publicField(this, "x", 0);
    __publicField(this, "y", 0);
    __publicField(this, "lineHeight", 0);
    __publicField(this, "lineWidth", 0);
    __publicField(this, "graphWidth", 0);
    __publicField(this, "graphCount", 0);
    __publicField(this, "charCount", 0);
    __publicField(this, "alignment", Bt.Left);
    __publicField(this, "layoutWidth", 0);
  }
  get actualBoundingBoxDescent() {
    return Math.round(this.maxFontSize * Ce);
  }
  push(...t4) {
    var _a2;
    return 1 === t4.length ? (this.maxFontSize = Math.max(this.maxFontSize, ((_a2 = t4[0].attr) == null ? void 0 : _a2.fontSize) || 0), this.charCount += t4[0].charCount, ++this.graphCount) : (this.maxFontSize = t4.reduce((t5, e) => {
      var _a3;
      return Math.max(t5, ((_a3 = e.attr) == null ? void 0 : _a3.fontSize) || 0);
    }, this.maxFontSize), this.charCount += t4.reduce((t5, e) => t5 + e.charCount, 0), this.graphCount += t4.length), super.push(...t4);
  }
  toJSON() {
    const t4 = [];
    for (let e = 0; e < this.length; ++e) t4.push(this[e]);
    return { maxFontSize: this.maxFontSize, actualBoundingBoxDescent: this.actualBoundingBoxDescent, x: this.x, y: this.y, lineHeight: this.lineHeight, lineWidth: this.lineWidth, graphWidth: this.graphWidth, graphCount: this.graphCount, charCount: this.charCount, alignment: this.alignment, layoutWidth: this.layoutWidth, graphs: t4 };
  }
}
class kr {
  constructor(t4) {
    __publicField(this, "index", 0);
    __publicField(this, "level", 0);
    __publicField(this, "text", "");
    __publicField(this, "type", ct.None);
    __publicField(this, "graph");
    this.graph = t4;
  }
}
class Ir extends Array {
  constructor() {
    super(...arguments);
    __publicField(this, "paraHeight", 0);
    __publicField(this, "paraWidth", 0);
    __publicField(this, "graphCount", 0);
    __publicField(this, "charCount", 0);
    __publicField(this, "yOffset", 0);
    __publicField(this, "xOffset", 0);
    __publicField(this, "bulletNumbers");
  }
  toJSON() {
    const t4 = [];
    for (let e = 0; e < this.length; ++e) t4.push(this[e]);
    return { paraHeight: this.paraHeight, graphCount: this.graphCount, charCount: this.charCount, yOffset: this.yOffset, xOffset: this.xOffset, paraWidth: this.paraWidth, bulletNumbers: this.bulletNumbers, lines: t4 };
  }
}
class Er {
  constructor() {
    __publicField(this, "layout");
    __publicField(this, "owners", []);
    __publicField(this, "__layoutWidth", 0);
    __publicField(this, "__textBehaviour");
    __publicField(this, "__verAlign");
    __publicField(this, "__frame", { width: 0, height: 0 });
  }
  update(t4, e) {
    var _a2, _b, _c, _d, _e, _f, _g;
    const i = ((e2) => {
      switch (e2) {
        case Pt.Flexible:
          return Number.MAX_VALUE;
        case Pt.Fixed:
        case Pt.FixWidthAndHeight:
          return t4.width;
      }
    })(((_a2 = e.attr) == null ? void 0 : _a2.textBehaviour) ?? Pt.Flexible);
    if (this.__layoutWidth !== i) this.__layoutWidth = i, this.layout = void 0;
    else if (this.layout) {
      const i2 = this.layout;
      if (this.__frame.height !== t4.height || this.__verAlign !== (((_b = e.attr) == null ? void 0 : _b.verAlign) ?? zt.Top)) {
        const i3 = ((e2) => {
          switch (e2) {
            case zt.Top:
              return 0;
            case zt.Middle:
              return (t4.height - this.layout.contentHeight) / 2;
            case zt.Bottom:
              return t4.height - this.layout.contentHeight;
          }
        })(((_c = e.attr) == null ? void 0 : _c.verAlign) ?? zt.Top);
        this.layout.yOffset = i3;
      }
      const s = ((_d = e.attr) == null ? void 0 : _d.textBehaviour) ?? Pt.Flexible;
      if (this.__frame.width !== t4.width && s === Pt.Flexible) {
        let s2 = Number.MAX_SAFE_INTEGER;
        for (let r = 0, n2 = e.paras.length; r < n2; r++) {
          const n3 = e.paras[r], o2 = i2.paras[r];
          switch (((_e = n3.attr) == null ? void 0 : _e.alignment) ?? Bt.Left) {
            case Bt.Centered:
              s2 = Math.min(s2, -(o2.paraWidth - t4.width) / 2);
              break;
            case Bt.Left:
            case Bt.Natural:
              s2 = Math.min(s2, 0);
              break;
            case Bt.Justified:
            case Bt.Right:
              s2 = Math.min(s2, -(o2.paraWidth - t4.width));
          }
        }
        i2.alignX = s2 === Number.MAX_SAFE_INTEGER ? 0 : s2;
      }
    }
    this.__frame.width = t4.width, this.__frame.height = t4.height, this.__textBehaviour = (_f = e.attr) == null ? void 0 : _f.textBehaviour, this.__verAlign = (_g = e.attr) == null ? void 0 : _g.verAlign;
  }
}
function Fr(t4, e, i) {
  var _a2;
  if (t4.layoutWidth !== i || t4.alignment !== e) {
    if (t4.alignment === Bt.Justified || t4.alignment === Bt.Natural) for (; ; ) {
      const s = t4[t4.length - 1], r = s[s.length - 1];
      let n2, o2;
      if (t4.length > 0 && (o2 = t4[0], n2 = o2[0]), !o2 || !n2) throw new Error("layout result wrong");
      let a2 = t4.graphCount;
      Rr(r.char.charCodeAt(0)) && a2--;
      let h2 = false;
      if (1 === o2.length && ((_a2 = o2.attr) == null ? void 0 : _a2.placeholder) && (a2--, h2 = true), a2 <= 1) break;
      const l2 = i - t4.graphWidth - n2.x;
      if (e === Bt.Natural) {
        if (l2 > t4.graphWidth / a2) break;
      }
      const c2 = 1 === a2 ? 0 : l2 / (a2 - 1);
      let d2 = 0;
      for (let e2 = h2 ? 1 : 0, i2 = t4.length; e2 < i2; e2++) {
        const i3 = t4[e2];
        for (let t5 = 0, e3 = i3.length; t5 < e3; t5++) {
          i3[t5].x -= d2, --a2, a2 > 0 && (d2 += c2);
        }
      }
      break;
    }
    Ar(t4, e, i);
  }
}
function Ar(t4, e, i) {
  var _a2;
  switch (e) {
    case Bt.Left:
      t4.x = 0;
      break;
    case Bt.Centered:
      t4.x = (i - t4.graphWidth) / 2;
      break;
    case Bt.Right: {
      let e2;
      if (t4.length > 0) {
        const i2 = t4[t4.length - 1];
        e2 = i2[i2.length - 1];
      }
      if (!e2) throw new Error("layout result wrong");
      const s = i - e2.x - e2.cw;
      t4.x = s;
      break;
    }
    case Bt.Natural:
    case Bt.Justified: {
      const s = t4[t4.length - 1], r = s[s.length - 1];
      let n2, o2;
      if (t4.x = 0, t4.length > 0 && (o2 = t4[0], n2 = o2[0]), !o2 || !n2) throw new Error("layout result wrong");
      let a2 = t4.graphCount;
      Rr(r.char.charCodeAt(0)) && a2--;
      let h2 = false;
      if (1 === o2.length && ((_a2 = o2.attr) == null ? void 0 : _a2.placeholder) && (a2--, h2 = true), a2 <= 1) break;
      const l2 = i - t4.graphWidth - n2.x;
      if (e === Bt.Natural) {
        if (l2 > t4.graphWidth / a2) break;
      }
      let c2 = 0;
      const d2 = 1 === a2 ? 0 : l2 / (a2 - 1);
      for (let e2 = h2 ? 1 : 0, i2 = t4.length; e2 < i2; e2++) {
        const i3 = t4[e2];
        for (let t5 = 0, e3 = i3.length; t5 < e3; t5++) {
          i3[t5].x += c2, --a2, a2 > 0 && (c2 += d2);
        }
      }
      break;
    }
  }
  t4.alignment = e, t4.layoutWidth = i;
}
function Rr(t4) {
  switch (t4) {
    case 10:
    case 13:
    case 8232:
    case 8233:
      return true;
  }
  return false;
}
function Lr(t4, e) {
  const i = t4.charCodeAt(e);
  if (!(55296 <= i && i <= 56319)) return t4.charAt(e);
  const s = t4.charCodeAt(e + 1);
  if (!(56320 <= s && s <= 57343)) return t4.charAt(e);
  const r = t4.charCodeAt(e + 2);
  return 8205 === r ? String.fromCharCode(i, s, r) + Lr(t4, e + 3) : String.fromCharCode(i, s);
}
function Pr(t4, e, i, s) {
  let r = 0;
  const n2 = function(t5, e2, i2, s2) {
    var _a2, _b, _c, _d;
    const r2 = p.text.textMeasure;
    let n3 = e2.spans, o3 = n3.length;
    if (0 === o3) {
      if (0 === e2.length) return [];
      o3 = 1, n3 = new G(new Qo(e2.length));
    }
    const a3 = ((_a2 = e2.attr) == null ? void 0 : _a2.kerning) ?? 0, h3 = e2.text;
    let l3 = 0;
    const c3 = h3.length;
    let d3 = 0, u = 0, f = n3[d3], g = (f.italic ? "italic " : "normal ") + (f.weight || 400) + " " + f.fontSize + "px " + f.fontName;
    const m = (((_b = e2.attr) == null ? void 0 : _b.indent) || 0) * Sr, _ = Math.min(m, i2), x = i2;
    let y2, w2 = _, b2 = new Tr();
    const M2 = [];
    let v2 = d3;
    const S2 = ((_c = e2.attr) == null ? void 0 : _c.transform) ?? ((_d = t5.attr) == null ? void 0 : _d.transform);
    for (; l3 < c3; ) {
      if (d3 >= o3 && (d3 = o3 - 1), v2 !== d3 && (v2 = d3, f = n3[d3], g = (f.italic ? "italic " : "normal ") + (f.weight || 400) + " " + f.fontSize + "px " + f.fontName), 0 === f.length && d3 < o3 - 1) {
        d3++;
        continue;
      }
      const t6 = Lr(h3, l3), i3 = t6.charCodeAt(0);
      if (1 === t6.length && Rr(i3)) {
        let e3;
        if (y2 || (y2 = new Cr(), y2.attr = f), y2.length > 0) e3 = y2[y2.length - 1];
        else if (b2.length > 0) {
          const t7 = b2[b2.length - 1];
          e3 = t7[t7.length - 1];
        }
        e3 && (w2 = e3.x + e3.cw), y2.push({ char: "\n", metrics: void 0, cw: 0, ch: f.fontSize ?? 0, index: l3, x: w2, cc: 1 }), l3 += t6.length, u++, u >= f.length && (u = 0, d3++), b2.push(y2), y2 = void 0, M2.push(b2), b2 = new Tr(), w2 = _;
        continue;
      }
      const c4 = f.kerning ?? a3;
      if (1 === t6.length && 0 === d3 && 42 === i3 && f.placeholder && 1 === f.length && f.bulletNumbers) {
        const i4 = vr(e2, f, f.bulletNumbers, s2);
        i4.graph.x += w2, y2 || (y2 = new Cr(), y2.attr = f), y2.push(i4.graph), w2 = i4.graph.x + i4.graph.cw + c4, l3 += t6.length, u++, u >= f.length && (u = 0, d3++, b2.push(y2), y2 = void 0), M2.bulletNumbers = i4;
        continue;
      }
      const p2 = f.transform ?? S2, m2 = fr(t6, 0 === l3 || 1 === l3 && !!M2.bulletNumbers, p2), C2 = r2(m2, g), T2 = (C2 == null ? void 0 : C2.width) ?? 0, k2 = f.fontSize ?? 0, I = "number" != typeof k2 ? Number.parseFloat(k2) : k2;
      T2 + w2 <= x ? (y2 || (y2 = new Cr(), y2.attr = f), y2.push({ char: m2, metrics: C2, cw: T2, ch: I, index: l3, x: w2, cc: t6.length }), w2 += T2 + c4, l3 += t6.length, u++, u >= f.length && (u = 0, d3++, b2.push(y2), y2 = void 0)) : 0 !== b2.length || y2 && 0 !== y2.length ? (y2 && b2.push(y2), y2 = new Cr(), y2.attr = f, M2.push(b2), b2 = new Tr(), w2 = _, y2.push({ char: m2, metrics: C2, cw: T2, ch: I, index: l3, x: w2, cc: t6.length }), w2 += T2 + c4, l3 += t6.length, u++, u >= f.length && (u = 0, d3++, b2.push(y2), y2 = void 0)) : (y2 || (y2 = new Cr(), y2.attr = f), y2.push({ char: m2, metrics: C2, cw: T2, ch: I, index: l3, x: Math.max(0, x - T2), cc: t6.length }), b2.push(y2), y2 = void 0, M2.push(b2), b2 = new Tr(), w2 = _, l3 += t6.length, u++, u >= f.length && (u = 0, d3++));
    }
    return y2 && y2.length > 0 && b2.push(y2), b2.length > 0 && M2.push(b2), M2;
  }(t4, e, i, s), o2 = e.attr;
  let a2 = 0, h2 = 0, l2 = 0;
  const c2 = n2.map((t5) => {
    let e2 = t5.maxFontSize;
    o2 && o2.maximumLineHeight && (e2 = Math.min(o2.maximumLineHeight, e2)), o2 && o2.minimumLineHeight && (e2 = Math.max(o2.minimumLineHeight, e2));
    const i2 = a2;
    a2 += e2, h2 += t5.graphCount, l2 += t5.charCount, t5.y = i2, t5.lineHeight = e2;
    const s2 = t5[0][0], n3 = t5[t5.length - 1], c3 = n3[n3.length - 1];
    return t5.graphWidth = c3.x + c3.cw - s2.x, t5.lineWidth = c3.x + c3.cw, r = Math.max(t5.lineWidth + t5.x, r), t5;
  }), d2 = new Ir(...c2);
  return d2.paraHeight = a2, d2.graphCount = h2, d2.charCount = l2, d2.paraWidth = r, d2.bulletNumbers = n2.bulletNumbers, d2;
}
function Br(t4, e, i) {
  var _a2, _b, _c, _d, _e, _f;
  const s = ((t5) => {
    switch (t5) {
      case Pt.Flexible:
        return Number.MAX_VALUE;
      case Pt.Fixed:
      case Pt.FixWidthAndHeight:
        return e.width;
    }
  })(((_a2 = t4.attr) == null ? void 0 : _a2.textBehaviour) ?? Pt.Flexible), r = (_b = t4.attr) == null ? void 0 : _b.padding, n2 = (r == null ? void 0 : r.left) ?? 0, o2 = (r == null ? void 0 : r.top) ?? 0, a2 = (r == null ? void 0 : r.right) ?? 0, h2 = (r == null ? void 0 : r.bottom) ?? 0, l2 = [];
  let c2 = 0, d2 = 0;
  const p2 = [], u = s - n2 - a2;
  for (let e2 = 0, i2 = t4.paras.length; e2 < i2; e2++) {
    const i3 = Pr(t4, t4.paras[e2], u, p2);
    if (e2 > 0) {
      const i4 = t4.paras[e2 - 1], s2 = ((_c = i4.attr) == null ? void 0 : _c.paraSpacing) || 0;
      c2 += s2;
    }
    i3.yOffset = c2, c2 += i3.paraHeight, d2 = Math.max(i3.paraWidth, d2), l2.push(i3);
  }
  const f = ((_d = t4.attr) == null ? void 0 : _d.textBehaviour) ?? Pt.Flexible, g = f === Pt.Flexible ? d2 : u;
  let m = Number.MAX_SAFE_INTEGER;
  for (let i2 = 0, s2 = t4.paras.length; i2 < s2; i2++) {
    const s3 = t4.paras[i2], r2 = l2[i2], n3 = ((_e = s3.attr) == null ? void 0 : _e.alignment) ?? Bt.Left;
    for (let t5 = 0, e2 = r2.length; t5 < e2; t5++) {
      Ar(r2[t5], n3, g);
    }
    if (f === Pt.Flexible) switch (n3) {
      case Bt.Centered:
        m = Math.min(m, -(r2.paraWidth - e.width) / 2);
        break;
      case Bt.Left:
      case Bt.Natural:
        m = Math.min(m, 0);
        break;
      case Bt.Justified:
      case Bt.Right:
        m = Math.min(m, -(r2.paraWidth - e.width));
    }
  }
  const _ = ((t5) => {
    switch (t5) {
      case zt.Top:
        return o2;
      case zt.Middle:
        return (e.height - c2 - o2 - h2) / 2;
      case zt.Bottom:
        return e.height - c2 - h2;
    }
  })(((_f = t4.attr) == null ? void 0 : _f.verAlign) ?? zt.Top);
  return { alignX: m === Number.MAX_SAFE_INTEGER ? 0 : m, xOffset: n2, yOffset: _, paras: l2, contentHeight: c2, contentWidth: d2 };
}
function Wr(t4, e) {
  return new Pi(t4.alpha, t4.red, t4.green, t4.blue);
}
function Gr(t4, e) {
  const i = new G();
  return t4.forEach((t5, e2) => {
    i.push(t5);
  }), i;
}
function Ur(t4, e) {
  return t4;
}
function rn(t4, e) {
  return new se(t4.x, t4.y);
}
function ln(t4, e) {
  return new ae(Gr(t4.crdtidx), t4.id, t4.position, Wr(t4.color));
}
function yn(t4, e) {
  const i = new Ni(rn(t4.from), rn(t4.to), /* @__PURE__ */ function(t5, e2) {
    return t5;
  }(t4.gradientType), function(t5, e2) {
    const i2 = new G();
    return t5.forEach((t6, e3) => {
      t6.crdtidx || (t6.crdtidx = [e3]), i2.push(ln(t6));
    }), i2;
  }(t4.stops));
  return function(t5, e2, i2) {
    e2.elipseLength && (t5.elipseLength = e2.elipseLength), e2.gradientOpacity && (t5.gradientOpacity = e2.gradientOpacity);
  }(i, t4), i;
}
function wn(t4, e, i) {
  e.fontName && (t4.fontName = e.fontName), e.fontSize && (t4.fontSize = e.fontSize), e.color && (t4.color = Wr(e.color)), e.strikethrough && (t4.strikethrough = /* @__PURE__ */ function(t5, e2) {
    return t5;
  }(e.strikethrough)), e.underline && (t4.underline = /* @__PURE__ */ function(t5, e2) {
    return t5;
  }(e.underline)), e.weight && (t4.weight = e.weight), e.italic && (t4.italic = e.italic), e.bulletNumbers && (t4.bulletNumbers = function(t5, e2) {
    const i2 = new $t(/* @__PURE__ */ function(t6, e3) {
      return t6;
    }(t5.type));
    return function(t6, e3, i3) {
      e3.behavior && (t6.behavior = /* @__PURE__ */ function(t7, e4) {
        return t7;
      }(e3.behavior)), e3.offset && (t6.offset = e3.offset);
    }(i2, t5), i2;
  }(e.bulletNumbers)), e.highlight && (t4.highlight = Wr(e.highlight)), e.kerning && (t4.kerning = e.kerning), e.transform && (t4.transform = /* @__PURE__ */ function(t5, e2) {
    return t5;
  }(e.transform)), e.placeholder && (t4.placeholder = e.placeholder), e.fillType && (t4.fillType = Ur(e.fillType)), e.gradient && (t4.gradient = yn(e.gradient));
}
const Mn = wn;
function vn(t4, e) {
  const i = new Qo(t4.length);
  return Mn(i, t4), i;
}
function Tn(t4, e, i) {
  wn(t4, e), e.alignment && (t4.alignment = /* @__PURE__ */ function(t5, e2) {
    return t5;
  }(e.alignment)), e.paraSpacing && (t4.paraSpacing = e.paraSpacing), e.minimumLineHeight && (t4.minimumLineHeight = e.minimumLineHeight), e.maximumLineHeight && (t4.maximumLineHeight = e.maximumLineHeight), e.indent && (t4.indent = e.indent);
}
function kn(t4, e) {
  const i = new Jo();
  return Tn(i, t4), i;
}
function Fn(t4, e, i) {
  Tn(t4, e), e.verAlign && (t4.verAlign = /* @__PURE__ */ function(t5, e2) {
    return t5;
  }(e.verAlign)), e.orientation && (t4.orientation = /* @__PURE__ */ function(t5, e2) {
    return t5;
  }(e.orientation)), e.textBehaviour && (t4.textBehaviour = /* @__PURE__ */ function(t5, e2) {
    return t5;
  }(e.textBehaviour)), e.padding && (t4.padding = function(t5, e2) {
    const i2 = new qt();
    return function(t6, e3, i3) {
      e3.left && (t6.left = e3.left), e3.top && (t6.top = e3.top), e3.right && (t6.right = e3.right), e3.bottom && (t6.bottom = e3.bottom);
    }(i2, t5), i2;
  }(e.padding));
}
function An(t4, e) {
  const i = t4;
  "boolean" == typeof i.bold && (i.bold = i.bold ? 700 : 400), i.bold && (i.weight = i.bold);
  const s = new Ko();
  return Fn(s, t4), s;
}
function _o(t4, e, i, s, r) {
  for (; s > 0 && e < t4.length; ) {
    const n2 = t4[e], o2 = Math.min(n2.length, i + s);
    r(n2, i, o2 - i), s -= o2 - i, i = 0, e++;
  }
}
function xo(t4, e, i, s) {
  for (let r = 0, n2 = t4.length; r < n2; r++) {
    const n3 = t4[r];
    if (e < n3.length) {
      _o(t4, r, e, i, s);
      break;
    }
    e -= n3.length;
  }
}
function yo(t4, e, i, s, r, n2) {
  for (; s > 0 && e < t4.length; ) {
    const o2 = t4[e], a2 = Math.min(o2.length, i + s);
    r(t4, e, o2, i, a2 - i), n2 && xo(o2.spans, i, s, n2), s -= a2 - i, i = 0, e++;
  }
}
function wo(t4, e, i, s, r) {
  for (let n2 = 0, o2 = t4.length; n2 < o2; n2++) {
    const o3 = t4[n2];
    if (e < o3.length) {
      yo(t4, n2, e, i, s, r);
      break;
    }
    e -= o3.length;
  }
}
const bo = (t4, e) => {
  if (t4.gradientType !== e.gradientType || t4.elipseLength !== e.elipseLength || t4.gradientOpacity !== e.gradientOpacity) return false;
  if (t4.from.x !== e.from.x || t4.from.y !== e.from.y || t4.to.x !== e.to.x || t4.to.y !== e.to.y) return false;
  if (t4.stops.length !== e.stops.length) return false;
  for (let i = 0; i < t4.stops.length; i++) {
    const s = t4.stops[i], r = e.stops[i];
    if (s.position !== r.position || !s.color.equals(r.color)) return false;
  }
  return true;
};
function Mo(t4, e) {
  if (e.color) {
    if (!t4.color) return true;
    if (!e.color.equals(t4.color)) return true;
  } else if (t4.color) return true;
  if (e.highlight) {
    if (!t4.highlight) return true;
    if (!e.highlight.equals(t4.highlight)) return true;
  } else if (t4.highlight) return true;
  if (e.fontName !== t4.fontName) return true;
  if (e.fontSize !== t4.fontSize) return true;
  if (e.weight !== t4.weight) return true;
  if (!!e.italic != !!t4.italic) return true;
  if (e.underline !== t4.underline) return true;
  if (e.strikethrough !== t4.strikethrough) return true;
  if (e.kerning !== t4.kerning) return true;
  if (e.transform !== t4.transform) return true;
  if (e.bulletNumbers && !t4.bulletNumbers || !e.bulletNumbers && t4.bulletNumbers) return true;
  if (e.bulletNumbers && t4.bulletNumbers) {
    if (e.bulletNumbers.type !== t4.bulletNumbers.type) return true;
    if (e.bulletNumbers.offset !== t4.bulletNumbers.offset) return true;
    if (e.bulletNumbers.behavior !== t4.bulletNumbers.behavior) return true;
  }
  if (!!e.placeholder != !!t4.placeholder) return true;
  if (e.fillType !== t4.fillType) return true;
  if (e.gradient) {
    if (!t4.gradient) return true;
    if (!bo(t4.gradient, e.gradient)) return true;
  } else if (t4.gradient) return true;
  return false;
}
function vo(t4, e, i) {
  So(t4, e, i);
}
function So(t4, e, i) {
  let s = false;
  if (e.color && (t4.color && e.color.equals(t4.color) || (t4.color = new Pi(e.color.alpha, e.color.red, e.color.green, e.color.blue), s = true)), e.highlight && (t4.highlight && e.highlight.equals(t4.highlight) || (t4.highlight = new Pi(e.highlight.alpha, e.highlight.red, e.highlight.green, e.highlight.blue), s = true)), e.fontName && (t4.fontName && e.fontName === t4.fontName || (t4.fontName = e.fontName, s = true)), e.fontSize && (t4.fontSize && e.fontSize === t4.fontSize || (t4.fontSize = e.fontSize, s = true)), void 0 !== e.weight && (t4.weight && t4.weight === e.weight || (t4.weight = e.weight, s = true)), void 0 !== e.italic && !!t4.italic !== e.italic && (t4.italic = !!e.italic || void 0, s = true), e.underline) {
    const i2 = e.underline === Vt.None ? void 0 : e.underline;
    i2 !== t4.underline && (t4.underline = i2, s = true);
  }
  if (e.strikethrough) {
    (e.strikethrough === Rt.None ? void 0 : e.strikethrough) !== t4.strikethrough && (t4.strikethrough = e.strikethrough === Rt.None ? void 0 : e.strikethrough, s = true);
  }
  return null != e.kerning && (null != t4.kerning && t4.kerning === e.kerning || (t4.kerning = e.kerning, s = true)), null != e.transform && (null != t4.transform && t4.transform === e.transform || (t4.transform = e.transform, s = true)), e.placeholder && i && (t4.placeholder || (t4.placeholder = true, s = true), e.bulletNumbers && (t4.bulletNumbers || (t4.bulletNumbers = new $t(e.bulletNumbers.type), s = true), e.bulletNumbers.type !== t4.bulletNumbers.type && (t4.bulletNumbers.type = e.bulletNumbers.type, s = true), e.bulletNumbers.offset !== t4.bulletNumbers.offset && (t4.bulletNumbers.offset = e.bulletNumbers.offset, s = true), e.bulletNumbers.behavior !== t4.bulletNumbers.behavior && (t4.bulletNumbers.behavior = e.bulletNumbers.behavior, s = true))), e.fillType && (t4.fillType && e.fillType === t4.fillType || (t4.fillType = e.fillType, s = true)), e.gradient && (t4.gradient && bo(t4.gradient, e.gradient) || (t4.gradient = new Ni(e.gradient.from, e.gradient.to, e.gradient.gradientType, e.gradient.stops, e.gradient.elipseLength, e.gradient.gradientOpacity), s = true)), s;
}
function Co(t4, e) {
  const i = e instanceof Jo ? e : e.attr;
  if (t4 instanceof ta) {
    if (!t4.attr) return i && (t4.attr = kn(i)), !!i;
    if (i) return To(t4.attr, i);
  } else if (i) return To(t4, i);
  return false;
}
function To(t4, e) {
  let i = false;
  return i = So(t4, e), null != e.minimumLineHeight && (null != t4.minimumLineHeight && t4.minimumLineHeight === e.minimumLineHeight || (t4.minimumLineHeight = e.minimumLineHeight, i = true)), null != e.maximumLineHeight && (null != t4.maximumLineHeight && t4.maximumLineHeight === e.maximumLineHeight || (t4.maximumLineHeight = e.maximumLineHeight, i = true)), null != e.paraSpacing && (null != t4.paraSpacing && t4.paraSpacing === e.paraSpacing || (t4.paraSpacing = e.paraSpacing, i = true)), null != e.alignment && (null != t4.alignment && t4.alignment === e.alignment || (t4.alignment = e.alignment, i = true)), null != e.indent && (null != t4.indent && t4.indent === e.indent || (t4.indent = e.indent, i = true)), i;
}
function ko(t4, e) {
  t4.attr ? (To(t4.attr, e), e.verAlign && (t4.attr.verAlign = e.verAlign), e.orientation && (t4.attr.orientation = e.orientation), e.textBehaviour && (t4.attr.textBehaviour = e.textBehaviour)) : t4.attr = An(e);
}
function Io(t4) {
  const e = new ea(new G()), i = new ta("\n", new G());
  i.attr = new Jo(), i.attr.minimumLineHeight = 24, e.paras.push(i);
  const s = new Qo(i.length);
  return s.fontName = "PingFang SC", s.fontSize = 14, s.color = new Pi(1, 51, 51, 51), i.spans.push(s), t4 && (ko(e, t4), Co(i, t4), vo(s, t4)), e;
}
function Fo(t4) {
  const e = Io(t4);
  return e.setTextBehaviour(Pt.Fixed), e.setPadding(5, 0, 3, 0), e;
}
function Ao(t4, e, i, s, r) {
  const n2 = t4.spans;
  t4.text = t4.text.slice(0, i) + e + t4.text.slice(i);
  for (let o2 = 0, a2 = 0, h2 = n2.length, l2 = i; a2 < h2; a2++) {
    let i2 = n2[a2];
    if (o2 += i2.length, 0 === l2) {
      if (r || i2.placeholder) {
        const t5 = new Qo(e.length);
        if ("simple" === s && vo(t5, i2), r && vo(t5, r, true), i2.placeholder || t5.placeholder || Mo(i2, t5)) {
          n2.splice(a2, 0, t5);
          break;
        }
      }
      i2.length += e.length;
      break;
    }
    if (l2 < i2.length) {
      if (r) {
        const t5 = new Qo(e.length);
        if ("simple" === s && vo(t5, i2), vo(t5, r, true), i2.placeholder || t5.placeholder || Mo(i2, t5)) {
          const e2 = new Qo(i2.length - l2);
          vo(e2, i2), i2.length = l2, n2.splice(a2 + 1, 0, t5, e2);
          break;
        }
      }
      i2.length += e.length;
      break;
    }
    if (l2 === i2.length) {
      if (r || i2.placeholder) {
        const t5 = new Qo(e.length);
        if ("simple" === s && vo(t5, i2), r && vo(t5, r, true), i2.placeholder || t5.placeholder || Mo(i2, t5)) {
          n2.splice(a2 + 1, 0, t5);
          break;
        }
      }
      i2.length += e.length;
      break;
    }
    if (a2 === h2 - 1) {
      if (i2.placeholder) {
        const s2 = new Qo(t4.length - e.length - o2);
        vo(s2, i2), n2.splice(a2 + 1, 0, s2), a2++, i2 = n2[a2];
      } else i2.length += t4.length - e.length - o2;
      if (r || i2.placeholder) {
        const t5 = new Qo(e.length);
        if ("simple" === s && vo(t5, i2), r && vo(t5, r, true), i2.placeholder || t5.placeholder || Mo(i2, t5)) {
          n2.splice(a2 + 1, 0, t5);
          break;
        }
      }
      i2.length += e.length;
      break;
    }
    l2 -= i2.length;
  }
}
function Ro(t4, e, i, s, r, n2, o2) {
  const a2 = o2 && o2.attr, h2 = o2 && o2.paraAttr;
  let l2 = s.indexOf("\n");
  if (l2 < 0) {
    if (Ao(i, s, r, n2, a2), h2) if ("simple" === n2) Co(i, h2);
    else {
      const t5 = new Jo();
      Co(t5, h2), i.attr = t5;
    }
  } else for (; l2 >= 0; ) {
    if (l2 > 0) {
      if (Ao(i, s.slice(0, l2), r, n2, a2), h2) if ("simple" === n2) Co(i, h2);
      else {
        const t5 = new Jo();
        Co(t5, h2), i.attr = t5;
      }
      r += l2;
    }
    if (s = s.slice(l2 + 1), 0 === r) {
      const s2 = "\n", r2 = new Qo(1);
      if (i.spans.length > 0) {
        vo(r2, i.spans[0]);
      }
      a2 && vo(r2, a2, true);
      const o3 = new G(r2), l3 = new ta(s2, o3);
      h2 && "simple" !== n2 || Co(l3, i), h2 && Co(l3, h2), t4.splice(e, 0, l3), e++;
    } else if (r < i.length - 1) {
      const s2 = i.text.slice(r);
      i.text = i.text.slice(0, r) + "\n";
      const o3 = i.spans, a3 = new G();
      for (let t5 = 0, e2 = o3.length, i2 = r; t5 < e2; t5++) {
        const r2 = o3[t5];
        if (0 === i2) {
          a3.push(...o3.splice(t5, o3.length - t5));
          break;
        }
        if (i2 < r2.length) {
          const e3 = new Qo(r2.length - i2);
          vo(e3, r2), r2.length = i2, a3.push(e3), a3.push(...o3.splice(t5 + 1, o3.length - t5 - 1));
          break;
        }
        if (t5 === e2 - 1) {
          const t6 = new Qo(s2.length);
          vo(t6, r2), a3.push(t6);
          break;
        }
        i2 -= r2.length;
      }
      const l3 = o3[o3.length - 1];
      if (l3.placeholder) {
        const t5 = new Qo(1);
        vo(t5, l3), o3.push(t5);
      } else l3.length++;
      const c2 = new ta(s2, a3);
      h2 && "simple" !== n2 || Co(c2, i), h2 && Co(c2, h2), t4.splice(e + 1, 0, c2), e++, i = c2, r = 0;
    } else {
      const s2 = i.spans;
      let o3, l3 = Math.max(i.length - 2, 0);
      for (let t5 = 0; t5 < s2.length; t5++) {
        const e2 = s2[t5];
        if (l3 < e2.length) {
          o3 = e2;
          break;
        }
        l3 -= e2.length;
      }
      !o3 && i.spans.length > 0 && (o3 = i.spans[i.spans.length - 1]);
      const c2 = "\n", d2 = new Qo(1);
      o3 && vo(d2, o3);
      const p2 = new G(d2), u = new ta(c2, p2);
      h2 && "simple" !== n2 || Co(u, i), a2 && vo(d2, a2, true), h2 && Co(u, h2), t4.splice(e + 1, 0, u), e++, i = u, r = 0;
    }
    if (l2 = s.indexOf("\n"), l2 < 0) {
      Ao(i, s, r, n2, a2);
      break;
    }
  }
}
function Lo(t4, e, i, s, r) {
  const n2 = t4.paras;
  for (let t5 = 0, o2 = n2.length; t5 < o2; t5++) {
    const a2 = n2[t5];
    if (i < a2.length) {
      Ro(n2, t5, a2, e, i, s, r);
      break;
    }
    if (t5 === o2 - 1) throw new Error("index outside text's range");
    i -= a2.length;
  }
}
function Po(t4, e, i) {
  1 === t4.paras.length && 1 === t4.paras[0].length && e.attr && ko(t4, e.attr), function(t5, e2, i2, s) {
    if (0 !== e2.length) for (let r = 0, n2 = e2.length; r < n2; r++) {
      const n3 = e2[r], o2 = n3.spans;
      let a2 = 0;
      for (let e3 = 0, r2 = o2.length; e3 < r2; e3++) {
        const r3 = o2[e3], h2 = n3.text.slice(a2, a2 + r3.length);
        Lo(t5, h2, i2 + a2, s, { attr: r3, paraAttr: n3.attr }), a2 += h2.length;
      }
      a2 < n3.length && Lo(t5, n3.text.slice(a2), i2 + a2, s, { paraAttr: n3.attr }), i2 += n3.length;
    }
  }(t4, e.paras, i, "complex");
}
function Bo(t4, e, i, s, r, n2, o2) {
  const a2 = [];
  for (; s > 0 && e < t4.length; ) {
    const h2 = t4[e];
    if (i > 0) {
      const s2 = new Qo(h2.length - i);
      vo(s2, h2), h2.length = i, t4.splice(e + 1, 0, s2), o2 += h2.length, i = 0, e++;
    } else if (s < h2.length) {
      const i2 = new Qo(h2.length - s);
      vo(i2, h2), h2.length = s, t4.splice(e + 1, 0, i2);
    } else if (a2.push({ index: i + o2, len: h2.length, value: h2[r] }), h2[r] = n2, o2 += h2.length, s -= h2.length, e > 0 && !Mo(h2, t4[e - 1])) {
      t4[e - 1].length += h2.length, t4.splice(e, 1);
    } else e++;
  }
  return a2;
}
function Oo(t4, e, i, s, r) {
  const n2 = [];
  let o2 = e;
  return wo(t4.paras, e, i, (t5, e2, i2, a2, h2) => {
    o2 -= a2, n2.push(...function(t6, e3, i3, s2, r2, n3) {
      for (let o3 = 0, a3 = t6.length; o3 < a3; o3++) {
        const a4 = t6[o3];
        if (e3 < a4.length) return Bo(t6, o3, e3, i3, s2, r2, n3);
        n3 += a4.length, e3 -= a4.length;
      }
      return [];
    }(i2.spans, a2, h2, s, r, o2)), o2 += i2.length;
  }), n2;
}
function No(t4, e, i) {
  const s = new G();
  for (let r = 0; r < t4.length && i > 0; ) {
    const n2 = t4[r];
    if (e < n2.length) {
      if (0 === e && i >= n2.length) {
        s.push(vn(n2)), t4.splice(r, 1), i -= n2.length;
        continue;
      }
      const o2 = Math.min(n2.length - e, i);
      n2.length -= o2, i -= o2, e = 0, r++;
      const a2 = vn(n2);
      a2.length = o2, s.push(a2);
    } else e -= n2.length, r++;
  }
  return s;
}
function zo(t4, e) {
  t4.text += e.text;
  const i = t4.spans, s = i.length - 1;
  if (i.push(...e.spans.map((t5) => vn(t5))), s >= 0 && i.length - 1 > s) {
    const t5 = i[s], e2 = i[s + 1];
    Mo(t5, e2) || (t5.length += e2.length, i.splice(s + 1, 1));
  }
}
function Vo(t4, e, i, s, r) {
  if (r > 0 && e === t4.length - 1 && s + r >= i.length && (r = i.length - s - 1), s + r <= i.length) {
    let n3 = s + r === i.length;
    const o3 = i.text.slice(s, s + r);
    i.text = i.text.slice(0, s) + i.text.slice(s + r);
    const a3 = No(i.spans, s, r), h3 = new ta(o3, a3);
    Co(h3, i);
    const l2 = new ea(new G());
    if (l2.paras.push(h3), n3) {
      const s2 = t4[e + 1];
      t4.splice(e + 1, 1), zo(i, s2);
    }
    return l2;
  }
  const n2 = t4[e].attr, o2 = new ea(new G());
  let a2 = -1;
  if (s > 0) {
    a2 = e;
    const t5 = i.length, n3 = i.text.slice(s);
    i.text = i.text.slice(0, s);
    const h3 = No(i.spans, s, r);
    r -= t5 - i.length, s = 0, e++;
    const l2 = new ta(n3, h3);
    Co(l2, i), o2.paras.push(l2);
  }
  let h2 = t4.length;
  for (; r > 0 && e < h2 && h2 > 1; ) {
    const i2 = t4[e];
    if (!(r >= i2.length)) break;
    {
      const s2 = i2.text, n3 = i2.spans.slice(0);
      t4.splice(e, 1), r -= i2.length, h2--;
      const a3 = new ta(s2, n3.map((t5) => vn(t5)));
      Co(a3, i2), o2.paras.push(a3);
    }
  }
  if (i = t4[e], r > 0 && e === t4.length - 1 && s + r >= i.length && (r = i.length - s - 1), r > 0 && e < h2) {
    const s2 = (i = t4[e]).text.slice(0, r);
    i.text = i.text.slice(r);
    const n3 = No(i.spans, 0, r);
    r -= i.text.length;
    const a3 = new ta(s2, n3);
    Co(a3, i), o2.paras.push(a3);
  }
  if (a2 >= 0) {
    const e2 = t4[a2], i2 = e2.spans;
    if (a2 === t4.length - 1) e2.text += "\n", i2.length > 0 && i2[i2.length - 1].length++;
    else {
      const i3 = t4[a2 + 1];
      t4.splice(a2 + 1, 1), zo(e2, i3);
    }
  } else if (n2 !== (i = t4[e]).attr) if (n2) {
    const t5 = new Jo();
    Co(t5, n2), i.attr = t5;
  } else i.attr = void 0;
  return o2;
}
function Do(t4, e, i, s, r) {
  var _a2, _b, _c, _d, _e, _f, _g, _h;
  if (s <= 0) return r;
  const n2 = ((t5) => {
    switch (t5) {
      case Pt.Flexible:
        return Number.MAX_VALUE;
      case Pt.Fixed:
      case Pt.FixWidthAndHeight:
        return e.width;
    }
  })(((_a2 = t4.attr) == null ? void 0 : _a2.textBehaviour) ?? Pt.Flexible), o2 = (_b = t4.attr) == null ? void 0 : _b.padding, a2 = (o2 == null ? void 0 : o2.left) ?? 0, h2 = (o2 == null ? void 0 : o2.top) ?? 0, l2 = (o2 == null ? void 0 : o2.right) ?? 0, c2 = (o2 == null ? void 0 : o2.bottom) ?? 0, d2 = n2 - a2 - l2, p2 = t4.paras, u = p2.length, f = r.paras;
  let g = 0, m = 0, _ = 0;
  const x = [];
  for (let t5 = f.length; _ < u && _ < t5; _++) {
    const t6 = p2[_], e2 = f[_];
    if (i < e2.charCount) break;
    if (t6.length !== e2.charCount) throw new Error("layout and data Not match 1");
    if (i -= e2.charCount, _ > 0) {
      const t7 = p2[_ - 1], e3 = ((_c = t7.attr) == null ? void 0 : _c.paraSpacing) || 0;
      g += e3;
    }
    g += e2.paraHeight, m = Math.max(e2.paraWidth, m), e2.bulletNumbers && x.push(e2.bulletNumbers), e2.xOffset = 0;
  }
  const y2 = p2.length - f.length + 1;
  for (let e2 = 0; _ < u && e2 < y2; e2++, _++) {
    const i2 = Pr(t4, p2[_], d2, x);
    if (_ > 0) {
      const t5 = p2[_ - 1], e3 = ((_d = t5.attr) == null ? void 0 : _d.paraSpacing) || 0;
      g += e3;
    }
    i2.yOffset = g, g += i2.paraHeight, m = Math.max(i2.paraWidth, m), 0 === e2 ? f.splice(_, 1, i2) : f.splice(_, 0, i2);
  }
  for (let t5 = f.length; _ < u && _ < t5; _++) {
    const t6 = p2[_], e2 = f[_];
    if (t6.length !== e2.charCount) throw new Error("layout and data Not match 2");
    if (_ > 0) {
      const t7 = p2[_ - 1], e3 = ((_e = t7.attr) == null ? void 0 : _e.paraSpacing) || 0;
      g += e3;
    }
    e2.yOffset = g, g += e2.paraHeight, m = Math.max(e2.paraWidth, m), e2.xOffset = 0;
  }
  if (u !== f.length) throw new Error("layout and data Not match 3");
  const w2 = ((_f = t4.attr) == null ? void 0 : _f.textBehaviour) ?? Pt.Flexible, b2 = w2 === Pt.Flexible ? m : d2;
  let M2 = Number.MAX_SAFE_INTEGER;
  for (let i2 = 0, s2 = t4.paras.length; i2 < s2; i2++) {
    const s3 = t4.paras[i2], r2 = f[i2], n3 = ((_g = s3.attr) == null ? void 0 : _g.alignment) ?? Bt.Left;
    for (let t5 = 0, e2 = r2.length; t5 < e2; t5++) {
      Fr(r2[t5], n3, b2);
    }
    if (w2 === Pt.Flexible) switch (n3) {
      case Bt.Centered:
        M2 = Math.min(M2, -(r2.paraWidth - e.width) / 2);
        break;
      case Bt.Left:
      case Bt.Natural:
        M2 = Math.min(M2, 0);
        break;
      case Bt.Justified:
      case Bt.Right:
        M2 = Math.min(M2, -(r2.paraWidth - e.width));
    }
  }
  const v2 = ((t5) => {
    switch (t5) {
      case zt.Top:
        return h2;
      case zt.Middle:
        return (e.height - g - h2 - c2) / 2;
      case zt.Bottom:
        return e.height - g - c2;
    }
  })(((_h = t4.attr) == null ? void 0 : _h.verAlign) ?? zt.Top);
  return r.alignX = M2 === Number.MAX_SAFE_INTEGER ? 0 : M2, r.xOffset = a2, r.yOffset = v2, r.contentHeight = g, r.contentWidth = m, r;
}
function Ho(t4, e, i, s, r) {
  var _a2, _b, _c, _d, _e, _f, _g, _h;
  if (s <= 0) return r;
  const n2 = ((t5) => {
    switch (t5) {
      case Pt.Flexible:
        return Number.MAX_VALUE;
      case Pt.Fixed:
      case Pt.FixWidthAndHeight:
        return e.width;
    }
  })(((_a2 = t4.attr) == null ? void 0 : _a2.textBehaviour) ?? Pt.Flexible), o2 = (_b = t4.attr) == null ? void 0 : _b.padding, a2 = (o2 == null ? void 0 : o2.left) ?? 0, h2 = (o2 == null ? void 0 : o2.top) ?? 0, l2 = (o2 == null ? void 0 : o2.right) ?? 0, c2 = (o2 == null ? void 0 : o2.bottom) ?? 0, d2 = n2 - a2 - l2, p2 = t4.paras, u = p2.length, f = r.paras;
  let g = 0, m = 0, _ = 0;
  const x = [];
  for (let t5 = f.length; _ < u && _ < t5; _++) {
    const t6 = p2[_], e2 = f[_];
    if (i < e2.charCount) break;
    if (t6.length !== e2.charCount) throw new Error("layout and data Not match 4");
    if (i -= e2.charCount, _ > 0) {
      const t7 = p2[_ - 1], e3 = ((_c = t7.attr) == null ? void 0 : _c.paraSpacing) || 0;
      g += e3;
    }
    g += e2.paraHeight, m = Math.max(e2.paraWidth, m), e2.bulletNumbers && x.push(e2.bulletNumbers), e2.xOffset = 0;
  }
  const y2 = f.length - p2.length + 1;
  if (_ < u && y2 > 0) {
    const e2 = Pr(t4, p2[_], d2, x);
    if (_ > 0) {
      const t5 = p2[_ - 1], e3 = ((_d = t5.attr) == null ? void 0 : _d.paraSpacing) || 0;
      g += e3;
    }
    e2.yOffset = g, g += e2.paraHeight, m = Math.max(e2.paraWidth, m), f.splice(_, 1, e2), _++;
    for (let t5 = 1; t5 < y2; t5++) f.splice(_, 1);
  }
  for (let t5 = f.length; _ < u && _ < t5; _++) {
    const t6 = p2[_], e2 = f[_];
    if (t6.length !== e2.charCount) throw new Error("layout and data Not match 5");
    if (_ > 0) {
      const t7 = p2[_ - 1], e3 = ((_e = t7.attr) == null ? void 0 : _e.paraSpacing) || 0;
      g += e3;
    }
    e2.yOffset = g, g += e2.paraHeight, m = Math.max(e2.paraWidth, m), e2.xOffset = 0;
  }
  if (u !== f.length) throw new Error("layout and data Not match 6");
  const w2 = ((_f = t4.attr) == null ? void 0 : _f.textBehaviour) ?? Pt.Flexible, b2 = w2 === Pt.Flexible ? m : d2;
  let M2 = Number.MAX_SAFE_INTEGER;
  for (let i2 = 0, s2 = t4.paras.length; i2 < s2; i2++) {
    const s3 = t4.paras[i2], r2 = f[i2], n3 = ((_g = s3.attr) == null ? void 0 : _g.alignment) ?? Bt.Left;
    for (let t5 = 0, e2 = r2.length; t5 < e2; t5++) {
      Fr(r2[t5], n3, b2);
    }
    if (w2 === Pt.Flexible) switch (n3) {
      case Bt.Centered:
        M2 = Math.min(M2, -(r2.paraWidth - e.width) / 2);
        break;
      case Bt.Left:
      case Bt.Natural:
        M2 = Math.min(M2, 0);
        break;
      case Bt.Justified:
      case Bt.Right:
        M2 = Math.min(M2, -(r2.paraWidth - e.width));
    }
  }
  const v2 = ((t5) => {
    switch (t5) {
      case zt.Top:
        return h2;
      case zt.Middle:
        return (e.height - g - h2 - c2) / 2;
      case zt.Bottom:
        return e.height - g - c2;
    }
  })(((_h = t4.attr) == null ? void 0 : _h.verAlign) ?? zt.Top);
  return r.alignX = M2 === Number.MAX_SAFE_INTEGER ? 0 : M2, r.xOffset = a2, r.yOffset = v2, r.contentHeight = g, r.contentWidth = m, r;
}
function Wo(t4, e, i, s, r) {
  var _a2, _b, _c, _d, _e, _f, _g, _h;
  if (s <= 0) return r;
  const n2 = ((t5) => {
    switch (t5) {
      case Pt.Flexible:
        return Number.MAX_VALUE;
      case Pt.Fixed:
      case Pt.FixWidthAndHeight:
        return e.width;
    }
  })(((_a2 = t4.attr) == null ? void 0 : _a2.textBehaviour) ?? Pt.Flexible), o2 = (_b = t4.attr) == null ? void 0 : _b.padding, a2 = (o2 == null ? void 0 : o2.left) ?? 0, h2 = (o2 == null ? void 0 : o2.top) ?? 0, l2 = (o2 == null ? void 0 : o2.right) ?? 0, c2 = (o2 == null ? void 0 : o2.bottom) ?? 0, d2 = n2 - a2 - l2, p2 = t4.paras, u = p2.length, f = r.paras;
  let g = 0, m = 0, _ = 0;
  const x = [];
  for (let t5 = f.length; _ < u && _ < t5; _++) {
    const t6 = p2[_], e2 = f[_];
    if (i < e2.charCount) break;
    if (t6.length !== e2.charCount) throw new Error("layout and data Not match 7");
    if (i -= e2.charCount, _ > 0) {
      const t7 = p2[_ - 1], e3 = ((_c = t7.attr) == null ? void 0 : _c.paraSpacing) || 0;
      g += e3;
    }
    g += e2.paraHeight, m = Math.max(e2.paraWidth, m), e2.bulletNumbers && x.push(e2.bulletNumbers), e2.xOffset = 0;
  }
  s += i;
  for (let e2 = f.length; s >= 0 && _ < u && _ < e2; _++) {
    const e3 = p2[_], i2 = Pr(t4, e3, d2, x);
    if (_ > 0) {
      const t5 = p2[_ - 1], e4 = ((_d = t5.attr) == null ? void 0 : _d.paraSpacing) || 0;
      g += e4;
    }
    i2.yOffset = g, g += i2.paraHeight, m = Math.max(i2.paraWidth, m), f.splice(_, 1, i2), s -= e3.length;
  }
  for (let t5 = f.length; _ < u && _ < t5; _++) {
    const t6 = p2[_], e2 = f[_];
    if (t6.length !== e2.charCount) throw new Error("layout and data Not match 8");
    if (_ > 0) {
      const t7 = p2[_ - 1], e3 = ((_e = t7.attr) == null ? void 0 : _e.paraSpacing) || 0;
      g += e3;
    }
    e2.yOffset = g, g += e2.paraHeight, m = Math.max(e2.paraWidth, m), e2.xOffset = 0;
  }
  if (u !== f.length) throw new Error("layout and data Not match 9");
  const y2 = ((_f = t4.attr) == null ? void 0 : _f.textBehaviour) ?? Pt.Flexible, w2 = y2 === Pt.Flexible ? m : d2;
  let b2 = Number.MAX_SAFE_INTEGER;
  for (let i2 = 0, s2 = t4.paras.length; i2 < s2; i2++) {
    const s3 = t4.paras[i2], r2 = f[i2], n3 = ((_g = s3.attr) == null ? void 0 : _g.alignment) ?? Bt.Left;
    for (let t5 = 0, e2 = r2.length; t5 < e2; t5++) {
      Fr(r2[t5], n3, w2);
    }
    if (y2 === Pt.Flexible) switch (n3) {
      case Bt.Centered:
        b2 = Math.min(b2, -(r2.paraWidth - e.width) / 2);
        break;
      case Bt.Left:
      case Bt.Natural:
        b2 = Math.min(b2, 0);
        break;
      case Bt.Justified:
      case Bt.Right:
        b2 = Math.min(b2, -(r2.paraWidth - e.width));
    }
  }
  const M2 = ((t5) => {
    switch (t5) {
      case zt.Top:
        return h2;
      case zt.Middle:
        return (e.height - g - h2 - c2) / 2;
      case zt.Bottom:
        return e.height - g - c2;
    }
  })(((_h = t4.attr) == null ? void 0 : _h.verAlign) ?? zt.Top);
  return r.alignX = b2 === Number.MAX_SAFE_INTEGER ? 0 : b2, r.xOffset = a2, r.yOffset = M2, r.contentHeight = g, r.contentWidth = m, r;
}
function $o(t4, e, i) {
  let s = "";
  return wo(t4.paras, e, i, (t5, e2, i2, r, n2) => {
    s += i2.text.slice(r, r + n2);
  }), s;
}
const Xo = new Pi(1, 0, 0, 0);
function Go(t4, e, i, s) {
  const r = t4.color ?? (i == null ? void 0 : i.color) ?? (s == null ? void 0 : s.color) ?? Xo;
  void 0 === e.color ? e.color = r : r === e.color || (r === Xo || e.color === Xo ? e.colorIsMulti = true : r.equals(e.color) || (e.colorIsMulti = true));
  const n2 = t4.gradient ?? (i == null ? void 0 : i.gradient) ?? (s == null ? void 0 : s.gradient);
  void 0 === e.gradient ? e.gradient = n2 : void 0 === n2 ? e.gradientIsMulti = true : bo(e.gradient, n2) || (e.gradientIsMulti = true);
  const o2 = t4.fontName ?? (i == null ? void 0 : i.fontName) ?? (s == null ? void 0 : s.fontName) ?? "";
  void 0 === e.fontName ? e.fontName = o2 : void 0 !== o2 && e.fontName === o2 || (e.fontNameIsMulti = true);
  const a2 = t4.fontSize ?? (i == null ? void 0 : i.fontSize) ?? (s == null ? void 0 : s.fontSize) ?? 0;
  void 0 === e.fontSize ? e.fontSize = a2 : void 0 !== a2 && e.fontSize === a2 || (e.fontSizeIsMulti = true);
  const h2 = t4.highlight ?? (i == null ? void 0 : i.highlight) ?? (s == null ? void 0 : s.highlight) ?? Xo;
  void 0 === e.highlight ? e.highlight = h2 : h2 === e.highlight || (h2 === Xo || e.highlight === Xo ? e.highlightIsMulti = true : h2.equals(e.highlight) || (e.highlightIsMulti = true));
  const l2 = t4.weight ?? (i == null ? void 0 : i.weight) ?? (s == null ? void 0 : s.weight) ?? 400;
  void 0 === e.weight ? e.weight = l2 : void 0 !== l2 && e.weight === l2 || (e.weightIsMulti = true);
  const c2 = t4.italic ?? (i == null ? void 0 : i.italic) ?? (s == null ? void 0 : s.italic) ?? false;
  void 0 === e.italic ? e.italic = c2 : void 0 !== c2 && e.italic === c2 || (e.italicIsMulti = true);
  const d2 = t4.underline ?? (i == null ? void 0 : i.underline) ?? (s == null ? void 0 : s.underline) ?? Vt.None;
  void 0 === e.underline ? e.underline = d2 : void 0 !== d2 && e.underline === d2 || (e.underlineIsMulti = true);
  const p2 = t4.strikethrough ?? (i == null ? void 0 : i.strikethrough) ?? (s == null ? void 0 : s.strikethrough) ?? Rt.None;
  void 0 === e.strikethrough ? e.strikethrough = p2 : void 0 !== p2 && e.strikethrough === p2 || (e.strikethroughIsMulti = true);
  const u = t4.kerning ?? (i == null ? void 0 : i.kerning) ?? (s == null ? void 0 : s.kerning) ?? 0;
  void 0 === e.kerning ? e.kerning = u : void 0 !== u && e.kerning === u || (e.kerningIsMulti = true);
  const f = t4.transform ?? (i == null ? void 0 : i.transform) ?? (s == null ? void 0 : s.transform) ?? Nt.None;
  void 0 === e.transform ? e.transform = f : void 0 !== f && e.transform === f || (e.transformIsMulti = true);
  const g = t4.bulletNumbers;
  void 0 === e.bulletNumbers ? g && (e.bulletNumbers = g) : g && e.bulletNumbers.type !== g.type && (e.bulletNumbersIsMulti = true);
  const m = t4.fillType ?? (i == null ? void 0 : i.fillType) ?? (s == null ? void 0 : s.fillType) ?? yt.SolidColor;
  void 0 === e.fillType ? m && (e.fillType = m) : m && e.fillType !== m && (e.fillTypeIsMulti = true);
}
function Yo(t4, e) {
  t4.fontNameIsMulti ? e.fontNameIsMulti = true : t4.fontName && (e.fontName = t4.fontName), t4.colorIsMulti ? e.colorIsMulti = true : t4.color && (e.color = t4.color), t4.fontSizeIsMulti ? e.fontSizeIsMulti = true : void 0 !== t4.fontSize && (e.fontSize = t4.fontSize), t4.highlightIsMulti ? e.highlightIsMulti = true : t4.highlight && (e.highlight = t4.highlight), t4.weightIsMulti ? e.weightIsMulti = true : void 0 !== t4.weight && (e.weight = t4.weight), t4.italicIsMulti ? e.italicIsMulti = true : void 0 !== t4.italic && (e.italic = t4.italic), t4.underlineIsMulti ? e.underlineIsMulti = true : void 0 !== t4.underline && (e.underline = t4.underline), t4.strikethroughIsMulti ? e.strikethroughIsMulti = true : void 0 !== t4.strikethrough && (e.strikethrough = t4.strikethrough), t4.kerningIsMulti ? e.kerningIsMulti = true : void 0 !== t4.kerning && (e.kerning = t4.kerning), t4.transformIsMulti ? e.transformIsMulti = true : void 0 !== t4.transform && (e.transform = t4.transform), t4.bulletNumbersIsMulti ? e.bulletNumbersIsMulti = true : void 0 !== t4.bulletNumbers && (e.bulletNumbers = t4.bulletNumbers), t4.fillTypeIsMulti ? e.fillTypeIsMulti = true : t4.fillType && (e.fillType = t4.fillType), t4.gradientIsMulti ? e.gradientIsMulti = true : t4.gradient && (e.gradient = t4.gradient);
}
function Uo(t4, e, i) {
  Go(t4, e, void 0, i);
  const s = t4.alignment ?? (i == null ? void 0 : i.alignment) ?? Bt.Left;
  void 0 === e.alignment ? e.alignment = s : void 0 !== s && e.alignment === s || (e.alignmentIsMulti = true);
  const r = t4.kerning ?? (i == null ? void 0 : i.kerning) ?? 0;
  void 0 === e.kerning ? e.kerning = r : void 0 !== r && e.kerning === r || (e.kerningIsMulti = true);
  const n2 = t4.maximumLineHeight ?? (i == null ? void 0 : i.maximumLineHeight) ?? 0;
  void 0 === e.maximumLineHeight ? e.maximumLineHeight = n2 : void 0 !== n2 && e.maximumLineHeight === n2 || (e.maximumLineHeightIsMulti = true);
  const o2 = t4.minimumLineHeight ?? (i == null ? void 0 : i.minimumLineHeight) ?? 0;
  void 0 === e.minimumLineHeight ? e.minimumLineHeight = o2 : void 0 !== o2 && e.minimumLineHeight === o2 || (e.minimumLineHeightIsMulti = true);
  const a2 = t4.paraSpacing ?? (i == null ? void 0 : i.paraSpacing) ?? 0;
  void 0 === e.paraSpacing ? e.paraSpacing = a2 : void 0 !== a2 && e.paraSpacing === a2 || (e.paraSpacingIsMulti = true);
}
function Zo(t4, e, i, s) {
  const r = new qo(), n2 = new qo(), o2 = new qo();
  if (t4.attr && (Uo(t4.attr, o2, t4.attr), o2.verAlign = t4.attr.verAlign, o2.orientation = t4.attr.orientation, o2.textBehaviour = t4.attr.textBehaviour), 0 === i) {
    t4.alignParaRange(e, i).index !== e && --e, i = 1;
  } else s = void 0;
  let a2, h2 = 0;
  var l2, c2, d2, p2;
  return wo(t4.paras, e, i, (e2, i2, s2, r2, o3) => {
    a2 = s2, h2 = r2;
    const l3 = s2.attr;
    l3 && Uo(l3, n2, t4.attr);
  }, (e2, i2, s2) => {
    h2 += i2;
    (!(1 === e2.length && h2 === a2.length - 1) || a2.spans.length <= 1) && Go(e2, r, a2.attr, t4.attr), h2 += s2;
  }), Yo(r, n2), Yo(l2 = n2, c2 = o2), l2.alignmentIsMulti ? c2.alignmentIsMulti = true : l2.alignment && (c2.alignment = l2.alignment), l2.kerningIsMulti ? c2.kerningIsMulti = true : void 0 !== l2.kerning && (c2.kerning = l2.kerning), l2.maximumLineHeightIsMulti ? c2.maximumLineHeightIsMulti = true : void 0 !== l2.maximumLineHeight && (c2.maximumLineHeight = l2.maximumLineHeight), l2.minimumLineHeightIsMulti ? c2.minimumLineHeightIsMulti = true : void 0 !== l2.minimumLineHeight && (c2.minimumLineHeight = l2.minimumLineHeight), l2.paraSpacingIsMulti ? c2.paraSpacingIsMulti = true : void 0 !== l2.paraSpacing && (c2.paraSpacing = l2.paraSpacing), o2.color === Xo && (o2.color = void 0), o2.highlight === Xo && (o2.highlight = void 0), s && (d2 = o2, (p2 = s).fontName && (d2.fontName = p2.fontName, d2.fontNameIsMulti = false), void 0 !== p2.fontSize && (d2.fontSize = p2.fontSize, d2.fontSizeIsMulti = false), p2.color && (d2.color = p2.color, d2.colorIsMulti = false), p2.highlight && (d2.highlight = p2.highlight, d2.highlightIsMulti = false), void 0 !== p2.weight && (d2.weight = p2.weight, d2.weightIsMulti = false), void 0 !== p2.italic && (d2.italic = p2.italic, d2.italicIsMulti = false), p2.underline && (d2.underline = p2.underline, d2.underlineIsMulti = false), p2.strikethrough && (d2.strikethrough = p2.strikethrough, d2.strikethroughIsMulti = false), void 0 !== p2.kerning && (d2.kerning = p2.kerning, d2.kerningIsMulti = false), p2.transform && (d2.transform = p2.transform, d2.transformIsMulti = false), p2.fillType && (d2.fillType = p2.fillType, d2.fillTypeIsMulti = false), p2.gradient && (d2.gradient = p2.gradient, d2.gradientIsMulti = false)), o2;
}
class jo extends X {
  constructor() {
    super();
    __publicField(this, "typeId", "span-attr");
    __publicField(this, "fontName");
    __publicField(this, "fontSize");
    __publicField(this, "color");
    __publicField(this, "strikethrough");
    __publicField(this, "underline");
    __publicField(this, "weight");
    __publicField(this, "italic");
    __publicField(this, "bulletNumbers");
    __publicField(this, "highlight");
    __publicField(this, "kerning");
    __publicField(this, "transform");
    __publicField(this, "placeholder");
    __publicField(this, "fillType");
    __publicField(this, "gradient");
  }
}
class Jo extends jo {
  constructor() {
    super();
    __publicField(this, "typeId", "para-attr");
    __publicField(this, "alignment");
    __publicField(this, "paraSpacing");
    __publicField(this, "minimumLineHeight");
    __publicField(this, "maximumLineHeight");
    __publicField(this, "indent");
  }
}
class Ko extends Jo {
  constructor() {
    super();
    __publicField(this, "typeId", "text-attr");
    __publicField(this, "verAlign");
    __publicField(this, "orientation");
    __publicField(this, "textBehaviour");
    __publicField(this, "padding");
  }
}
class qo extends Ko {
  constructor() {
    super(...arguments);
    __publicField(this, "fontNameIsMulti", false);
    __publicField(this, "fontSizeIsMulti", false);
    __publicField(this, "colorIsMulti", false);
    __publicField(this, "highlightIsMulti", false);
    __publicField(this, "weightIsMulti", false);
    __publicField(this, "italicIsMulti", false);
    __publicField(this, "underlineIsMulti", false);
    __publicField(this, "strikethroughIsMulti", false);
    __publicField(this, "alignmentIsMulti", false);
    __publicField(this, "paraSpacingIsMulti", false);
    __publicField(this, "kerningIsMulti", false);
    __publicField(this, "minimumLineHeightIsMulti", false);
    __publicField(this, "maximumLineHeightIsMulti", false);
    __publicField(this, "transformIsMulti", false);
    __publicField(this, "bulletNumbersIsMulti", false);
    __publicField(this, "fillTypeIsMulti", false);
    __publicField(this, "gradientIsMulti", false);
  }
}
class Qo extends jo {
  constructor(t4) {
    super();
    __publicField(this, "typeId", "span");
    __publicField(this, "length");
    this.length = t4;
  }
}
class ta extends X {
  constructor(t4, e) {
    super();
    __publicField(this, "typeId", "para");
    __publicField(this, "text");
    __publicField(this, "spans");
    __publicField(this, "attr");
    this.text = t4, this.spans = e;
  }
  get length() {
    return this.text.length;
  }
  charAt(t4) {
    return this.text.charAt(t4);
  }
}
const _ea = class _ea extends X {
  constructor(t4) {
    super();
    __publicField(this, "typeId", "text");
    __publicField(this, "paras");
    __publicField(this, "attr");
    __publicField(this, "__layouts", /* @__PURE__ */ new Map());
    this.paras = t4;
  }
  dropLayout(t4, e) {
    let i = this.__layouts.get(t4);
    if (i) {
      const s = i.owners.indexOf(e);
      s >= 0 && (i.owners.splice(s, 1), 0 === i.owners.length && this.__layouts.delete(t4));
    }
  }
  getLayout3(t4, e, i) {
    const s = [t4.width, t4.height].join(",");
    if (s !== i) {
      let r2 = i && this.__layouts.get(i);
      if (r2) {
        if (1 === r2.owners.length && r2.owners[0] === e) return r2.update(t4, this), r2.layout || (r2.layout = Br(this, t4)), this.__layouts.delete(i), this.__layouts.set(s, r2), { token: s, layout: r2.layout };
        const n2 = r2.owners.indexOf(e);
        n2 >= 0 && (r2.owners.splice(n2, 1), 0 === r2.owners.length && this.__layouts.delete(i));
      }
    }
    let r = this.__layouts.get(s);
    return r ? r.owners.indexOf(e) < 0 && r.owners.push(e) : (r = new Er(), r.owners.push(e), this.__layouts.set(s, r)), r.update(t4, this), r.layout || (r.layout = Br(this, t4)), { token: s, layout: r.layout };
  }
  getLayout2(t4) {
    const e = [t4.width, t4.height].join(",");
    let i = this.__layouts.get(e);
    return i ? i.layout : Br(this, t4);
  }
  getOpTarget(t4) {
    return 0 === t4.length ? this : "attr" === t4[0] ? (this.attr || (this.attr = new Ko()), this.attr.getOpTarget(t4.splice(1))) : void 0;
  }
  charAt(t4) {
    for (let e = 0, i = this.paras.length; e < i; e++) {
      const i2 = this.paras[e];
      if (t4 < i2.length) return i2.charAt(t4);
      t4 -= i2.length;
    }
    return "";
  }
  revertCharAt(t4) {
    for (let e = this.paras.length - 1; e >= 0; e--) {
      const i = this.paras[e];
      if (t4 < i.length) return i.charAt(i.length - t4 - 1);
      t4 -= i.length;
    }
    return "";
  }
  paraAt(t4) {
    for (let e = 0, i = this.paras.length; e < i; e++) {
      const i2 = this.paras[e];
      if (t4 < i2.length) return { para: i2, index: t4, paraIndex: e };
      t4 -= i2.length;
    }
  }
  spanAt(t4) {
    const e = this.paraAt(t4);
    if (!e) return;
    const i = e.para;
    t4 = e.index;
    const s = i.spans;
    for (let e2 = 0, i2 = s.length; e2 < i2; e2++) {
      const i3 = s[e2];
      if (t4 < i3.length) return i3;
      t4 -= i3.length;
    }
  }
  alignParaRange(t4, e) {
    if (t4 < 0) throw new Error("index < 0");
    const i = { index: t4, len: e };
    for (let s = 0, r = this.paras.length; s < r; s++) {
      const n2 = this.paras[s];
      if (t4 < n2.length) {
        i.index -= t4, i.len += t4, e += t4;
        for (let t5 = s; t5 < r; t5++) {
          const s2 = this.paras[t5];
          if (e <= s2.length) {
            i.len += s2.length - e;
            break;
          }
          e -= s2.length;
        }
        break;
      }
      t4 -= n2.length;
    }
    return i;
  }
  get length() {
    return this.paras.reduce((t4, e) => t4 + e.length, 0);
  }
  getText(t4, e) {
    if (t4 < 0) throw new Error("index < 0");
    return $o(this, t4, e);
  }
  toString() {
    const t4 = $o(this, 0, Number.MAX_VALUE);
    return t4.substring(0, t4.length - 1);
  }
  getTextWithFormat(t4, e) {
    if (t4 < 0) throw new Error("index < 0");
    return function(t5, e2, i) {
      const s = new _ea(new G());
      return wo(t5.paras, e2, i, (t6, e3, i2, r, n2) => {
        const o2 = r + n2, a2 = i2.text.slice(r, o2), h2 = new ta(a2, new G());
        Co(h2, i2), s.paras.push(h2);
      }, (t6, e3, i2) => {
        var _a2;
        const r = new Qo(e3 + i2 - e3);
        vo(r, t6), (_a2 = s.paras.at(-1)) == null ? void 0 : _a2.spans.push(r);
      }), s;
    }(this, t4, e);
  }
  getDefaultTextFormat() {
    return this.attr;
  }
  getTextFormat(t4, e, i) {
    if (t4 < 0) throw new Error("index < 0");
    return Zo(this, t4, e, i);
  }
  getUsedFontNames(t4) {
    return function(t5, e) {
      const i = e ?? /* @__PURE__ */ new Set();
      return t5.attr && t5.attr.fontName && i.add(t5.attr.fontName), wo(t5.paras, 0, Number.MAX_VALUE, (t6, e2, s, r, n2) => {
        const o2 = s.attr;
        o2 && o2.fontName && i.add(o2.fontName);
      }, (t6, e2, s) => {
        t6.fontName && i.add(t6.fontName);
      }), i;
    }(this, t4);
  }
  insertText(t4, e, i) {
    if (e < 0) throw new Error("index < 0");
    !function(t5, e2, i2, s) {
      Lo(t5, e2, i2, "simple", s);
    }(this, t4, e, i), this.__layouts.forEach((i2) => i2.layout = i2.layout && Do(this, i2.__frame, e, t4.length, i2.layout));
  }
  composingInputUpdate(t4) {
    if (t4 < 0) throw new Error("index < 0");
    this.__layouts.forEach((e) => e.layout = e.layout && Ho(this, e.__frame, t4, 1, e.layout));
  }
  insertFormatText(t4, e) {
    if (e < 0) throw new Error("index < 0");
    Po(this, t4, e), this.__layouts.forEach((i) => i.layout = i.layout && Do(this, i.__frame, e, t4.length, i.layout));
  }
  formatText(t4, e, i, s) {
    if (t4 < 0) throw new Error("index < 0");
    const r = Oo(this, t4, e, i, s);
    return this.__layouts.forEach((i2) => i2.layout = i2.layout && Wo(this, i2.__frame, t4, e, i2.layout)), r;
  }
  formatPara(t4, e, i, s) {
    if (t4 < 0) throw new Error("index < 0");
    const r = function(t5, e2, i2, s2, r2) {
      const n2 = [];
      let o2 = e2;
      return wo(t5.paras, e2, i2, (t6, e3, i3, a2, h2) => {
        o2 -= a2;
        const l2 = Math.min(i3.length, a2 + h2);
        n2.push({ index: a2 + o2, len: l2 - a2, value: i3.attr ? i3.attr[s2] : void 0 }), i3.attr || (i3.attr = new Jo()), i3.attr[s2] = r2, o2 += i3.length;
      }), n2;
    }(this, t4, e, i, s);
    return this.__layouts.forEach((i2) => i2.layout = i2.layout && Wo(this, i2.__frame, t4, e, i2.layout)), r;
  }
  deleteText(t4, e) {
    if (t4 < 0) throw new Error("index < 0");
    const i = function(t5, e2, i2) {
      if (e2 < 0 && (i2 += e2, e2 = 0), i2 <= 0) return;
      const s = t5.paras;
      for (let r = 0, n2 = s.length; r < n2; r++) {
        let n3 = s[r];
        if (e2 < n3.length) {
          const o2 = Vo(s, r, n3, e2, i2);
          return t5.attr && ko(o2, t5.attr), o2;
        }
        e2 -= n3.length;
      }
    }(this, t4, e);
    if (i && this.__layouts.size > 0) {
      const s = i.paras;
      let r = false;
      for (let t5 = 0, e2 = s.length; t5 < e2; t5++) {
        const e3 = s[t5];
        if ("*" === e3.text.at(0)) {
          const t6 = e3.spans[0];
          if (t6 && t6.placeholder && t6.bulletNumbers && 1 === t6.length) {
            r = true;
            break;
          }
        }
      }
      r ? this.reLayout() : this.__layouts.forEach((i2) => i2.layout = i2.layout && Ho(this, i2.__frame, t4, e, i2.layout));
    }
    return i;
  }
  onRollback(t4) {
    "composingInput" !== t4 && this.reLayout();
  }
  reLayout() {
    this.__layouts.forEach((t4) => t4.layout = void 0);
  }
  setTextBehaviour(t4) {
    this.attr || (this.attr = new Ko()), this.attr.textBehaviour = t4;
  }
  setTextVerAlign(t4) {
    this.attr || (this.attr = new Ko()), this.attr.verAlign = t4;
  }
  setBulletNumbersType(t4, e, i) {
    const s = function(t5, e2, i2, s2) {
      const r = [];
      return wo(t5.paras, i2, s2, (t6, s3, n2, o2, a2) => {
        if (i2 -= o2, 0 === o2 && "*" === n2.text[0] && n2.spans[0].bulletNumbers && 1 === n2.spans[0].length) {
          const t7 = n2.spans[0].bulletNumbers;
          if (t7.type !== e2) {
            const s4 = t7.type;
            t7.type = e2, r.push({ index: i2, len: 1, value: s4 });
          }
        }
        i2 += n2.length;
      }), r;
    }(this, t4, e, i);
    return this.reLayout(), s;
  }
  setBulletNumbersStart(t4, e, i) {
    const s = function(t5, e2, i2, s2) {
      const r = [];
      return wo(t5.paras, i2, s2, (t6, s3, n2, o2, a2) => {
        if (i2 -= o2, 0 === o2 && "*" === n2.text[0] && n2.spans[0].bulletNumbers && 1 === n2.spans[0].length) {
          const t7 = n2.spans[0].bulletNumbers;
          if (t7.offset !== e2) {
            const s4 = t7.offset || 0;
            t7.offset = e2, r.push({ index: i2, len: 1, value: s4 });
          }
        }
        i2 += n2.length;
      }), r;
    }(this, t4, e, i);
    return this.reLayout(), s;
  }
  setBulletNumbersBehavior(t4, e, i) {
    const s = function(t5, e2, i2, s2) {
      const r = [];
      return wo(t5.paras, i2, s2, (t6, s3, n2, o2, a2) => {
        if (i2 -= o2, 0 === o2 && "*" === n2.text[0] && n2.spans[0].bulletNumbers && 1 === n2.spans[0].length) {
          const t7 = n2.spans[0].bulletNumbers;
          if (t7.behavior !== e2) {
            const s4 = t7.behavior;
            t7.behavior = e2, r.push({ index: i2, len: 1, value: s4 });
          }
        }
        i2 += n2.length;
      }), r;
    }(this, t4, e, i);
    return this.reLayout(), s;
  }
  setParaIndent(t4, e, i) {
    const s = function(t5, e2, i2, s2) {
      const r = [];
      return wo(t5.paras, i2, s2, (t6, s3, n2, o2, a2) => {
        var _a2;
        i2 -= o2;
        const h2 = ((_a2 = n2.attr) == null ? void 0 : _a2.indent) || 0;
        (e2 ?? 0) !== h2 && (n2.attr || (n2.attr = new Jo()), n2.attr.indent = e2, r.push({ index: i2, len: n2.length, value: h2 })), i2 += n2.length;
      }), r;
    }(this, t4, e, i);
    return this.reLayout(), s;
  }
  setPadding(t4, e, i, s) {
    this.attr || (this.attr = new Ko()), this.attr.padding || (this.attr.padding = new qt()), t4 && (this.attr.padding.left = t4), e && (this.attr.padding.top = e), i && (this.attr.padding.right = i), s && (this.attr.padding.bottom = s), this.reLayout();
  }
};
__publicField(_ea, "DefaultFontSize", 12);
let ea = _ea;
class ia extends _i {
  constructor(t4, e, i, s, r, n2, o2, a2) {
    super(t4, e, i, s, r, n2);
    __publicField(this, "typeId", "table-cell");
    __publicField(this, "cellType");
    __publicField(this, "text");
    __publicField(this, "imageRef");
    __publicField(this, "rowSpan");
    __publicField(this, "colSpan");
    __publicField(this, "__cacheData");
    __publicField(this, "__startLoad", false);
    this.cellType = o2, this.text = a2;
  }
  get size() {
    return this.frame;
  }
  set size(t4) {
  }
  get frame() {
    return new ne();
  }
  getOpTarget(t4) {
    var _a2;
    return 0 === t4.length ? this : "text" === t4[0] ? (this.text || (this.text = Fo()), (_a2 = this.text) == null ? void 0 : _a2.getOpTarget(t4.slice(1))) : super.getOpTarget(t4);
  }
  getCrdtPath() {
    const t4 = this.__parent;
    if (!t4) throw new Error("cell not inside table?");
    return t4.getCrdtPath().concat(this.__propKey);
  }
  static getPathOfSize(t4) {
    const e = t4.width, i = t4.height;
    return new Je([["M", 0, 0], ["l", e, 0], ["l", 0, i], ["l", -e, 0], ["z"]]);
  }
  getPathOfSize(t4, e) {
    const i = t4.width, s = t4.height;
    return new Je([["M", 0, 0], ["l", i, 0], ["l", 0, s], ["l", -i, 0], ["z"]]);
  }
  isImageCell() {
    return this.cellType === Lt.Image;
  }
  isTextCell() {
    return this.cellType === Lt.Text;
  }
  peekImage(t4 = false) {
    var _a2, _b;
    if (((_a2 = this.__cacheData) == null ? void 0 : _a2.ref) === this.imageRef) return (_b = this.__cacheData) == null ? void 0 : _b.media.base64;
    if (!this.imageRef) return "";
    if (t4 && !this.__startLoad) {
      this.__startLoad = true;
      const t5 = this.parent.__imageMgr;
      t5 && t5.get(this.imageRef).then((t6) => {
        t6 && (this.__cacheData = { media: t6, ref: this.imageRef });
      }).finally(() => {
        var _a3;
        return this.__startLoad = false, this.notify("image-reload"), (_a3 = this.__cacheData) == null ? void 0 : _a3.media.base64;
      });
    }
  }
  async loadImage() {
    if (this.__cacheData) return this.__cacheData.media.base64;
    if (!this.imageRef) return "";
    const t4 = this.parent.__imageMgr, e = t4 && await t4.get(this.imageRef);
    return e && (this.__cacheData = { media: e, ref: this.imageRef }, this.notify()), this.__cacheData && this.__cacheData.media.base64 || "";
  }
  getText() {
    if (!this.text) throw new Error("");
    return this.text;
  }
}
const ga = Pi.DefaultColor;
function ma(t4, e) {
  const i = e.position, s = e.color || ga;
  return t4("stop", { offset: 100 * i + "%", "stop-color": "rgba(" + s.red + "," + s.green + "," + s.blue + "," + s.alpha + ")", "stop-opacity": s.alpha });
}
function _a(t4, e, i) {
  const s = "gradient" + l(e);
  let r, n2;
  if (e.gradientType == wt.Linear) {
    const r2 = e.stops.length, o2 = [];
    for (let i2 = 0; i2 < r2; i2++) {
      const s2 = e.stops[i2];
      o2.push(ma(t4, s2));
    }
    n2 = t4("linearGradient", { id: s, x1: e.from.x * i.width, y1: e.from.y * i.height, x2: e.to.x * i.width, y2: e.to.y * i.height, gradientUnits: "userSpaceOnUse" }, o2);
  } else if (e.gradientType == wt.Radial) {
    const r2 = e.stops.length, o2 = [];
    for (let i2 = 0; i2 < r2; i2++) {
      const s2 = e.stops[i2];
      o2.push(ma(t4, s2));
    }
    const a2 = Math.sqrt((e.to.y * i.height - e.from.y * i.height) ** 2 + (e.to.x * i.width - e.from.x * i.width) ** 2), h2 = a2, l2 = e.elipseLength ? e.elipseLength * a2 * i.width / i.height : 0, c2 = Math.atan2(e.to.y * i.height - e.from.y * i.height, e.to.x * i.width - e.from.x * i.width) / Math.PI * 180;
    n2 = t4("radialGradient", { id: s, cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(" + e.from.x * i.width + "," + e.from.y * i.height + ") rotate(" + c2 + ") scale(" + h2 + " " + l2 + ")" }, o2);
  } else if (e.gradientType == wt.Angular) {
    let t5 = "";
    const s2 = e.stops.length, n3 = () => {
      const t6 = e.stops[0], i2 = e.stops[s2 - 1], r2 = 1 - i2.position, n4 = t6.position, o2 = t6.color || ga, a2 = i2.color || ga, h2 = 1 / (n4 + r2), l2 = r2 * h2, c2 = n4 * h2;
      let d2 = o2.red * l2 + a2.red * c2, p2 = o2.green * l2 + a2.green * c2, u = o2.blue * l2 + a2.blue * c2, f = o2.alpha * l2 + a2.alpha * c2;
      return d2 = Math.min(Math.max(Math.round(d2), 0), 255), p2 = Math.min(Math.max(Math.round(p2), 0), 255), u = Math.min(Math.max(Math.round(u), 0), 255), f = Math.min(Math.max(f, 0), 1), { r: d2, g: p2, b: u, a: f };
    };
    if (s2 > 0 && e.stops[0].position > 0) {
      const { r: e2, g: i2, b: s3, a: r2 } = n3();
      t5 = "rgba(" + e2 + "," + i2 + "," + s3 + "," + r2 + ") 0deg";
    }
    for (let i2 = 0; i2 < s2; i2++) {
      const s3 = e.stops[i2], r2 = s3.color || ga, n4 = "rgba(" + r2.red + "," + r2.green + "," + r2.blue + "," + r2.alpha + ")", o2 = Math.round(360 * s3.position);
      t5.length > 0 && (t5 += ","), t5 = t5 + n4 + " " + o2 + "deg";
    }
    if (s2 > 0 && e.stops[s2 - 1].position < 1) {
      const { r: e2, g: i2, b: s3, a: r2 } = n3();
      t5 = t5 + ",rgba(" + e2 + "," + i2 + "," + s3 + "," + r2 + ") 360deg";
    }
    r = "background: conic-gradient(" + ("from " + (Math.atan2(e.to.y * i.height - e.from.y * i.height, e.to.x * i.width - e.from.x * i.width) / Math.PI * 180 + 90) + "deg at " + 100 * e.from.x + "% " + 100 * e.from.y + "%") + "," + t5 + ");height:-webkit-fill-available;width:-webkit-fill-available;";
  }
  return { id: s, style: r, node: n2 };
}
function xa(t4, e, i, s = xt.Evenodd) {
  return t4("clipPath", { id: e }, [t4("path", { d: i, "clip-rule": s })]);
}
function wa() {
  return Math.floor(1e4 * Math.random() + 1);
}
const ba = "data:image/svg+xml;base64,PHN2ZyBkYXRhLXYtM2YyZGNlYTM9IiIgZGF0YS12LTJkNjBmMTNlPSIiIHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczp4aHRtbD0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pbllNaW4gbWVldCIgb3ZlcmZsb3c9InZpc2libGUiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsiPjxnPjxnPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDIxNiwyMTYsMjE2KSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMTAwKSI+PHBhdGggZD0iTSAwIDAgTCAxMDAgMCBMIDEwMCAxMDAgTCAwIDEwMCBMIDAgMCBaIiBmaWxsPSJyZ2IoMjE2LDIxNiwyMTYpIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwyMDApIj48cGF0aCBkPSJNIDAgMCBMIDEwMCAwIEwgMTAwIDEwMCBMIDAgMTAwIEwgMCAwIFoiIGZpbGw9InJnYigyMTYsMjE2LDIxNikiIGZpbGwtb3BhY2l0eT0iMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjAiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDMwMCkiPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDIxNiwyMTYsMjE2KSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwzMDApIj48cGF0aCBkPSJNIDAgMCBMIDEwMCAwIEwgMTAwIDEwMCBMIDAgMTAwIEwgMCAwIFoiIGZpbGw9InJnYigyMTYsMjE2LDIxNikiIGZpbGwtb3BhY2l0eT0iMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjAiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDAsMzAwKSI+PHBhdGggZD0iTSAwIDAgTCAxMDAgMCBMIDEwMCAxMDAgTCAwIDEwMCBMIDAgMCBaIiBmaWxsPSJyZ2IoMjU1LDI1NSwyNTUpIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAwLDMwMCkiPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDAsMCwwKSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwyMDApIj48cGF0aCBkPSJNIDAgMCBMIDEwMCAwIEwgMTAwIDEwMCBMIDAgMTAwIEwgMCAwIFoiIGZpbGw9InJnYigyMTYsMjE2LDIxNikiIGZpbGwtb3BhY2l0eT0iMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjAiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDAsMjAwKSI+PHBhdGggZD0iTSAwIDAgTCAxMDAgMCBMIDEwMCAxMDAgTCAwIDEwMCBMIDAgMCBaIiBmaWxsPSJyZ2IoMCwwLDApIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAwLDIwMCkiPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwxMDApIj48cGF0aCBkPSJNIDAgMCBMIDEwMCAwIEwgMTAwIDEwMCBMIDAgMTAwIEwgMCAwIFoiIGZpbGw9InJnYigyMTYsMjE2LDIxNikiIGZpbGwtb3BhY2l0eT0iMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjAiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDAsMTAwKSI+PHBhdGggZD0iTSAwIDAgTCAxMDAgMCBMIDEwMCAxMDAgTCAwIDEwMCBMIDAgMCBaIiBmaWxsPSJyZ2IoMjU1LDI1NSwyNTUpIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAwLDEwMCkiPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDAsMCwwKSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwwKSI+PHBhdGggZD0iTSAwIDAgTCAxMDAgMCBMIDEwMCAxMDAgTCAwIDEwMCBMIDAgMCBaIiBmaWxsPSJyZ2IoMjE2LDIxNiwyMTYpIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDApIj48cGF0aCBkPSJNIDAgMCBMIDEwMCAwIEwgMTAwIDEwMCBMIDAgMTAwIEwgMCAwIFoiIGZpbGw9InJnYigwLDAsMCkiIGZpbGwtb3BhY2l0eT0iMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjAiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMDAsMCkiPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMzAwKSI+PHBhdGggZD0iTSAwIDAgTCAxMDAgMCBMIDEwMCAxMDAgTCAwIDEwMCBMIDAgMCBaIiBmaWxsPSJyZ2IoMjU1LDI1NSwyNTUpIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLDMwMCkiPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDAsMCwwKSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMjAwKSI+PHBhdGggZD0iTSAwIDAgTCAxMDAgMCBMIDEwMCAxMDAgTCAwIDEwMCBMIDAgMCBaIiBmaWxsPSJyZ2IoMCwwLDApIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLDIwMCkiPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMTAwKSI+PHBhdGggZD0iTSAwIDAgTCAxMDAgMCBMIDEwMCAxMDAgTCAwIDEwMCBMIDAgMCBaIiBmaWxsPSJyZ2IoMjU1LDI1NSwyNTUpIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLDEwMCkiPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDAsMCwwKSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnPjxwYXRoIGQ9Ik0gMCAwIEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgTCAwIDAgWiIgZmlsbD0icmdiKDAsMCwwKSIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMCwwKSI+PHBhdGggZD0iTSAwIDAgTCAxMDAgMCBMIDEwMCAxMDAgTCAwIDEwMCBMIDAgMCBaIiBmaWxsPSJyZ2IoMjU1LDI1NSwyNTUpIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PC9nPjwvc3ZnPg==", Ma = {};
function va(t4, e, i, s, r) {
  const n2 = r.imageScaleMode || Mt.Fill;
  return Ma[n2](t4, e, i, s, r);
}
Ma[Mt.Fill] = function(t4, e, i, s, r) {
  const n2 = r.peekImage(true) || ba;
  let o2 = r.originalImageWidth || 64, a2 = r.originalImageHeight || 64;
  const h2 = { "xlink:href": n2, x: 0, y: 0, "object-fit": "contain", preserveAspectRatio: "none meet" }, l2 = { width: e.width + 1, height: e.height + 1, x: 0, y: 0, patternUnits: "userSpaceOnUse", id: i }, c2 = e.width / o2, d2 = e.height / a2;
  if (e.width > e.height) {
    h2.width = e.width;
    let t5 = (a2 * c2 - e.height) / 2;
    if (t5 < 0) {
      delete h2.width, h2.height = e.height;
      t5 = (o2 * d2 - e.width) / 2, h2.x = -t5;
    } else h2.y = -t5;
  } else {
    h2.height = e.height;
    let t5 = (o2 * d2 - e.width) / 2;
    if (t5 < 0) {
      delete h2.height, h2.width = e.width;
      t5 = (a2 * c2 - e.height) / 2, h2.y = -t5;
    } else h2.x = -t5;
  }
  if (r.rotation && r.rotation > 0) if (90 === r.rotation || 270 === r.rotation) {
    const t5 = {};
    if (h2.width > 0) h2.height = h2.width, delete h2.width, 270 === r.rotation ? (t5.transform = `translate(0px ,${e.height / 2 + o2 * (e.width / a2) / 2}px) rotate(${r.rotation}deg)`, h2.y = 0) : (t5.transform = `translate(${e.width}px, ${e.height / 2 - o2 * (e.width / a2) / 2}px) rotate(${r.rotation}deg)`, h2.y = 0);
    else if (h2.width = h2.height, delete h2.height, 270 === r.rotation) {
      if (e.height / o2 * a2 > e.width) {
        const i2 = (e.height / o2 * a2 - e.width) / 2;
        t5.transform = `translate(${-i2}px ,${e.height}px) rotate(${r.rotation}deg)`;
      } else h2.height = e.width, delete h2.width, t5.transform = `translate(0px ,${e.height / 2 + o2 * (e.width / a2) / 2}px) rotate(${r.rotation}deg)`;
      h2.x = 0;
    } else {
      if (e.height / o2 * a2 > e.width) {
        const i2 = (e.height / o2 * a2 - e.width) / 2;
        t5.transform = `translate(${e.width + i2}px, 0px) rotate(${r.rotation}deg)`;
      } else h2.height = e.width, delete h2.width, t5.transform = `translate(${e.width}px ,${e.height / 2 - o2 * (e.width / a2) / 2}px) rotate(${r.rotation}deg)`;
      h2.x = 0;
    }
    h2.style = t5;
  } else h2.style = Sa(r.rotation, e);
  const p2 = Ca(t4, r), u = t4("image", h2), f = t4("pattern", l2, [u]);
  if (p2 && (h2.style ? h2.style.filter = p2.filter : h2.style = { filter: p2.filter }, p2.node.length)) {
    const e2 = t4("defs", p2.node);
    return t4("g", [e2, f]);
  }
  return f;
}, Ma[Mt.Fit] = function(t4, e, i, s, r) {
  const n2 = r.peekImage(true) || ba;
  let o2 = r.originalImageWidth || 64, a2 = r.originalImageHeight || 64;
  const h2 = { "xlink:href": n2, x: 0, y: 0, "object-fit": "contain", preserveAspectRatio: "none meet" }, l2 = { width: e.width + 1, height: e.height + 1, x: 0, y: 0, patternUnits: "userSpaceOnUse", id: i };
  if (r.rotation && r.rotation > 0) if (90 === r.rotation || 270 === r.rotation) {
    const t5 = o2;
    o2 = a2, a2 = t5;
  } else h2.style = Sa(r.rotation, e);
  const c2 = e.width / o2, d2 = e.height / a2;
  if (e.width > e.height) {
    h2.width = e.width;
    const t5 = a2 * c2;
    let i2 = (e.height - t5) / 2;
    if (i2 < 0) {
      delete h2.width, h2.height = e.height;
      const t6 = o2 * d2;
      i2 = (e.width - t6) / 2, h2.x = i2;
    } else h2.y = i2;
  } else {
    h2.height = e.height;
    const t5 = o2 * d2;
    let i2 = (e.width - t5) / 2;
    if (i2 < 0) {
      delete h2.height, h2.width = e.width;
      const t6 = a2 * c2;
      i2 = (e.height - t6) / 2, h2.y = i2;
    } else h2.x = i2;
  }
  if (r.rotation && r.rotation > 0 && (90 === r.rotation || 270 === r.rotation)) {
    const t5 = {};
    h2.width > 0 ? (h2.height = h2.width, delete h2.width, 270 === r.rotation ? t5.transform = `translate(0px ,${e.height - h2.y}px) rotate(${r.rotation}deg)` : (t5.transform = `translate(${e.width}px, 0) rotate(${r.rotation}deg)`, h2.x = h2.y), h2.y = 0) : (h2.width = h2.height, delete h2.height, 270 === r.rotation ? t5.transform = `translate(${e.width / 2 - o2 * d2 / 2}px ,${e.height}px) rotate(${r.rotation}deg)` : t5.transform = `translate(${e.width - h2.x}px, 0) rotate(${r.rotation}deg)`, h2.x = 0), h2.style = t5;
  }
  const p2 = Ca(t4, r), u = t4("image", h2), f = t4("pattern", l2, [u]);
  if (p2 && (h2.style ? h2.style.filter = p2.filter : h2.style = { filter: p2.filter }, p2.node.length)) {
    const e2 = t4("defs", p2.node);
    return t4("g", [e2, f]);
  }
  return f;
}, Ma[Mt.Stretch] = function(t4, e, i, s, r) {
  const n2 = { "xlink:href": r.peekImage(true) || ba, width: e.width, height: e.height, x: 0, y: 0, preserveAspectRatio: "none meet" };
  r.rotation && r.rotation > 0 && (90 === r.rotation || 270 === r.rotation ? (n2.width = e.height, n2.height = e.width, n2.style = { transform: `translate(${90 === r.rotation ? e.width : 0}px, ${270 === r.rotation ? e.height : 0}px) rotate(${r.rotation}deg)` }) : n2.style = Sa(r.rotation, e));
  const o2 = Ca(t4, r), a2 = t4("image", n2), h2 = t4("pattern", { width: e.width + 1, height: e.height + 1, x: 0, y: 0, patternUnits: "userSpaceOnUse", id: i }, [a2]);
  if (o2 && (n2.style ? n2.style.filter = o2.filter : n2.style = { filter: o2.filter }, o2.node.length)) {
    const e2 = t4("defs", o2.node);
    return t4("g", [e2, h2]);
  }
  return h2;
}, Ma[Mt.Crop] = function(t4, e, i, s, r) {
}, Ma[Mt.Tile] = function(t4, e, i, s, r) {
  let n2 = r.originalImageWidth || 64, o2 = r.originalImageHeight || 64, a2 = "number" == typeof r.scale ? r.scale : 0.5;
  const h2 = r.peekImage(true) || ba, c2 = "mask-" + l(r) + wa(), d2 = { "xlink:href": h2, width: n2 * a2, height: o2 * a2, x: 0, y: 0, "object-fit": "contain", preserveAspectRatio: "none meet" }, p2 = { width: n2 * a2, height: o2 * a2, x: 0, y: 0, patternUnits: "userSpaceOnUse", id: i };
  r.rotation && r.rotation > 0 && (90 === r.rotation || 270 === r.rotation ? p2.style = { transform: `translate(${p2.height / 2}px, ${p2.width / 2}px) rotate(${r.rotation}deg) translate(${-p2.width / 2}px, ${-p2.height / 2}px)` } : p2.style = Sa(r.rotation, { width: p2.width, height: p2.height }));
  const u = Ca(t4, r), f = t4("image", d2), g = t4("pattern", p2, [f]), m = t4("mask", { id: c2, width: n2 * a2, height: o2 * a2 }, [t4("rect", { width: n2 * a2, height: o2 * a2, fill: "white", "fill-opacity": "0.5" }), t4("path", { d: s, fill: "white" })]);
  if (r.isEditingImage && n2 * a2 > e.width) {
    let e2 = {};
    r.rotation && r.rotation > 0 && (e2 = 90 === r.rotation || 270 === r.rotation ? { transform: `translate(${o2 * a2 / 2}px, ${n2 * a2 / 2}px) rotate(${r.rotation}deg) translate(${-n2 * a2 / 2}px, ${-o2 * a2 / 2}px)` } : Sa(r.rotation, { width: n2 * a2, height: o2 * a2 }));
    const i2 = [g, m, t4("image", { ...d2, style: e2, opacity: r.color.alpha, mask: "url(#" + c2 + ")" })];
    if (u) {
      if (u.node.length) {
        const e3 = t4("defs", u.node);
        i2.unshift(e3);
      }
      d2.style = { filter: u.filter };
    }
    return t4("g", i2);
  }
  if (u && (d2.style = { filter: u.filter }, u.node.length)) {
    const e2 = t4("defs", u.node);
    return t4("g", [e2, g]);
  }
  return g;
};
const Sa = (t4, e) => {
  if (!t4) return;
  const { width: i, height: s } = e, r = {};
  let n2 = `translate(${i / 2}px, ${s / 2}px) rotate(${t4}deg) translate(${-i / 2}px, ${-s / 2}px)`;
  return r.transform = n2, r;
}, Ca = (t4, e) => {
  let i = [], s = "";
  const r = e.paintFilter;
  if (r) {
    if (r.exposure) {
      const n2 = r.exposure / 200, o2 = "exposureFilter-" + l(e) + wa(), a2 = { type: "linear", slope: "1", intercept: n2 }, h2 = t4("feComponentTransfer", [t4("feFuncR", a2), t4("feFuncG", a2), t4("feFuncB", a2)]), c2 = t4("filter", { id: o2 }, [h2]);
      i.push(c2), s += `url(#${o2}) `;
    }
    if (r.contrast) {
      s += `contrast(${1 + r.contrast / 200}) `;
    }
    if (r.saturation) {
      const n2 = t4("feColorMatrix", { type: "saturate", values: 1 + r.saturation / 100 }), o2 = "shadowFilter-" + l(e) + wa(), a2 = t4("filter", { id: o2 }, [n2]);
      i.push(a2), s += `url(#${o2}) `;
    }
    if (r.temperature) {
      let n2 = 1, o2 = 1;
      r.temperature < 0 ? (n2 = 1 + r.temperature / 200, o2 = 1 - r.temperature / 25) : (n2 = 1 + r.temperature / 200, o2 = 1 - r.temperature / 100);
      const a2 = t4("feColorMatrix", { type: "matrix", values: `${n2} 0 0 0 0
                     0 1 0 0 0
                     0 0 ${o2} 0 0
                     0 0 0 1 0` }), h2 = "shadowFilter-" + l(e) + wa(), c2 = t4("filter", { id: h2 }, [a2]);
      i.push(c2), s += `url(#${h2}) `;
    }
    if (r.tint) {
      let n2 = 1, o2 = 1;
      r.tint, n2 = 1 + r.tint / 200, o2 = 1 - r.tint / 200;
      const a2 = "shadowFilter-" + l(e) + wa(), h2 = t4("feColorMatrix", { type: "matrix", values: `${n2} 0 0 0 0
                     0 ${o2} 0 0 0
                     0 0 1 0 0
                     0 0 0 1 0` }), c2 = t4("filter", { id: a2 }, [h2]);
      i.push(c2), s += `url(#${a2}) `;
    }
    if (r.shadow) {
      const n2 = r.shadow / 1e3, o2 = "shadowFilter-" + l(e) + wa(), a2 = { type: "linear", slope: "1", intercept: n2 }, h2 = t4("feComponentTransfer", [t4("feFuncR", a2), t4("feFuncG", a2), t4("feFuncB", a2)]), c2 = t4("filter", { id: o2 }, [h2]);
      i.push(c2), s += `url(#${o2}) `;
    }
    if (r.hue) {
      const n2 = "hueFilter-" + l(e) + wa(), o2 = t4("feColorMatrix", { type: "hueRotate", values: r.hue }), a2 = t4("filter", { id: n2 }, [o2]);
      i.push(a2), s += `url(#${n2}) `;
    }
    if (s.length) return { node: i, filter: s };
  }
};
function Ta() {
  return Math.floor(1e4 * Math.random() + 1);
}
const ka = {};
ka[yt.SolidColor] = function(t4, e, i, s) {
  const r = i.color;
  return t4("path", { d: s, fill: "rgb(" + r.red + "," + r.green + "," + r.blue + ")", "fill-opacity": r ? r.alpha : 1, stroke: "none", "stroke-width": 0, "fill-rule": i.fillRule || "evenodd" });
}, ka[yt.Gradient] = function(t4, e, i, s) {
  var _a2;
  const r = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity, n2 = [], o2 = _a(t4, i.gradient, e);
  o2.node && n2.push(o2.node);
  const a2 = o2.id, h2 = o2.style;
  if (h2) {
    const o3 = "clippath-fill-" + l(i) + Ta(), a3 = xa(t4, o3, s);
    n2.push(a3), n2.push(t4("foreignObject", { width: e.width, height: e.height, x: 0, y: 0, "clip-path": "url(#" + o3 + ")", opacity: void 0 === r ? 1 : r }, t4("div", { width: "100%", height: "100%", style: h2 })));
  } else n2.push(t4("path", { d: s, fill: "url(#" + a2 + ")", "fill-opacity": void 0 === r ? 1 : r, stroke: "none", "stroke-width": 0, "fill-rule": i.fillRule || "evenodd" }));
  return t4("g", n2);
}, ka[yt.Pattern] = function(t4, e, i, s) {
  const r = "pattern-fill-" + l(i) + Ta(), n2 = i.color, o2 = va(t4, e, r, s, i), a2 = t4("path", { d: s, fill: "url(#" + r + ")", "fill-opacity": n2 ? n2.alpha : 1 });
  return t4("g", [o2, a2]);
};
const Ea = {};
Ea[yt.SolidColor] = function(t4, e, i, s) {
  return ka[yt.SolidColor](t4, e, i, s);
}, Ea[yt.Gradient] = function(t4, e, i, s) {
  var _a2, _b;
  if (((_a2 = i.gradient) == null ? void 0 : _a2.gradientType) === wt.Angular) return ka[yt.SolidColor](t4, e, i, s);
  const r = (_b = i.gradient) == null ? void 0 : _b.gradientOpacity, n2 = [], o2 = _a(t4, i.gradient, e);
  o2.node && n2.push(o2.node);
  const a2 = o2.id, h2 = o2.style;
  if (h2) {
    const o3 = "clippath-fill-" + l(i) + Ta(), a3 = xa(t4, o3, s);
    n2.push(a3), n2.push(t4("foreignObject", { width: e.width, height: e.height, x: 0, y: 0, "clip-path": "url(#" + o3 + ")", opacity: void 0 === r ? 1 : r }, t4("div", { width: "100%", height: "100%", style: h2 })));
  } else n2.push(t4("path", { d: s, fill: "url(#" + a2 + ")", "fill-opacity": void 0 === r ? 1 : r, stroke: "none", "stroke-width": 0, "fill-rule": i.fillRule || "evenodd" }));
  return t4("g", n2);
}, Ea[yt.Pattern] = function(t4, e, i, s) {
  return ka[yt.Pattern](t4, e, i, s);
};
const Fa = {}, Aa = {};
Aa[ht.Inner] = function(t4, e, i, s, r) {
  var _a2;
  const n2 = wa(), o2 = "clippath-border" + l(i) + n2, a2 = "mask1-border" + l(i) + n2, h2 = "mask2-border" + l(i) + n2, c2 = Pa(i.sideSetting), d2 = e.width, p2 = e.height, u = _a(t4, i.gradient, e), f = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity, g = { d: s, stroke: "white", "stroke-width": 2 * c2, "clip-path": "url(#" + o2 + ")", "stroke-linejoin": i.cornerType, opacity: void 0 === f ? 1 : f }, { length: m, gap: _ } = i.borderStyle;
  (m || _) && (g["stroke-dasharray"] = `${m}, ${_}`, g["stroke-dashoffset"] = m / 2);
  const x = Na(r, i, false);
  g.mask = "url(#" + h2 + ")";
  const y2 = t4("mask", { id: h2, x: 0, y: 0, width: d2, height: p2 }, [t4("path", { d: s, fill: "white" }), t4("path", { d: x, fill: "black" })]), w2 = [];
  if (0 === Math.max(...r.radius)) {
    const r2 = { fill: "none", stroke: "white" };
    (m || _) && (r2["stroke-dasharray"] = `${m}, ${_}`, r2["stroke-dashoffset"] = m / 2);
    const n3 = t4("rect", { x: 0, y: 0, width: d2, height: p2, fill: "black" }), a3 = Va(t4, e, i, r2, false), h3 = t4("clipPath", { id: o2 }, t4("path", { d: s, "clip-rule": "evenodd" })), l2 = t4("g", { "clip-path": "url(#" + o2 + ")" }, a3);
    w2.push(n3, h3, l2);
  } else {
    const e2 = t4("rect", { x: 0, y: 0, width: d2, height: p2, fill: "black" }), i2 = t4("clipPath", { id: o2 }, t4("path", { d: s, "clip-rule": "evenodd" }));
    w2.push(e2, i2, t4("path", g), y2);
  }
  return t4("g", [t4("mask", { id: a2, width: d2, height: p2 }, w2), t4("foreignObject", { x: 0, y: 0, width: d2, height: p2, mask: "url(#" + a2 + ")" }, [t4("div", { width: "100%", height: "100%", style: u.style })])]);
}, Aa[ht.Center] = function(t4, e, i, s, r) {
  var _a2;
  const n2 = wa(), o2 = "mask1-border" + l(i) + n2, a2 = "mask2-border" + l(i) + n2, h2 = Pa(i.sideSetting), c2 = _a(t4, i.gradient, e), d2 = -h2 / 2, p2 = -h2 / 2, u = e.width + h2, f = e.height + h2, g = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity, m = { d: s, stroke: "white", "stroke-width": h2, "stroke-linejoin": i.cornerType, opacity: void 0 === g ? 1 : g };
  (Math.max(...r.radius) > 0 || i.sideSetting.sideType !== At.Custom) && (m["stroke-linejoin"] = "miter");
  const { length: _, gap: x } = i.borderStyle;
  (_ || x) && (m["stroke-dasharray"] = `${_}, ${x}`, m["stroke-dashoffset"] = _ / 2);
  const y2 = La(r, i, true), w2 = Na(r, i, true);
  m.mask = "url(#" + a2 + ")";
  const b2 = [t4("mask", { id: a2, x: -h2 / 2, y: -h2 / 2, width: u, height: f }, [t4("path", { d: y2, fill: "white" }), t4("path", { d: w2, fill: "black" })]), t4("rect", { x: d2, y: p2, width: u, height: f, fill: "black" })];
  if (0 === Math.max(...r.radius) && (_ || x)) {
    const s2 = { fill: "none", stroke: "white", "stroke-dasharray": _, gap: x, "stroke-dashoffset": _ / 2 }, r2 = Ha(t4, e, i.sideSetting, "white"), n3 = t4("g", { mask: "url(#" + a2 + ")" }, [...Va(t4, e, i, s2, true), r2]);
    b2.push(n3);
  } else b2.push(t4("path", m));
  return t4("g", [t4("mask", { id: o2, maskContentUnits: "userSpaceOnUse", x: d2, y: p2, width: u, height: f }, b2), t4("foreignObject", { width: u, height: f, x: d2, y: p2, mask: "url(#" + o2 + ")" }, t4("div", { width: "100%", height: "100%", style: c2.style }))]);
}, Aa[ht.Outer] = function(t4, e, i, s, r) {
  var _a2;
  const n2 = Pa(i.sideSetting), o2 = _a(t4, i.gradient, e), a2 = e.width + 2 * n2, h2 = e.height + 2 * n2, c2 = -n2, d2 = -n2, p2 = wa(), u = "mask1-border" + l(i) + p2, f = "mask2-border" + l(i) + p2, g = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity, m = { d: s, stroke: "white", "stroke-width": 2 * n2, mask: "url(#" + u + ")", "stroke-linejoin": i.cornerType, opacity: void 0 === g ? 1 : g };
  (Math.max(...r.radius) > 0 || i.sideSetting.sideType !== At.Custom) && (m["stroke-linejoin"] = "miter");
  const { length: _, gap: x } = i.borderStyle;
  (_ || x) && (m["stroke-dasharray"] = `${_}, ${x}`, m["stroke-dashoffset"] = _ / 2);
  const y2 = La(r, i, false), w2 = Oa(e, r.radius, i.sideSetting);
  return t4("g", [t4("mask", { id: f, x: c2, y: d2, width: a2, height: h2 }, [t4("mask", { id: u, x: -n2, y: -n2, width: a2, height: h2 }, [t4("path", { d: y2, fill: "white" }), t4("path", { d: s, fill: "black" }), t4("path", { d: w2, fill: "black" })]), t4("rect", { x: c2, y: d2, width: a2, height: h2, fill: "black" }), t4("path", m)]), t4("foreignObject", { width: a2, height: h2, x: c2, y: d2, mask: "url(#" + f + ")" }, t4("div", { width: "100%", height: "100%", style: o2.style }))]);
}, Fa[ht.Inner] = function(t4, e, i, s, r) {
  var _a2;
  const { length: n2, gap: o2 } = i.borderStyle;
  if (0 === Math.max(...r.radius)) return za(t4, e, i, s);
  const a2 = wa(), h2 = "clippath-border" + l(i) + a2, c2 = "mask-border" + l(i) + a2, { width: d2, height: p2 } = e;
  let u;
  const f = { d: s, fill: "none", stroke: "", "stroke-width": 2 * Pa(i.sideSetting), "clip-path": "url(#" + h2 + ")" };
  (n2 || o2) && (f["stroke-dasharray"] = `${n2}, ${o2}`, f["stroke-dashoffset"] = n2 / 2);
  if (i.fillType == yt.SolidColor) {
    const t5 = i.color;
    f.stroke = "rgba(" + t5.red + "," + t5.green + "," + t5.blue + "," + t5.alpha + ")";
  } else {
    u = _a(t4, i.gradient, e);
    const s2 = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity;
    f.opacity = void 0 === s2 ? 1 : s2, f.stroke = "url(#" + u.id + ")";
  }
  const g = [];
  u && u.node && g.push(u.node);
  const m = Na(r, i, false);
  f.mask = "url(#" + c2 + ")";
  const _ = t4("mask", { id: c2, x: 0, y: 0, width: d2, height: p2 }, [t4("path", { d: s, fill: "white" }), t4("path", { d: m, fill: "black" })]);
  return g.push(t4("clipPath", { id: h2 }, t4("path", { d: s, "clip-rule": "evenodd" })), _, t4("path", f)), t4("g", g);
}, Fa[ht.Center] = function(t4, e, i, s, r) {
  var _a2;
  const { length: n2, gap: o2 } = i.borderStyle;
  if (0 === Math.max(...r.radius) && (n2 || o2)) return Da(t4, e, i, s, r);
  const a2 = Pa(i.sideSetting), h2 = wa(), c2 = "mask-border" + l(i) + h2, d2 = r.radius;
  let p2;
  const u = { d: s, fill: "none", stroke: "", "stroke-linejoin": i.cornerType, "stroke-width": a2 };
  (Math.max(...d2) > 0 || i.sideSetting.sideType !== At.Custom) && (u["stroke-linejoin"] = "miter"), (n2 || o2) && (u["stroke-dasharray"] = `${n2}, ${o2}`, u["stroke-dashoffset"] = n2 / 2);
  const f = e.width + a2, g = e.height + a2;
  if (i.fillType == yt.SolidColor) {
    const t5 = i.color;
    u.stroke = "rgba(" + t5.red + "," + t5.green + "," + t5.blue + "," + t5.alpha + ")";
  } else {
    p2 = _a(t4, i.gradient, e);
    const s2 = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity;
    u.opacity = void 0 === s2 ? 1 : s2, u.stroke = "url(#" + p2.id + ")";
  }
  const m = La(r, i, true), _ = Na(r, i, true);
  u.mask = "url(#" + c2 + ")";
  const x = t4("mask", { id: c2, x: -a2 / 2, y: -a2 / 2, width: f, height: g }, [t4("path", { d: m, fill: "white" }), t4("path", { d: _, fill: "black" })]), y2 = t4("path", u);
  return p2 && p2.node ? t4("g", [p2.node, x, y2]) : t4("g", [x, y2]);
}, Fa[ht.Outer] = function(t4, e, i, s, r) {
  var _a2;
  const n2 = Pa(i.sideSetting);
  let o2;
  const a2 = r.radius, h2 = { d: s, fill: "none", stroke: "", "stroke-linejoin": i.cornerType, "stroke-width": 2 * n2 };
  (Math.max(...a2) > 0 || i.sideSetting.sideType !== At.Custom) && (h2["stroke-linejoin"] = "miter");
  const { length: c2, gap: d2 } = i.borderStyle;
  (c2 || d2) && (h2["stroke-dasharray"] = `${c2}, ${d2}`, h2["stroke-dashoffset"] = c2 / 2);
  if (i.fillType == yt.SolidColor) {
    const t5 = i.color;
    h2.stroke = "rgba(" + t5.red + "," + t5.green + "," + t5.blue + "," + t5.alpha + ")";
  } else {
    o2 = _a(t4, i.gradient, e);
    const s2 = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity;
    h2.opacity = void 0 === s2 ? 1 : s2, h2.stroke = "url(#" + o2.id + ")";
  }
  const p2 = wa(), u = "mask-border" + l(i) + p2;
  h2.mask = "url(#" + u + ")";
  const f = e.width + 2 * n2, g = e.height + 2 * n2, m = [];
  o2 && o2.node && m.push(o2.node);
  const _ = La(r, i, false), x = Oa(e, r.radius, i.sideSetting), y2 = t4("mask", { id: u, x: -n2, y: -n2, width: f, height: g }, [t4("path", { d: _, fill: "white" }), t4("path", { d: s, fill: "black" }), t4("path", { d: x, fill: "black" })]), w2 = t4("path", h2);
  return m.push(y2, w2), t4("g", m);
};
const Ra = (t4, e, i, s, r) => {
  const n2 = i.fillType, o2 = i.gradient && i.gradient.gradientType;
  return n2 == yt.Gradient && o2 == wt.Angular ? Aa[i.position](t4, e, i, s, r) : Fa[i.position](t4, e, i, s, r);
}, La = (t4, e, i) => {
  const s = e.cornerType, { width: r, height: n2 } = t4.size, a2 = t4.radius, { sideType: h2, thicknessBottom: l2, thicknessTop: c2, thicknessLeft: d2, thicknessRight: p2 } = e.sideSetting, u = i ? c2 / 2 : c2, f = i ? l2 / 2 : l2, g = i ? d2 / 2 : d2, m = i ? p2 / 2 : p2;
  if (Math.max(...a2) > 0 || h2 !== At.Custom || s !== ut.Bevel) return Ba(a2, t4.size, e.sideSetting, s, i);
  {
    const t5 = r + m + g, e2 = n2 + u + f, i2 = new Zt([], "", 0, -u, ft.Straight), s2 = new Zt([], "", r, -u, ft.Straight), a3 = new Zt([], "", r + m, 0, ft.Straight), h3 = new Zt([], "", r + m, n2, ft.Straight), l3 = new Zt([], "", r, n2 + f, ft.Straight), c3 = new Zt([], "", 0, n2 + f, ft.Straight), d3 = new Zt([], "", -g, n2, ft.Straight), p3 = new Zt([], "", -g, 0, ft.Straight), _ = new Je(ai(new G(i2, s2, a3, h3, l3, c3, d3, p3), true, t5, e2, void 0)), x = new o();
    return x.preScale(t5, e2), _.transform(new o(x.inverse)), _.toString();
  }
}, Pa = (t4) => {
  const { sideType: e, thicknessBottom: i, thicknessTop: s, thicknessLeft: r, thicknessRight: n2 } = t4;
  return Math.max(i, s, r, n2);
}, Ba = (t4, e, i, s, r) => {
  const { width: n2, height: o2 } = e, { sideType: a2, thicknessBottom: h2, thicknessTop: l2, thicknessLeft: c2, thicknessRight: d2 } = i, p2 = new Zt([], "", 0, 0, ft.Straight), u = new Zt([], "", 1, 0, ft.Straight), f = new Zt([], "", 1, 1, ft.Straight), g = new Zt([], "", 0, 1, ft.Straight), m = r ? l2 / 2 : l2, _ = r ? h2 / 2 : h2, x = r ? c2 / 2 : c2, y2 = r ? d2 / 2 : d2;
  if (Math.max(...t4) > 0) {
    const i2 = 0 === x ? m : 0 === m ? x : Math.min(x, m), s2 = 0 === x ? _ : 0 === _ ? x : Math.min(x, _), r2 = 0 === y2 ? m : 0 === m ? y2 : Math.min(y2, m), n3 = 0 === y2 ? _ : 0 === _ ? y2 : Math.min(y2, _), o3 = Wa(t4, e);
    p2.radius = o3[0] > 0 ? o3[0] + i2 : 0, u.radius = o3[1] > 0 ? o3[1] + r2 : 0, f.radius = o3[2] > 0 ? o3[2] + n3 : 0, g.radius = o3[3] > 0 ? o3[3] + s2 : 0;
  } else if (s === ut.Round && a2 === At.Custom) {
    const t5 = x > 0 && m > 0 ? Math.min(x, m) : 0, e2 = y2 > 0 && m > 0 ? Math.min(y2, m) : 0, i2 = y2 > 0 && _ > 0 ? Math.min(y2, _) : 0, s2 = x > 0 && _ > 0 ? Math.min(x, _) : 0;
    p2.radius = t5, u.radius = e2, f.radius = i2, g.radius = s2;
  }
  let w2 = n2 + y2 + x, b2 = o2 + m + _;
  const M2 = new Je(ai(new G(p2, u, f, g), true, w2, b2, void 0));
  return M2.translate(-x, -m), M2.toString();
}, Oa = (t4, e, i) => {
  const { sideType: s, thicknessBottom: r, thicknessTop: n2, thicknessLeft: a2, thicknessRight: h2 } = i;
  let l2 = t4.width, c2 = t4.height, d2 = { x: 0, y: 0 }, p2 = { x: l2, y: 0 }, u = { x: l2, y: c2 }, f = { x: 0, y: c2 };
  const g = Wa(e, t4);
  0 === n2 ? (a2 > 0 ? (g[0] > 0 ? d2.x = g[0] : d2.x = 0, d2.y = -2) : (d2.x = -2, d2.y = -2), h2 > 0 ? (g[1] > 0 ? p2.x -= g[1] : p2.x = l2, p2.y = -2) : (p2.x += 2, p2.y = -2)) : (a2 > 0 ? d2.y = g[0] : (g[0] > 0 ? d2.y = g[0] : d2.y = 0, d2.x = -2), h2 > 0 ? p2.y = g[1] : (g[1] > 0 ? p2.y = g[1] : p2.y = 0, p2.x += 2)), 0 === r ? (a2 > 0 ? (g[3] > 0 ? f.x = g[3] : f.x = 0, f.y = c2 + 2) : (f.x = -2, f.y += 2), h2 > 0 ? g[2] > 0 ? u.x -= g[2] : u.x = l2 : (u.x += 2, u.y += 2)) : (a2 > 0 ? (f.x = 0, f.y -= g[3]) : (g[3] > 0 ? f.y -= g[3] : f.y = c2, f.x = -2), h2 > 0 ? (u.x = l2, u.y -= g[2]) : (g[2] > 0 ? u.y -= g[2] : u.y = c2, u.x += 2));
  const m = new Zt([], "", d2.x, d2.y, ft.Straight), _ = new Zt([], "", p2.x, p2.y, ft.Straight), x = new Zt([], "", u.x, u.y, ft.Straight), y2 = new Zt([], "", f.x, f.y, ft.Straight), w2 = Math.max(p2.x, u.x), b2 = Math.max(u.y, f.y), M2 = new Je(ai(new G(m, _, x, y2), true, w2, b2, void 0)), v2 = new o();
  return v2.preScale(w2, b2), M2.transform(new o(v2.inverse)), M2.toString();
}, Na = (t4, e, i) => {
  const { width: s, height: r } = t4.size, n2 = t4.radius, { sideType: o2, thicknessBottom: a2, thicknessTop: h2, thicknessLeft: l2, thicknessRight: c2 } = e.sideSetting, d2 = i ? h2 / 2 : h2, p2 = i ? a2 / 2 : a2, u = i ? l2 / 2 : l2, f = i ? c2 / 2 : c2, g = new Zt([], "", 0, 0, ft.Straight), m = new Zt([], "", 1, 0, ft.Straight), _ = new Zt([], "", 1, 1, ft.Straight), x = new Zt([], "", 0, 1, ft.Straight), y2 = Wa(n2, t4.size);
  if (y2[0] > 0) {
    const t5 = Math.max(u, d2);
    t5 > y2[0] ? g.radius = 0 : g.radius = y2[0] - t5;
  }
  if (y2[1] > 0) {
    const t5 = Math.max(f, d2);
    t5 > y2[1] ? m.radius = 0 : m.radius = y2[1] - t5;
  }
  if (y2[2] > 0) {
    const t5 = Math.max(f, p2);
    t5 > y2[2] ? _.radius = 0 : _.radius = y2[2] - t5;
  }
  if (y2[3] > 0) {
    const t5 = Math.max(u, p2);
    t5 > y2[3] ? x.radius = 0 : x.radius = y2[3] - t5;
  }
  let w2 = f + u > s ? 0 : s - (f + u), b2 = d2 + p2 > r ? 0 : r - (d2 + p2);
  const M2 = new Je(ai(new G(g, m, _, x), true, w2, b2, void 0));
  return M2.translate(u, d2), M2.toString();
}, za = (t4, e, i, s) => {
  var _a2;
  const r = wa(), n2 = "clippath-border" + l(i) + r;
  let o2;
  const a2 = { fill: "none", stroke: "" }, { length: h2, gap: c2 } = i.borderStyle;
  (h2 || c2) && (a2["stroke-dasharray"] = `${h2}, ${c2}`, a2["stroke-dashoffset"] = h2 / 2);
  if (i.fillType == yt.SolidColor) {
    const t5 = i.color;
    a2.stroke = "rgba(" + t5.red + "," + t5.green + "," + t5.blue + "," + t5.alpha + ")";
  } else {
    o2 = _a(t4, i.gradient, e);
    const s2 = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity;
    a2.opacity = void 0 === s2 ? 1 : s2, a2.stroke = "url(#" + o2.id + ")";
  }
  const d2 = [];
  o2 && o2.node && d2.push(o2.node);
  const p2 = Va(t4, e, i, a2, false);
  return d2.push(t4("clipPath", { id: n2 }, t4("path", { d: s, "clip-rule": "evenodd" })), t4("g", { "clip-path": "url(#" + n2 + ")" }, p2)), t4("g", d2);
}, Va = (t4, e, i, s, r) => {
  const { sideType: n2, thicknessTop: o2, thicknessLeft: a2, thicknessBottom: h2, thicknessRight: l2 } = i.sideSetting, { width: c2, height: d2 } = e, p2 = [], u = t4("path", { d: `M 0 0 L ${c2} 0`, ...s, "stroke-width": r ? o2 : 2 * o2 }), f = t4("path", { d: `M ${c2} 0 L ${c2} ${d2}`, ...s, "stroke-width": r ? l2 : 2 * l2 }), g = t4("path", { d: `M 0 0 L 0 ${d2}`, ...s, "stroke-width": r ? a2 : 2 * a2 }), m = t4("path", { d: `M 0 ${d2} L ${c2} ${d2}`, ...s, "stroke-width": r ? h2 : 2 * h2 });
  switch (n2) {
    case At.Top:
      p2.push(u);
      break;
    case At.Left:
      p2.push(g);
      break;
    case At.Right:
      p2.push(f);
      break;
    case At.Bottom:
      p2.push(m);
      break;
    case At.Custom:
      p2.push(u, f, g, m);
      break;
    default:
      return [];
  }
  return p2;
}, Da = (t4, e, i, s, r) => {
  var _a2;
  const n2 = Pa(i.sideSetting), o2 = wa(), a2 = "mask-border" + l(i) + o2;
  let h2;
  const c2 = { fill: "none", stroke: "" }, { length: d2, gap: p2 } = i.borderStyle;
  (d2 || p2) && (c2["stroke-dasharray"] = `${d2}, ${p2}`, c2["stroke-dashoffset"] = d2 / 2);
  const u = e.width + n2, f = e.height + n2;
  if (i.fillType == yt.SolidColor) {
    const t5 = i.color;
    c2.stroke = "rgba(" + t5.red + "," + t5.green + "," + t5.blue + "," + t5.alpha + ")";
  } else {
    h2 = _a(t4, i.gradient, e);
    const s2 = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity;
    c2.opacity = void 0 === s2 ? 1 : s2, c2.stroke = "url(#" + h2.id + ")";
  }
  const g = La(r, i, true), m = t4("mask", { id: a2, x: -n2 / 2, y: -n2 / 2, width: u, height: f }, [t4("path", { d: s, fill: "black" }), t4("path", { d: g, fill: "white" })]), _ = Ha(t4, e, i.sideSetting, c2.stroke), x = t4("g", { mask: "url(#" + a2 + ")" }, [...Va(t4, e, i, c2, true), _]);
  return h2 && h2.node ? t4("g", [h2.node, m, x]) : t4("g", [m, x]);
}, Ha = (t4, e, i, s) => {
  const { width: r, height: n2 } = e, { thicknessBottom: o2, thicknessLeft: a2, thicknessRight: h2, thicknessTop: l2 } = i;
  return t4("path", { d: `M ${-a2} ${-l2} L 0 ${-l2} L 0 0 L ${-a2} 0 Z M ${r} ${-l2} L ${r + h2} ${-l2} L ${r + h2} 0 L ${r} 0 Z M ${r} ${n2} L ${r + h2} ${n2} L ${r + h2} ${n2 + o2} L ${r} ${n2 + o2} Z M ${-a2} ${n2} L 0 ${n2} L 0 ${n2 + o2} L ${-a2} ${n2 + o2} Z`, fill: s, stroke: "none" });
}, Wa = (t4, e) => {
  const { width: i, height: s } = e;
  let r = [...t4];
  const n2 = Math.min(i, s);
  return t4[0] > n2 / 2 && (t4[1] > 0 || t4[3] > 0 ? t4[1] > 0 && t4[3] > 0 ? r[0] = n2 / 2 : t4[1] > 0 ? r[0] = Math.min(t4[0], i / 2, s) : r[0] = Math.min(t4[0], i, s / 2) : t4[0] > n2 ? r[0] = n2 : r[0] = t4[0]), t4[1] > n2 / 2 && (t4[0] > 0 || t4[2] > 0 ? t4[0] > 0 && t4[2] > 0 ? r[1] = n2 / 2 : t4[0] > 0 ? r[1] = Math.min(t4[1], i / 2, s) : r[1] = Math.min(t4[1], i, s / 2) : t4[1] > n2 ? r[1] = n2 : r[1] = t4[1]), t4[2] > n2 / 2 && (t4[3] > 0 || t4[1] > 0 ? t4[3] > 0 && t4[1] > 0 ? r[2] = n2 / 2 : t4[3] > 0 ? r[2] = Math.min(t4[2], i / 2, s) : r[2] = Math.min(t4[2], i, s / 2) : t4[2] > n2 ? r[2] = n2 : r[2] = t4[2]), t4[3] > n2 / 2 && (t4[2] > 0 || t4[0] > 0 ? t4[2] > 0 && t4[0] > 0 ? r[3] = n2 / 2 : t4[2] > 0 ? r[3] = Math.min(t4[3], i / 2, s) : r[3] = Math.min(t4[3], i, s / 2) : t4[3] > n2 ? r[3] = n2 : r[3] = t4[3]), r;
}, $a = {}, Xa = {};
function Ga(t4, e, i, s, r, n2 = true) {
  const o2 = e.length, a2 = [];
  for (let h2 = 0; h2 < o2; h2++) {
    const o3 = e[h2];
    if (!o3.isEnabled) continue;
    const l2 = n2 ? o3.position : ht.Center, c2 = o3.fillType, d2 = o3.gradient && o3.gradient.gradientType;
    c2 == yt.Gradient && d2 == wt.Angular && void a2.push(Xa[l2](t4, i, o3, s, r)) || (c2 == yt.SolidColor || c2 == yt.Gradient) && void a2.push($a[l2](t4, i, o3, s, r)) || yt.Pattern;
  }
  return a2;
}
function Ya(t4, e) {
  return t4 !== At.Normal && !e.haveEdit && [Ft.Rectangle, Ft.Artboard, Ft.Image, Ft.Symbol, Ft.SymbolRef, Ft.SymbolUnion].includes(e.type);
}
Xa[ht.Inner] = function(t4, e, i, s, r) {
  var _a2;
  if (r && Ya(i.sideSetting.sideType, r)) return Ra(t4, e, i, s, r);
  const n2 = wa(), o2 = "clippath-border" + l(i) + n2, a2 = "mask-border" + l(i) + n2, h2 = i.sideSetting.thicknessTop, c2 = e.width, d2 = e.height, p2 = _a(t4, i.gradient, e), u = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity, f = { d: s, stroke: "white", "stroke-width": 2 * h2, "clip-path": "url(#" + o2 + ")", "stroke-linejoin": i.cornerType, opacity: void 0 === u ? 1 : u }, { length: g, gap: m } = i.borderStyle;
  return (g || m) && (f["stroke-dasharray"] = `${g}, ${m}`), t4("g", [t4("mask", { id: a2, width: c2, height: d2 }, [t4("rect", { x: 0, y: 0, width: c2, height: d2, fill: "black" }), t4("clipPath", { id: o2 }, t4("path", { d: s, "clip-rule": "evenodd" })), t4("path", f)]), t4("foreignObject", { x: 0, y: 0, width: c2, height: d2, mask: "url(#" + a2 + ")" }, t4("div", { width: "100%", height: "100%", style: p2.style }))]);
}, Xa[ht.Center] = function(t4, e, i, s, r) {
  var _a2;
  if (r && Ya(i.sideSetting.sideType, r)) return Ra(t4, e, i, s, r);
  const n2 = wa(), o2 = "mask-border" + l(i) + n2, a2 = i.sideSetting.thicknessTop, h2 = _a(t4, i.gradient, e), c2 = -a2 / 2, d2 = -a2 / 2, p2 = e.width + a2, u = e.height + a2, f = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity, g = { d: s, stroke: "white", "stroke-width": a2, "stroke-linejoin": i.cornerType, opacity: void 0 === f ? 1 : f }, { length: m, gap: _ } = i.borderStyle;
  return (m || _) && (g["stroke-dasharray"] = `${m}, ${_}`), t4("g", [t4("mask", { id: o2, maskContentUnits: "userSpaceOnUse", x: c2, y: d2, width: p2, height: u }, [t4("rect", { x: c2, y: d2, width: p2, height: u, fill: "black" }), t4("path", g)]), t4("foreignObject", { width: p2, height: u, x: c2, y: d2, mask: "url(#" + o2 + ")" }, t4("div", { width: "100%", height: "100%", style: h2.style }))]);
}, Xa[ht.Outer] = function(t4, e, i, s, r) {
  var _a2;
  const n2 = i.sideSetting.thicknessTop;
  if (r && Ya(i.sideSetting.sideType, r)) return Ra(t4, e, i, s, r);
  const o2 = _a(t4, i.gradient, e), a2 = e.width + 2 * n2, h2 = e.height + 2 * n2, c2 = -n2, d2 = -n2, p2 = wa(), u = "mask1-border" + l(i) + p2, f = "mask2-border" + l(i) + p2, g = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity, m = { d: s, stroke: "white", "stroke-width": 2 * n2, mask: "url(#" + u + ")", "stroke-linejoin": i.cornerType, opacity: void 0 === g ? 1 : g }, { length: _, gap: x } = i.borderStyle;
  return (_ || x) && (m["stroke-dasharray"] = `${_}, ${x}`), t4("g", [t4("mask", { id: f, x: c2, y: d2, width: a2, height: h2 }, [t4("mask", { id: u, x: -n2, y: -n2, width: a2, height: h2 }, [t4("rect", { x: -n2, y: -n2, width: a2, height: h2, fill: "white" }), t4("path", { d: s, fill: "black" })]), t4("rect", { x: c2, y: d2, width: a2, height: h2, fill: "black" }), t4("path", m)]), t4("foreignObject", { width: a2, height: h2, x: c2, y: d2, mask: "url(#" + f + ")" }, t4("div", { width: "100%", height: "100%", style: o2.style }))]);
}, $a[ht.Inner] = function(t4, e, i, s, r) {
  var _a2;
  if (r && Ya(i.sideSetting.sideType, r)) return Ra(t4, e, i, s, r);
  const n2 = wa(), o2 = "clippath-border" + l(i) + n2;
  let a2;
  const h2 = { d: s, fill: "none", stroke: "", "stroke-width": 2 * i.sideSetting.thicknessTop, "stroke-linejoin": i.cornerType, "clip-path": "url(#" + o2 + ")" };
  r && Math.max(...r.radius) > 0 && (h2["stroke-linejoin"] = "miter");
  const { length: c2, gap: d2 } = i.borderStyle;
  (c2 || d2) && (h2["stroke-dasharray"] = `${c2}, ${d2}`);
  if (i.fillType == yt.SolidColor) {
    const t5 = i.color;
    h2.stroke = "rgba(" + t5.red + "," + t5.green + "," + t5.blue + "," + t5.alpha + ")";
  } else {
    a2 = _a(t4, i.gradient, e);
    const s2 = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity;
    h2.opacity = void 0 === s2 ? 1 : s2, h2.stroke = "url(#" + a2.id + ")";
  }
  const p2 = [];
  return a2 && a2.node && p2.push(a2.node), p2.push(t4("clipPath", { id: o2 }, t4("path", { d: s, "clip-rule": "evenodd" })), t4("path", h2)), t4("g", p2);
}, $a[ht.Center] = function(t4, e, i, s, r) {
  var _a2;
  if (r && Ya(i.sideSetting.sideType, r)) return Ra(t4, e, i, s, r);
  const n2 = i.sideSetting.thicknessTop;
  let o2;
  const a2 = { d: s, fill: "none", stroke: "", "stroke-linejoin": i.cornerType, "stroke-width": n2 };
  r && Math.max(...r.radius) > 0 && (a2["stroke-linejoin"] = "miter");
  const { length: h2, gap: l2 } = i.borderStyle;
  (h2 || l2) && (a2["stroke-dasharray"] = `${h2}, ${l2}`);
  if (i.fillType == yt.SolidColor) {
    const t5 = i.color;
    a2.stroke = "rgba(" + t5.red + "," + t5.green + "," + t5.blue + "," + t5.alpha + ")";
  } else {
    o2 = _a(t4, i.gradient, e);
    const s2 = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity;
    a2.opacity = void 0 === s2 ? 1 : s2, a2.stroke = "url(#" + o2.id + ")";
  }
  const c2 = t4("path", a2);
  return o2 && o2.node ? t4("g", [o2.node, c2]) : c2;
}, $a[ht.Outer] = function(t4, e, i, s, r) {
  var _a2;
  if (r && Ya(i.sideSetting.sideType, r)) return Ra(t4, e, i, s, r);
  const n2 = i.sideSetting.thicknessTop;
  let o2;
  const a2 = { d: s, fill: "none", stroke: "", "stroke-linejoin": i.cornerType, "stroke-width": 2 * n2 };
  r && Math.max(...r.radius) > 0 && (a2["stroke-linejoin"] = "miter");
  const { length: h2, gap: c2 } = i.borderStyle;
  (h2 || c2) && (a2["stroke-dasharray"] = `${h2}, ${c2}`);
  if (i.fillType == yt.SolidColor) {
    const t5 = i.color;
    a2.stroke = "rgba(" + t5.red + "," + t5.green + "," + t5.blue + "," + t5.alpha + ")";
  } else {
    o2 = _a(t4, i.gradient, e);
    const s2 = (_a2 = i.gradient) == null ? void 0 : _a2.gradientOpacity;
    a2.opacity = void 0 === s2 ? 1 : s2, a2.stroke = "url(#" + o2.id + ")";
  }
  const d2 = wa(), p2 = "mask-border" + l(i) + d2;
  a2.mask = "url(#" + p2 + ")";
  const u = e.width + 2 * n2, f = e.height + 2 * n2, g = [];
  o2 && o2.node && g.push(o2.node);
  const m = t4("mask", { id: p2, x: -n2, y: -n2, width: u, height: f }, [t4("rect", { x: -n2, y: -n2, width: u, height: f, fill: "white" }), t4("path", { d: s, fill: "black" })]), _ = t4("path", a2);
  return g.push(m, _), t4("g", g);
};
const Ua = {};
Ua[Et.Outer] = function(t4, e, i, s, r, n2, o2, a2, h2, l2) {
  const { width: c2, height: d2 } = i, p2 = { props_w: [1.4 * c2], props_h: [1.4 * d2], props_x: [-0.2 * c2], props_y: [-0.2 * d2] };
  Ja(e, i, p2);
  const { color: u, offsetX: f, offsetY: g, blurRadius: m, spread: _ } = e, { red: x, green: y2, blue: w2, alpha: b2 } = u, M2 = { id: "spread" + s + r, x: "-20%", y: "-20%", height: "140%", width: "140%", "color-interpolation-filters": "sRGB" }, v2 = Ka(a2);
  M2.width = (Math.max(...p2.props_w) + 2 * ((l2 == null ? void 0 : l2.saturation) || 0) + 2 * v2) / c2 * 100 + "%", M2.height = (Math.max(...p2.props_h) + 2 * ((l2 == null ? void 0 : l2.saturation) || 0) + 2 * v2) / d2 * 100 + "%", M2.x = (Math.min(...p2.props_x) - ((l2 == null ? void 0 : l2.saturation) || 0) - v2) / c2 * 100 + "%", M2.y = (Math.min(...p2.props_y) - ((l2 == null ? void 0 : l2.saturation) || 0) - v2) / d2 * 100 + "%";
  const S2 = _ / 1e4, C2 = +((2 * _ + c2 - _ / 100) / c2 - S2).toFixed(3), T2 = +((2 * _ + d2 - _ / 100) / d2 - S2).toFixed(3), k2 = { type: "matrix", values: `0 0 0 ${x / 255} 0 0 0 0 ${y2 / 255} 0 0 0 0 ${w2 / 255} 0 0 0 0 ${b2} 0`, result: `color${r}` }, I = { in: "SourceAlpha", type: "matrix", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" }, E2 = { dx: f / C2, dy: g / T2 }, F2 = { stdDeviation: "" + m / 2 }, A2 = { mode: "normal", in2: "BackgroundImageFix", result: `effect${r + 1}_dropShadow` }, R2 = [t4("feFlood", { "flood-opacity": "0", result: "BackgroundImageFix" }), t4("feColorMatrix", I), t4("feOffset", E2), t4("feGaussianBlur", F2), t4("feColorMatrix", k2), t4("feBlend", A2)];
  l2 && l2.isEnabled && l2.type === ot.Gaussian && R2.push(t4("feGaussianBlur", { stdDeviation: "" + l2.saturation / 2 }));
  const L2 = t4("filter", M2, R2);
  let P2 = "none";
  if (o2.length) for (let t5 = 0; t5 < o2.length; t5++) {
    const e2 = o2[t5];
    if (0 !== e2.color.alpha && e2.isEnabled) {
      P2 = "black";
      break;
    }
  }
  const B2 = Ga(t4, a2, i, n2, void 0);
  return { filter: L2, p: t4("g", { filter: `url(#spread${s + r})`, style: `transform-origin: left top; transform: translate(${c2 / 2}px, ${d2 / 2}px) scale(${C2 >= 0 ? C2 : 0}, ${T2 >= 0 ? T2 : 0}) translate(${-c2 / 2}px, ${-d2 / 2}px) ` }, [t4("path", { d: n2, fill: P2 }), ...B2]) };
}, Ua[Et.Inner] = function(t4, e, i, s, r, n2, o2, a2, h2) {
  const l2 = `inner-shadow-${s + r}`, { width: c2, height: d2 } = i, { color: p2, offsetX: u, offsetY: f, blurRadius: g, spread: m } = e, _ = { dx: u, dy: f, result: "offsetBlur" }, x = { stdDeviation: "" + g / 2, in: "spread", in2: "offsetBlur", result: "blur" }, y2 = { operator: "out", in: "SourceGraphic", in2: "blur", result: "inverse" }, { red: w2, green: b2, blue: M2, alpha: v2 } = p2, S2 = { "flood-color": `rgba(${w2}, ${b2}, ${M2}, ${v2})`, result: "color" }, C2 = { operator: "in", in: "color", in2: "inverse", result: "shadow" }, T2 = { operator: "over", in: "shadow", in2: "SourceGraphic" }, k2 = { operator: "erode", radius: `${m}`, result: "spread" }, I = { id: l2, x: 0.2 * -c2, y: 0.2 * -d2, height: 1.4 * d2, width: 1.4 * c2, "color-interpolation-filters": "sRGB", filterUnits: "userSpaceOnUse" };
  if (h2 === Ft.Line) {
    const t5 = 9 * Ka(a2);
    I.x = -0.2 * c2 - t5, I.y = -0.2 * d2 - t5, I.width = 1.4 * c2 + 2 * t5, I.height = 1.4 * d2 + 2 * t5;
  }
  const E2 = [t4("feOffset", _), t4("feMorphology", k2), t4("feGaussianBlur", x), t4("feComposite", y2), t4("feFlood", S2), t4("feComposite", C2), t4("feComposite", T2)];
  return t4("filter", I, E2);
};
const Ja = (t4, e, i) => {
  const { offsetX: s, offsetY: r, blurRadius: n2, spread: o2 } = t4, { width: a2, height: h2 } = e, l2 = a2 + Math.abs(s) + 2 * n2 + Math.abs(2 * o2) + 0.4 * a2, c2 = h2 + Math.abs(r) + 2 * n2 + Math.abs(2 * o2) + 0.4 * h2, d2 = Math.min(0, s) - n2 - Math.min(0, o2) - 0.2 * a2, p2 = Math.min(0, r) - n2 - Math.min(0, o2) - 0.2 * h2;
  i.props_h.push(c2), i.props_w.push(l2), i.props_x.push(d2), i.props_y.push(p2);
}, Ka = (t4) => {
  if (!t4.length) return 0;
  let e = 0;
  for (let i = 0; i < t4.length; i++) {
    const s = t4[i];
    if (!s.isEnabled || s.position === ht.Inner) continue;
    const { thicknessBottom: r, thicknessTop: n2, thicknessLeft: o2, thicknessRight: a2 } = s.sideSetting, h2 = Math.max(r, n2, o2, a2);
    h2 > e && (e = s.position === ht.Center ? h2 / 2 : h2);
  }
  return e;
}, qa = {};
qa[ot.Gaussian] = (t4, e, i, s) => {
  const r = { id: i, x: "-20%", y: "-20%", height: "140%", width: "140%", "color-interpolation-filters": "sRGB" }, n2 = { "flood-opacity": "0", result: "BackgroundImageFix" }, o2 = e.saturation / s.width * 100, a2 = e.saturation / s.height * 100;
  r.x = -(o2 + 20) + "%", r.y = -(a2 + 20) + "%", r.width = 2 * o2 + 140 + "%", r.height = 2 * a2 + 140 + "%";
  const h2 = { stdDeviation: e.saturation / 2 };
  return t4("defs", {}, [t4("filter", r, [t4("feFlood", n2), t4("feBlend", { mode: "normal", in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }), t4("feGaussianBlur", h2)])]);
}, qa[ot.Background] = (t4, e, i, s, r, n2, o2) => {
  const a2 = Qa(r), h2 = Qa(n2);
  if (!a2 && !h2) return;
  const c2 = "mask-blur" + l(e) + wa();
  let d2 = { width: "100%", height: "100%" }, p2 = [];
  const u = { x: 0, y: 0, width: s.width, height: s.height }, f = [t4("path", { d: o2, fill: "white" })];
  if (h2) for (let e2 = 0; e2 < n2.length; e2++) {
    const i2 = n2[e2];
    let s2 = i2.sideSetting.thicknessTop;
    if (i2.position === ht.Inner) continue;
    i2.position === ht.Outer && (s2 *= 2);
    const r2 = { d: o2, fill: "white", stroke: "white", "stroke-width": s2 };
    i2.borderStyle.gap && (r2["stroke-dasharray"] = 10), f.push(t4("path", r2));
  }
  const g = t4("mask", { id: c2 }, f);
  p2.push(g), d2["backdrop-filter"] = `blur(${e.saturation / 2}px)`, d2.mask = "url(#" + c2 + ")";
  const m = t4("div", { style: d2 }), _ = t4("foreignObject", u, m);
  return p2.push(_), t4("g", p2);
};
const Qa = (t4) => {
  for (let e = 0; e < t4.length; e++) {
    const i = t4[e];
    if (i.color.alpha > 0 && i.isEnabled) return true;
  }
  return false;
};
const mh = {};
mh[Ct.FilledArrow] = function(t4, e, i, s) {
  const r = i.color;
  return t4("marker", { id: "arrow-" + s, viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 10, markerHeight: 10, orient: "auto-start-reverse" }, [t4("path", { d: "M 2 2 L 8 5 L 2 8 Z", stroke: "none", fill: i.fillType === yt.Gradient ? "white" : "rgb(" + r.red + "," + r.green + "," + r.blue + ")" })]);
}, mh[Ct.OpenArrow] = function(t4, e, i, s) {
  const r = i.color;
  return t4("marker", { id: "arrow-" + s, viewBox: "0 0 10 10", refX: 7.5, refY: 5, markerWidth: 10, markerHeight: 10, orient: "auto-start-reverse" }, [t4("polyline", { points: "4,2 8,5 4,8", stroke: i.fillType === yt.Gradient ? "white" : "rgb(" + r.red + "," + r.green + "," + r.blue + ")", "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" })]);
}, mh[Ct.FilledCircle] = function(t4, e, i, s) {
  const r = i.color, n2 = i.sideSetting.thicknessTop, o2 = { id: "arrow-" + s, viewBox: `0 0 ${6 * n2} ${6 * n2}`, refX: "5", refY: "5", markerWidth: 6 * n2, markerHeight: 6 * n2, orient: "auto-start-reverse" };
  n2 <= 1 && (delete o2.viewBox, o2.markerWidth = 12, o2.markerHeight = 12);
  return t4("marker", o2, [t4("circle", { cx: 5, cy: 5, r: 3, stroke: "none", fill: i.fillType === yt.Gradient ? "white" : "rgb(" + r.red + "," + r.green + "," + r.blue + ")" })]);
}, mh[Ct.FilledSquare] = function(t4, e, i, s) {
  const r = i.color;
  return t4("marker", { id: "arrow-" + s, viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 10, markerHeight: 10, orient: "auto-start-reverse" }, [t4("path", { d: "M5 2 L8 5 L5 8 L2 5 z", stroke: "none", fill: i.fillType === yt.Gradient ? "white" : "rgb(" + r.red + "," + r.green + "," + r.blue + ")" })]);
}, mh[Ct.Square] = function(t4, e, i, s) {
  const r = i.color, n2 = i.sideSetting.thicknessTop, o2 = { id: "arrow-" + s, viewBox: `0 0 ${6 * n2} ${6 * n2}`, refX: "3", refY: "3", markerWidth: n2, markerHeight: n2, orient: "auto-start-reverse" };
  n2 <= 1 && (o2.markerWidth = 2, o2.markerHeight = 2, o2.viewBox = "0 0 12 12");
  return t4("marker", o2, [t4("rect", { width: 6, height: 6, stroke: "none", fill: i.fillType === yt.Gradient ? "white" : "rgb(" + r.red + "," + r.green + "," + r.blue + ")" })]);
}, mh[Ct.Round] = function(t4, e, i, s) {
  const r = i.color, n2 = i.sideSetting.thicknessTop, o2 = { id: "arrow-" + s, viewBox: `0 0 ${6 * n2} ${6 * n2}`, refX: "5", refY: "5", markerWidth: n2, markerHeight: n2, orient: "auto-start-reverse" };
  n2 <= 1 && (o2.markerWidth = 2, o2.markerHeight = 2, o2.viewBox = "0 0 12 12");
  return t4("marker", o2, [t4("circle", { cx: 5, cy: 5, r: 3, stroke: "none", fill: i.fillType === yt.Gradient ? "white" : "rgb(" + r.red + "," + r.green + "," + r.blue + ")" })]);
};
const Pc = new Int32Array(1);
new Uint8Array(Pc.buffer);
new Uint32Array(Pc.buffer);
var lp, cp;
!function(t4) {
  t4[t4.None = 0] = "None", t4[t4.TextInsert = 1] = "TextInsert", t4[t4.TextDelete = 2] = "TextDelete";
}(lp || (lp = {})), function(t4) {
  t4[t4.None = 0] = "None", t4[t4.Array = 1] = "Array", t4[t4.Idset = 2] = "Idset", t4[t4.CrdtArr = 3] = "CrdtArr", t4[t4.CrdtTree = 4] = "CrdtTree";
}(cp || (cp = {}));
const vp = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
class Sp {
  constructor(t4, e = vp) {
    __publicField(this, "radix");
    __publicField(this, "radixChars");
    __publicField(this, "radixCharsMap");
    if (t4 < 2 || t4 > e.length) throw new Error("radix的取值必须在2-RadixChars.length之间");
    this.radix = t4, this.radixChars = e, this.radixCharsMap = /* @__PURE__ */ new Map();
    for (let t5 = 0; t5 < e.length; t5++) this.radixCharsMap.set(e[t5], t5);
  }
  from(t4) {
    let e = BigInt(t4);
    if (0n === e) return this.radixChars[0];
    if (e < 0n) return "-" + this.from(-e);
    let i = "";
    for (; e > 0n; ) i = this.radixChars[Number(e % BigInt(this.radix))] + i, e /= BigInt(this.radix);
    return i;
  }
  to(t4) {
    if ("-" === t4[0]) return -this.to(t4.slice(1));
    let e = BigInt(0);
    for (let i = 0; i < t4.length; i++) e = e * BigInt(this.radix) + BigInt(this.radixCharsMap.get(t4[i]) || 0);
    return e;
  }
}
var Cp, Tp;
!function(t4) {
  const e = vp, i = new Sp(e.length, e);
  t4.MAX_SAFE_INTEGER = "HXmza2ckz6v";
  const s = {};
  for (let t5 = 0; t5 < e.length; ++t5) s[e[t5]] = t5;
  function r(t5, e2) {
    if (0 === t5.length || 1 === t5.length && "0" === t5[0]) {
      if (0 === e2.length) return 0;
      if (1 === e2.length && "0" === e2[0]) return 0;
    }
    if (t5.length === e2.length) for (let i2 = 0; i2 < t5.length; ++i2) {
      const r2 = s[t5[i2]] - s[e2[i2]];
      if (0 !== r2) return r2;
    }
    return t5.length - e2.length;
  }
  t4.comp = function(t5, e2) {
    return "-" === t5[0] ? "-" === e2[0] ? -r(t5.slice(1), e2.slice(1)) : -1 : "-" === e2[0] ? 1 : r(t5, e2);
  }, t4.minus = function(t5, e2) {
    return i.from(i.to(t5) - BigInt(e2));
  }, t4.toString = function(t5) {
    if (0 === t5) return "0";
    const i2 = e.length, s2 = t5 < 0;
    s2 && (t5 = -t5);
    const r2 = [];
    for (; t5 > 0; ) {
      const s3 = t5 % i2;
      r2.push(e[s3]), t5 = Math.floor(t5 / i2);
    }
    return s2 && r2.push("-"), r2.reverse().join("");
  };
}(Cp || (Cp = {})), function(t4) {
  t4[t4.None = 0] = "None", t4[t4.Insert = 1] = "Insert", t4[t4.Remove = 2] = "Remove", t4[t4.Attr = 3] = "Attr", t4[t4.Selection = 4] = "Selection";
}(Tp || (Tp = {}));
var Cg, Tg;
!function(t4) {
  t4.RectLeft = "rect-left", t4.RectRight = "rect-right", t4.RectBottom = "rect-bottom", t4.RectTop = "rect-top", t4.RectLT = "rect-left-top", t4.RectRT = "rect-right-top", t4.RectRB = "rect-right-bottom", t4.RectLB = "rect-left-bottom", t4.RectLTR = "rect-left-top-rotate", t4.RectRTR = "rect-right-top-rotate", t4.RectRBR = "rect-right-bottom-rotate", t4.RectLBR = "rect-left-bottom-rotate", t4.LineStart = "line-start", t4.LineEnd = "line-end", t4.LineStartR = "line-start-rotate", t4.LineEndR = "line-end-rotate", t4.Text = "text";
}(Cg || (Cg = {})), function(t4) {
  t4.Pending = "pending", t4.Fulfilled = "fulfilled", t4.Exception = "exception";
}(Tg || (Tg = {}));
var em;
!function(t4) {
  t4[t4.normal = 0] = "normal", t4[t4.requestdata = 1] = "requestdata";
}(em || (em = {}));
const system$1 = {
  incorrect_input: "输入有误！",
  "illegal_input": "输入不合法！",
  select: "请选择！",
  space: "...",
  empty: "暂无数据",
  paste: "粘贴",
  "paste_here": "粘贴在这里",
  "only_text": "只粘贴文本",
  copy: "复制",
  copyAs: "复制/粘贴为",
  cut: "剪切",
  replace: "替换",
  failed: "操作失败",
  "null_file_name": "文件名不能为空",
  "replace_failed": "替换失败，请使用粘贴功能",
  "select_layer": "图层选择",
  "bring_forward": "上移一层",
  "send_backward": "下移一层",
  "bring_to_top": "置于顶层",
  "send_to_bottom": "置于底层",
  "visible": "显示/隐藏",
  "hidden": "隐藏",
  "Lock": "锁定/解锁",
  "select_all": "选择全部",
  "fit_canvas": "适应画布",
  "show_many_cursor": "显示多人光标",
  "show_comment": "显示评论",
  "show_cutout": "显示切图",
  "show_ruler": "显示标尺",
  "show_pixel_network": "显示像素网络",
  "hide_operation_interface": "隐藏操作界面",
  "creating_groups": "创建编组",
  "create_container": "创建容器",
  "un_group": "取消编组",
  "create_component": "创建组件",
  "unbind_instance": "解绑实例",
  "reset_instance_roperties": "重置实例属性",
  "edit_component": "编辑组件",
  "wx_login": "微信扫码登录",
  "login_read": "扫码表示已阅读并同意",
  "read_TOS": "服务协议",
  "read_Privacy": "隐私协议",
  "product_description": "一款支持原型设计、文档演示以及审批管理的高效率RPD书写工具。",
  "login_footer": "©2024 珠海市旷才科技有限公司",
  "placeholder": "搜索文件",
  "about": "关于",
  "help_manual": "帮助手册",
  "about_software": "关于软件",
  "personal_center": "个人中心",
  "login_out": "退出登录",
  "new_file": "新文件",
  "page1": "页面 1",
  "dissolution": "取消容器",
  "content_includes": "文本包含",
  "title_includes": "标题包含",
  "license_key": "粤ICP备2023042416号",
  "phonetips": "移动端暂不支持登录，请在电脑端进行登录！",
  "btn_login": "登录",
  "artboart_title_visible": "显示容器标题",
  sensitive_reminder: "含有敏感信息，请重新输入。",
  sensitive_reminder2: "含有敏感信息，无法分享。",
  sensitive_reminder3: "含有敏感信息，无法访问。",
  pixel: "对齐像素",
  grid: "像素网格",
  rule: "显示标尺",
  uploadMediaFail: "图片资源上传失败",
  internet: "进入官网"
};
const home$1 = {
  open_local_file: "打开文件",
  open_remote_file: "打开远程文件",
  new_file: "新建文档",
  object_selector: "选择对象",
  scale: "等比缩放",
  automatically_open: "自动打开",
  search_file: "搜索文件",
  about: "关于",
  help_manual: "帮助手册",
  about_software: "关于软件",
  New_file: "新建文件",
  recently_opened: "最近打开",
  star_file: "标星文件",
  file_shared: "我的文件",
  shared_file_received: "收到的共享文件",
  file_shared_with_me: "共享给我的文件",
  recycling_station: "回收站",
  file_name: "文件名称",
  modification_time: "最近访问",
  Creation_time: "创建时间",
  delete_file_time: "删除时间",
  size: "大小",
  operation: "操作",
  filelocation: "文件位置",
  creator: "创建者",
  deleter: "删除人",
  star_marking: "标星",
  share: "分享",
  delete: "删除",
  delete_ok_tips: "文件已移至回收站",
  delete_no_tips: "移除失败",
  test: "测试",
  file_star_marking: "文件已被标星，可在标星列表中查看！",
  rect: "矩形",
  picture: "图片",
  comment: "评论",
  groups: "编组",
  ungroup: "解组",
  search_layer: "搜索图层",
  prompt: "创建者变更了文档权限，文档即将刷新",
  visit: "创建者取消了文件的访问权限，文档即将退出",
  delete_file: "创建者删除了该文档，文档即将退出",
  star: "标星",
  de_star: "取消标星",
  star_ok: "已设为星标文档",
  star_cancel: "已取消星标文档",
  de_access_record: "移除记录",
  access_record_ok: "移除成功",
  access_record_no: "移除失败",
  exit_share: "退出共享",
  exit_share_success: "退出成功",
  exit_share_fail: "退出失败",
  restore: "还原",
  completely_delete: "彻底删除",
  delete_tips: "删除执行后，文件将无法恢复找回，确认要删除吗？",
  delete_ok: "确定删除",
  cancel: "取消",
  failed_list_tips: "文件列表获取失败",
  restore_ok: "还原成功",
  restore_no: "还原失败",
  delete_file_ok: "删除成功",
  delete_file_no: "删除失败",
  other_tips: "请确保网络连接正常",
  addComment: "添加评论",
  rename: "重命名",
  rename_ok: "确定",
  page_sort: "按页面排序",
  login_failed: "登录失败",
  login_refresh: "点击刷新二维码",
  invitation_code_tips: "请输入试用邀请码",
  table_empty_tips: "当前列表没有文件",
  "align_left": "左对齐",
  "align_h_c": "左右居中对齐",
  "align_right": "右对齐",
  "align_top": "顶对齐",
  "align_v_c": "上下居中对齐",
  "align_bottom": "底对齐",
  "distribute_h": "左右等距分布",
  "distribute_v": "上下等距分布",
  people_are_visiting: "正在访问的人:",
  permissions: "权限:",
  contact: "连接线",
  full: "进入全屏",
  exit_full: "退出全屏",
  not_preview_frame: "没有可演示的容器"
};
const search$1 = {
  search_results: "未搜索到相关组件",
  search_history: "没有搜索记录",
  search_history_title: "历史记录",
  search_history_clear: "清除",
  result_count: "共xx条结果"
};
const navi$1 = {
  shape: "图层",
  comps: "组件",
  resource: "资源库",
  page: "页面",
  add_page: "添加新页面",
  copy: "副本",
  development: "功能开发中…",
  overname: "文件名最大长度50字符"
};
const frame$1 = {
  custom: "自定义",
  phone: "手机",
  pad: "平板",
  deskdop: "桌面",
  presentation: "预览",
  watch: "手表",
  paper: "纸张",
  social_media: "社交媒体",
  slide: "幻灯片"
};
const fileMenu$1 = {
  create_new: "新建文件",
  create_copy: "创建文件副本",
  save: "保存",
  rename: "重命名",
  view: "视图",
  guide: "快捷键指南"
};
const pageMenu$1 = {
  copy_link: "复制页面链接",
  duplicate: "创建页面副本",
  rename: "重命名",
  delete: "删除页面"
};
const attr$1 = {
  design: "设计",
  prototype: "原型",
  inspect: "标注",
  constraints: "约束",
  groupings: "相对位置及大小",
  border: "边框",
  opacity: "不透明度",
  fill: "填充",
  text: "文本",
  table_text: "表格文本",
  "follow_container_scaling": "跟随缩放",
  "advanced_stroke": "边框设置",
  position: "位置",
  "corner_smoothing": "平滑圆角",
  vertical: "垂直：",
  horizontal: "水平：",
  fixedWidth: "固定宽度",
  fixedHeight: "固定高度",
  fixedLeft: "左部固定",
  fixedRight: "右部固定",
  withContainer: "跟随缩放",
  fixedTop: "顶部固定",
  fixedBottom: "底部固定",
  thickness: "厚度",
  borderStyle: "样式",
  dash: "虚线",
  solid: "实线",
  startMarkerType: "起点样式",
  endMarkerType: "终点样式",
  background: "画布背景",
  color: "颜色",
  alpha: "不透明度",
  "fixed_left": "靠左固定",
  "fixed_right": "靠右固定",
  "fixed_left_right": "左右固定",
  "center": "居中",
  "follow_container": "跟随缩放",
  "fixed_bottom": "底部固定",
  "fixed_top": "顶部固定",
  "fixed_top_bottom": "上下固定",
  "adapt": "适应容器大小",
  "mixed": "多值",
  "mixed_lang": "存在对象设置不同，可点击 + 号统一设置",
  "mixed_cell_lang": "存在单元格设置不同，点击 + 进行统一设置",
  text_advanced_settings: "文本高级设置",
  word_space: "字间距",
  row_height: "行高",
  paragraph_space: "段落间距",
  id_style: "编号样式",
  letter_case: "字母大小写",
  text_style: "文本样式",
  auto: "自动",
  search_for_fonts: "搜索字体…",
  bold: "加粗",
  tilt: "倾斜",
  underline: "下划线",
  deleteline: "删除线",
  align_left: "左对齐",
  align_center: "居中对齐",
  align_right: "右对齐",
  align_the_sides: "两边对齐",
  align_top: "顶对齐",
  align_middle: "居中对齐",
  align_bottom: "底对齐",
  none_list: "无",
  unordered_list: "无序列表",
  ordered_list: "有序列表",
  as_typed: "无",
  uppercase: "全大写",
  lowercase: "全小写",
  titlecase: "首字母大写",
  autowidth: "单行模式",
  autoheight: "自动高度",
  fixedsize: "固定宽高",
  more_value: "多值",
  used_font: "已使用字体",
  no_font_is_currently_in_use: "当前无已使用字体",
  chinese_font: "中文字体",
  english_font: "英文字体",
  find_the_fonts: "查找不到相关字体",
  font_is_not: "本地不存在该字体，使用默认字体效果替代显示",
  font_color: "字体颜色",
  highlight_color: "高亮颜色",
  multiple_colors: "存在多种颜色值，点击+可统一设置",
  unfold: "展开",
  packup: "收起",
  "flip_v": "垂直翻转",
  "flip_h": "水平翻转",
  full_border: "全边框",
  outer_border: "外边框",
  inner_border: "内边框",
  exit_path_edit: "结束编辑",
  close_path: "闭合路径",
  de_close_path: "打开路径",
  right_angle: "直角",
  completely_symmetrical: "完全对称",
  angular_symmetry: "不对称",
  asymmetric: "角度对称",
  path: "路径",
  corner: "边角",
  unilateral: "单边",
  independentCorners: "展开圆角",
  constrainProportions: "锁定比例",
  frameSize: "容器尺寸"
};
const login$1 = {
  login_failure: "登录失效，请重新登录",
  welcome: "欢迎登录使用",
  name: "墨师设计",
  describe: "在线协作专业产品设计软件",
  miniprogram: "微信小程序",
  scan_code: "微信扫一扫"
};
const comment$1 = {
  reply: "回复",
  delete: "删除",
  settled: "解决",
  edit_content: "编辑内容",
  quick_reply: "快速回复",
  last: "上一条",
  next: "下一条",
  sort: "按页面排序",
  show_about_me: "仅显示关于我的",
  show_resolved_comments: "显示已解决评论",
  comment_area: "评论区",
  input_comments: "输入评论",
  reply_comment: "回复评论",
  check: "查看",
  a_few_reply: "条回复",
  month: "月",
  day: "日",
  no_comment: "当前无评论",
  comments_hide: "评论已设置隐藏",
  show_comments: "显示评论",
  input_no_perm: "无评论权限"
};
const clipboard$1 = {
  "invalid_data": "该内容无法解析",
  "not_supported1": "当前浏览器不支持，请使用Ctrl C复制",
  "not_supported2": "当前浏览器不支持，请使用Ctrl X剪切",
  "copyAsPNGSuccess": "复制成功",
  "copyAsPNGFailed": "复制失败",
  "copyAsPNG": "复制PNG图片"
};
const opacity$1 = {};
const message$1 = {
  doc_notopen: "网络异常，文档无法打开，请检查网络后重试。",
  list_for_failure: "网络异常，文件列表获取失败，请检查网络后重试。",
  retry: "重试",
  leave: "您的更改尚未保存，确定要离开吗？",
  network_error: "网络异常，请勿刷新页面或关闭文档，以免内容丢失，文档尝试保存中…",
  network_anomaly: "网络异常",
  link_success: "网络连接成功",
  autosave: "文档自动保存成功",
  cancel: "取消",
  exit_document: "退出文档",
  back_home: "返回首页",
  unuploaded_msg: "文档存在未上传资源，退出会造成内容丢失，是否退出?"
};
const bool$1 = {
  union: "联集",
  subtract: "减去顶层",
  intersection: "交集",
  difference: "差集",
  cohere: "路径拼合"
};
const date$1 = {
  just_now: "刚刚",
  s: "秒前"
};
const preview$1 = {
  actual_size: "实际尺寸",
  previous_page: "上一页",
  next_page: "下一页",
  first_page: "第一页",
  preview: "预览",
  open: "在设计模式中打开",
  fill_screen: "充满屏幕",
  fit_width: "适应宽度",
  fit_screen: "适应屏幕"
};
attr$1[ht.Inner] = "内部";
attr$1[ht.Center] = "居中";
attr$1[ht.Outer] = "外部";
opacity$1[nt.Normal] = "正常";
opacity$1[nt.Darken] = "变暗";
opacity$1[nt.Multiply] = "正片叠底";
opacity$1[nt.ColorBurn] = "颜色加深";
opacity$1[nt.Lighten] = "变亮";
opacity$1[nt.Screen] = "滤色";
opacity$1[nt.ColorDodge] = "颜色减淡";
opacity$1[nt.Overlay] = "叠加";
opacity$1[nt.SoftLight] = "柔光";
opacity$1[nt.HardLight] = "强光";
opacity$1[nt.Difference] = "差值";
opacity$1[nt.Exclusion] = "排除";
opacity$1[nt.Hue] = "色相";
opacity$1[nt.Saturation] = "饱和度";
opacity$1[nt.Color] = "颜色";
opacity$1[nt.Luminosity] = "明度";
opacity$1[nt.PlusDarker] = "加暗";
opacity$1[nt.PlusLighter] = "提亮";
const shape$1 = {
  group: "编组",
  page: "页面",
  line: "直线",
  oval: "圆形",
  rect: "矩形",
  path: "路径",
  artboard: "容器",
  arrow: "箭头",
  text: "文字",
  image: "图片",
  input_text: "输入文本",
  table: "表格",
  contact: "连接线",
  cutout: "切图",
  shape_tool: "形状工具",
  symbol: "组件",
  curve: "曲线工具",
  clip: "裁剪工具",
  default: "默认",
  pen: "钢笔",
  pencil: "铅笔",
  polygon: "多边形",
  star: "星形"
};
shape$1[Ft.Rectangle] = "矩形";
const color$1 = {
  solid: "纯色",
  linear: "线性渐变",
  radial: "径向渐变",
  angular: "旋转渐变",
  esc: "按ESC退出",
  recently: "最近使用",
  documentc: "文档使用",
  times: "使用xx次",
  rotate: "旋转90度",
  reverse: "翻转渐变"
};
color$1[wt.Linear] = "线性渐变";
color$1[wt.Radial] = "径向渐变";
color$1[wt.Angular] = "旋转渐变";
const share$1 = {
  need_to_apply_for_confirmation: "需申请确认",
  editable: "编辑",
  readOnly: "只读",
  remove: "移除",
  anyone_can_read_it: "任何人均可阅读",
  anyone_can_edit_it: "任何人均可编辑",
  anyone_can_comment: "任何人均可评论",
  shareable: "已关闭分享",
  no_authority: "无权限",
  copy_success: "复制成功",
  copy_failure: "复制失败",
  file_sharing: "文件分享",
  share_switch: "分享开关",
  file_name: "文件名",
  page_order_adjustment: "页面顺序调整",
  permission_setting: "权限设置",
  copy_link: "复制链接",
  people_who_have_joined_the_share: "已加入分享的人",
  share_limit: "分享限制人数",
  founder: "创建者",
  document_permission: "文档权限",
  reviewable: "评论",
  no_document: "没有该文档"
};
const permission$1 = {
  no_authority_to_rename: "没有对当前文档进行重命名的权限"
};
const apply$1 = {
  file_access_request: "文件访问申请",
  applicant: "申请人",
  access_file: "访问文件",
  authority: "权限",
  remarks: "备注",
  agree: "同意",
  refuse: "拒绝",
  maximum_share: "该文件已达最大分享人数，请联系创建者处理",
  request_access: "您已多次申请访问权限，请等待创建者处理",
  no_file_access_permission: "无文件访问权限",
  file_attribution: "文件归属",
  apply_for_permission: "申请权限",
  read_only: "仅阅读",
  apply_for_edit: "申请编辑",
  please_remarks: "请输入申请备注",
  file_deleted: "文件已被删除，或创建者已关闭分享",
  authorization_failure: "授权失败",
  notification_message: "通知消息",
  application_documents: "申请文件",
  have_agreed: "已同意",
  rejected: "已拒绝",
  no_message_received: "未收到任何消息",
  link_not: "链接不存在",
  not_passed: "申请未通过，请修改信息或联系创建者后重新申请",
  project_apply: "加入项目申请",
  project: "项目",
  team: "团队",
  team_apply: "加入团队申请",
  file: "文件",
  apply_team: "申请加入团队：",
  apply_project: "申请加入项目："
};
const percenter$1 = {
  return_home: "返回首页",
  personal_center: "个人中心",
  essential_information: "基本信息",
  head_portrait: "头像",
  avatar_restriction: "上传5M以内PNG或JPG格式图片",
  modify_profile_picture: "更换",
  username: "用户名",
  edit_user_name: "编辑",
  affirm: "确认",
  cancel: "取消",
  userID: "用户ID",
  successtips: "更改成功",
  errortips1: "更改失败",
  errortips: "图片大小或格式不符",
  usernametips_null: "用户名不能为空",
  usernametips_length: "用户名不能超过20个字符",
  nicknametips_length: "昵称不能为空且不超过20个字符",
  error_occurred: "发生错误"
};
const homerightmenu$1 = {
  open: "打开",
  newtabopen: "在新标签页打开",
  share: "分享",
  exit_share: "退出共享",
  target_star: "标星",
  unstar: "取消标星",
  rename: "重命名",
  copyfile: "创建文件副本",
  removed_record: "从打开记录移除",
  deletefile: "删除文件",
  restore: "还原",
  completely_delete: "彻底删除",
  copyfile_ok: "复制成功",
  copyfile_no: "复制失败",
  "unable_lower": "无法再向下移动",
  "unable_upper": "无法再向上移动"
};
const table$1 = {
  table: "表格",
  table_style: "表格样式",
  del_column: "删除行列",
  del_select_row: "删除选中行",
  del_select_col: "删除选中列",
  del_table: "删除整个表格",
  split_cell: "拆分单元格",
  split_towrow: "拆分为两行",
  split_towcol: "拆分为两列",
  insert_column: "插入行列",
  merge_cell: "合并单元格",
  top_insert: "上方插入行",
  bottom_insert: "下方插入行",
  left_insert: "左侧插入列",
  right_insert: "右侧插入列",
  confirm: "确定",
  row: "行",
  col: "列",
  insert_table: "插入表格",
  row_num: "行数",
  col_num: "列数",
  column_table: "指定行列表格"
};
const Createteam$1 = {
  add_team: "创建团队",
  add_project: "新建项目",
  team_name: "团队名称",
  project_name: "项目名称",
  team_name_tips: "输入团队名称",
  project_name_tips: "输入项目名称",
  team_description: "团队描述",
  project_description: "项目描述",
  team_description_tips: "输入团队描述",
  project_description_tips: "输入项目描述",
  team_avatar: "团队头像",
  required: "（必填）",
  optional: "（选填）",
  avatar_restriction: "选择2M以内的JPG、PNG格式图片作为头像显示",
  movetip: "移动文件位置",
  move: "移动",
  description: "你还没有填写团队描述，快去填写吧。",
  sharetip: "收到的共享项目",
  fixed: "固定项目",
  cancelFixed: "取消固定",
  projectdeltitle: "删除项目",
  projectexittitle: "退出项目",
  projectexitcontext: "退出项目后，无法再访问项目中的文件，或使用项目中的资源。",
  projectdelcontext: "删除项目后，将删除项目及项目中所有文件、资料。",
  ok_exit: "仍然退出",
  ok_delete: "仍然删除",
  membertip: "邀请项目成员",
  projectsetting: "项目访问设置",
  membersetting: "成员权限设置",
  projectfilenull: "当前项目没有文件",
  projectfilesearchtips: "没有匹配的文件",
  projectOptionsA: "公开: 团队全部成员可访问",
  projectOptionsB: "非公开: 仅通过链接申请访问",
  projectPermsA: "仅阅读",
  projectPermsB: "可评论",
  projectPermsC: "可编辑",
  projecttype: "项目类型",
  jurisdiction: "权限",
  jointips: "点击链接或扫描二维码申请加入",
  invitation_switch: "邀请链接：",
  copylink: "复制链接",
  confirm: "确定",
  cancel: "取消",
  joinprojecttipsA: "申请加入项目",
  joinprojecttipsB: "加入项目后，可访问该项目中的所有文件、资源",
  joinprojecttipsC: "已发送申请，",
  joinprojecttipsC1: "即将进入应用首页，待审批通过后，可查看该项目内容",
  joinprojecttipsD: "项目邀请已关闭，如需加入项目，请联系项目管理员处理。",
  joinprojecttipsE: "返回首页",
  joinprojecttipsF: "申请加入",
  all: "全部",
  creator: "创建者",
  manager: "管理员",
  editable: "可编辑",
  reviewed: "可评论",
  Readonly: "仅阅读",
  transferor: "转让创建者",
  moveoutproject: "移出项目组",
  membersed: "已加入项目成员",
  username: "用户名",
  pertipsA: "项目权限: 公开，所有团队成员均可访问",
  pertipsB: "项目权限: 非公开，仅通过链接邀请成员可访问",
  Transfertips: "转让创建者权限后，您将不再拥有该项目，后续作为管理员留在项目中。",
  confirmTransfer: "确定转让",
  project: "项目组",
  team: "团队",
  welcome: "欢迎加入",
  rejectprompt1: "拒绝了",
  rejectprompt2: "如有疑问，请联系团队管理员。",
  rejectprompt3: "如有疑问，请联系项目管理员。",
  shareprojecttips: "项目中所有成员均可访问"
};
const inviteMember$1 = {
  title: "邀请同事加入团队",
  permission_set: "权限设置",
  permission_tips: "发送链接或二维码给同事申请加入",
  permission_switch: "邀请链接开关：",
  permission_tipsA: "同事申请后，需管理员确认后才能加入",
  copy_success: "复制成功",
  copy_failure: "复制失败"
};
const joinTeam$1 = {
  jointeamtipsA: "申请加入团队：",
  jurisdiction: "加入团队后，可访问该团队中的项目、文件、资源",
  jointeamtipsB: "申请加入",
  jointeamtipsC: "已发送申请，",
  jointeamtipsC1: "即将进入应用首页，待审批通过后，可查看该团队内容",
  jointeamtipsD: "团队邀请已关闭，如需加入团队，请联系团队管理员处理。",
  read: "阅读",
  edit: "编辑"
};
const moveprojectfill$1 = {
  name: "文件名称：",
  location: "当前位置：",
  my_file: "我的文件",
  move_to: "移动文件至：",
  private_file: "设为私有文件",
  share_Project: "收到的共享项目",
  cancel: "取消"
};
const projectlist$1 = {
  datanull: "未加入任何项目",
  datanull2: "没有匹配的项目",
  addproject: "新建项目",
  project_name: "项目名称",
  project_description: "项目描述",
  creator: "创建者",
  operation: "操作",
  enterproject: "进入项目",
  confirm1: "新建项目"
};
const projectpage$1 = {
  menu: "项目菜单",
  back: "回到上一级",
  input_tips: "点击输入项目描述…",
  unpin: "取消固定",
  fixed_items: "固定项目",
  member: "邀请项目成员",
  permission: "成员权限",
  file: "文件",
  recycle_bin: "回收站"
};
const teammember$1 = {
  transferCreator_context: "转让创建者权限后，您将不再拥有该团队，后续作为管理员留在团队中。",
  transferCreator_title: "转移创建者权限",
  transferCreator_confirm: "确定转移",
  outTeamDialog_context: "移出团队后，该成员无法再访问团中的项目及资源。",
  outTeamDialog_title: "移出团队",
  outTeamDialog_confirm: "确认移出",
  exitTeamDialog_context: "退出团队后，团队中的所有项目，文件及资源，将无法再进行访问。",
  modifyNickname_title: "仅针对当前团队修改，不影响在其他团队的姓名",
  exitTeamDialog_title: "离开团队",
  exitTeamDialog_confirm: "确认离开",
  name: "姓名",
  modify: "修改",
  change_teamname: "更改团队姓名",
  change_name: "修改姓名",
  team_permission: "团队权限",
  all: "全部",
  creator: "创建者",
  manager: "管理员",
  editable: "可编辑",
  Readonly: "仅阅读",
  leave_team: "离开团队",
  move_team: "移出团队",
  transfer_creator: "转移创建者",
  permission_tips: "已设为：",
  transfer_tips: "已转让给："
};
const teampage$1 = {
  addproject: "新建项目",
  addmember: "邀请成员",
  search_default_tipsA: "搜索项目/创建者",
  search_default_tipsB: "搜索成员",
  project: "项目",
  members: "成员",
  team_set: "团队设置"
};
const teamprojectmenu$1 = {
  rename: "重命名",
  projectsetting: "项目访问设置",
  membersetting: "成员权限设置",
  fixed: "固定项目",
  cancelFixed: "取消固定",
  projectexittitle: "退出项目",
  projectdeltitle: "删除项目"
};
const teamsetting$1 = {
  team_name: "团队名称",
  edit_name: " 修改名称",
  team_description: "团队描述",
  edit_description: "修改描述",
  team_avatar: "团队头像",
  edit_avatar: "修改头像",
  avatar_restriction: "选择2M以内的JPG、PNG格式图片作为头像显示",
  disband_team: "解散团队",
  disband_team_tips: "解散团队，删除团队文件，不可恢复",
  leave_team: "离开团队",
  leave_team_tips: "离开团队后，将无法再查看团队项目及资源",
  disband_team_tipsB: "解散团队后，将彻底删除团队中包含的全部项目资料，且不可恢复。",
  leave: "离开",
  disband: "解散",
  confirm: "确定",
  cancel: "取消",
  title_name1: "修改团队名称",
  title_name2: "修改团队描述",
  title_name3: "解散团队",
  title_name4: "离开团队"
};
const compos$1 = {
  duplicate_name: "名称重复，请重新输入",
  default_text_input: "请输入默认文本",
  attr_name_input: "请输入属性名称",
  place_select_instance: "请选择组件实例",
  place_select_layer: "请选择图层",
  compos_instance: "组件实例",
  select_layer: "选择图层",
  show: "显示",
  hidden: "隐藏",
  text_layer_null: "文本图层为空",
  instance_null: "组件实例为空",
  text_content: "文本内容",
  layer_isShow: "图层是否显示",
  instance_attr: "实例属性",
  untie: "解绑",
  reset_all_attr: "重置全部属性",
  layer_show: "图层显示",
  close_icon: "关闭图标",
  compos_state: "组件状态",
  toggle_instance: "切换实例",
  instance_toggle: "实例切换",
  compos_attr: "组件属性",
  delect_attr_type: "选择新建属性类型",
  display_state: "显示状态",
  search_compos: "搜索组件",
  compos: "组件",
  attr_name: "属性名称",
  state: "状态",
  lib_local: "本地",
  lib_line: "线框图组件",
  gocomp: "转到主组件",
  datail: "查看详情",
  attri_1: "属性 1",
  dlt: "默认",
  dltv: "默认值",
  attri: "属性",
  add_new: "添加新值",
  error_1: "新的组件不能包含已有组件图层的组成图层",
  error_2: "新的组件不能包含组件实例的组成图层",
  error_3: "组件内部不能包含连接线",
  validate_info_1: "请选择图层",
  validate_info_2: "属性名不能为空",
  validate_info_3: "默认值不能为空",
  conflict: "存在状态相同的可变组件，需要修改状态以解决冲突",
  conflict_2: "此可变组件存在相同状态，需要修改状态以解决冲突",
  confirm: "确认",
  circle_warning: "存在循环引用",
  invalid_compos: "无效组件",
  toggle_list_style: "切换列表"
};
const lable$1 = {
  development: "开发模式",
  selectLayer: "请选择图层",
  copyfailure: "复制失败",
  border: "边框",
  position: "位置",
  pure_color: "纯色",
  thickness: "粗细",
  style: "样式",
  dotted_line: "虚线",
  solid_line: "实线",
  code: "代码",
  copy_all: "复制全部",
  copy: "复制",
  fill: "填充",
  layer_info: "图层信息",
  name: "名称",
  posi: "位置",
  size: "大小",
  rotate: "角度",
  raduis: "圆角",
  opacity: "不透明度",
  select_multiple_layers: "已选择多个图层",
  development_platform: "开发平台",
  applet_of_WeChat: "微信小程序",
  pixel: "像素",
  copied: "已复制",
  click_copy: "点击复制",
  text: "文本",
  content: "内容",
  font: "字体",
  type_size: "字号",
  word_weight: "字重",
  word_space: "字间距",
  line_height: "行高",
  para_spacing: "段间距"
};
const shadow$1 = {
  shadow_stting: "阴影",
  only_used: "仅矩形、圆形以及容器可以使用",
  shadow_setting: "阴影设置",
  position: "位置",
  color: "颜色",
  effect: "效果",
  blur: "模糊",
  extend: "扩展",
  fill_is_visible: "容器的填充可见时可使用"
};
shadow$1[Et.Inner] = "内阴影";
shadow$1[Et.Outer] = "外阴影";
const blur$1 = {
  blur: "模糊",
  blur_setting: "模糊设置"
};
blur$1[ot.Gaussian] = "高斯模糊";
blur$1[ot.Background] = "背景模糊";
blur$1[ot.Zoom] = "缩放模糊";
blur$1[ot.Motion] = "动感模糊";
const cutoutExport$1 = {
  cutoutNotBool: "切图图层不支持布尔操作",
  cutout: "切图",
  create_cut_chart_and_export: "创建切图与导出",
  trim_transparent_pixels: "修剪透明像素",
  canvas_background_color: "画布背景色",
  export: "导出",
  preview: "预览",
  default: "默认",
  ios_presets: "iOS预设",
  android_presets: "Android预设",
  export_cutout: "导出切图",
  repeat: "与其他切图重名"
};
cutoutExport$1[mt.Prefix] = "前缀";
cutoutExport$1[mt.Suffix] = "后缀";
const report$1 = {
  title: "举报",
  tips: "请选择要举报的问题类型，并填写详细举报内容。",
  type: "举报类型",
  type_normal: "请选择类型",
  type_value1: "欺诈",
  type_value2: "色情低俗",
  type_value3: "不当言论",
  type_value4: "其他",
  report_content: "举报内容",
  report_normal: "请填写详细内容",
  upload_img: "上传截图",
  select_img: "添加文件",
  img_tips: "添加png、jpg格式文件，最多可上传5张",
  filet_ips: "允许使用当前文档用于确定举报证明使用",
  submit: "提交举报",
  cancel: "取消"
};
const setting$1 = {
  pixelAlignMentOn: "对齐像素已开启",
  pixelAlignMentOff: "对齐像素已关闭",
  pixelGridOn: "像素网格已开启",
  pixelGridOff: "像素网格已关闭"
};
const miniprogram$1 = {
  home: "首页",
  my_file: "我的文件",
  team: "团队",
  about: "我的",
  privacy: "隐私政策",
  serve: "在线服务协议",
  search: "没有匹配的文件",
  listnull: "当前列表没有文件",
  flushed: "刷新",
  recent: "最近",
  share: "收到的共享",
  star: "标星",
  projectnull: "还未加入项目",
  share_title: "分享",
  permissions: "权限设置",
  myself: "仅自己",
  confirm: "需要确认",
  share_users: "已加入分享的人",
  share_to: "分享到",
  copy_link: "复制链接",
  share_users_null: "没有加入的成员",
  team_jion_null: "还未加入团队"
};
const product$1 = {
  name: "墨师设计",
  subtitle: "在线协作专业产品设计软件",
  description: "墨师设计是一款专业产品设计软件，支持产品文稿写作、UI设计、设计演示、切图标注交付，为产品研发团队提供一站式协同设计新体验",
  keywords: "墨师设计,产品设计,协同设计,UI设计,Moss Design"
};
const pattern$1 = {
  image: "图片"
};
pattern$1[Mt.Fill] = "填充";
pattern$1[Mt.Stretch] = "拉伸";
pattern$1[Mt.Fit] = "适应";
pattern$1[Mt.Tile] = "平铺";
const start$1 = {
  title: "一起来设计吧",
  description_1: "专业产品设计软件，支持产品文稿写作、UI设计、设计演示、切图标注交付，",
  description_2: "为产品研发团队提供一站式协同设计新体验"
};
const moss$1 = {};
const design$1 = {
  title: "专业UI设计功能",
  description_1: "专业的矢量编辑工具，满足精细化编辑；高效的组件功能，",
  description_2a: " 并且兼容Sketch、Figma(",
  description_2b: "开发中，敬请期待",
  description_2c: ")等主流文件格式",
  description_3: "无缝进行文件迁移"
};
const cooperation$1 = {
  title: "团队实时协作",
  description_1: "链接邀请，在线实时协同，随时都能获取最新稿件；",
  description_2: "文档定点评论，高效沟通，让思维随时碰撞出新的火花；",
  description_3: "设计师轻松交付，切图资源、布局参数，工程师信手拈来"
};
const platform$1 = {
  title: "跨终端 无缝衔接",
  description: "多端数据实时同步，随时随地编辑创作"
};
const end$1 = {
  title: "每个参与者都能高效参与的设计工具"
};
const pub$1 = {
  login_1: "开始设计",
  login_2: "立即免费体验"
};
const lang_zh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Createteam: Createteam$1,
  apply: apply$1,
  attr: attr$1,
  blur: blur$1,
  bool: bool$1,
  clipboard: clipboard$1,
  color: color$1,
  comment: comment$1,
  compos: compos$1,
  cooperation: cooperation$1,
  cutoutExport: cutoutExport$1,
  date: date$1,
  design: design$1,
  end: end$1,
  fileMenu: fileMenu$1,
  frame: frame$1,
  home: home$1,
  homerightmenu: homerightmenu$1,
  inviteMember: inviteMember$1,
  joinTeam: joinTeam$1,
  lable: lable$1,
  login: login$1,
  message: message$1,
  miniprogram: miniprogram$1,
  moss: moss$1,
  moveprojectfill: moveprojectfill$1,
  navi: navi$1,
  opacity: opacity$1,
  pageMenu: pageMenu$1,
  pattern: pattern$1,
  percenter: percenter$1,
  permission: permission$1,
  platform: platform$1,
  preview: preview$1,
  product: product$1,
  projectlist: projectlist$1,
  projectpage: projectpage$1,
  pub: pub$1,
  report: report$1,
  search: search$1,
  setting: setting$1,
  shadow: shadow$1,
  shape: shape$1,
  share: share$1,
  start: start$1,
  system: system$1,
  table: table$1,
  teammember: teammember$1,
  teampage: teampage$1,
  teamprojectmenu: teamprojectmenu$1,
  teamsetting: teamsetting$1
}, Symbol.toStringTag, { value: "Module" }));
const system = {
  incorrect_input: "Incorrect input!",
  "illegal_input": "illegal input!",
  select: "Select",
  space: "...",
  empty: "No data",
  paste: "Paste",
  "paste_here": "Paste Here",
  "only_text": "Paste text",
  copy: "Copy",
  copyAs: "Copy/Paste as",
  cut: "Cut",
  replace: "Replace",
  failed: "Failed",
  "null_file_name": "The file name cannot be empty",
  "replace_failed": "Replacement failed, please try pasting",
  "select_layer": "Select layer",
  "bring_forward": "Bring forward",
  "send_backward": "Send backward",
  "bring_to_top": "Bring to top",
  "send_to_bottom": "Send to bottom",
  "visible": "Visible/Hidden",
  "hidden": "Hidden",
  "Lock": "Lock/Unlock",
  "select_all": "Select all",
  "fit_canvas": "Adapt to artboard",
  "show_many_cursor": "Show others cursor",
  "show_comment": "Show Cutout",
  "show_ruler": "show ruler",
  "show_pixel_network": "Show grid",
  "hide_operation_interface": "Hide UI",
  "creating_groups": "Create group",
  "create_container": "Create artboard",
  "un_group": "Dissolve the group",
  "create_component": "Create component",
  "unbind_instance": "Unbind",
  "reset_instance_roperties": "Reset",
  "edit_component": "Edit component",
  "wx_login": "Wechat scan code login",
  "login_read": "Scanning code indicates that you have read and agreed",
  "read_TOS": "Service Agreement",
  "read_Privacy": "Privacy Agreement",
  "product_description": "An efficient RPD writing tool that supports prototyping, document presentation, and approval management.",
  "login_footer": "Zhuhai Kuangcai Technology Co., Ltd",
  "placeholder": "Search file",
  "about": "About",
  "help_manual": "Help manual",
  "about_software": "About Software",
  "personal_center": "Personal center",
  "login_out": "Login out",
  "new_file": "New file",
  "page1": "Page 1",
  "dissolution": "Dissolution",
  "content_includes": "Content includes",
  "title_includes": "Title includes",
  "license_key": "粤ICP备2023042416号",
  "phonetips": "Mobile terminal does not support login, please login on the computer side!",
  "btn_login": "Login",
  "artboart_title_visible": "Show artboard title",
  sensitive_reminder: "Contains sensitive information, please re-enter.",
  sensitive_reminder2: "Contains sensitive information and cannot be shared.",
  sensitive_reminder3: "Contains sensitive information and cannot be accessed.",
  pixel: "Pixel Round",
  grid: "Pixel grid",
  rule: "Rule",
  uploadMediaFail: "Image upload failed",
  internet: "Go Home"
};
const home = {
  open_local_file: "Open file",
  open_remote_file: "Open remote file",
  new_file: "New file",
  object_selector: "Move",
  scale: "Scale",
  automatically_open: "Automatically open",
  search_file: "Search file",
  about: "About",
  help_manual: "Help manual",
  about_software: "About software",
  New_file: "New file",
  recently_opened: "Recently opened",
  star_file: "Star file",
  file_shared: "My files",
  shared_file_received: "Shared file received",
  file_shared_with_me: "File shared with me",
  recycling_station: "Recycling station",
  file_name: "File name",
  modification_time: "Recently visited",
  Creation_time: "Creation time",
  delete_file_time: "Deletion time",
  size: "Size",
  operation: "Operation",
  filelocation: "File location",
  creator: "Creator",
  deleter: "Deleter",
  star_marking: "Star marking",
  share: "Share",
  delete: "Delete",
  delete_ok_tips: "File moved to trash",
  delete_no_tips: "Removal failed",
  test: "Test",
  file_star_marking: "File has been marked star, can be viewed in the star list!",
  rect: "Rectangle",
  picture: "Picture",
  comment: "Comments",
  groups: "Group up",
  ungroup: "Ungroup",
  search_layer: "Search layer",
  prompt: "Founder change the file permissions, document is refreshed",
  visit: "Founder cancelled file access, document will exit",
  delete_file: "The creator deleted the document and it is about to exit",
  star: "Star",
  de_star: "Delete star",
  star_ok: "Starred document",
  star_cancel: "Document unstarred",
  de_access_record: "Delete access record",
  access_record_ok: "Removed successfully",
  access_record_no: "Removal failed",
  exit_share: "Exit share",
  exit_share_success: "Exit share success",
  exit_share_fail: "Exit share failed",
  restore: "Restore",
  completely_delete: "Completely delete",
  delete_tips: "After deleting, the file cannot be recovered. Are you sure you want to delete it?",
  delete_ok: "confirm delete",
  cancel: "cancel",
  failed_list_tips: "Failed to get file list",
  restore_ok: "Restored successfully",
  restore_no: "Restore failed",
  delete_file_ok: "Successfully deleted",
  delete_file_no: "Failed to delete",
  other_tips: "Please make sure the network connection is normal",
  addComment: "Add comment",
  rename: "Rename",
  rename_ok: "OK",
  page_sort: "Sort by page",
  login_failed: "Login failure",
  login_refresh: "Click refresh QR code",
  invitation_code_tips: "Please enter the trial invitation code",
  table_empty_tips: "No content",
  "align_left": "Align left",
  "align_h_c": "Align horizontal centers",
  "align_right": "Align right",
  "align_top": "Align top",
  "align_v_c": "Align vertical centers",
  "align_bottom": "Align bottom",
  "distribute_h": "Distribute horizontal spacing",
  "distribute_v": "Distribute vertical spacing",
  people_are_visiting: "People are visiting:",
  permissions: "Permissions:",
  contact: "Contact",
  full: "Full screen",
  exit_full: "Exit full screen",
  not_preview_frame: "There is no demonstrable container"
};
const search = {
  search_results: "No matching results",
  search_history: "No search history",
  search_history_title: "Historical record",
  search_history_clear: "Clear",
  result_count: "xx results"
};
const navi = {
  shape: "Shapes",
  comps: "Compnents",
  resource: "Resource",
  page: "Page",
  add_page: "Add new page",
  copy: "copy",
  development: "Functional development…",
  overname: "The maximum length of filenames is 50 characters"
};
const frame = {
  custom: "Custom",
  phone: "Phone",
  pad: "Pad",
  deskdop: "Deskdop",
  presentation: "Presentation",
  watch: "Watch",
  paper: "Paper",
  social_media: "Social media",
  slide: "Slide"
};
const fileMenu = {
  create_new: "Create new file",
  create_copy: "Create copy of file",
  save: "Save file",
  rename: "Rename file",
  view: "View",
  guide: "Shortcut key guide"
};
const pageMenu = {
  copy_link: "Copy link to page",
  duplicate: "Duplicate page",
  rename: "Rename page",
  delete: "Delete page"
};
const attr = {
  design: "Design",
  prototype: "Prototype",
  inspect: "Inspect",
  constraints: "Constraints",
  groupings: "Groupings",
  border: "Border",
  opacity: "Opacity",
  fill: "Fill",
  text: "Text",
  table_text: "Table Text",
  "follow_container_scaling": "Follow container scaling",
  "advanced_stroke": "Advanced stroke",
  position: "Position",
  "corner_smoothing": "Cornor smoothing",
  vertical: "Vertical",
  horizontal: "Horizontal",
  fixedWidth: "FixedWidth",
  fixedHeight: "FixedHeight",
  fixedLeft: "Left fixed",
  fixedRight: "Right fixed",
  withContainer: "Follow container scaling",
  fixedTop: "Top fixed",
  fixedBottom: "Bottom fixed",
  thickness: "Thickness",
  borderStyle: "Border style",
  dash: "Dash",
  solid: "Solid",
  startMarkerType: "Start Marker Type",
  endMarkerType: "End Marker Type",
  background: "Background",
  color: "Color",
  alpha: "Alpha",
  "fixed_left": "Left fixed",
  "fixed_right": "Right fixed",
  "fixed_left_right": "Fixed left and right",
  "center": "Center",
  "follow_container": "Follow container",
  "fixed_bottom": "Bottom fixed",
  "fixed_top": "Top fixed",
  "fixed_top_bottom": "Fixed top and bottom",
  "adapt": "Resize to fit",
  "mixed": "Mixed",
  "mixed_lang": "Click + to replace mixed content.",
  "mixed_cell_lang": "There are cell Settings, click + set centrally",
  text_advanced_settings: "Text Advanced Settings",
  word_space: "Word space",
  row_height: "Line height",
  paragraph_space: "Paragraph spacing",
  id_style: "Numbering style",
  letter_case: "Letter case",
  text_style: "Text style",
  auto: "Auto",
  search_for_fonts: "Search for fonts…",
  bold: "Bold",
  tilt: "Tilt",
  underline: "Underline",
  deleteline: "Delete line",
  align_left: "Text align left",
  align_center: "Text align center",
  align_right: "Text align right",
  align_the_sides: "Text align justified",
  align_top: "Align top",
  align_middle: "Align middle",
  align_bottom: "Align bottom",
  none_list: "No list",
  unordered_list: "Bulleted list",
  ordered_list: "Unmbered list",
  as_typed: "As typed",
  uppercase: "Uppercase",
  lowercase: "Lowercase",
  titlecase: "Title case",
  autowidth: "Auto width",
  autoheight: "Auto height",
  fixedsize: "Fixed size",
  more_value: "More value",
  used_font: "Used font",
  no_font_is_currently_in_use: "No font is currently in use",
  chinese_font: "Chinese font",
  english_font: "English font",
  find_the_fonts: "Can't find the fonts",
  font_is_not: "The font is not present locally. Use the default font effect instead",
  font_color: "Font color",
  highlight_color: "Highlight color",
  multiple_colors: "There are many color values, click + can be unified set",
  unfold: "Unfold",
  packup: "Pack up",
  "flip_v": "Flip Vertical",
  "flip_h": "Flip Horizontal",
  full_border: "Full border",
  outer_border: "border",
  inner_border: "Inner border",
  exit_path_edit: "Exit",
  close_path: "Close",
  de_close_path: "Open",
  right_angle: "Right Angle",
  completely_symmetrical: "Completely Symmetrical",
  angular_symmetry: "Angular Symmetry",
  asymmetric: "Asymmetric",
  path: "Path",
  corner: "corner",
  unilateral: "unilateral",
  independentCorners: "Independent corners",
  constrainProportions: "Constrain proportions",
  frameSize: "Frame"
};
const login = {
  login_failure: "Login failure",
  welcome: "Welcome",
  name: "MossDesign",
  describe: "Online collaborative professional product design software",
  miniprogram: "MiniProgram",
  scan_code: "Scan wechat"
};
const comment = {
  reply: "Reply",
  delete: "Delete",
  settled: "solve",
  edit_content: "Edit content",
  quick_reply: "Quick reply",
  last: "Last",
  next: "Next",
  sort: "Sort by page",
  show_about_me: "Show about me",
  show_resolved_comments: "Show resolved comments",
  comment_area: "Comment section",
  input_comments: "Input comments",
  reply_comment: "Reply to comment",
  check: "check",
  a_few_reply: "reply",
  month: "month",
  day: "day",
  no_comment: "No comments",
  comments_hide: "Comments are set to hide",
  show_comments: "Show comments",
  input_no_perm: "No permission to comment"
};
const clipboard = {
  "invalid_data": "invalid data",
  "not_supported1": "The current browser does not support it, please use Ctrl C to copy",
  "not_supported2": "The current browser does not support it, please use ctrl X to cut",
  "copyAsPNGSuccess": "copied as PNG",
  "copyAsPNGFailed": "Failed",
  "copyAsPNG": "copy as PNG"
};
const opacity = {};
const message = {
  doc_notopen: "Network anomalies, the document can't open, please try again after checking the network.",
  list_for_failure: "Network exception, file list acquisition failed, please check the network and try again.",
  retry: "Retry",
  leave: "Your changes have not been saved, are you sure you want to leave?",
  network_error: "Please do not refresh the page or close the document to avoid content loss. The document is trying to save...",
  network_anomaly: "Network anomaly",
  link_success: "Network connection successful",
  autosave: "Automatic document saving",
  cancel: "Cancel",
  exit_document: "Exit",
  back_home: "Back to home",
  unuploaded_msg: "The document has unuploaded resources. If you exit, content will be lost. Do you want to exit?"
};
const bool = {
  union: "Union",
  subtract: "Subtract",
  intersection: "Intersect",
  difference: "Exclude",
  cohere: "Vector"
};
const date = {
  just_now: "Just now",
  s: "s"
};
const preview = {
  actual_size: "Actual size",
  previous_page: "Previous page",
  next_page: "Next page",
  first_page: "First page",
  preview: "Preview",
  open: "Opens in Design mode",
  fill_screen: "Fill screen",
  fit_width: "Fit width",
  fit_screen: "Fit screen"
};
attr[ht.Inner] = "Inner";
attr[ht.Center] = "Center";
attr[ht.Outer] = "Outer";
opacity[nt.Normal] = "Normal";
opacity[nt.Darken] = "Become dark";
opacity[nt.Multiply] = "Multiply";
opacity[nt.ColorBurn] = "Color deepening";
opacity[nt.Lighten] = "Become bright";
opacity[nt.Screen] = "Filter";
opacity[nt.ColorDodge] = "Color dodge";
opacity[nt.Overlay] = "Superpose";
opacity[nt.SoftLight] = "Soft light";
opacity[nt.HardLight] = "Strong light";
opacity[nt.Difference] = "Difference";
opacity[nt.Exclusion] = "Exclude";
opacity[nt.Hue] = "Hue";
opacity[nt.Saturation] = "Saturation";
opacity[nt.Color] = "Color";
opacity[nt.Luminosity] = "Lightness";
opacity[nt.PlusDarker] = "Plus darker";
opacity[nt.PlusLighter] = "Plus lighter";
const shape = {
  group: "Group",
  page: "Page",
  line: "Line",
  oval: "Oval",
  rect: "Rect",
  path: "Vector",
  artboard: "Artboard",
  arrow: "Arrow",
  text: "text",
  image: "image",
  input_text: "Input text",
  table: "Table",
  contact: "Contact",
  cutout: "Cutout",
  shape_tool: "Shape tool",
  symbol: "Symbol",
  curve: "Curve",
  clip: "Clip",
  default: "Default",
  pen: "Pen",
  pencil: "Pencil",
  polygon: "Polygon",
  star: "Star"
};
shape[Ft.Rectangle] = "Rectangle";
const color = {
  solid: "Solid",
  linear: "Liner",
  radial: "Radial",
  angular: "Angular",
  esc: "Press ESC to exit",
  recently: "Recently used",
  documentc: "Document colors",
  times: "Used xx times",
  rotate: "Rotate",
  reverse: "Reverse"
};
color[wt.Linear] = "Linear gradient";
color[wt.Radial] = "Radial gradient";
color[wt.Angular] = "Angular gradient";
const share = {
  need_to_apply_for_confirmation: "Need to apply for confirmation",
  editable: "Editable",
  readOnly: "ReadOnly",
  remove: "Remove",
  anyone_can_read_it: "Anyone can read it",
  anyone_can_edit_it: "Anyone can edit it",
  anyone_can_comment: "Anyone can comment",
  shareable: "Shareable",
  no_authority: "No authority",
  copy_success: "Copy success",
  copy_failure: "Copy failure",
  file_sharing: "File sharing",
  share_switch: "Share switch",
  file_name: "File name",
  page_order_adjustment: "Page order adjustment",
  permission_setting: "Permission setting",
  copy_link: "Copy link",
  people_who_have_joined_the_share: "People who have joined the share",
  share_limit: "Share limit",
  founder: "Founder",
  document_permission: "Document permission",
  reviewable: "Reviewable",
  no_document: "No such document"
};
const permission = {
  no_authority_to_rename: "当前没有重命名的权限"
};
const apply = {
  file_access_request: "File access request",
  applicant: "Applicant",
  access_file: "Access file",
  authority: "Authority",
  remarks: "Remarks",
  agree: "Agree",
  refuse: "Refuse",
  maximum_share: "The file has reached the maximum number of shares. Contact the creator",
  request_access: "You have applied for access several times, please wait for the creator to process",
  no_file_access_permission: "No file access permission",
  file_attribution: "File attribution",
  apply_for_permission: "Apply for permission",
  read_only: "Read only",
  apply_for_edit: "Apply for edit",
  please_remarks: "Please enter application remarks",
  file_deleted: "The file has been deleted, or the creator has closed the share",
  authorization_failure: "Authorization failure",
  notification_message: "Notification message",
  application_documents: "Application documents",
  have_agreed: "Have agreed",
  rejected: "Rejected",
  no_message_received: "No message received",
  link_not: "Link does not exist",
  not_passed: "The application failed, please modify the information or contact the creator and re-apply",
  project_apply: "Application to join project",
  project: "project",
  team: "Team",
  team_apply: "Join team application",
  file: "File"
};
const percenter = {
  return_home: "return home",
  personal_center: "personal center",
  essential_information: "essential information",
  head_portrait: "head portrait",
  avatar_restriction: "Upload images in PNG or JPG format less than 5M",
  modify_profile_picture: "Change",
  username: "Username",
  edit_user_name: "Edit",
  affirm: "Affirm",
  cancel: "Cancel",
  userID: "UserID",
  successtips: "Successfully",
  errortips1: "Failed",
  errortips: "The file size or format is out of limit",
  usernametips_null: "The user name cannot be empty",
  usernametips_length: "The user name cannot exceed 20 characters",
  nicknametips_length: "Nickname cannot be empty and cannot exceed 20 characters",
  error_occurred: "error occurred"
};
const homerightmenu = {
  open: "Open",
  newtabopen: "Opens in a new TAB",
  share: "Share",
  exit_share: "Exit share",
  target_star: "Target star",
  unstar: "Unstar",
  rename: "Rename",
  copyfile: "Create a copy of a file",
  removed_record: "Removed from open record",
  deletefile: "Delete file",
  restore: "Restore",
  completely_delete: "Completely delete",
  copyfile_ok: "Successful replication",
  copyfile_no: "Replication failure",
  "unable_lower": "Unable to move down again",
  "unable_upper": "Unable to move up again"
};
const table = {
  table: "Table",
  table_style: "Table style",
  del_column: "Delete column",
  del_select_row: "Delete selected row",
  del_select_col: "Delete selected col",
  del_table: "Delete table",
  split_cell: "Split cell",
  split_towrow: "Split two rows",
  split_towcol: "Split two cols",
  insert_column: "Insert column",
  merge_cell: "Merge cells",
  top_insert: "Top insert row",
  bottom_insert: "Insert row below",
  left_insert: "Left insert column",
  right_insert: "Right insert column",
  confirm: "Confirm",
  row: "row",
  col: "col",
  insert_table: "Insert table",
  row_num: "Number of rows",
  col_num: "Number of columns",
  column_table: "Designated column table"
};
const Createteam = {
  add_team: "Create a team",
  add_project: "Create a project",
  team_name: "Team name",
  project_name: "Project name",
  team_name_tips: "Enter team name",
  project_name_tips: "Enter project name",
  team_description: "Team description",
  project_description: "Project description",
  team_description_tips: "Enter team description",
  project_description_tips: "Enter project description",
  team_avatar: "Team avatar",
  required: "(Required)",
  optional: "(Optional)",
  avatar_restriction: "Upload images in PNG or JPG format less than 2M",
  movetip: "Move file location",
  move: "move",
  description: "You haven't filled out the team description yet, so go ahead.",
  sharetip: "Shared items received",
  fixed: "Fixed",
  cancelFixed: "Cancel fixed",
  projectdeltitle: "Delete project",
  projectexittitle: "Exit project",
  projectexitcontext: "After exiting the project, you can no longer access the files in the project or use the resources in the project.",
  projectdelcontext: "After deleting a project, the project and all files and data in the project will be deleted.",
  ok_exit: "Still quit",
  ok_delete: "Still delete",
  membertip: "Invite project members",
  projectsetting: "Project access settings",
  membersetting: "Member permission setting",
  projectfilenull: "The project does not have any files",
  projectfilesearchtips: "No matching files",
  projectOptionsA: "Public: Accessible to all team members",
  projectOptionsB: "Non-public: Request access via link only",
  projectPermsA: "Read only",
  projectPermsB: "Can be reviewed",
  projectPermsC: "Editable",
  projecttype: "Project type",
  jurisdiction: "jurisdiction",
  jointips: "Click the link or scan the QR code to join",
  invitation_switch: "Invite link switch",
  copylink: "copylink",
  confirm: "confirm",
  cancel: "cancel",
  joinprojecttipsA: "Apply for a project",
  joinprojecttipsB: "After you join a project, you can access all files and resources in the project",
  joinprojecttipsC: "Application has been sent,",
  joinprojecttipsC1: "You are about to enter the home page of the application. After approval, you can view the contents of the project",
  joinprojecttipsD: "The project invitation has been closed. If you want to join the project, contact the project administrator.",
  joinprojecttipsE: "Back home",
  joinprojecttipsF: "Apply to join",
  all: "All",
  creator: "Creator",
  manager: "Manager",
  editable: "Editable",
  reviewed: "reviewed",
  Readonly: "Read only",
  transferor: "Transferor",
  moveoutproject: "Move out of project",
  membersed: "members",
  username: "User name",
  pertipsA: "Project permissions: Public, accessible to all team members",
  pertipsB: "Project permissions: Non-public, accessible only by inviting members via link",
  Transfertips: "After you transfer Creator rights, you no longer own the project and remain in the project as an administrator.",
  confirmTransfer: "Confirm transfer",
  project: "Project",
  team: "Team",
  welcome: "Welcome to",
  rejectprompt1: "The application to join",
  rejectprompt2: "If you have any questions, please contact the team administrator.",
  rejectprompt3: "If you have any questions, please contact the project administrator.",
  shareprojecttips: "Accessible to all members of the project"
};
const inviteMember = {
  title: "Invite colleagues to join the team",
  permission_set: "Permission settings",
  permission_tips: "Send a link or QR code to colleagues to apply to join",
  permission_switch: "Invitation link switch: ",
  permission_tipsA: "After colleagues apply, they need to be confirmed by the administrator before they can join.",
  copy_success: "Copy Success",
  copy_failure: "Copy Failure"
};
const joinTeam = {
  jointeamtipsA: "Apply to join the team: ",
  jurisdiction: "After joining a team, you can access the projects, files, and resources in the team",
  jointeamtipsB: "Applications for Membership",
  jointeamtipsC: "Application has been sent,",
  jointeamtipsC1: "You will soon enter the application homepage. After approval, you can view the team's content.",
  jointeamtipsD: "Team invitation has been closed. If you want to join the team, please contact the team administrator.",
  read: "Read",
  edit: "Edit"
};
const moveprojectfill = {
  name: "File name: ",
  location: "Current position: ",
  my_file: "My file",
  move_to: "Move files to: ",
  private_file: "Set to private file",
  share_Project: "Shared items received",
  cancel: "cancel"
};
const projectlist = {
  datanull: "No project is added",
  datanull2: "No matching items",
  addproject: "New project",
  project_name: "Project name",
  project_description: "Project description",
  creator: "Creator",
  operation: "Operation",
  enterproject: "Enter project",
  confirm1: "Confirm"
};
const projectpage = {
  menu: "Project menu",
  back: "Return to previous level",
  input_tips: "Click to enter a project description…",
  unpin: "Unpin",
  fixed_items: "Fixed items",
  member: "Invite project members",
  permission: "Member permissions",
  file: "Flie",
  recycle_bin: "recycle bin"
};
const teammember = {
  transferCreator_context: "After transferring creator rights, you will no longer own the team and will remain in the project as an administrator.",
  transferCreator_title: "Transfer creator rights",
  transferCreator_confirm: "Confirm transfer",
  outTeamDialog_context: "After being removed from the team, the member can no longer access the projects and resources in the team.",
  outTeamDialog_title: "Move out of team",
  outTeamDialog_confirm: "Confirm removal",
  exitTeamDialog_context: "After leaving the team, all projects, files and resources in the team will no longer be accessible.",
  modifyNickname_title: "Modifications only for the current team and do not affect names in other teams",
  exitTeamDialog_title: "Leave the team",
  exitTeamDialog_confirm: "Confirm to leave",
  name: "Name",
  modify: "Modify",
  change_teamname: "Change teamname",
  change_name: "Change name",
  team_permission: "Team permissions",
  all: "All",
  creator: "Creator",
  manager: "Manager",
  editable: "Editable",
  Readonly: "Read only",
  leave_team: "Leave the team",
  move_team: "Move out of team",
  transfer_creator: "Transfer creator",
  permission_tips: "Already set to: ",
  transfer_tips: "Transferred to: "
};
const teampage = {
  addproject: "New Project",
  addmember: "Invite members",
  search_default_tipsA: "Search projects/creators",
  search_default_tipsB: "Search members",
  project: "Project",
  members: "Members",
  team_set: "Team settings"
};
const teamprojectmenu = {
  rename: "Rename",
  projectsetting: "Project access settings",
  membersetting: "Member permission settings",
  fixed: "Fixed",
  cancelFixed: "Cancel fixed",
  projectexittitle: "Exit project",
  projectdeltitle: "Delete project"
};
const teamsetting = {
  team_name: "Team name",
  edit_name: "Edit name",
  team_description: "Team description",
  edit_description: "Edit description",
  team_avatar: "Team avatar",
  edit_avatar: "Edit avatar",
  avatar_restriction: "Upload images in PNG or JPG format less than 2M",
  disband_team: "Disband the team",
  disband_team_tips: "Disband the team and delete team files, which cannot be recovered.",
  leave_team: "Leave the team",
  leave_team_tips: "After leaving the team, you will no longer be able to view team projects and resources",
  disband_team_tipsB: "After the team is disbanded, all project data contained in the team will be completely deleted and cannot be recovered.",
  leave: "Leave",
  disband: "Disband",
  confirm: "Confirm",
  cancel: "Cancel",
  title_name1: "Change team name",
  title_name2: "Modify team description",
  title_name3: "Dissolve the team",
  title_name4: "Leaving the team"
};
const shadow = {
  shadow_stting: "Shadow",
  only_used: "Only rectangles, circles and containers can be used",
  shadow_setting: "Shadow setting",
  position: "position",
  color: "colour",
  effect: "effect",
  blur: "Blur",
  extend: "spread",
  fill_is_visible: "Used when the container's fill is visible"
};
shadow[Et.Inner] = "Inner shadow";
shadow[Et.Outer] = "Outer shadow";
const blur = {
  blur: "Blur",
  blur_setting: "Blur setting"
};
blur[ot.Gaussian] = "Gaussian blur";
blur[ot.Background] = "Background blur";
blur[ot.Zoom] = "Zoom blur";
blur[ot.Motion] = "Motion blur";
const cutoutExport = {
  cutoutNotBool: "The cutmap layer does not support Boolean operations",
  cutout: "Cutout",
  create_cut_chart_and_export: "Create cut chart and export",
  trim_transparent_pixels: "Trim transparent pixels",
  canvas_background_color: "Canvas background color",
  export: "Export",
  preview: "Preview",
  default: "Default",
  ios_presets: "iOS presets",
  android_presets: "Android presets",
  export_cutout: "Export cutout",
  repeat: "Same name as other slices"
};
cutoutExport[mt.Prefix] = "Prefix";
cutoutExport[mt.Suffix] = "Suffix";
const compos = {
  duplicate_name: "Name duplicate, please reenter",
  default_text_input: "Please enter the default text",
  attr_name_input: "Please enter the attribute name",
  place_select_instance: "Select a component instance",
  place_select_layer: "Please select layer",
  compos_instance: "Component instance",
  select_layer: "Select layer",
  show: "show",
  hidden: "Hidden",
  text_layer_null: "The text layer is empty",
  instance_null: "A component instance is empty",
  text_content: "Text content",
  layer_isShow: "Layer display or not",
  instance_attr: "Instance attribute",
  untie: "untie",
  reset_all_attr: "Reset all properties",
  layer_show: "Layer display",
  close_icon: "Close icon",
  compos_state: "Component state",
  toggle_instance: "Switch instance",
  instance_toggle: "Instance switch",
  compos_attr: "Component attribute",
  delect_attr_type: "Select the attribute type",
  display_state: "Display status",
  search_compos: "Search component",
  compos: "Component",
  attr_name: "Attribute name",
  state: "State",
  lib_local: "Local",
  lib_line: "Path",
  gocomp: "Go to main component",
  datail: "View details",
  attri_1: "Attribute 1",
  dlt: "Default",
  dltv: "Default Value",
  attri: "Attribute",
  add_new: "Add new",
  error_1: "Wrong Selection",
  error_2: "Wrong Selection",
  error_3: "Wrong Selection",
  validate_info_1: "Null Layer",
  validate_info_2: "Invalid Name",
  validate_info_3: "Invalid Default Value",
  conflict: "Conflict",
  conflict_2: "Conflict",
  confirm: "Confirm",
  circle_warning: "Wrong reference",
  invalid_compos: "Invalid Symbol",
  toggle_list_style: "list style"
};
const lable = {
  development: "Development mode",
  selectLayer: "Please select layer",
  copyfailure: "Copy the failure",
  border: "border",
  position: "position",
  pure_color: "Pure color",
  thickness: "thickness",
  style: "style",
  dotted_line: "Dotted line",
  solid_line: "Solid line",
  code: "Code",
  copy_all: "Copy all",
  copy: "Copy",
  fill: "Fill",
  layer_info: "Layer information",
  name: "name",
  posi: "position",
  size: "size",
  rotate: "rotate",
  raduis: "raduis",
  opacity: "opacity",
  select_multiple_layers: "Already select multiple layers",
  development_platform: "Development platform",
  applet_of_WeChat: "Applet of WeChat",
  pixel: "pixel",
  copied: "copied",
  click_copy: "Click copy",
  text: "text",
  content: "content",
  font: "font",
  type_size: "Type size",
  word_weight: "Word weight",
  word_space: "LineSpacing",
  line_height: "Line height",
  para_spacing: "Paragraph spacing"
};
const report = {
  title: "Report",
  tips: "Please select the type of problem you want to report and fill in the detailed report content. ",
  type: "report type",
  type_normal: "Please select the type",
  type_value1: "Fraud",
  type_value2: "Pornographic and vulgar",
  type_value3: "Inappropriate speech",
  type_value4: "other",
  report_content: "Report content",
  report_normal: "Please fill in the details",
  upload_img: "Upload screenshot",
  select_img: "Add file",
  img_tips: "Add png, jpg format files, up to 5 can be uploaded",
  filet_ips: "Allow the use of the current document to determine the use of reported evidence",
  submit: "Submit",
  cancel: "cancel"
};
const setting = {
  pixelAlignMentOn: "Pixel Align On",
  pixelAlignMentOff: "Pixel Align Off",
  pixelGridOn: "Pixel grid visible",
  pixelGridOff: "Pixel grid hidden"
};
const miniprogram = {
  home: "Home",
  my_file: "My File",
  team: "Team",
  about: "About",
  privacy: "Privacy Policy",
  serve: "Online Services Agreement",
  search: "There are no matching files",
  listnull: "There are no files in the current list",
  flushed: "flushed",
  recent: "Recent",
  share: "Shares received",
  star: "Started",
  projectnull: "Not yet part of the project",
  share_title: "Share",
  permissions: "Permission settings",
  myself: "Myself",
  confirm: "Application required",
  share_users: "People who have joined the sharing",
  share_to: "Share To",
  copy_link: "Copy Link",
  share_users_null: "Members who did not join",
  team_jion_null: "Haven't joined the team yet"
};
const product = {
  name: "Moss Design",
  subtitle: "Collaborative professional product design software",
  description: "Moss Design is a professional product design software that supports online collaboration. It supports product manuscript writing, professional UI design, and obtaining design annotations, providing a one-stop collaborative design experience for product development teams.",
  keywords: "Moss Design, Product Design, Collaborative Design, UI Design"
};
const pattern = {
  image: "image"
};
pattern[Mt.Fill] = "Fill";
pattern[Mt.Stretch] = "Stretch";
pattern[Mt.Fit] = "Fit";
pattern[Mt.Tile] = "Tile";
const start = {
  title: "Write anytime and Drawing anything",
  description_1: "Professional product design software, support product document writing, UI design, design presentation, marking delivery,",
  description_2: "Provide one-stop collaborative design experience for product development team"
};
const moss = {};
const design = {
  title: "Professional design",
  description_1: "Professional vector editing tools to meet the fine editing; Efficient component functionality, ",
  description_2a: "and compatible with Sketch, Figma(",
  description_2b: "in development, stay tuned",
  description_2c: ") and other major file formats",
  description_3: "for seamless file migration"
};
const cooperation = {
  title: "Collaboration",
  description_1: "Link invitation, online real-time collaboration, access to the latest manuscripts at any time.",
  description_2: "Document fixed comment, efficient communication, so that thinking at any time collision new sparks.",
  description_3: "Designers easily deliver, map resources, layout parameters, engineers at their fingertips."
};
const platform = {
  title: "Seamless across terminals",
  description: "Real-time synchronization of multi-end data, editing and creation anytime and anywhere"
};
const end = {
  title: "Design tools that each participant can participate in efficiently"
};
const pub = {
  login_1: "Free experience",
  login_2: "Experience now for free"
};
const lang_en = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Createteam,
  apply,
  attr,
  blur,
  bool,
  clipboard,
  color,
  comment,
  compos,
  cooperation,
  cutoutExport,
  date,
  design,
  end,
  fileMenu,
  frame,
  home,
  homerightmenu,
  inviteMember,
  joinTeam,
  lable,
  login,
  message,
  miniprogram,
  moss,
  moveprojectfill,
  navi,
  opacity,
  pageMenu,
  pattern,
  percenter,
  permission,
  platform,
  preview,
  product,
  projectlist,
  projectpage,
  pub,
  report,
  search,
  setting,
  shadow,
  shape,
  share,
  start,
  system,
  table,
  teammember,
  teampage,
  teamprojectmenu,
  teamsetting
}, Symbol.toStringTag, { value: "Module" }));
const i18n = createI18n({
  locale,
  legacy: false,
  //this.$i18n.locale // 通过切换locale的值来实现语言切换
  messages: {
    //引入语言包
    "zh": lang_zh,
    // 中文语言包
    "en": lang_en
    // 英文语言包
  }
});
const app = createApp(_sfc_main$1);
app.use(i18n);
app.component("svg-icon", _sfc_main);
app.mount("#app");