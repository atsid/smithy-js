/**
 * Json Query placeholder
 */
define([
 ], function (
 ) {

    var module = function queryFunction(query, obj) {
        if (window.JSONQuery) {
            return window.JSONQuery(query, obj);
        }
    };
    return module;
});