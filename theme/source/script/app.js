/**
 * 运行 code
 */
function runCode () {
    let models = monaco.editor.getModels()
    models.forEach(model => {
       
    })

    const iframe_body = document.getElementById('result_iframe')
    iframe_body.srcdoc = ''
}


function createHtml ({ htmlStr, jsStr, cssStr, csscdn = [], jscdn = [] }) {
    let _cssCDN = csscdn.map((item) => `<link href="${item.url}" rel="stylesheet">`).join("\n");
    let _jsCDN = jscdn.map((item) => `<script src="${item.url}"><\/script>`).join("\n");
    let head = `
        <title>预览<\/title>
        ${_cssCDN}
        <style type="text/css">
            ${cssStr}
        <\/style>`;
    let body = `
        ${htmlStr}
        ${_jsCDN}
        <script>
            try {
                ${jsStr}
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

require.config({
    paths: {
        'vs': _editor.vs_path
    },
    'vs/nls': {
        availableLanguages: {
            '*': 'zh-cn',
        },
    },
});
require(['vs/editor/editor.main'], function () {
    cssFormatMonaco(monaco);

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
    };

    // 监听文件初始化
    monaco.editor.onDidCreateEditor(codeEditor => {
        setTimeout(() => {
            codeEditor.addCommand(monaco.KeyCode.F5, runCode);
            codeEditor.getAction(['editor.action.formatDocument']).run()
        }, 500);
    })

    let fragment = document.createDocumentFragment();
    Object.keys(_editor.code).forEach(key => {
        let code = _editor.code[key]
        let item = document.createElement('div')
        item.className = 'editor-item'

        let title = document.createElement('div')
        title.className = 'editor-title'
        title.innerHTML = `<div>${key}</div>`

        let edit = document.createElement('div')
        edit.className = 'editor-container'

        item.appendChild(title)
        item.appendChild(edit)
        fragment.appendChild(item)

        monaco.editor.create(edit, {
            ...config,
            value: code.text,
            language: code.language,
        })
    });
    document.getElementById('editor-parent').appendChild(fragment)
});

