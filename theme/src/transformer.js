const plain = (text) => text

function method (fn) {
    if (typeof fn !== "function") {
        throw new Promise.TypeError("fn is not a function.");
    }
    return async function () {
        return Reflect.apply(fn, this, arguments);
    };
};


export class Transformer {
    constructor() {
        this.store = {};
        this._register();
    }

    _register () {
        this.register('css', plain, 'css');
        this.register('html', plain, 'html');
        this.register('javascript', plain, 'javascript');
        this.register('less', plain, 'css');
    }

    register (language, run, type) {
        this.store[language] = {
            type,
            run: method(run)
        }
    }

    run (language, text) {
        if (this.store[language]) {
            let { run, type } = this.store[language]
            return run(text).then(res => {
                return {
                    res,
                    type,
                }
            })
        }
        throw new Error(`未找到 ${language} 转换器`)
    }
}