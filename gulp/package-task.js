import { metadataFiles, packageJSONFields, mainExport, npmPkgName, npmOrgName, targetDir, packageName, observableFromStreams } from './util.js';

import gulp from 'gulp';
import { memoizeTask } from './memoize-task.js';
import { ReplaySubject, EMPTY as ObservableEmpty, forkJoin as ObservableForkJoin } from 'rxjs';
import { share } from 'rxjs/operators/index.js';
import gulpJsonTransform from 'gulp-json-transform';

export const packageTask = ((cache) => memoizeTask(cache, function bundle(target, format) {
    if (target === `src`) return ObservableEmpty();
    const out = targetDir(target, format);
    const jsonTransform = gulpJsonTransform(target === npmPkgName ? createMainPackageJson(target, format) :
        target === `ts` ? createTypeScriptPackageJson(target, format)
            : createScopedPackageJSON(target, format),
        2);
    return ObservableForkJoin([
        observableFromStreams(gulp.src(metadataFiles), gulp.dest(out)), // copy metadata files
        observableFromStreams(gulp.src(`package.json`), jsonTransform, gulp.dest(out)) // write packageJSONs
    ]).pipe(share({ connector: () => new ReplaySubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }));
}))({});

export default packageTask;

const createMainPackageJson = (target, format) => (orig) => ({
    ...createTypeScriptPackageJson(target, format)(orig),
    bin: orig.bin,
    name: npmPkgName,
    type: 'commonjs',
    main: `${mainExport}.node.js`,
    module: `${mainExport}.node.mjs`,
    types: `${mainExport}.node.d.ts`,
    unpkg: `${mainExport}.dom.es2015.min.js`,
    jsdelivr: `${mainExport}.dom.es2015.min.js`,
    browser: {
        [`./${mainExport}.node.js`]: `./${mainExport}.dom.js`,
        [`./${mainExport}.node.mjs`]: `./${mainExport}.dom.mjs`
    },
    exports: {
        '.': {
            node: {
                import: {
                    types: `./${mainExport}.node.d.ts`,
                    default: `./${mainExport}.node.mjs`,
                },
                require: {
                    types: `./${mainExport}.node.d.ts`,
                    default: `./${mainExport}.node.js`,
                },
            },
            import: {
                types: `./${mainExport}.dom.d.ts`,
                default: `./${mainExport}.dom.mjs`,
            },
            require: {
                types: `./${mainExport}.dom.d.ts`,
                default: `./${mainExport}.dom.js`,
            }
        },
        './*': {
            import: {
                types: `./*.d.ts`,
                default: `./*.mjs`,
            },
            require: {
                types: `./*.d.ts`,
                default: `./*.js`,
            },
        },
    },
    sideEffects: false,
    esm: { mode: `all`, sourceMap: true }
});

const createTypeScriptPackageJson = (target, format) => (orig) => ({
    ...createScopedPackageJSON(target, format)(orig),
    bin: undefined,
    main: `${mainExport}.node.ts`,
    module: `${mainExport}.node.ts`,
    types: `${mainExport}.node.ts`,
    browser: `${mainExport}.dom.ts`,
    type: 'module',
    sideEffects: false,
    esm: { mode: `auto`, sourceMap: true },
    dependencies: {
        '@types/node': '*',
        ...orig.dependencies
    }
});

const createScopedPackageJSON = (target, format) => (({ name, ...orig }) =>
    packageJSONFields.reduce(
        (xs, key) => ({ ...xs, [key]: xs[key] || orig[key] }),
        {
            // un-set version, since it's automatically applied during the release process
            version: undefined,
            // set the scoped package name (e.g. "@reactivex/ix-esnext-esm")
            name: `${npmOrgName}/${npmPkgName}-${packageName(target, format)}`,
            // set "unpkg"/"jsdeliver" if building scoped UMD target
            unpkg: format === 'umd' ? `${mainExport}.dom.js` : undefined,
            jsdelivr: format === 'umd' ? `${mainExport}.dom.js` : undefined,
            // set "browser" if building scoped UMD target, otherwise "Ix.dom"
            browser: format === 'umd' ? `${mainExport}.dom.js` : `${mainExport}.dom.js`,
            // set "main" to "Ix" if building scoped UMD target, otherwise "Ix.node"
            main: format === 'umd' ? `${mainExport}.dom.js` : `${mainExport}.node.js`,
            // set "type" to `module` or `commonjs` (https://nodejs.org/api/packages.html#packages_type)
            type: format === 'esm' ? `module` : `commonjs`,
            // set "module" if building scoped ESM target
            module: format === 'esm' ? `${mainExport}.node.js` : undefined,
            // set "sideEffects" to false as a hint to Webpack that it's safe to tree-shake the ESM target
            sideEffects: format === 'esm' ? false : undefined,
            // include "esm" settings for https://www.npmjs.com/package/esm if building scoped ESM target
            esm: format === `esm` ? { mode: `auto`, sourceMap: true } : undefined,
            // set "types" to "Ix.dom" if building scoped UMD target, otherwise "Ix.node"
            types: format === 'umd' ? `${mainExport}.dom.d.ts` : `${mainExport}.node.d.ts`,
        }
    )
);
