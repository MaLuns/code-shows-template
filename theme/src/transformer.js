
// 代码转换
const transformer = {
    plain (code) {
        return code;
    },
    async loadLess () {
        const less = await import(/* webpackChunkName: "load/less" */ 'less')
        return (code) => less.render(code).then((output) => output.css);
    },
    async loadSass () {
        return (code) => ''
    }
}

export default transformer