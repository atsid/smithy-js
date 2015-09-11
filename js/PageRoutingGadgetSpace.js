"use strict";
/**
 * @class SMITHY/PageRoutingGadgetSpace
 * A GadgetSpace that allows for clean url or hash page routing via serialized and realized layouts.
 * Routing can be specification based to provide explicit urls or ad hoc.
 */
define([
    "./declare",
    "./util",
    "./GadgetSpace",
    "./PageRouter"
], function (
    declare,
    Util,
    GadgetSpace,
    Router
) {
    var util = new Util(),
        module = declare([GadgetSpace], {

        /**
         * @constructor
         * Adds the following config to that provided by a GadgetSpace:
         * @param config - configuration object providing:
         *  {
         *     usePageRouting - "hash" for routing via the hash, "url" for routing via an updated url and falsey for no routing.
         *                      Page routing involves saving and re-rendering of the GadgetSpace via getSerializedLayout()
         *                      and realizeLayout() and in the case of "url" routing re-rendering the page as well.
         *     routingSpecification - to support explicit paths for GadgetSpace layouts a specification can be passed of the following form:
         *       [
         *          rootPattern: a regular expression that matches the entire root pathName (minus protocol and host) of the application
         *                      including compensating for trailing slash
         *          routes: {
         *               "nameOfRouteUsedByTheApp" : {
         *                   id: idUsedToRetrieveLayout
         *                   url: partialUrlPathToMatchAsAStringIncludingEmbeddedParams (e.g. pathtomap/{paramname}/morepath)
         *               },
         *               default: {// special name used by gadgetspace for routing to the default (application root) layout.
         *                    id: "idtodefaultlayout"
         *               },
         *               error: {// special name used by gadgetspace for routing to a layout if there is an error loading the layout.
         *                    id: "idtodefaultlayout"
         *               }
         *          }
         *       ]
         *
         *  }
         */
        constructor: function (config) {
            var that = this, routingSpec = config && config.routingSpecification;

            this.lastRouteParams = {};

            // setup page routing.
            if (this.config.usePageRouting) {
                this.router = new Router({
                    mode: this.config.usePageRouting,
                    rootPattern: (routingSpec && routingSpec.rootPattern) || /.*/,
                    noMatch: function (loc) {
                        var errorRoute = routingSpec && routingSpec.routes.error;
                        if (errorRoute) {
                            that.lastRouteParams = that.processRouteParams(loc, errorRoute);
                            that.processStoredLayout(loc, errorRoute);
                        }
                    }
                });
                // if there's a routing spec then use it
                if (routingSpec) {
                    Object.keys(routingSpec.routes).forEach(function (key, idx, obj) {
                        var val = routingSpec.routes[key],
                            rgx;
                        if (key !== "error") {
                            rgx = val.url.replace(/\{.*\}/, "([^/]*)") || "$";
                            if(rgx.charAt(rgx.length - 1) !== "$") {
                                 rgx += "$";
                            }
                            that.router.register(new RegExp(rgx), function (loc) {
                                that.lastRouteParams = that.processRouteParams(loc, val);
                                that.processStoredLayout(loc, val);
                            });
                        }
                    });
                } else { // register default pattern for adhoc routing.
                    this.router.register(/[0-9a-f][0-9a-f]+$/, function (loc) {
                        that.processStoredLayout(loc);
                    });
                }
                this.router.startup();
            }
        },

        /**
         * Retrieve a stored layout for a particular key, asynchronously
         * if a callback is specified and resource is not immediately available.
         * @param key - the id of the stored layout
         * @param callback - the callback to process the loaded layout, it takes one
         *                   argument, the returned layout
         * @return the layout if synchronous, otherwise undefined
         */
        getStoredLayout: function (key, callback) {
            var ret = this.getSlagData(key);
            if (!ret) {
                require({async: callback ? true : false}, [key], function(val) {
                    ret = val;
                    if (callback) {
                        callback(val);
                    }
                });
            }
            return ret;
        },

        /**
         * Re-render if a layout for the given key is found.
         * @param key - the object containing key to find the layout.
         * @param route - the route descriptor if there is one.
         */
        processStoredLayout: function(key, route) {
            var id = (route && route.id) || key.pathname,
                layout = this.getStoredLayout(id);
            if (typeof layout === 'string') {
                this.realizeLayout(JSON.parse(layout), true);
            } else {
                this.realizeLayout(layout, true);
            }
        },

        /**
         * Given a route and a location produce an object that contains
         * both embedded parameters and query parameters.
         * @param route
         * @param location
         * @return params object
         */
        processRouteParams: function (location, route) {
            var ret,
                qparams = (location.search && location.search.substring(1).split("&")) || [],
                params = (route.url && route.url.match(/{(.*?)}/g)) || [],
                values = location.pathname.match(
                    (route.url && route.url.replace(/{.*?}/g, "(.*)")) || []
                ).splice(1);
            params.forEach(function (key, idx, obj) {
                ret = ret || {};
                ret[key.replace(/[{}]/g, "")] = decodeURIComponent(values[idx]);
            });
            qparams.forEach(function (key, idx, obj) {
                var pair = key.split("=");
                ret = ret || {};
                ret[pair[0]] = decodeURIComponent(pair[1]);
            });

            return ret;
        },

        /**
         * If page routing is being used and there is a routing spec, route to
         * the given route name.  If a key matches a replace value in the path,
         * that key is removed from the params clone so as not to show up in the
         * query string as well as in the path.
         */
        routeTo: function(name, params, hashParams) {
            var path, route, routingSpec = this.config.routingSpecification,
                embedded, paramsClone = util.mixin({}, params);
            if (this.router && routingSpec && routingSpec.routes[name]) {
                route = routingSpec.routes[name];
                // set path to default
                path = route.url;
                // replace params
                embedded = route.url.match(/{(.*?)}/g) || [];
                embedded.forEach(function (key, idx, obj) {
                    var val = paramsClone && paramsClone[key.replace(/[{}]/g, "")];
                    if (val) {
                        path = path.replace(key, encodeURIComponent(val));
                        delete paramsClone[key.replace(/[{}]/g, "")];
                    }
                });
                this.router.go(path, paramsClone, hashParams || {});
            }
        },

        /**
         * If page routing is enabled on the GadgetSpace this method will get a serialized
         * version of the current layout, take an md5 of it, store the layout
         * and then route the page to it which will:
         * - if "hash" was specified, this will cause the hash to be updated with the md5 key which
         *   will in turn cause the layout to be retrieved and realized within this gadget space.
         * - if "url" was specified, this will cause the url path to be update with the md5 which will reload the
         *   page. (using realizeWithRouting() in that page will cause the layout to be retrieved and
         *   realized).
         */
        routePage: function() {
            if (this.router) {
                // save layout and route
                this.router.go(this.stashLayout());
            }
        },

        /**
         * Realize a default layout unless page routing dictates that
         * a stored layout should be used.
         * @param layout the layout to realize
         * @param ignoreRouting whether page routing should be ignored.
         */
        realizeLayout: function (layout, ignoreRouting) {
            if ((this.router && this.router.isDefault() && layout) ||
                ignoreRouting) {
                this.inherited(arguments);
            }
        }
    });

    return module;

});
