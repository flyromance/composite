/**
 * Created by Administrator on 2016/1/11.
 */
//序列化表单，把表单数据转化为 name=value&name1=value1 的形式
function serialize(form){
    if(form.elements){
        var elems = form.elements;
        var len = elems.length;
        var elem = null;
        var parts = [];
        var i, j, optLen, option, optValue;
        for(i = 0; i < len; i++){
            elem = elems[i];
            switch( elem.type ){
                case 'select-one':
                case 'select-multiple':
                    if(elem.name.length){
                        for(j = 0, optLen = elem.options.length; j < optLen; j++){
                            option = elem.options[j];
                            if(option.selected){
                                optValue = '';
                                if(option.hasAttribute){
                                    optValue = (option.hasAttribute('value') ? option.value : option.text);
                                }else{
                                    optValue = (option.attributes['value'] ? option.value : option.text);
                                }
                                parts.push(encodeURIComponent(elem.name) + '=' + encodeURIComponent(optValue));
                            }
                        }
                    }
                    break;

                case 'button':
                case 'submit':
                case 'file':
                case 'undefined':
                case 'reset':
                    break;

                case 'radio':
                case 'checkbox':
                    if(!elem.checked){
                        break;
                    }

                default:
                    if(elem.name.length){
                        parts.push(encodeURIComponent(elem.name) + '=' + encodeURIComponent(elem.value));
                    }
            }
        }
        return parts.join("&");
    }else{
        return null;
    }
}

// request请求 and response响应
function createXHR(){
    if( XMLHttpRequest ){
        /// for other
        return new XMLHttpRequest();
    }else if( ActiveXObject ){
        // for ie5 ie6
        return new ActiveXObject("Microsoft.XMLHTTP");
    }else{
        throw new Error("no xhr object available");
    }
}
// 添加查询字符串 location.search
function addURLParam(url, name, value){
    url += (url.indexOf("?")  == -1 ? "?" : "&");
    console.log(url);
    url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
    console.log(url);
    return url;
}


function sendXhr(url, cb){
    var xhr = createXHR(); // readyState == 0， 刚创建完xhr对象，还没发出请求

// 监听xhr的状态改变事件,全是小写
    xhr.onreadystatechange = function(){
        // raadyState == 3 已经接受到部分响应数据
        // readyState == 4 数据接受完成，并且能在客户端使用
        // xhr.abort() 调用此方法后，停止触发事件
        if( xhr.readyState == 4 ){
            if( (xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 ){
                // getResponseHeader()获取响应的头信息
                var responseHeader = xhr.getResponseHeader('content-type');
                var responseHeaders = xhr.getAllResponseHeaders();
                var responseValue = xhr.responseText;

                console.log(responseHeader);
                console.log(responseHeaders);

                if(cb){
                    cb(responseValue);
                }else{
                    alert(responseValue);
                }
            }else{
                alert('fail');
            }
        }
    }

// 同域www.baidu.com、同端口:8080、同协议http://
    xhr.open('get', url, true); // readyState == 1， 已发出请求，还没调用send()

// 此方法必须在open()方法调用之后，send()调用之前使用
// Cookie：当前页面设置的Cookie, Referer：请求页面的URI, Host:请求页面所在的域
// 浏览器一般禁止以此方法设置cookie
// xhr.setRequestHeader('myHeader', 'myValue');

// get:send(null), post:send(data)
    xhr.send(null); //  readyState == 2， 已调用send()，但没有接受到响应
}
