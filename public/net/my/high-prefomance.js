/**
 * Created by Administrator on 2016/1/24.
 */
var localCaches = {};
var callBacks = {
    fail:function(){},
    success:function(){}
};
function sendXhr(url,callback){
    // 先判断有无缓存，有缓存的话就不发送xhr请求了！！！
    if(localCaches[url]){
        callback.success(localCaches[url]);
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.onerror = callback.fail;
    xhr.onreadystatechange = function(){
        if( xhr.readyState == 4 && xhr.status == 200 ){
            // 把获取到的响应数据存起来
            localCaches[url] = xhr.responseText;
            // 获取响应头信息
            //var responseHeaders = xhr.getAllResponseHeaders();
            callback.success(xhr.responseText);
        }else{
            callback.fail();
        }
    };
    xhr.open('get',url,true);
    // 设置响应头
    //xhr.setRequestHeader();
    xhr.send(null);
}