import { Transformer } from './transformer'
import { createElement as c, getElement } from './dom';

class VEditor extends EventTarget {
    constructor(
        codes,
        {
            container = '',
            preview = '',
            cssCDN = [],
            jsCDN = [],
            config = {},
        }
    ) {
        super()

        this.transformer = new Transformer();
        this.codes = codes; // 源代码文件

        this.containerEl = getElement(container); // 编辑器容器 dom
        this.previewEl = getElement(preview); // 预览 dom
        this.cssCDN = cssCDN; // css cdn
        this.jsCDN = jsCDN; // js cdn 
        this.config = config; // 编辑器配置 

        this.editors = [];
    }

    // 初始化
    init () {
        if (!this.containerEl) {
            return Promise.reject(new Error('container is required'))
        }

        let { codes, config, containerEl } = this;
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
                        codeEditor.addCommand(monaco.KeyCode.F5, () => that.runCode());
                        codeEditor.getAction(['editor.action.formatDocument']).run();
                        that.dispatchEvent(new CustomEvent('reader'))
                    }, 500);
                })

                // 初始化编辑器
                let fragment = document.createDocumentFragment();
                Object.keys(codes).forEach(key => {
                    let code = codes[key]
                    let edit = c('div', { class: 'editor-container' })
                    let item = c(
                        'div',
                        { class: 'editor-item' },
                        c('div', { class: 'editor-title' }, c('div', {}, key)),
                        edit
                    )

                    fragment.appendChild(item)

                    const editor = monaco.editor.create(edit, {
                        ...def_config,
                        value: code.text,
                        language: code.language,
                    })
                    that.editors.push(editor)
                });
                containerEl.appendChild(fragment)
            });
        })
    }

    // 运行代码
    runCode () {
        let { transformer, createHtml, previewEl } = this
        let models = monaco.editor.getModels()
        const tasks = models.map(model => {
            const language = model._languageId
            const value = model.getValue()
            return transformer.run(language, value).catch(() => null)
        })
        Promise.all(tasks).then(results => {
            let code = {}
            results.forEach(element => {
                if (element.result) {
                    code[element.type] = element.result;
                }
            });
            let htmlstr = createHtml(code);
            previewEl.srcdoc = htmlstr;
        })
    }

    // 生成
    createHtml ({ html, javascript, css, csscdn = [], jscdn = [] }) {
        let _cssCDN = csscdn.map((item) => `<link href="${item.url}" rel="stylesheet">`).join("\n");
        let _jsCDN = jscdn.map((item) => `<script src="${item.url}"><\/script>`).join("\n");
        let head = `
            <title>预览<\/title>
            ${_cssCDN}
            <style type="text/css">
                ${css}
            <\/style>`;
        let body = `
            ${html}
            ${_jsCDN}
            <script>
                try {
                    ${javascript}
                } catch (err) {
                    console.error('js代码运行出错')
                    console.error(err)
                }
            <\/script>`;

        return `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                ${head}
            </head>
            <body>
                ${body}
            </body>
            </html>`
    }
}


export default VEditor