/**
 * Component lifecycle methods related to pubsub. Any component that wants to use pubsub
 * should include the Messaging lifecycle, so that a standard lifecycle can be applied.
 * This has additional benefits to development, including (a) the establishment of registry for runtime
 * introspection of functionality, and (b) helper methods available to the component for boilerplate reduction.
 *
 * Any component utilizing Messaging should use the following practices:
 * 1) Override the setupMessaging method, and include all pubsub-related setup in this method only.
 * 2) Use the registerPublisher and registerSubscriber helper methods to do all publish declaration and subscribing within setupMessaging.
 * This will ensure that the lifecycle is properly applied, and that elements such as the registry stay up-to-date.
 */
define([
    "../declare",
    "../util",
    "./Registry",
    "../Logger"
], function (
    declare,
    Util,
    Registry,
    Logger
) {
    var body,
        util = new Util(),
        logger = new Logger("debug"),
        module = declare(null, body = {

        constructor: function (config) {
            
            // private method for framework publishing.
            var registerFrameworkPublisher = function (channelName) {
                var channel = this.channelFactory.get(channelName, this, "framework");

                this.pub[channelName] = function (message) {
                    logger.debug("Sending message [" + channelName + "] from gadget", message);
                    channel.publish(message);
                };

                this.registry.addToRegistry(this.registry.locPublishes, channel.channelName, channel);
            };

            if (config.features.hasMessaging) {
                this.pub = {};
                this.channelFactory = config && config.channelFactory;
                //all lifecycles should init the registry if it hasn't already been done.
                if (!this.registry) {
                    this.registry = new Registry();
                }
                registerFrameworkPublisher.call(this, "GadgetStatusChange");
            } else {
                Object.keys(body).forEach(function (key, idx, obj) {
                    var val = body[key];
                    if (typeof val === 'function' && obj.hasOwnProperty(key)) {
                        this[key] = function () {};
                    }
                }, this);
            }
        },

        /**
         * Standard lifecycle method for setup.
         * Provides a consistent location to setup messaging for a component that uses pubsub.
         * Should typically be populated with registerPublisher and registerSubscriber calls.
         * Be sure to call this.inherited(arguments) to ensure parent components are initialized for messaging.
         */
        setupMessaging: function () {
        },

        /**
         * Standard lifecycle method for teardown.
         * Provides a consistent location to teardown messaging for a component that uses pubsub.
         * Default impl ensures that all pubsub channels are de-registered and unsubscribed.
         * Most components should not need to reimplement this method.
         */
        teardownMessaging: function () {
            var registry = this.registry,
                publishes = registry.getRegistryLocation(registry.locPublishes),
                subscribes = this.registry.getRegistryLocation(this.registry.locSubscribes);
            Object.keys(publishes).forEach(function (key, idx, obj) {
                var value = publishes[key];
                delete this.pub[key];
                registry.removeFromRegistry(registry.locPublishes, key);
            }, this);
            Object.keys(subscribes).forEach(function (value, key, obj) {
                var value = subscribes[key];
                value.unsubscribe(this);
                registry.removeFromRegistry(registry.locSubscribes, key);
            }, this);
        },

        /**
         * Helper function for all pubsub components to declare oneself as a publisher on a given channel.
         * This also adds the channel publish as a convenience function directly to the component in the
         * form of comp.pub[channelName], such as this.pub.CaseOpened(msg);
         * @param channelName - name of the channel to register for publication.
         */
        registerPublisher: function (channelName) {
            var channel = this.channelFactory.get(channelName, this);

            this.pub[channel.channelName] = function (message) {
                logger.debug("Sending message [" + channelName + "] from gadget", message);
                channel.publish(message);
            };

            this.registry.addToRegistry(this.registry.locPublishes, channel.channelName, channel);
        },

        /**
         * Helper function for all pubsub components to easily subscribe to a channel.
         * @param channelName - name of the channel to listen on.
         * @param callback - callback function to run when channel receives a message.
         * @param filterPredicate - optional filter predicate function to evaluate the message before invoking callback.
         * @param captureSelf -boolean indicator when messages published by the same component (this) should still get the callback executed.
         */
        registerSubscriber: function (channelName, callback, filterPredicate, captureSelf) {
            var channel = this.channelFactory.get(channelName, this),
                defaultCapture = (typeof (captureSelf) === 'boolean' ? captureSelf : true);

            channel.subscribe(callback, filterPredicate, defaultCapture);

            this.registry.addToRegistry(this.registry.locSubscribes, channel.channelName, channel);
        },

        /**
         * Similar to registerSubscriber, but listens on the framework-specific channel bus.
         * @param channelName
         * @param callback
         * @param filterPredicate
         * @param captureSelf
         */
        registerFrameworkSubscriber: function (channelName, callback, filterPredicate, captureSelf) {
            var channel = this.channelFactory.get(channelName, this, "framework"),
                defaultCapture = (typeof (captureSelf) === 'boolean' ? captureSelf : true);

            channel.subscribe(callback, filterPredicate, defaultCapture);

            this.registry.addToRegistry(this.registry.locSubscribes, channel.channelName, channel);
        },

        /**
         * Helper methods to unregister a subscription for a channel. This removes the channel from the component
         * registry, as well as calls the unsubscribe method so the pubsub bus is no longer away of the callback.
         * @param channelName
         */
        unregisterSubscriber: function (channelName) {
            var channel = this.registry.getRegistryLocation(this.registry.locSubscribes)[channelName];

            if (util.isDefined(channel)) {
                channel.unsubscribe();
                this.registry.removeFromRegistry(this.registry.locSubscribes, channel.channelName);
            }
        }
    });

    return module;
});