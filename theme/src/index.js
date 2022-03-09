import Iframe from './Iframe';
import transform from './transform'
import { createHtml, createElement as c, getElement } from './utils'

class VEditor extends EventTarget {
    constructor(codes, options) {
        super()

        this.options = {
            container: '',
            preview: '',
            cssCDN: [],
            jsCDN: [],
            config: {},
            sandboxAttributes: ['allow-modals', 'allow-forms', 'allow-pointer-lock', 'allow-popups', 'allow-same-origin', 'allow-scripts'],
            ...options
        }

        this.codes = codes; // 源代码文件
        this.config = this.options.config; // 编辑器配置 

        this.containerElement = getElement(this.options.container);
        this.previewElement = getElement(this.options.preview) ? new Iframe({
            el: getElement(this.options.preview),
            sandboxAttributes: this.options.sandboxAttributes
        }) : null;

    }

    // 初始化
    init () {
        if (!this.containerElement) {
            return Promise.reject(new Error('container is required'))
        }

        let { codes, config, containerElement } = this;
        let { vs_path, ...econfig } = config;
        let that = this;

        return new Promise((resolve, reject) => {
            __non_webpack_require__.config({
                paths: { 'vs': vs_path },
                'vs/nls': { availableLanguages: { '*': 'zh-cn', }, },
            });

            __non_webpack_require__(['vs/editor/editor.main'], function () {
                resolve()

                // 编辑器配置
                const def_config = {
                    lineNumbers: false,
                    automaticLayout: true,
                    fontSize: 16,
                    theme: 'vs-dark',
                    minimap: {
                        enabled: false
                    },
                    folding: false,
                    fontFamily: 'MonoLisa, monospace',
                    contextmenu: false, // 
                    fixedOverflowWidgets: true, // 让语法提示层能溢出容器
                    ...econfig
                };

                // 监听文件初始化
                monaco.editor.onDidCreateEditor(codeEditor => {
                    setTimeout(() => {
                        codeEditor.addCommand(monaco.KeyCode.F5, () => that.runCode(true));
                        codeEditor.getAction(['editor.action.formatDocument']).run();
                        that.dispatchEvent(new CustomEvent('reader'))
                    }, 500);
                })

                // 初始化编辑器
                let fragment = document.createDocumentFragment();
                Object.keys(codes).forEach(key => {
                    let code = codes[key]
                    let edit = c('div', { class: 'code-editor' })
                    let item = c(
                        'div',
                        { class: 'editor-item' },
                        c('div', { class: 'editor-title' }, c('div', {}, key)),
                        edit
                    )

                    fragment.appendChild(item)

                    monaco.editor.create(edit, {
                        ...def_config,
                        value: code.text,
                        language: code.language,
                    })

                    transform.load(code.language)
                });
                containerElement.appendChild(fragment)
            });
        })
    }

    // 运行代码
    async runCode (event = false) {
        const { previewElement, options } = this
        const models = monaco.editor.getModels()
        const tasks = models.map(model => {
            return transform.run(model._languageId, model.getValue()).catch(() => null)
        })

        const results = await Promise.all(tasks);
        const code = {
            jscdn: options.jsCDN,
            csscdn: options.cssCDN
        };
        results.forEach(element => {
            if (element.result) {
                code[element.type] = element.result;
            }
        });

        if (previewElement) {
            previewElement.setHTML(createHtml(code));
        } else {
            if (event) {
                this.dispatchEvent(new CustomEvent('runcode', {
                    detail: createHtml(code)
                }))
            }
        }
    }
}

VEditor.prototype.transform = transform

export default VEditor