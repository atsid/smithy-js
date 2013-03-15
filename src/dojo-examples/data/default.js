define({
    gadgetRegistry: [
        {
            name: "TitleGadget",
            gadget: "TitleGadget",
            data: {
                applicationTitle: "Smithy Page Routing Example"
            }
        },
        {
            name: "NavigationGadget",
            gadget: "NavigationGadget"
        },
        {
            name: "WidgetTestGadget",
            gadget: "WidgetTestGadget"
        }
    ],
    layoutData: {
        "address": "/windows[0]",
        "subAreas": [
            {
                "address": "/windows[0]/top",
                "gadget": {
                    "name": "TitleGadget"
                },
                "subAreas": []
            },
            {
                "address": "/windows[0]/left",
                "gadget": {
                    "name": "NavigationGadget"
                },
                "subAreas": []
            },
            {
                "address": "/windows[0]/center",
                "gadget": {
                    "name": "WidgetTestGadget"
                },
                "subAreas": []
            }
        ]
    }
});
