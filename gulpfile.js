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
        `dev/index.html`])
        .pipe(htmlValidator(undefined));
};

exports.validateHTML = validateHTML;

let lintCSS = () => {
    return src([`dev/css/style.css`])
        .pipe(CSSLinter({
            failAfterError: false,
            reporters: [
                {formatter: `string`, console: true}
            ]
        }));
};

exports.lintCSS = lintCSS;

let lintJS = () => {
    return src([`dev/js/app.js`])
        .pipe(jsLinter())
        .pipe(jsLinter.formatEach(`compact`));
};

exports.lintJS = lintJS;

let transpileJSForDev = () => {
    return src(`dev/js/app.js`)
        .pipe(babel())
        .pipe(dest(`temp/js`));
};

exports.transpileJSForDev = transpileJSForDev;

let transpileJSForProd = () => {
    return src(`dev/js/app.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`prod/js`));
};

exports.transpileJSForProd = transpileJSForProd;

let compressHTML = () => {
    return src([`dev/index.html`])
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};

exports.compressHTML = compressHTML;

let compressCSS = () => {
    return src('dev/css/style.css')
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
                `dev`,
                `dev/css`,
                `dev/js`
            ]
        }
    });
}

    watch(`dev/js/app.js`, series(lintJS, transpileJSForDev))
        .on(`change`, reload);

    watch(`dev/css/style.css`, series(lintCSS, compressCSS))
        .on(`change`, reload);

    watch(`dev/index.html`, validateHTML)
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

exports.default = serve;
