# smithy-js - A gadget-based application framework

## Overview
Smithy-js is an ES5 javascript library for laying out and managing "gadgets" (see below) in an application. It provides several abstractions that help focus development on independent gadgets instead of the machinery necessary to allow them to work in a larger application. These include:
* An abstraction for an application's visual area (GadgetSpace) that potentially includes multiple windows and the hierarchy of display areas (GadgetArea's) within those windows.
* A gadget "lifecycle" as a set of methods that are called on each gadget to walk it through creation and destruction.
* A string address scheme for accessing and manipulating GadgetAreas.
* A registry for gadgets maintained by the GadgetSpace.
* A topic-based messaging bus for communication among gadgets (provided by bullhorn-js).
* Access to services from Gadgets (provided by circuits-js).
* Access to models from Gadgets (provided by schematic-js).

## Gadgets
Gadgets are a modular unit of user interface functionality. They can be thought of as a self-contained interaction component that accomplishes some aspect of the application’s functionality. The intention of segmenting functionality into these independent user interface components is that they can then be re-used as building blocks for larger aggregations of application functionality or custom workflows.
Gadgets are not to be confused with widgets. A widget is a much smaller component representing some interaction element such as a list box, textarea, checkbox, etc. Gadgets are composed of widgets as the user interface controls for building the desired functionality of the component.
Examples of gadgets or gadget-like components in other systems are iGoogle on the web, Dashboard widgets in OSX, sidebar gadgets in Windows, and so on. They ultimately provide users with a snapshot or slice of relevant functionality that can be turned on or off, assembled into a workspace, or otherwise be independently configured based on the user’s needs. Developing applications with this paradigm allows for extremely flexible and modular user interfaces that can be customized to a specific user or group. This also enables rapid updating of individual units without modifying large or cross-cutting areas of the interface, reducing development risks to the overall application. A further benefit is that the gadget framework can be presented to developers or advanced users as an SDK whereby they can develop their own custom gadgets that easily drop into a workspace. No knowledge of the framework as a whole is required – just knowledge of the gadget interfaces themselves. Sandboxing can be applied that constrains the interaction ability of gadgets with low-level system activities, to the point that failing or insecure gadgets can be shutoff so that the entire application does not fail.

## Usage
The following is a simple code snippet that shows how gadgets can be add and loaded in a GadgetSpace:
````
    // Setup the gadget space passing it factories and a template for creating new windows.
    app = new GadgetSpace({
        gadgetFactory: gfact,
        viewFactory: vfact,
        channelFactory: cfact,
        modelFactory: mfact,
        extendedWindowConfig: {
            url: "ExtendedWindow.html"
        }
    });

    // Register gadgets with gadget space.
    app.addGadget("TitleGadget", {
        data: {applicationTitle: "Smithy Example"}
    });

    // Load a gadget into the gadget space at a particular area address. Smithy will create the necessary views
    // to fill in the intermediate windows/areas using the view factory, load the gadget via the gadget factory,
    // and walk the gadget through its lifecyle in the resulting area.
    app.loadGadgetTo("TitleGadget", "windows[0]/top", true);

    app.render();

````

##License
This software is licensed under the Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0).