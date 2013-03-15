/**
 * @class SMITHY/PageRoutingGadgetSpace
 * A GadgetSpace that allows for clean url or hash page routing via serialized and realized layouts.
 * Routing can be specification based to provide explicit urls or ad hoc.
 */
define([
    "./declare",
    "./util",
    "./GadgetSpace",
    "./md5",
    "./PageRouter"
], function (
    declare,
    Util,
    GadgetSpace,
    md5,
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
            var that = this, routingSpec = config.routingSpecification;

            this.lastRouteParams = {};

            // setup page routing.
            if (this.config.usePageRouting) {
                this.router = new Router({
                    mode: this.config.usePageRouting,
                    rootPattern: (routingSpec && routingSpec.rootPattern) || /.*/
                });
                // if there's a routing spec then use it
                if (routingSpec) {
                    Object.keys(routingSpec.routes).forEach(function (key, idx, obj) {
                        var val = routingSpec.routes[key],
                            rgx;
                        if (key !== "error") {
                            rgx = val.url.replace(/\{.*\}/, "(.*)") || "^$";
                            that.router.register(new RegExp(rgx), function (evt) {
                                that.lastRouteParams = that.processRouteParams(evt, val);
                                that.processStoredLayout(evt, val);
                            })
                        }
                    });
                } else { // register default pattern for adhoc routing.
                    this.router.register(/[0-9a-f][0-9a-f]+$/, function (evt) {
                        that.processStoredLayout(evt);
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
            ret = this.getSlagData(key);
            if (!ret) {
                require({async: callback ? true : false}, [key], function(val) {
                    ret = val;
                    callback && callback(val);
                });
            }
            return ret;
        },

        /**
         * Saved a layout for a particular key.
         * @param key - key to store the layout under
         * @param layout - the layout to store.
         */
        saveStoredLayout: function (key, layout) {
            this.setSlagData(key, layout);
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
                params = route.url.match(/{(.*?)}/g) || [],
                values = location.pathname.match(
                    route.url.replace(/{.*?}/g, "(.*)")
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
         * the given route name.
         */
        routeTo: function(name, params) {
            var path, route, routingSpec = this.config.routingSpecification,
                embedded;
            if (this.router && routingSpec && routingSpec.routes[name]) {
                route = routingSpec.routes[name];
                // set path to default
                path = route.url;
                // replace params
                embedded = route.url.match(/{(.*?)}/g) || [];
                embedded.forEach(function (key, idx, obj) {
                    var val = params && params[key.replace(/[{}]/g, "")];
                    if (val) {
                        path = path.replace(key, encodeURIComponent(val));
                    }
                });
                this.router.go(path, params);
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
            var layout, md5Id;
            if (this.router) {
                // save layout.
                layout = this.getSerializedLayout();
                md5Id = md5(layout);
                this.saveStoredLayout(md5Id, layout);
                this.router.go(md5Id);
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
