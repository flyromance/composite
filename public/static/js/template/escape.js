/**
 * 反转义字符
 */
_util.unescape = function unescape(s) {
    return s
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'");
};

/**
 * 转义字符
 */
_util.escape = function (s) {
    if (!s) return s;
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/'/g, '&#39;');
};
