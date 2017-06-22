// 阶乘: 递归
function factorialize(n) {
    if (n <= 1) return n;

    return n * factorialize(n - 1);
}

// 阶乘: 非递归
function factorialize_(n) {
    if (n <= 1) return n;
    var ret = n;
    while (n) {
        ret = ret * (--n);
    }
    return ret;
}

// 数组去重
function uniqueArr(arr) {
    var cache = {},
        i = 0;
    while (i < arr.length) {
        if (!cache[arr[i]]) {
            cache[arr[i]] = 1;
            i++;
        } else {
            arr.splice(i, 1);
        }
    }
}

// 数组最大差值
function getMaxProfit(arr) {
    var max = arr[0];
    var min = arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            min = [arr[i], arr[i] = min][0];
        }

        if (arr[i] > max) {
            max = [arr[i], arr[i] = max][0];
        }
    }

    return max - min;
}

// 数组二分查找: 实现array.indexOf(value)
// 前提：arr是已经排好了顺序
function binary_search(arr, value) {
    var min = 0,
        max = arr.length;

    while (min < max) {
        mid = Math.ceil((max - min) / 2);

        if (value < arr[mid]) {
            max = mid - 1;
        } else if (value > arr[mid]) {
            min = mid + 1;
        } else {
            return mid;
        }
    }

    return -1;
}

// 递归生成斐波拉契数列 ：0, 1, 1, 2, 3, 5, 8...
function getFibonacci(n) {
    if (n == 0) return [0];
    if (n == 1) return [0, 1];
    var arr = getFibonacci(n - 1);
    arr.push(arr[n - 2] + arr[n - 1]);
    return arr;
}

// 随机生成指定长度的字符串
function randomString(n) {
    var str = 'abcdefghijklmnopqrstuvwxyz9876543210';
    var i = 0, index, strLen = str.length, ret = '';
    while (i < n) {
        index = Math.floor(Math.random() * strLen);
        ret += str.charAt(index);
        i++;
    }

    return ret;
}
