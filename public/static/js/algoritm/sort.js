/**
 * 排序
 * 参考：http://www.barretlee.com/blog/2016/08/11/algorithms-of-sort/
 */

// 冒泡排序
function bubbleSort(arr, order) {
    var i, mid, j, item, lens = arr.length;

    if (typeof order === 'function') {
        order = order.call(null, 1, 2) < 0 ? false : true;
    }

    for (i = 0; i < lens - 1; i++) {
        for (j = i + 1; j < lens; j++) {

            if (order === true) { // 从大到小
                if (arr[i] < arr[j]) {
                    mid = arr[i];
                    arr[i] = arr[j];
                    arr[j] = mid;
                }
            } else { // 从小到大
                if (arr[i] > arr[j]) {
                    mid = arr[i];
                    arr[i] = arr[j];
                    arr[j] = mid;
                    // arr[i] = [arr[j], arr[j] = arr[i]][0]; // 简单写法
                }
            }

        }
    }

    return arr;
}


// 选择排序：和冒泡排序原理一致
function selectSort(input) {
    for (var i = 0, len = input.length; i < len - 1; i++) {
        var min = i;
        for (var j = i + 1; j < len; j++) {
            if (input[j] < input[min]) {
                min = j;
            }
        }
        input[i] = [input[min], input[min] = input[i]][0];
    }
    return input;
}


// 插入排序：把自己插入到之前已经排好的序列中
function insertSort(input) {
    for (var i = 1, len = input.length; i < len; i++) {
        for (var j = i; j > 0; j--) {
            if (input[j] < input[j - 1]) {
                input[j] = [input[j - 1], input[j - 1] = input[j]][0];
            }
        }
    }

    return input;
}


/**
 * 快速排序: 二分排序
 * http://www.ruanyifeng.com/blog/2011/04/quicksort_in_javascript.html
 */
function quickSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }

    var mid_index = Math.floor(arr.length / 2);
    var mid_value = arr.splice(mid_index, 1)[0];
    var left_arr = [];
    var right_arr = [];

    // length长度改变了
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] >= mid_value) {
            right_arr.push(arr[i]);
        } else {
            left_arr.push(arr[i]);
        }
    }

    return quickSort(left_arr).concat([mid_value], quickSort(right_arr));
}
