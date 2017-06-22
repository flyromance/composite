/** 
 * 完成右侧模块（实际内容、广告内容、滚动fix）
 * 容器没有预先占位, 广告模块插入到实际内容模块中，都完成后再滚动fix
 */

// 实现1：没有并行请求
(function() {
    var right = new SubPub();

    // 实际内容
    function renderMain() {
        $.ajax({
            url: 'xxx'
        }).done(function() {
            // data - template - html - insertTo(大container)
        }).complete(function() {
            right.trigger('main', 1);
        });
    }

    // 广告等其他内容（不是同一个接口出来的），并且插入广告依赖实际内容
    function renderOther() {
        $.ajax({
            url: 'xxx'
        }).done(function() {
            // data - template - html - insertTo(实际内容模块中间)
        }).complete(function() {
            right.trigger('last', 2);
        });
    }

    // 所有内容完成后：才能继续操作，比如：滚动fix
    function renderLast() {

    }

    right.on('main', renderOther);
    right.on('last', renderLast);

    renderMain();
})();

// 实现2：并行请求
(function() {
    var right = new SubPub();
    var readyNum = 0;
    var dfd = new $.Deferred();

    // 实际内容
    function renderMain() {
        $.ajax({
            url: 'xxx'
        }).done(function() {
            // data - template - html - insertTo(container)
            dfd.resolve();
        }).complete(function() {
            right.trigger('done', 'main');
        });
    }

    // 广告等其他内容（不是同一个接口出来的），并且插入广告依赖实际内容
    function renderOther() {
        $.ajax({
            url: 'xxx'
        }).done(function() {
            // data - template - html 
            // 这里要依赖Main模块完成后，才能找到位置插入！！
            dfd.done(function() {
                // insertTo(Main container)
            });
        }).complete(function() {
            right.trigger('done', 'other');
        });
    }

    // 所有内容完成后：才能继续操作，比如：滚动fix
    function handleRight() {

    }

    function complete(name) {
        if (name == 'main') {
            readyNum++;
        }
        if (name == 'other') {
            readyNum++;
        }
        if (readyNum >= 2) {
            handleRight();
        }
    }

    right.on('done', complete);

    renderMain();
    renderOther();
})();
