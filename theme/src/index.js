import { Transformer } from './transformer'
import { dcreate } from './dom';

class VEditor {
    constructor(codes, editConfig = {}) {
        this.transformer = new Transformer();
        this.codes = codes;
        this.editConfig = editConfig;
        this.editors = [];
    }

    // 初始化
    init () {
        let { codes, editConfig } = this;
        let { vs_path, ...econfig } = editConfig;
        let that = this;

        return new Promise((resolve, reject) => {
            __non_webpack_require__.config({
                paths: { 'vs': vs_path },
                'vs/nls': { availableLanguages: { '*': 'zh-cn', }, },
            });

            __non_webpack_require__(['vs/editor/editor.main'], function () {
                resolve()

                // 编辑器配置
                const config = {
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
                        codeEditor.addCommand(monaco.KeyCode.F5, () => {
                            that.runCode()
                        });
                        codeEditor.getAction(['editor.action.formatDocument']).run()
                    }, 500);
                })

                let fragment = document.createDocumentFragment();

                Object.keys(codes).forEach(key => {
                    let code = codes[key]
                    let edit = dcreate('div', { class: 'editor-container' })
                    let item = dcreate(
                        'div',
                        { class: 'editor-item' },
                        dcreate('div', { class: 'editor-title' }, dcreate('div', {}, key)),
                        edit
                    )

                    fragment.appendChild(item)

                    const editor = monaco.editor.create(edit, {
                        ...config,
                        value: code.text,
                        language: code.language,
                    })

                    that.editors.push(editor)
                });

                document.getElementById('editor-parent').appendChild(fragment)
            });
        })
    }

    // 运行代码
    runCode () {
        let { transformer } = this
        let models = monaco.editor.getModels()
        models.forEach(model => {
            const language = model._languageId
            const value = model.getValue()
            console.log(model);
            transformer.run(language, value).then(res => {
                console.log(res);
            })
        })

        const iframe_body = document.getElementById('result_iframe')
        iframe_body.srcdoc = ''
    }
}


export default VEditor