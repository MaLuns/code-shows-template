(function () {
    const dom = document;
    const layouts = ['top', 'left', 'bottom', 'right']
    let currentLayout = 'top';
    const editorContainer = dom.getElementById('editor-container')
    const layoutButton = dom.getElementById('layout-button')
    const runCodeButton = dom.getElementById('run-code')
    const saveCodeButton = dom.getElementById('save-code')
    const resizerBar = dom.getElementById('resizer')

    const next = function (item, arr) {
        if (arr.length === 0) return
        let index = arr.findIndex(e => e === item);
        return index === -1 || index === arr.length - 1 ? arr[0] : arr[index + 1]
    }

    const editor = new VEditor(
        window._CODE_INFO,
        {
            config: {
                vs_path: window._VS_PATH,
            },
            container: editorContainer,
            preview: '#output-iframe',
            cssCDN: window._CODE_CDN && _CODE_CDN.css ? _CODE_CDN.css : [],
            jsCDN: window._CODE_CDN && _CODE_CDN.js ? _CODE_CDN.js : [],
        },
    );

    // 初始化编辑器
    editor.init().then(() => {
        // 注册插件
        cssFormatMonaco(monaco);
    })

    // 编辑器加载完成
    editor.addEventListener('reader', function () {
        this.runCode();
        dom.body.classList.remove('loading');

    })

    // 
    editorContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('editor-title')) {
            let p = e.target.parentElement
            if (p.classList.contains('folding')) {
                p.classList.remove('folding')
            } else {
                p.classList.add('folding')
            }
        }
    })

    // 运行代码
    runCodeButton.addEventListener('click', function () {
        editor.runCode()
    })

    // 修改布局
    layoutButton.addEventListener('click', function () {
        let main = dom.getElementById('layout-main')
        main.classList.remove(`layout-${currentLayout}`)

        this.dataset.type = currentLayout = next(currentLayout, layouts)

        main.classList.add(`layout-${currentLayout}`)
        editorContainer.style = ''
    })

    // 拖动区域
    resizerBar.addEventListener('mousedown', function (e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);

        // 容器宽高
        let winY = dom.body.clientHeight;
        let winX = dom.body.clientWidth;
        // 鼠标在 resizer 内 偏移坐标
        let disY = e.clientY - this.offsetTop;
        let disX = e.clientX - this.offsetLeft
        // resizer 宽高
        let h = this.offsetHeight
        let w = this.offsetWidth

        let oft = editorContainer.offsetTop

        dom.onmousemove = e => {
            switch (currentLayout) {
                case 'top':
                    editorContainer.style.height = Math.min(Math.max(e.clientY - disY - oft, 0), winY - oft) + 'px'
                    break;
                case 'bottom':
                    editorContainer.style.height = Math.min(Math.max((winY - e.clientY + disY - h), 0), winY - 60) + 'px'
                    break;
                case 'left':
                    editorContainer.style.width = Math.max((e.clientX - disX), 0) + 'px'
                    break;
                case 'right':
                    editorContainer.style.width = Math.max(winX - e.clientX + disX - w, 0) + 'px'
                    break;
                default:
                    break;
            }
        };

        dom.onmouseup = () => {
            dom.onmousemove = null;
            dom.onmouseup = null;
            dom.getElementById('output-iframe').classList.remove('disable-mouse-events')
        };

        dom.getElementById('output-iframe').classList.add('disable-mouse-events')
    });

    // 保存
    saveCodeButton.addEventListener('click', function () {
        editor.saveAs((dom.title || 'demo') + '.html')
    })

})()