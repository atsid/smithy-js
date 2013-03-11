/**
 * @class SMITHY/GadgetSpace
 * A GadgetSpace provides an abstraction for:
 *  1. A user-interface surface composed of multiple trees of
 *    GadgetArea's with the root GadgetArea of each tree housed in a separate
 *    browser window controlled by the GadgetSpace.
 *  2. Methods for managing GadgetAreas in the GadgetSpace via a string address
 *     related to their position. (e.g. /window[1]/row[0]/column[0]/left).
 *  3. A container for Gadget types managed by the GadgetSpace. Gadget types are registered
 *    with the GadgetSpace, and instances of the Gadgets are created and their life-cycles and
 *    environment are controlled by the GadgetSpace.
 *  4. Provide a gadget data repository.
 */
define([
    "./declare",
    "./util",
    "./GadgetFactory",
    "./lifecycle/Registry",
    "./GadgetArea",
    "./BasePlate",
    "./GadgetAreaWindow",
    "./md5",
    "./PageRouter"
], function (
    declare,
    Util,
    GadgetFactory,
    Registry,
    GadgetArea,
    BasePlate,
    Window,
    md5,
    Router
) {
    var util = new Util(),
        module = declare([BasePlate, GadgetArea], {

        /**
         * @constructor
         * @param config - configuration object providing:
         *  {
         *     usePageRouting - "hash" for routing via the hash, "url" for routing via an updated url and falsey for no routing.
         *                      Page routing involves saving and re-rendering of the GadgetSpace via getSerializedLayout()
         *                      and realizeLayout() and in the case of "url" routing re-rendering the page as well.
         *     useWebStorageForSlag - truthy means store slag data in localStorage.
         *     gadgetFactory {SMITHY/GadgetFactory}- a factory for creating gadgets based on a name.
         *     serviceFactory {SALTMINE/ServiceFactory}- a factory for accessing services.
         *     channelFactory {BULLHORN/ChannelFactory}- a factory for creating pubsub channels.
         *     modelFactory {SCHEMATIC/ModelFactory}- a factory for creating model objects.
         *     viewFactory - a factory for creating view objects
         *  }
         */
        constructor: function (config) {
            var newWindow, that = this;

            // store config
            this.config = util.mixin({
                gadgetFactory: new GadgetFactory(),
                gadgetSpace: this
            }, config);
            this.registry = new Registry();

            // setup page routing.
            if (this.config.usePageRouting) {
                this.router = new Router({
                    mode: this.config.usePageRouting,
                    urlPattern: /[0-9a-f][0-9a-f]+$/
                });
                this.router.register(/[0-9a-f][0-9a-f]+$/, function (evt) {
                    that.processStoredLayout(evt.newPath);
                });
                this.router.startup();
            }

            // add properties for serialization
            Object.defineProperty(this, "gadgetRegistry", {
                get: function () {
                    return this.registry.getDescriptorArray(this.registry.locGadgets);
                },
                set: function (value) {
                },
                enumerable: true
            });
            this.layoutData = this;

            // create the main window
            this.createMainWindow();
        },

        /**
         * Retrieve a stored layout for a particular key.
         * @param key
         * @return {*}
         */
        getStoredLayout: function (key) {
            return this.getSlagData(key);
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
         * @param key - the key to find the layout.
         */
        processStoredLayout: function(key) {
            var layout = this.getStoredLayout(key);
            if (layout) {
                this.realizeLayout(JSON.parse(layout));
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
         * Publishes a GadgetSpaceStatusChange for this gadget space.
         * @param status - the status to publish.
         */
        statusChange: function (status) {
            this.pub.GadgetSpaceStatusChange({status: status});
        },

        /**
         * Override createSubArea because GadgetSpace always has windows as
         * sub-areas.
         * @param config - config for the new Window
         * @return the new window.
         */
        createSubArea: function (config) {
            return new Window(config);
        },

        /**
         * Make sure the primary window (windows[0]) is created with the
         * current window.
         */
        createMainWindow: function () {
            // create the main window
            this.config.layoutMode = undefined;
            var newWindow = new Window(util.mixin({
                "window": window,
                "parent": this
            }, this.config));

            this.subAreas = [newWindow];
        },

        /**
         * Register a gadget type with the gadget space.
         * @param name - the name of the gadget resolvable by the factory.
         * @param descriptor - Properties describing how the gadget should behave in the GadgetSpace:
         *  {
         *     gadget - the gadget to load instead of "name" so a gadget can be registered multiple times with different names.
         *     data - static initialization data in the form understood by the gadget.
         *     configModel - the model used by the gadgets config data.
         *     configId - the id used to retrieve an instance of the config model, by default the gadget name is used
         *                as the id.
         *     activationChannel - activate this gadget when a message is published on this channel and passes the filter.
         *     channelFilter - filter to apply to the above channel subscription.
         *     openRule - a function that takes the address of an originating Gadget area and returns a target
         *                   gadget area to open a gadget in.
         *     image - visual representation of the gadget.
         *  }
         * @param factory - an override for the default gadget factory provided in the
         *                  configuration for this GadgetSpace.
         * @return undefined
         */
        addGadget: function (name, descriptor, factory) {
            var desc = util.mixin(
                {
                    name: name,
                    gadget: name,
                    factory: factory || this.config.gadgetFactory
                },
                descriptor
            );
            this.registry.addToRegistry(this.registry.locGadgets, name, desc);
            this.pub.GadgetRegistrationEvent({gadget: name, descriptor: desc, event: "GADGETADDED"});
        },

        /**
         * Un-register a gadget from the gadget space.
         * @param name - name of the gadget.
         * @param destroyActiveInstances - should current instances of this gadget be destroyed.
         * @return undefined
         */
        removeGadget: function (name, destroyActiveInstances) {
            this.registry.removeFromRegistry(name, this.registry.locGadgets);
            this.pub.GadgetRegistrationEvent({gadget: name, event: "GADGETREMOVED"});
        },

        /**
         * Override remove sub area so that we always keep window 0.
         * @param area - the area being removed
         * @param idx - the index of the area
         */
        removeSubAreaAtIndex: function (area, idx) {
            this.inherited(arguments);
            if (idx === 0) {
                this.createMainWindow();
            }
        },

        /**
         * Create an instance of a gadget and place it in the area at the supplied address,
         * creating the associated area(s) if necessary.
         * @param gadgetName - name of the gadget to create.
         * @param areaAddress - the target area for the gadget.
         * @param createIntermediateAreas - create intermediate areas if they don't exist otherwise fail.
         *      default is false.
         * @return safe version of the area containing the gadget.
         */
        loadGadgetTo: function (gadgetName, areaAddress, createIntermediateAreas) {
            var gadget = this.registry.getRegistryItem(this.registry.locGadgets, gadgetName),
                area = this.addArea(areaAddress, createIntermediateAreas);
            area.loadGadget(gadget, this);
            return area;
        },

        /**
         * Move the area at one address to another.
         * @param fromAddress - the address to move from.
         * @param toAddress - the address to move to.
         * @param createIntermediateAreas - create intermediate areas if they don't exist otherwise fail.
         *      default is false.
         * @return undefined
         */
        moveArea: function (fromAddress, toAddress, createIntermediateAreas) {
            throw new Error("Not Implemented");
        },

        /**
         * Check if an area exists at a give address.
         * @param address
         * @return true or false
         */
        doesAreaExist: function (address) {
            throw new Error("Not Implemented");
        },

        /**
         * Make the area at address a root area (in its own window).
         * @param address - to detach.
         * @return a safe version of the new area.
         */
        detachArea: function (address) {
            throw new Error("Not Implemented");
        },

        /**
         * Iterate predicate over the registered gadget descriptors. The predicate
         * takes the descriptor as an argument.
         * @param predicate - the predicate to call.
         * @param scope - the scope to call it in.
         * @return undefined
         */
        enumerateGadgetDescriptors: function (predicate, scope) {
            this.registry.enumerateEntries(this.registry.locGadgets, function (val, key, obj) {
                predicate.call(scope, val);
            });
        },

        /**
         * Realize a default layout unless page routing dictates that
         * a stored layout should be used.
         */
        realizeWithRouting: function (defaultLayout) {
            if (this.router && this.router.isDefault()) {
                this.realizeLayout(defaultLayout);
            }
        },

        /**
         * Override realizeLayout to take a GadgetSpace model, so gadget registration
         * can be handled first, then the layout by passing up the inheritance chain.
         * @param gadgetSpace - the gadgetSpace model to realize.
         * @return undefined
         */
        realizeLayout: function (gadgetSpace) {
            var gadgets = gadgetSpace.gadgetRegistry || [];
            this.registry.clear(this.registry.locGadgets);
            gadgets.forEach(function (key, idx, obj) {
                this.addGadget(obj[idx].name, obj[idx]);
            }, this);
            arguments[0] = gadgetSpace.layoutData;
            this.inherited(arguments);
        },

        /**
         * Override to take a GadgetSpace model, so gadget registration
         * can be handled first, then the layout by passing up the inheritance chain.
         * @param asObject - get the layout as an object.
         * @return JSON representation of this gadgetspace.
         */
        getSerializedLayout: function (asObject) {
            var ret = this.asModel("GadgetSpaceSchema");
            return (asObject ? ret : JSON.stringify(ret));
        },

        /**
         * Initiate rendering for the whole gadget space. It waits on the creation
         * of all windows before publishing the "RENDERED" message.
         */
        render: function () {
            var that = this, i = 0;
            this.subAreas.forEach(function (area, idx) {
                area.whenWindowCreated(function () {
                    i += 1;
                    area.render();
                    if (i === that.subAreas.length) {
                        that.statusChange("RENDERED");
                    }
                });
            });
        }

    });

    return module;

});
