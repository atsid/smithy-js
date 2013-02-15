/**
 * @class SMITHY/BasePlate
 * Smithy framework element base providing facilities useful for all
 * framework elements.
 */
define([
    "./declare",
    "./util",
    "./AmdResolver",
    "./Logger",
    "./Slag"
], function (
    declare,
    Util,
    AmdResolver,
    Logger,
    Slag
) {

    var channels = [
        "GadgetStatusChange",
        "AreaStatusChange",
        "GadgetSpaceStatusChange",
        "GadgetRegistrationEvent",
        "SlagChange"
    ], models = [
        "GadgetAreaSchema"
    ], slag,
        util = new Util(),
        logger = new Logger("debug"),
        module = declare(null, {

        /**
         * Build the class in the constructor because most of the properties are
         * generated or their contents are conditional based on the value of config.
         * @param config
         */
        constructor: function (config) {

            var oldResolver,
                scratch,
                features = {
                    "hasMessaging": !util.isUndefined(config.channelFactory),
                    "hasModels": !util.isUndefined(config.modelFactory),
                    "hasServices": !util.isUndefined(config.serviceFactory)
                },
                that = this;

            this.config = config;

            this.config.features = this.features = features;

            this.pub = {};

            // Setup channel resolution so it will also resolve
            // channels in smithy.
            if (features.hasMessaging) {
                // can it already resolve?
                if (!config.factoriesConfigured) {
                    // if not add resolution for smithy channels
                    config.channelFactory.addResolver(new AmdResolver({
                        path: "smithy/schema/channels/"
                    }).resolver);
                }
            }

            // setup channels to publish on if bullhorn is present.
            //
            channels.forEach(function (channelName) {
                if (features.hasMessaging) {
                    var channel = config.channelFactory.get(channelName, that, "framework");
                    that.pub[channelName] = function (message) {
                        logger.debug("Sending message [" + channelName + "] from base plate", message);
                        channel.publish(message);
                    };
                } else {
                    that.pub[channelName] = function (message) {
                        logger.debug("Bullhorn not available for publishing on [" + channelName + "] from base plate", message);
                    };
                }
            });

            // detect model handling and setup smithy models.
            //
            this.asModel = function () {};
            if (features.hasModels) {
                // can it already resolve?
                if (!config.factoriesConfigured) {
                    // if not add resolution for smithy models
                    config.modelFactory.addResolver(new AmdResolver({
                        path: "smithy/schema/models/"
                    }).resolver);
                }
                this.asModel = function (modelName) {
                    return this.config.modelFactory.getModel(modelName, this);
                };
            }

            // Setup slag repository. It is a singleton for any derivatives of
            // BasePlate.
            if (!slag) {
                slag = new Slag({
                    useWebStorage: config.useWebStorageForSlag,
                    changeEvent: this.pub.SlagChange
                });
            }

            // access to the context data repository.
            this.setSlagData = function (path, value) {
                slag.set(path, value);
            };

            this.getSlagData = function (path) {
                slag.get(path);
            };

            // setup service support:
            this.loadModelData = function (modelName, id, callbacks) { callbacks.error(); };
            this.saveModelData = function (modelName, id, callbacks) { callbacks.error(); };
            if (features.hasServices) {
                this.loadModelData = function (modelName, id, callbacks) {
                    var data, svc = config.serviceFactory.getServiceForModel(modelName);
                    svc.readModel({id: id}, callbacks);
                };
                this.saveModelData = function (modelName, id, callbacks) {
                    var data, svc = config.serviceFactory.getServiceForModel(modelName);
                    if (id) {
                        svc.updateModel({id: id}, callbacks);
                    } else {
                        svc.createModel({id: id}, callbacks);
                    }
                };
            }

            // last
            config.factoriesConfigured = true;
        }
    });

    return module;

});
