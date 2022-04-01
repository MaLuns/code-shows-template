import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Iframe from './Iframe';
import transform from './transform'
import { createHtml, createElement as c, getElement, debounce } from './utils'
import { liftOff, initMonacoEditor, loadTheme } from './textmate'
import { cssFormatter, pugFormater } from './formatters';
import { supportLanguage } from './config';

const basepath = (window._ROOT_PATH || '/') + 'asset/script'

// 初始化 css 格式化
const cssFormt = cssFormatter()
const pugFormt = pugFormater()

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


        this.editors = []
    }

    // 初始化
    async init () {
        if (!this.containerElement) {
            return Promise.reject(new Error('container is required'))
        }
        await initMonacoEditor()

        let { codes, config, containerElement } = this;
        config.theme = config.theme || 'MonokaiPro'

        await loadTheme(config.theme)

        return new Promise((resolve, reject) => {
            resolve()

            //#region 编辑器配置
            const def_config = {
                lineNumbers: false,
                automaticLayout: true,
                fontSize: 16,
                fontFamily: 'MonoLisa, monospace',
                fixedOverflowWidgets: true,
                minimap: {
                    enabled: false
                },
                hover: {
                    enabled: false
                },
                ...config
            };
            //#endregion

            //#region 监听编辑器创建成功
            const readerEvent = debounce(() => this.dispatchEvent(new CustomEvent('reader')), 1000)
            const _runCode = debounce(() => this.runCode(), 1000)
            monaco.editor.onDidCreateEditor(codeEditor => {
                setTimeout(() => {
                    codeEditor.getAction(['editor.action.formatDocument']).run(); // 格式化
                    codeEditor.addCommand(monaco.KeyCode.F5, () => _runCode()); // 监听F5
                    // codeEditor.onDidBlurEditorText((e) => _runCode()) // 监听失焦事件
                    codeEditor.onDidChangeModelContent((e) => _runCode())// 监听编辑事件
                    readerEvent()
                }, 500);
            })
            //#endregion

            //#region 初始化编辑器
            let fragment = document.createDocumentFragment();
            let keys = Object.keys(codes);
            keys.forEach((key, index) => {
                let code = codes[key]
                let edit = c('div', { class: 'code-editor' })
                let item = c('div', { class: 'editor-item', 'data-resizer': index },
                    c('div', { class: 'editor-title' }, code.language),
                    edit
                )

                fragment.appendChild(item)
                if (index < keys.length - 1) {
                    fragment.appendChild(c('div', { class: 'resizer-x', "data-editor": index + 1 }))
                }

                if (['vue2', 'vue3'].includes(code.language)) {
                    code.source = code.source.replace(/<\\\/script>/g, '</script>')
                }

                var editro = monaco.editor.create(edit, {
                    ...def_config,
                    value: code.source,
                    language: supportLanguage[code.language],
                })

                liftOff(supportLanguage[code.language], editro) // 替换 textmate
                transform.load(code.language) // 加载预处理语言 转换器

                this.editors.push({
                    editro,
                    language: code.language
                })
            });
            containerElement.appendChild(fragment)
            //#endregion
        })
    }

    // 设置主题
    async setTheme (name) {
        return loadTheme(name)
    }

    // 运行代码
    async runCode (event = false) {
        const { previewElement } = this
        const code = await this._getCode()

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

    // 保存代码
    async saveAs (name) {
        const file = await import(/* webpackChunkName: "lib/file-saver" */ 'file-saver')
        const obj = createHtml(await this._getCode())
        const { head = '', body = '' } = obj
        var blob = new Blob([`<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`], { type: "text/plain;charset=utf-8" });
        file.saveAs(blob, name || "demo.html");
    }

    async _getCode () {
        const { options } = this
        const tasks = this.editors.map(item => {
            return transform.run(item.language, item.editro.getValue()).catch(e => {
                throw e
            })
        })

        const results = await Promise.all(tasks);
        let code = {
            jscdn: [basepath + '/console.js'].concat(options.jsCDN),
            csscdn: options.cssCDN
        };
        results.forEach(element => {
            if (element) {
                code = {
                    ...code,
                    ...element
                }
            }
        });

        return code
    }
}

VEditor.prototype.transform = transform

export default VEditor