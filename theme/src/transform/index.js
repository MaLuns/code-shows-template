import transformer from './transformer'


function asyncMethod (fn) {
    if (typeof fn !== "function") {
        throw new Promise.TypeError("fn is not a function.");
    }
    return async function () {
        return Reflect.apply(fn, this, arguments);
    };
};



class Transform {
    constructor() {
        this.store = {};
    }

    async load (language) {
        let tran = this.get(language)
        if (!tran) {
            switch (language) {
                case 'css':
                    this.register('css', transformer.plain, 'css');
                    break;
                case 'html':
                    this.register('html', transformer.plain, 'html');
                    break;
                case 'javascript':
                    this.register('javascript', transformer.plain, 'javascript');
                    break;
                case 'less':
                    this.register('less', await transformer.loadLess(), 'css');
                    break;
                case 'sass':
                    this.register('less', await transformer.loadSass(), 'css');
                    break;
                default:
                    break;
            }
        }
    }

    get (language) {
        return this.store[language]
    }

    register (language, run, type) {
        this.store[language] = {
            type,
            run: asyncMethod(run)
        }
    }

    run (language, text) {
        if (this.store[language]) {
            let { run, type } = this.store[language]
            return run(text).then(result => {
                return {
                    result,
                    type,
                }
            })
        }
        throw new Error(`未找到 ${language} 转换器`)
    }
}

export default new Transform()