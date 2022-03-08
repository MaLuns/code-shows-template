
/**
 * 创建dom
 * @param {*} name 
 * @param {*} attrs 
 */
export const dcreate = (name, attrs, ...childs) => {
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
