import { render } from "./artTemplate/artTemplate";

/*
<ul>
<% for (var i = 0; i < list.length; i++) { %>
    <li><%= list[i] %></li>
<% } %>
</ul>

let ret = '';
with(data) {
    ret += '<ul>';
    for (var i = 0; i < list.length; i++) {
        ret += '<li>;
        ret += list[i]; // ret += escape(list[i]);
        ret += '</li>';
    }
    ret += '</ul>';
}
return ret;
*/

// 反转义字符
function unescape(s) {
    return s
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'");
};

// 转义字符
function escape(s) {
    if (!s) return s;
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/'/g, '&#39;');
};


function escapeHtml(htmlStr) {
    return htmlStr.replace(/<(.+?)>/g, function ($0, $1) {
        return '&lt;' + $1 + '&gt;';
    });
}

function myTemplate(templateStr) {
    let reg = /(<%[=-]?)(.+?)(?:%>)/g;
    let index = 0;
    let match;
    let fnBody = '';

    while(match = reg.exec(templateStr)) {
        fnBody += 'ret += "' + templateStr.slice(index, match.index) + '";\n';
        switch (match[1]) {
            case "<%=": 
                fnBody += 'ret += ' + match[2] + ';\n';
                break;
            case "<%-": 
                // 转义
                fnBody += 'ret += escapeHtml(' + match[2] + ');\n';
                break;
            case "<%":
            default: 
                fnBody += match[2] + '\n';
                break;
        }
        index = reg.lastIndex;
    }

    if (templateStr.slice(index)) {
        fnBody += 'ret += "' + templateStr.slice(index) + '"';   
    }

    let fnWrap = `
        let ret = '';
        with(data) {
            ${fnBody}
        }
        return ret;
    `;

    let fn = new Function('data', fnWrap);

    return fn;
}


/*
 调用方法
 {{# v }}
 {{ v }}

{{if admin === 1}}
    {{each list}}
        <div>{{$index}}. {{$value.user}}</div>
    {{/each}}
{{else if admin === 2 }}

{{else}}

{{/if}}

to

<%if (admin) { %>
    <%for (var i=0;i<list.length;i++) {%>
        <div><%=i%>. <%=list[i].user%></div>
    <%}%>
<% } else if (admin === 2) { %>

<% } else { %>

<% } %>
*/

function myTemp(templateStr) {
    let reg = /(?:\{\{(\/?))(.+?)(?:\}\})/g;
    let stack = [];
    let match = reg.exec(templateStr);
    
    while (stack.length) {

    }

    let renderFn = new Function();
    return renderFn;
}

if (1) {

} else if (2) {

} else {

}