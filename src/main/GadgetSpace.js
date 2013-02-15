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
    "./GadgetAreaWindow"
], function (
    declare,
    Util,
    GadgetFactory,
    Registry,
    GadgetArea,
    BasePlate,
    Window
) {
    var util = new Util(),
        module = declare([BasePlate, GadgetArea], {

        /**
         * @constructor
         * @param config - configuration object providing:
         *  {
         *     gadgetFactory {SMITHY/GadgetFactory}- a factory for creating gadgets based on a name.
         *     serviceFactory {SALTMINE/ServiceFactory}- a factory for accessing services.
         *     channelFactory {BULLHORN/ChannelFactory}- a factory for creating pubsub channels.
         *     modelFactory {SCHEMATIC/ModelFactory}- a factory for creating model objects.
         *     viewFactory - a factory for creating view objects
         *  }
         */
        constructor: function (config) {
            var newWindow;

            // store config
            this.config = util.mixin({
                gadgetFactory: new GadgetFactory(),
                gadgetSpace: this
            }, config);
            this.registry = new Registry();

            // create the main window
            this.createMainWindow();
        },

        statusChange: function (status) {
            this.pub.GadgetSpaceStatusChange({status: status});
        },

        createSubArea: function (config) {
            return new Window(config);
        },

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
            this.registry.addToRegistry(this.registry.locGadgets, name, util.mixin(
                {
                    name: name,
                    factory: factory || this.config.gadgetFactory
                },
                descriptor
            ));
            this.pub.GadgetRegistrationEvent({gadget: name, event: "GADGETADDED"});
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
         * takes the descriptor as a predicate.
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
