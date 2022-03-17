// monaco editor包含的语言，可通过vue.config.js的MonacoWebpackPlugin插件进行配置
export const monacoEditorInnerLanguages = ['css', 'html', 'javascript', 'less', 'pug', 'scss', 'typescript', 'coffee']

// 语言id到作用域名称的映射
export const scopeNameMap = {
    html: 'text.html.basic',
    pug: 'text.pug',
    css: 'source.css',
    less: 'source.css.less',
    scss: 'source.css.scss',
    sass: 'source.sassdoc',
    typescript: 'source.ts',
    javascript: 'source.js',
    javascriptreact: 'source.js.jsx',
    coffeescript: 'source.coffee'
}

// 作用域名称到语法文件的映射
export const tmGrammarJsonMap = {
    'text.html.basic': 'html.tmLanguage.json',
    'text.pug': 'pug.tmLanguage.json',
    'source.css': 'css.tmLanguage.json',
    'source.css.less': 'less.tmLanguage.json',
    'source.less': 'less.tmLanguage.json',
    'source.css.scss': 'scss.tmLanguage.json',
    'source.sass': 'scss.tmLanguage.json',
    'source.sassdoc': 'sassdoc.tmLanguage.json',
    'source.stylus': 'css.tmLanguage.json',
    'source.ts': 'TypeScript.tmLanguage.json',
    'source.js': 'JavaScript.tmLanguage.json',
    'source.js.jsx': 'JavaScriptReact.tmLanguage.json',
    'source.coffee': 'coffeescript.tmLanguage.json',
    'source.js.regexp': {
        format: 'plist',
        path: 'Regular Expressions (JavaScript).tmLanguage'
    }
}