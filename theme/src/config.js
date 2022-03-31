// monaco editor 包含的语言
export const monacoEditorInnerLanguages = ['coffee', 'css', , 'html', 'javascript', 'json', 'less', 'pug', , 'scss', 'typescript', 'markdown']

// Monaco Editor 支持的语言
export const supportLanguage = {
    css: 'css',
    less: 'less',
    scss: 'scss',
    sass: 'scss',
    stylus: 'stylus',
    html: 'html',
    pug: 'pug',
    javascript: 'javascript',
    babel: 'javascript',
    typescript: 'typescript',
    coffeescript: 'coffeescript',
    vue2: 'vue2',
    vue3: 'vue3'
}


// 语言id到作用域名称的映射
export const scopeNameMap = {
    html: 'text.html.basic',
    pug: 'text.pug',
    css: 'source.css',
    less: 'source.css.less',
    scss: 'source.css.scss',
    sass: 'source.sassdoc',
    stylus: 'source.stylus',
    typescript: 'source.ts',
    javascript: 'source.js',
    javascriptreact: 'source.js.jsx',
    coffeescript: 'source.coffee',
    vue2: 'source.vue',
    vue3: 'source.vue'
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
    'source.postcss': {
        format: 'plist',
        path: 'postcss.tmLanguage',
    },
    'source.stylus': {
        format: 'plist',
        path: 'stylus.tmLanguage',
    },
    'source.ts': 'TypeScript.tmLanguage.json',
    'source.js': 'JavaScript.tmLanguage.json',
    'source.js.jsx': 'JavaScriptReact.tmLanguage.json',
    'source.coffee': 'coffeescript.tmLanguage.json',
    'source.js.regexp': {
        format: 'plist',
        path: 'Regular Expressions (JavaScript).tmLanguage'
    },
    'source.vue': 'vue.tmLanguage.json',
}