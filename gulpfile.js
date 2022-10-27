const { src, dest, series, watch } = require(`gulp`),
    CSSLinter = require(`gulp-stylelint`),
    babel = require(`gulp-babel`),
    htmlCompressor = require(`gulp-htmlmin`),
    htmlValidator = require(`gulp-html`),
    cssCompressor = require(`gulp-clean-css`),
    jsCompressor = require(`gulp-uglify`),
    jsLinter = require(`gulp-eslint`),
    browserSync = require(`browser-sync`),
    reload = browserSync.reload;

let browserChoice = `default`;

async function chrome () {
    browserChoice = `google chrome`;
}

let validateHTML = () => {
    return src([
        `index.html`])
        .pipe(htmlValidator(undefined));
};

exports.validateHTML = validateHTML;

let lintCSS = () => {
    return src([`css/style.css`])
        .pipe(CSSLinter({
            failAfterError: false,
            reporters: [
                {formatter: `string`, console: true}
            ]
        }));
};

exports.lintCSS = lintCSS;

let lintJS = () => {
    return src([`js/app.js`])
        .pipe(jsLinter())
        .pipe(jsLinter.formatEach(`compact`));
};

exports.lintJS = lintJS;

let transpileJSForDev = () => {
    return src(`js/app.js`)
        .pipe(babel())
        .pipe(dest(`temp/js`));
};

exports.transpileJSForDev = transpileJSForDev;

let transpileJSForProd = () => {
    return src(`js/app.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`prod/js`));
};

exports.transpileJSForProd = transpileJSForProd;

let compressHTML = () => {
    return src([`index.html`])
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};

exports.compressHTML = compressHTML;

let compressCSS = () => {
    return src('css/style.css')
      .pipe(cssCompressor({compatibility: 'ie8'}))
      .pipe(dest('prod/css'));
};

exports.compressCSS = compressCSS;

let serve = () => {
    browserSync({
        notify: true,
        reloadDelay: 50,
        browser: browserChoice,
        server: {
            baseDir: [
                `temp`,
                `prod`,
                `html`
            ]
        }
    });
}

    watch(`app.js`, series(lintJS, transpileJSForDev))
        .on(`change`, reload);

    watch(`style.css`, series(lintCSS, compressCSS))
        .on(`change`, reload);

    watch(`index.html`, validateHTML)
        .on(`change`, reload);

exports.serve = series(
    validateHTML,
    lintCSS,
    lintJS,
    transpileJSForDev,
    serve
);

exports.build = series(
    compressHTML,
    compressCSS,
    transpileJSForProd
);