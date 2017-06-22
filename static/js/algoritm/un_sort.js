/**
 * 数组乱序
 * 应用场景：抽奖
 */

// 普通 - 
function _draw(amount, n) {
    var arr = new Array(amount).fill().map(function(_, index) {return index + 1;});
    var ret = [], i, random_num;

    // 循环n次
    for (i = 0; i < n; i++) {
        random_num = Math.floor(arr.length * Math.random());
        ret.push(arr.splice(random_num, 1)[0]);
    }

    return ret;
}

// 打乱 - 取出
function draw(amount, n) {
    var arr = new Array(amount).fill().map((val, index) => index + 1);
    var mid, i, random_num;
    
    // 打乱数组, 只打乱前n个就行了
    for ( i = 0; i < n; i++ ) {
        random_num = Math.floor(amount * Math.random());
        mid = arr[i];
        arr[i] = arr[random_num];
        arr[random_num] = mid;
    }

    return arr.slice(0, n);
}

// 连续抽奖：其实就是维持一个array，每次都是针对它截取
function Box(amount) {
    this.arr = new Array(amount).fill().map((val, index) => index + 1);
}

Box.prototype.draw = function(n) {
    n = this.arr.length >= n ? n : this.arr.length;
    var lens = this.arr.length,
        arr = this.arr,
        i, mid, random_num;

    // 打乱前n个
    for (i = 0; i < n; i++) {
        random_num = Math.floor(lens * Math.random());
        mid = arr[i];
        arr[i] = arr[random_num];
        arr[random_num] = mid;
    }  

    return this.arr.splice(0, n);
};

var box = new Box(10);