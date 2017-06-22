/**
 * ajax 简单封装
 * @param: {}
 * @return: undefined
 * @dependence: deepExtend
 */
function fetchData(obj) {
    var _config = {
        type: 'get',
        async: true
    };
    var config = deepExtend({}, _config, obj);

    // 创建请求
    var xhr = new XMLHttpRequest();

    function handleStatus(status, res, cb) {
        if (xhr.status >= 200 && xhr.status < 400) { // success
            if (cb.doneFn && typeof cb.doneFn == 'function') {
                cb.doneFn(res.responseText);
            }
        } else { // error

        }
    }

    // 发送请求
    if (!obj.method || obj.method.toLowerCase() == 'get') {
        xhr.open('get', url, obj.isAscyn);
    } else {
        xhr.open('post', url, true);
    }

    // 监听请求
    if (xhr.onload) {
        xhr.onload = function (res) {
            handleStatus(xhr.status, res, obj.cb);
        }
    } else {
        xhr.onreadystatechange = function (res) {

            if (xhr.readyState == '4') {
                handleStatus(xhr.status, res, obj.cb);
            }
        }
    }

    // 设置请求头信息
    if (obj.contentType && typeof obj.contentType == 'string') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }

    // 发送数据
    xhr.send(obj.data || null);
}/**
 * Created by j-fanlong on 2017/3/13.
 */
