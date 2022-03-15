const editor = new VEditor(
    window._CODE_INFO,
    {
        config: {
            vs_path: window._VS_PATH,
        },
        container: '#editor-container',
        preview: '#output-iframe',
        cssCDN: window._CODE_CDN && _CODE_CDN.css ? _CODE_CDN.css : [],
        jsCDN: window._CODE_CDN && _CODE_CDN.js ? _CODE_CDN.js : [],
    },
);

editor.addEventListener('reader', function () {
    document.body.classList.remove('loading');
    editor.runCode();
})

editor.init().then(() => {
    cssFormatMonaco(monaco);
})

document.getElementById('run-code').addEventListener('click', () => {
    editor.runCode()
})

document.getElementById('layout-button').addEventListener('click', function () {
    let type = this.dataset.type;
    this.dataset.type = type === 'left' ? 'top' : 'left'
})

const resizer = document.getElementById('resizer')
resizer.onmousedown = e => {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);

    let winY = document.body.clientHeight;
    let disY = e.clientY - resizer.offsetTop;
    let docs = document.getElementById('editor-container')

    document.onmousemove = e => {
        let height = Math.min(Math.max(e.clientY - disY - 60, 0), winY - 160);
        docs.style.height = height + 'px'
    };

    document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        document.getElementById('output-iframe').classList.remove('disable-mouse-events')
    };

    document.getElementById('output-iframe').classList.add('disable-mouse-events')
};