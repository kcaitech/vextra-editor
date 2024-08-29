function fixLocale(locale: string) {
    locale = locale.toLowerCase();
    if (locale.startsWith('zh')) return 'zh';
    return 'en';
}
/*
在css中使用
https://www.w3.org/International/questions/qa-css-lang.zh-hans.html
**/
export const locale = fixLocale(localStorage.getItem('locale') || navigator.language || 'en');
// export const locale = fixLocale('en');
