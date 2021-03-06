module.exports = {
    ...require('../jest.config'),
    "globals": {
        "ts-jest": {
            "diagnostics": false,
            "tsConfig": "spec/tsconfig/tsconfig.esnext.cjs.json"
        }
    },
    "moduleNameMapper": {
        "^ix(.*)": "<rootDir>/targets/esnext/cjs$1"
    }  
};
