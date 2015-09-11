"use strict";
define([
    'dojo/_base/declare',
    'dijit/layout/_LayoutWidget',
    'dijit/_TemplatedMixin',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-style',
    'dojo/dom-class',
    'dojo/dom-attr',
    'dojo/dom-construct',
    'dojo/dom-geometry',
    'dojo/_base/window',
    'dijit/registry'
], function (
    declare,
    LayoutWidget,
    TemplatedMixin,
    dojoLang,
    dojoArray,
    domStyle,
    domClass,
    domAttr,
    domConstruct,
    domGeom,
    dojoWindow,
    dijitRegistry
) {
    /**
     * @class smithy/dojoviews/LayoutContainer
     * @extends dijit.layout._LayoutWidget, dijit._TemplatedMixin
     * Class that provides row or column layout with optional resizing splitters. This was derived
     * from GridContainer, but only provides a single direction of layout. A GridContainer
     * can be easily created by first creating a column layout and insert a row layout into
     * every column.
     */

    /**
     * Note that dijit.layout._LayoutWidget = [dijit._Widget, dijit._Container, dijit._Contained]
     */

    var LayoutContainer = declare('LayoutContainer', [LayoutWidget, TemplatedMixin], {

        templateString: '<div class="${domNodeClass}" tabIndex="0"></div>',

        // areaWidths: Number[] | String
        //   Initial area widths defined as an array of numbers or a string with numbers comma separated.
        areaWidths: [100],

        // columnsMode: Boolean
        //   layout orientation: either true = columns or false = rows
        columnsMode: true,

        // keepOne: Boolean
        //   true to always keep one area
        keepOne: true,

        // fitLayout: Boolean
        //   If true, fit all children in an area to fit
        fitLayout: true,

        // minAreaWidth: Number
        //   Minimum area width. This is the width that areas are collapsed to ...
        //     and the width under which an area is considered collapsed.
        minAreaWidth: 50, //pixels

        // isResizable: Boolean
        //   Allow or not resizing of columns by a splitter.
        isResizable: true,

        // isCollapsible: Boolean
        //   Provide arrows on splitter for collapsing.
        isCollapsible: false,

        // liveResizeColumns: Boolean
        //   Specifies whether columns resize as you drag (true) or only upon mouseup (false)
        liveResize: false,

        // gadgetMargin: Number
        //   Margin width for gadgets. No margin for layout widgets. The assumption is that
        //     same margins will be applied to the gadgets in a child layout container.
        gadgetMargin: 10,

        // tightSpacing: Boolean
        //   True to place gadgets close together when using splitters. When true, splitter will
        //     basically fill the spacing.
        tightSpacing: false,

        // gripWidth: Number
        //   Width of the always visible middle area of splitters. Includes 2 1px borders.
        gripWidth: 6,

        // showSplitter: Boolean
        //   If true, splitter is always shown. If false, only shown on hover.
        //   If false, gadgets are given a half the margin size in the area of a splitter.
        //   Don't set to false if inserting layout containers.
        showSplitter: true,

        postMixInProperties: function () {
            this.inherited(arguments);

            var columnsMode = this.columnsMode,
                dir = columnsMode ? 'H' : 'V',
                width = 'width',
                height = 'height',
                offsetWidth = 'offsetWidth',
                offsetHeight = 'offsetHeight';

            this._resizeDim = columnsMode ? width : height;
            this._flowDim = columnsMode ? height : width;
            this._widthProp = columnsMode ? offsetWidth : offsetHeight;
            this._heightProp = columnsMode ? offsetHeight : offsetWidth;
            this.domNodeClass = 'layoutContainer' + dir;
            this.areaClass = 'layoutContainerArea' + dir;

            this._firstLayout = true;
            this._areaCounter = 0;
        },

        postCreate: function () {
            this.inherited(arguments);

            var areaWidths = this.areaWidths,
                aWidths = [];

            if (dojoLang.isString(areaWidths)) {
                dojoArray.forEach(areaWidths.split(','), function (sWidth) {
                    aWidths.push(parseInt(sWidth, 10));
                });
                this.areaWidths = aWidths;
            }

            this._areas = [];
            this._createAreas();
        },

        /**
         * Perform anything that requires the layout widget in the DOM.
         * Create and place resize splitters if isResizable is true.
         */
        startup: function () {
            var i, node = this.domNode, columnsMode = this.columnsMode, parent = this.getParent(), nested;

            if (this._started || !this.domNode.parentNode) {
                return;
            }

            if (this.fitLayout) {
                this._border = {
                    h: 0,
                    w: 0
                };
            } else {
                domStyle.set(node, "overflow" + columnsMode ? "Y" : "X", "hidden");
                domStyle.set(node, this._flowDim, "auto");
            }

            nested = this._nested = parent instanceof LayoutContainer;
            this._nestedTight = nested && parent.tightSpacing;
            this._setAllChildStyles();

            this.inherited(arguments);

            for (i = 0; i < this.nbAreas - 1; i += 1) {
                this._createSplitter(i);
            }

            this.onStartup(this);
        },

        /**
         * Get property name for use with contentBox/marginBox. If columnsMode,
         * return 'w'; else 'h'.
         * returns 'w' and
         * @param {Boolean} inverse True to get property in other direction.
         * @return {String} 'w' or 'h'
         */
        _getDim: function (inverse) {
            var columnsMode = this.columnsMode;
            if (inverse) {
                columnsMode = !columnsMode;
            }
            return columnsMode ? 'w' : 'h';
        },

        /**
         * This should be called after all children have been added
         * when doRender = false was used.
         */
        render: function () {
            this._layoutTime();
        },

        /**
         * Create the initial areas.
         */
        _createAreas: function () {
            var i,
                nbAreas = this.nbAreas,
                origWidths = this.areaWidths || [],
                widths = [],
                areaWidth,
                widthSum = 0,
                fixedWidth,
                node;

            if (!nbAreas) {
                this.nbAreas = nbAreas = this.keepOne ? 1 : 0;
            }

            // Calculate the widths of each area.
            for (i = 0; i < nbAreas; i += 1) {
                if (widths.length < origWidths.length) {
                    areaWidth = origWidths[i];
                } else {
                    if (!fixedWidth) {
                        fixedWidth = (100 - widthSum) / (nbAreas - i);
                    }
                    areaWidth = fixedWidth;
                    widths.push(areaWidth);
                }
                widthSum += areaWidth;
                widths.push(areaWidth);
            }

            for (i = 0; i < nbAreas; i += 1) {
                node = this._createAreaNode(widths[i]);
                this._areas.push({
                    node: this.containerNode.appendChild(node),
                    index: i
                });
                this.onAddArea(this, node);
            }
        },

        /**
         * Create an area node with a percentage width. Percentage width not
         * applied if not specified (non-zero value).
         * @param {Number} width
         * @return {HTMLElement} New area node
         */
        _createAreaNode: function (width) {
            var node,
                style = {
                    display: this.columnsMode ? 'inline-block' : 'block'
                };
            if (width) {
                style[this._resizeDim] = width + '%';
            }
            node = domConstruct.create("div", {
                className: this.areaClass,
                id: this.id + "_dz" + this._areaCounter,
                style: style
            });
            this._areaCounter += 1;
            return node;
        },

        /**
         * Add a single new empty area at the specified index. Index reflects the
         * index the area will have after created and inserted.
         * @param {Number} index Index of where to add the new area.
         */
        addArea: function (index) {
            var indexIs0, i, t, width, sizeArea, node, sizes, size, resizeAreas, areaIndex, areaNode, gripIndex, dim = this._getDim(), areas = this._areas, nbAreas = this.nbAreas;

            //calc size of new area and its neighbors
            indexIs0 = index === 0;
            if (indexIs0 || index === nbAreas) {
                sizeArea = indexIs0 ? 0 : (nbAreas - 1);
                node = areas[sizeArea].node;
                width = domGeom.getContentBox(node)[dim] / 2;
                sizes = [width];
                resizeAreas = [indexIs0 ? 1 : sizeArea];
                gripIndex = indexIs0 ? 0 : sizeArea;
            } else {
                node = areas[index - 1].node;
                width = domGeom.getContentBox(node)[dim] / 3;
                sizes = [width * 2];
                node = areas[index].node;
                t = domGeom.getContentBox(node)[dim] / 3;
                width += t;
                sizes.push(2 * t);
                resizeAreas = [index - 1, index + 1];
                gripIndex = index;
            }

            if (this._started) {
                this._setAllChildStyles();
            }

            //create new area node and splitter
            areaNode = this._createArea(index);
            this._createSplitter(gripIndex);

            //resize neighbors
            for (i = 0; i < resizeAreas.length; i += 1) {
                areaIndex = resizeAreas[i];
                size = sizes[i];
                this._resizeAreaWidth(areaIndex, size);
            }

            //resize new area. area does not have a child yet
            this._resizeAreaWidth(index, width);

            this._placeGrips();

            this.onAddArea(this, areaNode);
        },

        /**
         * Add an area at the supplied index. Area is created w/o a splitter.
         * @param {Number} index Index of where to insert the new area.
         * @return {HTMLElement} The new area div
         */
        _createArea: function (index) {
            var i,
                areas = this._areas,
                containerNode = this.containerNode,
                node = this._createAreaNode(0),
                area = {
                    node: node,
                    index: index
                };

            if (index === areas.length) {
                //append at end
                containerNode.appendChild(node);
                areas.push(area);
            } else {
                //insert before
                containerNode.insertBefore(node, areas[index].node);
                areas.splice(index, 0, area);
            }

            for (i = index; i < areas.length; i += 1) {
                areas[i].index = i;
            }

            this.nbAreas += 1;
            return node;
        },

        /**
         * Add any necessary areas so that there will be an area at the index.
         * @param {Number} index Area index. 3 means that there will be at least 4 areas afterwards.
         */
        addMissingAreas: function (index) {
            var nbAreas = this.nbAreas,
                missing = index - nbAreas + 1;
            if (missing > 0) {
                if (nbAreas === 0) {
                    this.nbAreas = missing;
                    this._createAreas();
                } else if (missing === 1) {
                    this.addArea(index);
                } else {
                    this.addAreas(missing);
                }
            }
        },

        /**
         * Create 1 or more new areas. Add them to the end of the container.
         * Requires that container is <em>started</em>.
         * @param {Number} count Number of new areas to create.
         */
        addAreas: function (count) {
            var nbAreas = this.nbAreas,
                newAreaCount = count + nbAreas,
                areaWidths = this._getAreaWidths(),
                currentTotalWidth = this._total(areaWidths),
                widthForNewAreas = (1 / newAreaCount) * currentTotalWidth,
                shrinkFactor = nbAreas / newAreaCount,
                i,
                gripIndex;

            for (i = 0; i < nbAreas; i += 1) {
                this._resizeAreaWidth(i, areaWidths[i] * shrinkFactor);
            }
            for (i = 0; i < count; i += 1) {
                this._createArea(this.nbAreas);
                gripIndex = nbAreas + i - 1;
                if (gripIndex >= 0) {
                    this._createSplitter(gripIndex);
                }
                this._resizeAreaWidth(nbAreas + i, widthForNewAreas);
            }
            this._placeGrips();
        },

        /**
         * Remove an area by index.
         * @param {Number} index Index of area to remove
         * @return {Boolean} true if an area was removed
         */
        removeArea: function (index) {
            var widths = this._getAreaWidths(),
                width = widths[index],
                total = this._getTotalAreaWidth(),
                newTotal,
                i,
                remainder,
                nbAreas,
                area = this._areas[index];

            //always have at least one area
            if (this.nbAreas === 1 && this.keepOne) {
                return false;
            }

            if (!area) {
                throw new Error('Invalid area index');
            }

            this._deleteArea(index);
            widths.splice(index, 1);

            newTotal = total - width;
            remainder = total;
            nbAreas = this.nbAreas; //modified by above call to _deleteArea
            for (i = 0; i < nbAreas; i += 1) {
                if (i === (nbAreas - 1)) {
                    width = remainder;
                } else {
                    width = widths[i] * total / newTotal;
                    remainder -= width;
                }
                this._resizeAreaWidth(i, width);
            }
            this._placeGrips();
            return true;
        },

        /**
         * Delete an area.
         * @param {Number} index
         * @private
         */
        _deleteArea: function (index) {
            var areas = this._areas,
                area = areas[index],
                areaNode = area.node,
                childNode = areaNode.firstChild,
                widget,
                lastArea,
                i;

            if (childNode) {
                widget = dijitRegistry.byNode(childNode);
                this.removeChild(widget || childNode);
            }

            if (area.grip) {
                this._deleteAreaGrip(area);
            }

            this.onRemoveArea(this, areaNode);

            domConstruct.destroy(this.containerNode.removeChild(areaNode));
            areas.splice(index, 1);
            this.nbAreas -= 1;

            for (i = index; i < areas.length; i += 1) {
                areas[i].index = i;
            }

            // remove grip from last area if present
            lastArea = areas[this.nbAreas - 1];
            if (lastArea.grip) {
                this._deleteAreaGrip(lastArea);
            }
        },

        /**
         * Add a child to the layout. If an area does not exist at the index specified, area(s)
         * will be created. Specifying an index that already has a child results in an error.
         * @param {dijit._WidgetBase | Element} widgetOrNode Child widget or node to add
         * @param {Number} index Index of area to add as a child
         * @param {Boolean} doRender True to resize child.
         */
        addChild: function (widgetOrNode, index, doRender) {
            var widgetNode = widgetOrNode.domNode,
                isWidget = !!widgetNode,
                node = widgetNode || widgetOrNode,
                parentNode = node.parentNode,
                currentContainer = parentNode && parentNode.parentNode,
                currentArea = currentContainer === this.containerNode,
                areaNode,
                areas = this._areas;

            if (currentArea) {
                this.removeChild(widgetOrNode);
            }

            //if index is undefined, either insert into first open area, or a new area if none open
            if (typeof index !== "number") {
                for (var i = 0; i < areas.length; i += 1) {
                    if (!areas[i].node.firstChild) {
                        index = i;
                        break;
                    }
                }
                if (typeof index !== "number") {
                    index = areas.length;
                }
            }

            this.addMissingAreas(index);

            areaNode = areas[index].node;
            if (areaNode.firstChild) {
                this.addArea(index);
                areaNode = areas[index].node;
            }

            if (isWidget) {
                LayoutContainer.superclass.addChild.call(this, widgetOrNode);
            }

            areaNode.appendChild(node);
            domAttr.set(node, "tabIndex", "0");
            if (this._started) {
                this._setChildStyle(node, areaNode, index);
            }

            this.onAddChild(this, areaNode, widgetOrNode);

            if (doRender !== false && this._started) {
                this._resizeChild(areaNode, node);
            }

            this.onAreaChildChange(this, areaNode, widgetOrNode);
        },

        /**
         * Remove child from layout
         * @param {dijit._WidgetBase | HTMLElement} widgetOrNode Child to remove
         */
        removeChild: function (widgetOrNode, index) {
            var widgetNode = widgetOrNode.domNode,
                node = widgetNode || widgetOrNode,
                isWidget = !!widgetNode,
                areaNode = node.parentNode;

            if (isWidget) {
                this.inherited(arguments);
            } else {
                areaNode.removeChild(node);
            }

            if (typeof index === 'number') {
                this.removeArea(index);
            }

            this.onRemoveChild(this, areaNode, widgetOrNode);
        },

        /**
         * Remove a child at an index.
         * @param {Number} index Area index to remove child
         */
        removeChildAt: function (index) {
            var childNode = this._areas[index].node.firstChild,
                widget = childNode && dijitRegistry.byNode(childNode);
            if (childNode) {
                this.removeChild(widget || childNode);
            }
        },

        /**
         * Set style on a child based on its position in the layout.
         * @param {Element} childNode Child node
         * @param {Element} areaNode Area node - parentNode of childNode
         * @param {Number} index Index of area/child in layout
         * @param {dijit._WidgetBase} [widget]
         * @private
         */
        _setChildStyle: function (childNode, areaNode, index, widget) {
            widget = widget || dijitRegistry.byNode(childNode);
            if (widget && widget instanceof LayoutContainer) {
                areaNode.style.position = '';
                return;
            }

            var columnsMode = this.columnsMode,
                margin = this.gadgetMargin,
                halfMargin = margin / 2,
                style = childNode.style,
                tightSpacing = this.tightSpacing,
                nested = this._nested,
                leftRight = tightSpacing ? halfMargin : margin,
                topBottom = this._nestedTight ? halfMargin : margin,
                left = (nested && index === 0) ? margin : leftRight,
                right = (nested && index === (this.nbAreas - 1)) ? margin : leftRight,
                px = 'px';

            areaNode.style.position = 'relative';
            style.position = 'absolute';
            style[columnsMode ? 'left' : 'top'] = left + px;
            style[columnsMode ? 'right' : 'bottom'] = right + px;
            style[columnsMode ? 'top' : 'left'] = style[columnsMode ? 'bottom' : 'right'] = this.fitLayout ? topBottom + px : '';
        },

        /**
         * Set the style values for all children.
         */
        _setAllChildStyles: function () {
            dojoArray.forEach(this._areas, function (area, index) {
                var areaNode = area.node,
                    childNode = areaNode.firstChild;
                this._setChildStyle(childNode, areaNode, index);
            }, this);
        },

        /**
         * Create a splitter for an area.
         * @param {Number} index
         */
        _createSplitter: function (index) {
            var area = this._areas[index],
                splitter,
                grip,
                gripHover;

            if (!this.isResizable) {
                return;
            }

            grip = this._createGrip();

            splitter = grip.splitter;
            gripHover = grip.gripHover;
            area.grip = grip;
            grip.area = area;
            area.gripHandler = [
                this.connect(gripHover, "onmouseover", function (e) {
                    this._handleGripMouseOver(e, grip);
                }),
                this.connect(gripHover, "onmouseout", function (e) {
                    this._handleGripMouseOut(e, grip);
                }),
                this.connect(splitter, "onmousedown", function (e) {
                    this._handleResizeAreaOn(e, grip);
                })
            ];

            if (this.isCollapsible) {
                grip.left.onclick = dojoLang.hitch(this, function () {
                    this.collapseArea(grip, "left");
                });
                grip.right.onclick = dojoLang.hitch(this, function () {
                    this.collapseArea(grip, "right");
                });
            }

        },

        /**
         * Delete the grip on an area.
         * @param {Object} area Area object.
         */
        _deleteAreaGrip: function (area) {
            var un; //undefined
            dojoArray.forEach(area.gripHandler, this.disconnect, this);
            domConstruct.destroy(this.domNode.removeChild(area.grip.splitter));
            delete area.gripHandler;
            delete area.grip;
        },

        /**
         * Create the DOM for a splitter. The object containing references to all of the nodes
         * and other details is referred to as a "grip". Note that the visible portion of the
         * splitter is also called the grip, but is not referenced anywhere.
         * @return {Object} Grip object with references to splitter nodes.
         */
        _createGrip: function () {
            /*
             * For columns, use 'V' grip classes. For rows, use 'H' classes.
             */
            var columnsMode = this.columnsMode,
                dim = columnsMode ? 'V' : 'H',
                style = {},
                cls,
                widthProp = this._resizeDim,
                gripWidth = this.gripWidth,
                margin = this.gadgetMargin,
                splitter,
                gripHover,
                handle,
                left,
                right,
                title;

            style[widthProp] = 2 * margin - 4 + 'px';
            splitter = domConstruct.create("div", {className: "layoutContainerGripSplitter" + dim, style: style}, this.domNode);

            gripHover = domConstruct.create("div", {style: "width:100%;height:100%"}, splitter);

            style[widthProp] = gripWidth - 2 + 'px';
            style['margin' + (columnsMode ? 'Left' : 'Top')] = -gripWidth / 2 + 'px';
            cls = "layoutContainerGrip" + dim;
            if (this.showSplitter) {
                cls += ' layoutContainerGripShowNormal' + dim;
            }
            domConstruct.create("div", {className: cls, style: style}, gripHover);

            if (this.isCollapsible) {
                handle = domConstruct.create("div", {className: "layoutContainerGripHandle" + dim}, splitter);
                title = 'Collapse ' + columnsMode ? 'column to the left' : 'up';
                left = domConstruct.create("div", {title: title, className: "layoutContainerGripLeft" + dim}, handle);
                title = 'Collapse ' + columnsMode ? 'column to the right' : 'down';
                right = domConstruct.create("div", {title: title, className: "layoutContainerGripRight" + dim}, handle);
            }

            return {
                splitter: splitter,
                gripHover: gripHover,
                handle: handle, //handle is the box that needs to be centered along the length of the splitter
                left: left,
                right: right
            };
        },

        /**
         * Set the splitter to show as focused/hovered. This is mainly for splitters that do not "show" normally.
         * @param {Boolean} active True to show
         */
        _showActiveSplitter: function (active) {
            domClass.toggle(this._activeGrip.splitter, 'layoutContainerActiveSplitter', active);
        },

        /**
         * Event handler for when the mouse enters the grip.
         */
        _handleGripMouseOver: function (e, grip) {
            domClass.add(grip.splitter, "layoutContainerGripSplitterHover");
        },

        /**
         * Event handler for when the mouse leaves the grip.
         */
        _handleGripMouseOut: function (e, grip) {
            domClass.remove(grip.splitter, "layoutContainerGripSplitterHover");
        },

        /**
         * Event handler when the mouse button is released when a splitter is being moved.
         */
        _handleGripMouseUp: function () {
            dojoWindow.body().style.cursor = "default";
            this.disconnect(this._connectResizeMove);
            this.disconnect(this._connectGripMouseUp);

            this._connectGripMouseUp = this._connectResizeMove = null;

            this._clearCover();
        },

        /**
         * Remove and destroy the cover, and optionally create a new cover.
         * The cover is used to prevent pdfs from messing with the splitter move events.
         * @param {Boolean} [createCover]
         */
        _clearCover: function (createCover) {
            if (this._cover) {
                domConstruct.destroy(this._cover);
            }
            if (createCover) {
                this._cover = domConstruct.create("div", {style: "top: 0px; left: 0px; position: absolute; z-index: 1000; height: 100%; width: 100%;"}, this._activeGrip.splitter, "before");
            } else {
                this._cover = 0;
            }
        },

        /**
         * Calculate the minimum width for children in an area. Note that currently only one child per area is allowed.
         * This may not be necessary - carry over from GridContainer.
         * @param {NodeList} childNodes
         * @return {Number} Maximum of children minimum widths
         */
        calculateChildMinWidth: function (childNodes) {
            var width = 0,
                childMinWidth = 0,
                objectStyle,
                minWidth,
                columnsMode = this.columnsMode;

            dojoArray.forEach(childNodes, function (child) {
                if (child.nodeType === 1) {
                    objectStyle = domStyle.getComputedStyle(child);
                    minWidth = parseInt(objectStyle[columnsMode ? 'minWidth' : 'minHeight'], 10);
                    childMinWidth = minWidth + parseInt(objectStyle[columnsMode ? 'marginLeft' : 'marginTop'], 10) + parseInt(objectStyle[columnsMode ? 'marginRight' : 'marginBottom'], 10);

                    if (width < childMinWidth) {
                        width = childMinWidth;
                    }
                }
            });
            return width;
        },

        /**
         * Event handler when splitter is clicked. Connect events to listen
         * to the resize actions. Change the type of width of areas from
         * % to px. Calculate the minWidth according to the children.
         * @param e
         * @param {Object} grip Grip object as returned by _createGrip
         * @private
         */
        _handleResizeAreaOn: function (e, grip) {
            var areaWidths,
                areas = this._areas,
                nbAreas = areas.length,
                area,
                i,
                currentArea,
                nextArea,
                minPix,
                columnsMode = this.columnsMode;

            this._activeGrip = grip;
            this._showActiveSplitter(true);

            this._initMouseLocation = e['page' + (columnsMode ? 'X' : 'Y')];
            e.preventDefault();

            dojoWindow.body().style.cursor = columnsMode ? 'col-resize' : 'row-resize';

            areaWidths = this._getAreaWidths();

            for (i = 0; i < nbAreas; i += 1) {
                area = areas[i];
                if (grip === area.grip) {
                    currentArea = this._currentArea = area.node;
                    this._currentAreaIndex = i;
                    this._currentAreaWidth = areaWidths[i];
                    nextArea = this._nextArea = areas[i + 1].node;
                    this._nextAreaWidth = areaWidths[i + 1];
                    break;
                }
            }

            minPix = this.minAreaWidth;

            // calculate the minWidh of all children for current and next area
            this._currentMinWidth = Math.max(this.calculateChildMinWidth(currentArea.childNodes), minPix);
            this._nextMinWidth = Math.max(this.calculateChildMinWidth(nextArea.childNodes), minPix);

            this._connectResizeMove = this.connect(dojoWindow.doc, "onmousemove", "_handleResizeAreaMove");
            this._connectGripMouseUp = this.connect(dojoWindow.doc, "onmouseup", "_handleGripMouseUp");
            this._clearCover(true);
        },

        /**
         * Event when area resize splitter is moved.
         * @param {MouseEvent} e
         */
        _handleResizeAreaMove: function (e) {
            e.preventDefault();

            if (!this._connectResizeOff) {
                this.disconnect(this._connectGripMouseUp);
                this._connectGripMouseUp = null;
                this._connectResizeOff = this.connect(dojoWindow.doc, "onmouseup", "_handleResizeAreaOff");
            }

            var columnsMode = this.columnsMode,
                pageLocation = e['page' + (columnsMode ? 'X' : 'Y')],
                initMouseLocation = this._initMouseLocation,
                d = pageLocation - initMouseLocation,
                dim,
                activeGripSplitterStyle;

            if (d === 0) {
                return;
            }

            if (!(this._currentAreaWidth + d < this._currentMinWidth || this._nextAreaWidth - d < this._nextMinWidth)) {
                initMouseLocation = pageLocation;
            } else {
                //adjust the delta so that the handles are set exactly to their boundaries.
                if (this._currentAreaWidth + d < this._currentMinWidth) {
                    d = this._currentMinWidth - this._currentAreaWidth;
                } else {
                    d = this._nextAreaWidth - this._nextMinWidth;
                }
                initMouseLocation += d;
            }
            this._initMouseLocation = initMouseLocation;

            if (d !== 0) {
                this._currentAreaWidth += d;
                this._nextAreaWidth -= d;
                dim = columnsMode ? 'left' : 'top';
                activeGripSplitterStyle = this._activeGrip.splitter.style;
                activeGripSplitterStyle[dim] = parseInt(activeGripSplitterStyle[dim], 10) + d + "px";

                if (this.liveResize) {
                    dim = this._resizeDim;
                    this._currentArea.style[dim] = this._currentAreaWidth + "px";
                    this._nextArea.style[dim] = this._nextAreaWidth + "px";
                    this.resize();
                }
            }
        },

        /**
         * Event handler when the splitter is dropped.
         * @param {MouseEvent} e Event object
         */
        _handleResizeAreaOff: function (e) {
            var index;

            dojoWindow.body().style.cursor = "default";
            this._clearCover();
            this.disconnect(this._connectResizeMove);
            this.disconnect(this._connectResizeOff);
            this._connectResizeOff = this._connectResizeMove = null;
            this._showActiveSplitter(false);

            if (!this.liveResize) {
                index = this._currentAreaIndex;
                this._resizeAreaWidth(index, this._currentAreaWidth);
                this._resizeAreaWidth(index + 1, this._nextAreaWidth);
            }
            this._placeGrips();
        },

        /**
         * Collapse an area.
         * @param {Object} grip Grip object
         * @param {String} direction Collapse direction - either 'left' or 'right'
         */
        collapseArea: function (grip, direction) {
            var areas = this._areas,
                minAreaWidth = this.minAreaWidth,
                gripArea = grip.area,
                areaNode = gripArea.node,
                index,
                areaIndex,
                other,
                nodeAtIndexWidth,
                nodeAtAreaIndexWidth;

            index = grip.area.index;

            grip.restoreWidth = areaNode[this._widthProp]; //close enough

            if (direction === "left") {
                other = this.getNextExpandedArea(index);
                areaIndex = !isNaN(other) ? other : index + 1;
            } else {
                other = this.getPreviousExpandedArea(index);
                areaIndex = !isNaN(other) ? other : index;
                index += 1;
            }

            nodeAtIndexWidth = minAreaWidth;
            nodeAtAreaIndexWidth = this._getAreaWidth(areaIndex) + this._getAreaWidth(index) - minAreaWidth;
            this._resizeAreaWidth(index, nodeAtIndexWidth);
            this._resizeAreaWidth(areaIndex, nodeAtAreaIndexWidth);
            areas[index].collapseDirection = direction;
            this._placeGrips();
        },

        /**
         * Test if an area is collapsed.
         * @param {Number} index Area index
         * @return {Boolean} True if area is, or nearly, collapsed
         */
        isAreaCollapsed: function (index) {
            return this._areas[index].node[this._widthProp] <= this.minAreaWidth;
        },

        /**
         * Get the next area that is expanded (not collapsed). Undefined is returned if no
         * next area is expanded. Search starts at refIndex + 1.
         * @param {Number} refIndex Reference index. Start search at refIndex + 1.
         * @return {Number} Index of next expanded area
         */
        getNextExpandedArea: function (refIndex) {
            var i;
            for (i = refIndex + 1; i < this.nbAreas; i += 1) {
                if (!this.isAreaCollapsed(i)) {
                    return i;
                }
            }
        },

        /**
         * Get the previous area that is expanded (not collapsed). Undefined is returned if no
         * next area is expanded. Search starts at refIndex - 1.
         * @param {Number} refIndex Reference index. Start search at refIndex.
         * @return {Number} Index of previous expanded area
         */
        getPreviousExpandedArea: function (refIndex) {
            var i;
            for (i = refIndex; i >= 0; i -= 1) {
                if (!this.isAreaCollapsed(i)) {
                    return i;
                }
            }
        },

        /**
         * Restore a collapsed area.
         * @param {Number} index Index of the grip (& area) to restore.
         */
        restoreArea: function (index) {
            var areaIndex,
                areas = this._areas,
                area = areas[index],
                areaNodeWidth = this._getAreaWidth(index),
                restoreWidth = area.restoreWidth,
                dir = area.collapseDirection,
                next = this.getNextExpandedArea(index),
                previous = this.getPreviousExpandedArea(index),
                nodeWidth,
                nodeAtIndexWidth,
                nodeAtAreaIndexWidth;

            if (restoreWidth) {
                if (dir === "left") {
                    areaIndex = !isNaN(next) ? next : previous;
                } else {
                    areaIndex = !isNaN(previous) ? previous : next;
                }
                nodeWidth = this._getAreaWidth(areaIndex);
                if (restoreWidth > nodeWidth) {
                    nodeAtIndexWidth = nodeWidth / 2 + areaNodeWidth;
                    nodeAtAreaIndexWidth = nodeWidth / 2;
                } else {
                    nodeAtIndexWidth = restoreWidth;
                    nodeAtAreaIndexWidth = nodeWidth - restoreWidth + areaNodeWidth;
                }

                this._resizeAreaWidth(index, nodeAtIndexWidth);
                this._resizeAreaWidth(areaIndex, nodeAtAreaIndexWidth);
                this._placeGrips();
            }
        },

        /**
         *  Enables/disables a columns collapse buttons.
         *  @param {Number} index Area index
         *  @param {Boolean} collapsed If the area is being set to collapsed.
         */
        setCollapsed: function (index, collapsed) {
            var areas = this._areas,
                area = areas[index],
                prevArea,
                grip,
                columnsMode = this.columnsMode;

            if (!this.isCollapsible) {
                return;
            }

            if (area.collapsed !== collapsed) {
                area.collapsed = collapsed;
                prevArea = areas[index - 1];
                grip = area.grip;
                if (collapsed) {
                    area.restoreWidth = area.node[this._widthProp];
                    if (grip) {
                        grip.left.style.display = "none";
                        grip.right.title = "Restore" + (columnsMode ? " column" : "");
                        grip.right.onclick = dojoLang.hitch(this, function () {
                            area.collapseDirection = "left";
                            this.restoreArea(area.index);
                        });
                        //set right button to restore
                    }
                    if (prevArea && prevArea.grip) {
                        grip = prevArea.grip;
                        grip.right.style.display = "none";
                        grip.left.title = "Restore" + (columnsMode ? " column" : "");
                        grip.left.onclick = dojoLang.hitch(this, function () {
                            area.collapseDirection = "right";
                            this.restoreArea(area.index);
                        });
                        //set left button to restore
                    }
                } else {
                    delete area.restoreWidth;
                    if (grip) {
                        grip.left.style.display = "";
                        grip.right.title = 'Collapse ' + (columnsMode ? 'column to the right' : 'down');
                        grip.right.onclick = dojoLang.hitch(this, function () {
                            this.collapseArea(area.grip, "right");
                        });
                        //set right button to collapse
                    }
                    if (prevArea && prevArea.grip) {
                        grip = prevArea.grip;
                        grip.right.style.display = "";
                        grip.left.title = "Collapse " + (columnsMode ? "column to the left" : "up");
                        grip.left.onclick = dojoLang.hitch(this, function () {
                            this.collapseArea(prevArea.grip, "left");
                        });
                        //set left button to collapse
                    }
                }
            }
        },

        /**
         * Resize the child in an area.
         * @param {HTMLElement} areaNode Area node containing childNode
         * @param {HTMLElement} childNode Child node inside areaNode
         */
        _resizeChild: function (areaNode, childNode) {
            var widget;

            if (!this._started) {
                return;
            }

            if (childNode) {
                widget = dijitRegistry.byNode(childNode);
                if (widget && widget.resize) {
                    widget.resize();
                }
                this.onResizeChild(this, areaNode, widget || childNode);
            }
        },

        /**
         * Resize the widths of all gadgets in a column to the given width.
         * @param {Number} index Area index
         * @param {Number} width New marginBox width for gadgets
         */
        _resizeAreaWidth: function (index, width) {
            if (!this._started) {
                return;
            }

            var collapsed = width <= this.minAreaWidth,
                areaNode = this._areas[index].node,
                childNode = areaNode.firstChild;

            this.setCollapsed(index, collapsed);
            areaNode.style[this._resizeDim] = width + "px";
            this._resizeChild(areaNode, childNode);
            this.onResizeArea(this, areaNode);
        },

        /**
         * Complete re-layout of container and all children. Use timer to avoid
         * frequent laying out when user is resizing window.
         */
        layout: function () {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            if (this._firstLayout) {
                if (domGeom.getContentBox(this.domNode)[this._getDim()] === 0) {
                    return;
                }
                this._firstLayout = false;
                this._setInitialAreaWidths();
                this._layoutTime();
            } else {
                // Delay applying the size change in case the size
                // changes very frequently, for performance reasons.
                this._timer = setTimeout(dojoLang.hitch(this, this._layoutTime), 100);
            }
        },

        /**
         * Layout on a timer to prevent repeated firing when sizing window. Layout
         * container and resize all widgets. Layout is only called when the entire
         * container is resized. We want to keep the relative sizes of all columns
         * the same.
         */
        _layoutTime: function () {
            var contentBox, i, length, oldWidth, newWidth, colWidth, remainingWidth, dimW = this._getDim(), dimH = this._getDim(1);

            this._timer = null;

            if (!this.domNode) {
                return;
            }

            oldWidth = this._getTotalAreaWidth();
            contentBox = this.getContentBox();
            remainingWidth = newWidth = contentBox[dimW] - this._border[dimW];

            //resize
            length = this.nbAreas;
            for (i = 0; i < length; i += 1) {
                if ((i + 1) === length) {
                    colWidth = remainingWidth;
                } else {
                    colWidth = this._getAreaWidth(i) * newWidth / oldWidth;
                    remainingWidth = remainingWidth - colWidth;
                }
                this._resizeAreaWidth(i, colWidth);
            }
            this._placeGrips();
        },

        /**
         * Place grips in correct locations and centers collapse/expand handles.
         */
        _placeGrips: function () {
            var gripWidth,
                heightProp = this._heightProp,
                widthProp = this._widthProp,
                dimW = this._getDim(),
                containerHeight = this.containerNode[heightProp],
                areaWidth = 0,
                columnsMode = this.columnsMode,
                grip,
                splitter,
                handle;

            dojoArray.forEach(this._areas, function (area) {
                grip = area.grip;
                if (grip) {
                    splitter = grip.splitter;
                    if (!gripWidth) {
                        gripWidth = splitter[widthProp] / 2;
                    }

                    areaWidth += domGeom.getMarginBox(area.node)[dimW];
                    domStyle.set(splitter, columnsMode ? "left" : "top", (areaWidth - gripWidth) + "px");

                    //position container for collapse buttons
                    handle = grip.handle;
                    if (handle) {
                        domStyle.set(handle, columnsMode ? "top" : "left", containerHeight / 2 - handle[heightProp] / 2 + "px");
                    }
                }
            }, this);
        },

        /**
         * The initial area widths are specified as a percent, which is not ideal.
         * Area widths are changed to absolute values.
         */
        _setInitialAreaWidths: function () {
            var i, areaNode, areas = this._areas, dim = this._getDim(), box = {};
            if (this._setInitialWidths || !domGeom.getContentBox(this.domNode)[dim]) {
                return;
            }

            this._setInitialWidths = 1;
            for (i = 0; i < areas.length; i += 1) {
                areaNode = areas[i].node;
                box[dim] = domGeom.getContentBox(areaNode)[dim];
                domGeom.setContentSize(areaNode, box);
            }
        },

        /**
         * Get the width of an area node using the style value. This is used
         * when an accurate width value is required - offsetWidth does not
         * provide decimals.
         * @param {Number} index Area index
         * @return {Number} Width of area
         */
        _getAreaWidth: function (index) {
            return parseInt(this._areas[index].node.style[this._resizeDim], 10);
        },

        /**
         * Get the widths of all area nodes.
         * @return {Number[]}
         */
        _getAreaWidths: function () {
            var areaWidths = [], i;
            for (i = 0; i < this.nbAreas; i += 1) {
                areaWidths[i] = this._getAreaWidth(i);
            }
            return areaWidths;
        },

        /**
         * Total the numbers in an array.
         * @param {Number[]} arr
         * @return {Number}
         */
        _total: function (arr) {
            var i, total = 0;
            for (i = 0; i < arr.length; i += 1) {
                total += arr[i];
            }
            return total;
        },

        /**
         * Get total container width from column widths
         * @return {Number} Total width of columns
         */
        _getTotalAreaWidth: function () {
            return this._total(this._getAreaWidths());
        },

        /**
         * Get all column widths as a percent.
         * @return {Number[]} Each number is a value representing
         *                  each column's width as a percent (0 to 100).
         */
        getWidthsAsPercent: function () {
            var i, columnWidthPercents = [],
                areaWidths = this._getAreaWidths(),
                total = this._total(areaWidths);

            for (i = 0; i < areaWidths.length; i += 1) {
                columnWidthPercents.push(areaWidths[i] * 100 / total);
            }
            return columnWidthPercents;
        },

        /**
         * Get the number of areas
         * @return {Number} Number of columns
         */
        getAreaCount: function () {
            return this.nbAreas;
        },

        /**
         * Remove an empty area. Only one area will possibly be removed;
         * @return {Boolean} True if an empty area was removed.
         */
        removeEmptyAreas: function () {
            var i;
            for (i = 0; i < this.nbAreas; i += 1) {
                if (this.isAreaEmpty(i)) {
                    this.removeArea(i);
                    return true;
                }
            }
            return false;
        },

        /**
         * Test if an area is empty
         * @param index
         * @return {Boolean}
         */
        isAreaEmpty: function (index) {
            var areaNode = this._areas[index].node,
                childNode = areaNode.firstChild,
                widget = dijitRegistry.byNode(childNode);
            if (widget && widget.isEmpty) {
                return widget.isEmpty();
            }
            return !!childNode;
        },

        /**
         * Find an area object by the area node.
         * @param areaNode
         * @return {*}
         */
        findAreaByAreaNode: function (areaNode) {
            var i,
                areas = this._areas,
                area;
            for (i = 0; i < areas.length; i += 1) {
                area = areas[i];
                if (area.node === areaNode) {
                    return area;
                }
            }
//            return util.first(this._areas, function (area) {
//                return area.node === areaNode;
//            });
        },

        /**
         * Get the child nodes and/or widgets. This is not called getChildren because
         * destroyDescendants requires that function to return widgets. Fine to call
         * getChildren if you are always adding widgets as children.
         * @returns {[Element | dijit._WidgetBase} Child widgets or nodes.
         */
        getAreasChildren: function () {
            var children = [];
            dojoArray.forEach(this._areas, function (area) {
                var childNode = area.node,
                    childWidget = childNode && dijitRegistry.byNode(childNode);
                if (childNode) {
                    children.push(childWidget || childNode);
                }
            });
            return children;
        },

        /**
         * Normal destroy method. onDestroy is fired before the container is destroyed.
         */
        destroy: function () {
            this.onDestroy(this);

            this.inherited(arguments);

            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = 0;
            }
        },

        /**
         * Get and set the contentBox for the container. This is used when the second window
         * initially shows its contents.
         */
        getContentBox: function () {
            if (this._contentBox.w) {
                return this._contentBox;
            }

            var node = this.domNode, mb, cs, me, be, bb, pe;
            mb = domGeom.getMarginBox(node);

            // Compute and save the size of my border box and content box
            // (w/out calling dojo.contentBox() since that may fail if size was recently set)
            cs = domStyle.getComputedStyle(node);
            me = domGeom.getMarginExtents(node, cs);
            be = domGeom.getBorderExtents(node, cs);
            bb = (this._borderBox = {
                w: mb.w - (me.w + be.w),
                h: mb.h - (me.h + be.h)
            });
            pe = domGeom.getPadExtents(node, cs);
            this._contentBox = {
                l: domStyle.toPixelValue(node, cs.paddingLeft),
                t: domStyle.toPixelValue(node, cs.paddingTop),
                w: bb.w - pe.w,
                h: bb.h - pe.h
            };
            return this._contentBox;
        },

        /**
         * Event when widget is in DOM and initial areas have been created, and possibly any
         * initial children have been added.
         * @param {LayoutContainer} me
         */
        onStartup: function (me) {},

        /**
         * Event when this LayoutContainer is destroyed.
         * @param {LayoutContainer} me
         */
        onDestroy: function (me) {},

        /**
         * Event when a new area node is created. Area node will be in the DOM.
         * @param {LayoutContainer} me
         * @param {HTMLElement} areaNode Area node that was created.
         */
        onAddArea: function (me, areaNode) {},

        /**
         * Event when an area node is removed. Area node will not be in the DOM any more.
         * @param {LayoutContainer} me
         * @param {HTMLElement} areaNode Area node that was removed.
         */
        onRemoveArea: function (me, areaNode) {},

        /**
         * Event when a child is added to an area. Child node will
         * be in the DOM. Event not fired if area already contained
         * a child when addChild was called.
         * @param {LayoutContainer} me
         * @param {HTMLElement} areaNode Area node that contains the child.
         * @param {dijit._WidgetBase | HTMLElement} childWidgetOrNode Widget or node passed by caller to addChild
         */
        onAddChild: function (me, areaNode, childWidgetOrNode) {},

        /**
         * Event when a child is removed from an area. Area node will be in the DOM,
         * but the child node will not be in the DOM.
         * @param {LayoutContainer} me
         * @param {HTMLElement} areaNode Area node that previously contained the child.
         * @param {dijit._WidgetBase | HTMLElement} childWidgetOrNode Widget or node passed by caller to removeChild
         */
        onRemoveChild: function (me, areaNode, childWidgetOrNode) {},

        /**
         * Event when a child is added or removed.
         * @param {LayoutContainer} me
         * @param {HTMLElement} area Area node that child was added
         * @param {dijit._Widget | HTMLElement} child Only included when a child is added.
         */
        onAreaChildChange: function (me, area, child) {},

        /**
         * Event when a child (widget or node) in an area is resized. If the child
         * is a widget and the widget has a resize method, the resize method
         * has already been called.
         * @param {LayoutContainer} me this instance
         * @param {HTMLElement} area Area node that was resized
         * @param {dijit._WidgetBase | HTMLElement} child Child widget or node
         */
        onResizeChild: function (me, area, child) {},

        /**
         * Resize event when area is resized.
         * @param {LayoutContainer} me this instance
         * @param {HTMLElement} area Area node that was resized
         */
        onResizeArea: function (me, area) {}

    });
    return LayoutContainer;
});