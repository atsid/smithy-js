/**
 * @class SMITHY/GadgetArea
 * GadgetArea's are the primary unit of layout for a GadgetSpace. They can contain
 * either a single gadget or a collection of other GadgetArea's. They support a basic set
 * of layout methods - gadget, rows, columns, tabs, borders and a set of operations for their
 * areas or gadgets.
 * @config - {
 * }
 */
define([
    "./declare",
    "./util",
    "./Logger",
    "./BasePlate",
    "./Query"
], function (
    declare,
    Util,
    Logger,
    BasePlate,
    jsonQuery
) {

    var util = new Util(),
        logger = Logger("debug"),
        Thisctor = declare(BasePlate, {

        constructor: function (config) {
            var that = this;
            this.config = util.mixin({
                percentage: 100
            }, config);
            this.subAreas = [];
            Object.defineProperty(this, "address", {
                get: function () {
                    return that.getAddress();
                },
                enumerable: true
            });
        },

        initialize: function () {
            this.statusChange("CREATED");
        },

        /**
         * Retrieve the factory via a method to allow overriding.
         * @return a factory to use for this area.
         */
        getViewFactory: function () {
            return this.config.windowRef.window.smithyProxy.viewFactory;
        },

        /**
         * Retrieve the factory via a method to allow overriding.
         * @return a factory to use for this area.
         */
        getGadgetFactory: function () {
            return this.config.windowRef.window.smithyProxy.gadgetFactory;
        },

        /**
         * A convenience method to publish status changes.
         * @param status the status to publish
         */
        statusChange: function (status) {
            this.pub.AreaStatusChange({address: this.getAddress(), status: status });
        },

        /**
         * Contains the set of utility methods that help translate
         * and address areas in a particular layout.
         */
        layout: {
            address: function (idx, mode) {
                var names = ["left", "right", "top", "bottom", "center"],
                    ret;
                if (mode === "borders") {
                    ret = names[idx];
                } else if (mode !== "gadget") {
                    ret = mode + "[" + idx + "]";
                }
                return ret;
            },
            layout: function (area, mode) {
                var names = ["left", "right", "top", "bottom", "center"];
                if (mode !== "gadget") {
                    names.forEach(function (name, idx) {
                        area[name] = area.subAreas[idx];
                    });
                    area[mode] = area.subAreas;
                }
            },
            render: function (area, mode) {
                var names = ["left", "right", "top", "bottom", "center"],
                    parent = area.config.parent;

                if (mode === "gadget") {
                    if (area.gadget && !area.view) {
                        area.gadget.setupView();
                        area.view = area.getGadget().getView();
                        parent.render();
                    }
                } else {
                    if (!area.view) {
                        area.view = area.getViewFactory().createView(area, mode);
                    }
                    area.subAreas.forEach(function (subArea, idx) {
                        var name = (mode === "borders" ? names[idx] : undefined);
                        if (subArea) {
                            subArea.render();
                            if (!area.view.hasChild(subArea.view)) {
                                area.view.addChild(subArea.view, name);
                            }
                            if (parent.renderedOnce &&
                                    !parent.view.hasChild(area.view)) {
                                parent.render();
                            }
                        }
                    });
                    area.view.startup();
                }
            },
            remove: function (obj, idx, mode) {
                var names = ["left", "right", "top", "bottom", "center"];
                if (mode === "borders") {
                    obj.subAreas[idx] = undefined;
                    obj[names[idx]] = undefined;
                } else {
                    obj.subAreas.splice(idx, 1);
                }
            },
            index: function (address, mode) {
                var ret, names = {"left": 0, "right": 1, "top": 2, "bottom": 3, "center": 4};
                if (mode === "borders") {
                    ret = names[address];
                } else if (mode !== "gadget") {
                    ret = address.match(/[0-9]+/)[0];
                }
                return ret;
            },
            impliedMode: function (address) {
                var prefixes = {"win": "windows", "row": "rows", "col": "columns", "tab": "tabs"},
                    found = prefixes[address.substring(0, 3)];
                return found || "borders";
            }
        },

        /**
         * Get the string address of this area. Its address is a direct representation of
         * its placement in a tree of areas starting at the base gadgetspace.
         * @param {SMITHY/GadgetArea} area the sub area to return the address of or undefined for this area.
         * @return the address of the area.
         */
        getAddress: function (area) {
            var address = "";
            if (this.config.parent) {
                address = this.config.parent.getAddress(this);
            }
            if (area) {
                address = address + "/" + this.getSubAddress(area);
            }
            return address;
        },

        /**
         * Get relative string address of the immediate sub-area by finding the area
         * in the sub-area array and using the address methods.
         * @param area the area to return the relative address for.
         * @return the relative address of the area.
         */
        getSubAddress: function (area) {
            var ret = "";
            this.subAreas.forEach(function (obj, idx) {
                if (obj === area) {
                    ret = this.layout.address(idx, this.config.layoutMode);
                }
            }, this);
            return ret;
        },

        /**
         * Set the method used to layout this area's sub-areas. An error is thrown if a gadget is attached
         * and the mode is anything other than "gadget".
         * @param {string} mode can be:
         *  "gadget" - the area has no sub areas only a gadget.
         *  "rows" - the sub-areas are laid out top to bottom in rows.
         *  "columns" - the sub-areas are laid out left to right in columns
         *  "tabs" - the sub-areas are laid out as tabs from left to right.
         *  "borders" - the sub areas are laid out in regions - left, right, top, bottom, center
         * @param {boolean} relayout - layout children again if a layout mode already exists, default false.
         * @return undefined
         */
        setLayoutMode: function (mode, relayout) {
            this.config.layoutMode = mode;
            if (relayout) {
                this.layout.layout(this, mode);
            }
        },

        /**
         * Add an area at the given address, creating it if doesn't exist and no area is passed.
         * The address is interpreted as relative to this area.
         * @param address
         * @param createIntermediateAreas - create intermediate areas if they don't exist otherwise fail.
         *      default is false.
         * @param area
         * @return a safe version of the new area or "area" if passed.
         */
        addArea: function (address, createIntermediateAreas, area) {
            var massagedAddress = address.charAt(0) === '/' ? address.slice(1) : address,
                areas = massagedAddress.split("/"),
                first = areas.shift(),
                top,
                isLast = !areas.length,
                ret,
                newConfig = {};

            if (!this.config.layoutMode) {
                this.config.layoutMode = this.layout.impliedMode(first);
            }

            top = (first === "next" ? this.subAreas.length :
                    this.layout.index(first, this.config.layoutMode));

            // if this area does not exist then create it.
            if (!this.subAreas[top]) {
                util.mixin(newConfig, this.config);
                if (!createIntermediateAreas && !isLast) {
                    throw new Error("Missing intermediate area: " + first);
                }
                newConfig.parent = this;
                newConfig.layoutMode = this.layout.impliedMode(areas[0] || first);
                if (isLast) {
                    this.subAreas[top] = area || this.createSubArea(newConfig);
                } else {
                    this.subAreas[top] = this.createSubArea(newConfig);
                }
                this.subAreas[top].initialize();
            }
            if (!isLast) {
                ret = this.subAreas[top].addArea(areas.join("/"), createIntermediateAreas, area);
            } else {
                ret = this.subAreas[top];
            }
            this.setLayoutMode(this.config.layoutMode, true);
            return ret;
        },

        /**
         * Isolate subarea creation so it can be overridden.
         * @param config
         * @return {*}
         */
        createSubArea: function (config) {
            return new Thisctor(config);
        },

        /**
         * Remove the area at address relative to this area.
         * @param address
         * @return the removed area
         */
        removeArea: function (address) {
            var area = this.getArea(address);
            return area.config.parent.removeSubArea(area);
        },

        /**
         * Remove an immediate child of this area.
         * @param area the sub-area to remove.
         * @return the removed area
         */
        removeSubArea: function (area) {
            util.some(this.subAreas, function (obj, idx) {
                if (obj === area) {
                    this.removeSubAreaAtIndex(obj, idx);
                }
            }, this);
            return area;
        },

        /**
         * Remove an immediate child of this area.
         * @param area the sub-area to remove.
         * @param idx index of subarea.
         * @return the removed area
         */
        removeSubAreaAtIndex: function (area, idx) {
            if (this.view) {
                this.view.removeChild(area.view);
            }
            area.destroy();
            this.layout.remove(this, idx, this.config.layoutMode);
            return area;
        },

        /**
         * Get a safe version of the area at the address relative to this area.
         * @param address
         * @return a safe version of the area
         */
        getArea: function (address) {
            var query = address.replace(/\//g, "."), ret;
            if (query.charAt(0) !== '.') {
                query = "." + query;
            }
            ret = this.getAreas(query);
            return (ret && ret.length) ? ret[0] : ret;
        },

        /**
         * Get a collection of areas based on the query relative to this area.
         * @param query
         * * @return a collection of safe areas
         */
        getAreas: function (query) {
            return jsonQuery(query, this);
        },

        /**
         * Set the gadget belonging to this area. Will fail if area isn't empty.
         * @param gadget
         * @param descriptor
         * @return undefined
         */
        setGadget: function (gadget, descriptor) {
            this.setLayoutMode("gadget");
            this.gadget = gadget;
            this.gadget.parent = this;
            this.gadgetDescriptor = descriptor;
        },

        /**
         * Remove the gadget belonging to this area.
         * @return undefined
         */
        removeGadget: function () {
            var parent = this.config.parent;
            if (this.gadget) {
                if (this.view !== this.gadget && this.view) {
                    this.view.destroy();
                } else if (parent) {
                    parent.view.removeChild(this.gadget);
                }
                this.gadget.destroy();
                this.gadget = undefined;
                this.view = undefined
            }
        },

        /**
         * Does this area have an attached gadget.
         * @return a safe version of the gadget or undefined
         */
        hasGadget: function () {
            return this.config.layoutMode === "gadget" && this.getGadget();
        },

        /**
         * Get a safe version of the gadget belonging to this area or undefined.
         * @return a safe version of the gadget or undefined
         */
        getGadget: function () {
            return this.gadget;
        },

        /**
         * Load the gadget into this area. Some machinations
         * necessary to load model data and handle asynchronous gadget creation.
         * @param descriptor the registered gadget descriptor
         * @param gadgetSpace the gadget space requesting the load.
         * @param data additionalData to pass to gadget
         * @return undefined
         */
        loadGadget: function (descriptor, gadgetSpace, data) {
            var gadget, that = this,
                initData = util.mixin(
                    util.mixin(
                        util.mixin({}, descriptor.data),
                        data),
                    this.config.gadgetSpace.lastRouteParams || {}
                ),
                gConfig = util.mixin(
                    {
                        gadgetSpace: gadgetSpace,
                        initData: initData
                    },
                    that.config
                ),
                setupGadget = function (gadget) {
                    that.setGadget(gadget, descriptor);
                    gadget.setupLifecycle();
                },
                // method to create the gadget when config data is loaded
                // and the window is created.
                createGadget;

            // if we want asynchronous gadget creation, call the right
            // factory method.
            if (!that.config.async) {
                createGadget = function () {
                    gadget = that.getGadgetFactory().getGadget(
                        descriptor.gadget,
                        gConfig
                    );
                    setupGadget(gadget);
                };
            } else {
                createGadget = function () {
                    gadget = that.getGadgetFactory().getGadgetAsync(
                        descriptor.gadget,
                        gConfig,
                        setupGadget,
                        that
                    );
                };
            }

            // if we have a model then load the model before
            // we create the gagdget.
            this.whenWindowCreated(function () {
                if (!descriptor.data && descriptor.configModel) {
                    that.loadModelData(descriptor.configModel, descriptor.configId, {
                        load: function (data, params, total) {
                            descriptor.data = data;
                            createGadget();
                        },
                        error: function (data, params) {
                            createGadget();
                        }
                    });
                } else {
                    createGadget();
                }
            });
        },

        /**
         * Find the area that contains the passed gadget by name.
         * @param gadget to remove
         * @return the removed gadget.
         */
        findGadget: function (gadget) {
            var gadgetName = (gadget && gadget.name) || gadget || "",
                ret = this.findAreas(function (area) {
                    var gadget = area.getGadget();
                    return (gadget && gadget.name && gadget.name === gadgetName);
                }, this);
            return ret;
        },

        /**
         * Detach this area and make it a top-level area.
         * @return a safe version of the new area.
         */
        detach: function () {
            throw new Error("not implemented");
        },

        /**
         * Render the gadget area and sub areas
         */
        render: function () {
            var that = this, parent = that.config.parent;

            this.whenWindowCreated(function () {
                if (!parent.view && !that.isWindow) {
                    parent.render();
                } else {
                    that.layout.render(that, that.config.layoutMode);
                }
                that.renderedOnce = true;
                that.statusChange("RENDERED");
            });
        },

        /**
         * Perform the predicate over all areas and sub-areas
         * halting and returning when predicate returns truthy.
         * @param predicate - the method to call that takes an area
         *     as an argument and returns truthy to terminate.
         * @param scope - scope to call the method in.
         * @return the result of a truthy call or undefined if none.
         */
        findArea: function (predicate, scope, depthFirst) {
            var ret;
            this.subAreas.some(function (area, idx) {
                ret = predicate.call(scope, area);
                if (!ret && depthFirst) {
                    if (depthFirst) {
                        ret = area.findArea(predicate, scope, depthFirst);
                    }
                }
                return ret;
            });
            if (!ret && !depthFirst) {
                this.subAreas.some(function (area, idx) {
                    ret = area.findArea(predicate, scope, depthFirst);
                });
            }
            return ret;
        },

        /**
         * Perform the predicate over all areas and sub-areas
         * returning an array of areas that match.
         * @param predicate - the method to call that takes an area
         *     as an argument and returns truthy to include.
         * @param scope - scope to call the method in.
         * @return the resulting array
         */
        findAreas: function (predicate, scope) {
            var ret = [];
            this.traverseAreas(function (area) {
                if (predicate.call(scope, area)) {
                    ret.push(area);
                }
            });
            return ret;
        },

        /**
         * Perform the predicate over all areas and sub-areas.
         * @param predicate - the method to call that takes an area
         *     as an argument.
         * @param scope - scope to call the method in.
         * @return undefined
         */
        traverseAreas: function (predicate, scope) {
            this.subAreas.forEach(function (area, idx) {
                if (area) {
                    predicate.call(scope, area);
                    area.traverseAreas(predicate, scope);
                }
            });
        },

        /**
         * Perform the callback when the root window has been successfully created.
         * @param callback
         */
        whenWindowCreated: function (callback) {
            this.config.parent.whenWindowCreated(callback);
        },

        /**
         * Destroy this area's view, recursively if requestd.
         * @param shallow - only destroy this area.
         */
        destroy: function (shallow) {
            if (!shallow) {
                this.subAreas.forEach(function (subArea) {
                    if (subArea) {
                        subArea.destroy(false);
                    }
                });
                this.subAreas = [];
            }
            if (this.hasGadget()) {
                this.removeGadget();
            } else if (this.view) {
                this.view.destroy();
            }
            this.statusChange("DESTROYED");
        },

        /**
         * Create all the areas and gadgets represented by the given serialized layout.
         * @param serializedLayout - serialized form a area/gadget layout.
         * @param leaveCurrentLayout - destroy the current layout before rendering, false by default.
         * @return undefined
         */
        realizeLayout: function (serializedLayout, leaveCurrentLayout) {
            var layout, realize = function (part) {
                if (part.address) {
                    if (part.gadget) {
                        this.config.gadgetSpace.loadGadgetTo(part.gadget.name, part.address, true);
                    }
                }
                part.subAreas.forEach(realize, this);
            };
            if (this.subAreas.length > 0 && !leaveCurrentLayout) {
                this.subAreas.some(function (obj, idx) {
                    this.removeSubAreaAtIndex(obj, idx);
                }, this);
            }
            if (typeof (serializedLayout) === "string") {
                layout = JSON.parse(serializedLayout);
            } else {
                layout = serializedLayout;
            }
            realize.call(this, layout);
            this.render();
        },

        /**
         * Retrieve a serialized version of the current layout.
         * @return the layout as a string based on the GadgetArea model.
         */
        getSerializedLayout: function () {
            return JSON.stringify(this.asModel("GadgetAreaSchema"));
        }

    });

    return Thisctor;
});
