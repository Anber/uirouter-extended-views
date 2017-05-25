(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'js-md5'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('js-md5'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.jsMd5);
        global.utils = mod.exports;
    }
})(this, function (exports, _jsMd) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getFullToken = getFullToken;
    exports.getFullViewName = getFullViewName;

    var _jsMd2 = _interopRequireDefault(_jsMd);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function getFullToken(viewName, origToken) {
        var sync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var viewHash = (0, _jsMd2.default)(viewName);
        return origToken + '$' + viewHash + (sync ? '$sync' : '');
    }

    function getFullViewName(_ref) {
        var _ref$viewDecl = _ref.viewDecl,
            stateName = _ref$viewDecl.$uiViewContextAnchor,
            viewName = _ref$viewDecl.$name;

        return viewName.indexOf('@') >= 0 ? viewName : viewName + '@' + stateName;
    }
});