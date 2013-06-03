/**
 * Json Query placeholder
 */
define([
    "./JSONQuery"
 ], function (
    JSONQuery
 ) {

    var module = function queryFunction(query, obj) {
        return JSONQuery(query, obj);
    };
    return module;
});