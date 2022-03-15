
/**
 * 创建dom
 * @param {*} name 
 * @param {*} attrs 
 */
export const createElement = (name, attrs, ...childs) => {
    let el = document.createElement(name)
    addAttr(el, attrs)
    if (childs.length > 0) {
        appendChild(el, ...childs)
    }
    return el
}

/**
 * 添加属性
 * @param {*} el 
 * @param {*} attrs 
 */
export const addAttr = (el, attrs) => {
    for (const key in attrs) {
        if (attrs.hasOwnProperty(key)) {
            el.setAttribute(key, attrs[key])
        }
    }
}

/**
 * 
 * @param {*} el 
 * @param {*} childers 
 */
export const appendChild = (el, ...childers) => {
    childers.forEach(element => {
        if (typeof element === 'string') {
            el.append(element)
        } else {
            el.appendChild(element)
        }
    });
}

/**
 * 获取元素
 * @param {*} el 
 * @returns 
 */
export const getElement = (el) => {
    let element = typeof el === 'string' && el ? document.querySelector(el) : el;
    return element instanceof HTMLElement ? element : null
}

/**
 * 生成 HMLT 片段
 * @param {*}  
 * @returns 
 */
export const createHtml = ({ html, javascript, css, csscdn = [], jscdn = [] }) => {
    javascript = javascript ? `
        <script>
            try { 
                ${javascript}
            } catch (err) { 
                console.error('js代码运行出错') 
                console.error(err)
            } 
        <\/script>` : ''

    let _cssCDN = csscdn.map((item) => `<link href="${item}" rel="stylesheet">`).join("\n");
    let _jsCDN = jscdn.map((item) => `<script src="${item}"><\/script>`).join("\n");

    let head = `
    ${_cssCDN}
    <style type="text/css">${css}<\/style>`;

    let body = `
    ${html}
    ${_jsCDN}
    ${javascript}`;

    return { head, body }
}

/**
 * 防抖
 * @param {*} func 
 * @param {*} wait 
 * @param {*} immediate 
 * @returns 
 */
export const debounce = (func, wait, immediate) => {
    var timeout;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
}