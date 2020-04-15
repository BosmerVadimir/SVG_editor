import React, {Component} from 'react';
import _ from 'lodash';
import {HotKeys} from 'react-hotkeys';
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import InsertMenu from './panels/InsertMenu';
import SVGRenderer from './SVGRenderer';
import {EditMode, ViewMode} from './constants';
import * as actions from './actions';
import {Circle, Rect} from './objects';
import Polyline from "./objects/Polyline";
import {BlockPicker, HuePicker} from 'react-color';
import DraggableObjectItem from './components/DraggableObjectItem'

const colors = [
    {index: 0, color: '#D0021B'},
    {index: 1, color: '#F5A623'},
    {index: 2, color: '#F8E71C'},
    {index: 3, color: '#8B572A'},
    {index: 4, color: '#7ED321'},
    {index: 5, color: '#417505'},
    {index: 6, color: '#BD10E0'},
    {index: 7, color: '#9013FE'},
    {index: 8, color: '#4A90E2'},
    {index: 9, color: '#50E3C2'},
    {index: 10, color: '#B8E986'}
];

var mouseOldX = 0;
var mouseOldY = 0;
var mouseDirection = {x: undefined, y: undefined};

class Designer extends Component {
    static defaultProps = {
        objectTypes: {
            'rectangle': Rect,
            'circle': Circle,
            'polygon': Polyline,
            'clear': null
        },
        snapToGrid: 1,
        svgStyle: {},
        insertMenu: InsertMenu
    };

    keyMap = {
        'removeObject': ['del', 'backspace'],
        'moveLeft': ['left', 'shift+left'],
        'moveRight': ['right', 'shift+right'],
        'moveUp': ['up', 'shift+up'],
        'moveDown': ['down', 'shift+down'],
        'closePath': ['enter'],
        'edit': ['e', 'E'],
        'read': ['r', 'R']
    };

    constructor(props) {
        super(props);
        this.state = {
            mode: EditMode.FREE,
            viewMode: ViewMode.VIEW,
            handler: {
                top: 200,
                left: 200,
                width: 50,
                height: 50,
                rotate: 0,
            },

            imageWidth: 0,
            imageHeight: 0,
            imageX: 0,
            imageY: 0,
            canvasWidth: 0,
            canvasHeight: 0,
            currentObjectIndex: null,
            selectedObjectIndex: null,
            selectedTool: null,
            hovered: [],
            pictureX: 0,
            pictureY: 0,
            draggingMode: false,
            openLayersDialog: false,
            layersList: [],
            showPicker: false,
            background: '#fff',
            selectedLayer: {},
            selectedMenuItem: [],
            zoom: 1,
            initZoom: 1,
            center: true,
            panZoomDisabled: false,
            showHandler: false,
            bbox: null,
            offset: null
        };
        this.getMouseCoords = this.getMouseCoords.bind(this);
        this.removeCurrent = this.removeCurrent.bind(this);
        this.removeObject = this.removeObject.bind(this);
        this.removeCurrentByUUID = this.removeCurrentByUUID.bind(this);
    }

    componentDidMount() {
        const CustomColors = [
            {strokeColor: '#9B9B9B', fillColor: '#50E3C2', alphaColor: 1},
            {strokeColor: '#F5A623', fillColor: '#4A90E2', alphaColor: 1},
            {strokeColor: '#F8E71C', fillColor: '#9013FE', alphaColor: 1},
            {strokeColor: '#8B572A', fillColor: '#BD10E0', alphaColor: 1},
            {strokeColor: '#7ED321', fillColor: '#417505', alphaColor: 1},
            {strokeColor: '#417505', fillColor: '#7ED321', alphaColor: 1},
            {strokeColor: '#BD10E0', fillColor: '#8B572A', alphaColor: 1},
            {strokeColor: '#9013FE', fillColor: '#F8E71C', alphaColor: 1},
            {strokeColor: '#4A90E2', fillColor: '#F5A623', alphaColor: 1},
            {strokeColor: '#50E3C2', fillColor: '#9B9B9B', alphaColor: 1}
        ];

        let img = document.createElement('img');
        img.src = this.props.backgroundUrl;

        let self = this;
        let newLayerList = this.props.layersList;
        let width = this.props.width ? parseFloat(this.props.width.toFixed(1)) : null;
        let height = this.props.height ? parseFloat(this.props.height.toFixed(1)) : null;

        img.onload = () => {
            let imageWidth = img.width;
            let imageHeight = img.height;
            let quotientX = imageWidth / width;
            let quotientY = imageHeight / height;
            let newZoomX = 1 / quotientX;
            let newZoomY = 1 / quotientY;
            let zoom = newZoomX > newZoomY ? parseFloat(newZoomX.toFixed(2)) : parseFloat(newZoomY.toFixed(2));
            let maxX = (imageWidth * zoom - width) / 2;
            let maxY = (imageHeight * zoom - height) / 2;

            self.setState({
                imageWidth: imageWidth,
                imageHeight: imageHeight,
                canvasWidth: width,
                canvasHeight: height,
                maxX: maxX,
                maxY: maxY,
                layersList: newLayerList,
                zoom: zoom,
                initZoom: zoom,
                pictureX: 0,
                pictureY: 0
            });

        }

    }

    componentWillMount() {
        this.objectRefs = {};
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.layersList.length !== this.props.layersList.length) {
            this.setState({layersList: this.props.layersList})
        }
    }

    showHandler(index, event, clicked) {
        let {mode, viewMode, pictureX, pictureY, zoom} = this.state;
        let {objects} = this.props;
        let object = objects[index];
        if (viewMode === ViewMode.VIEW && mode === EditMode.FREE) {
            this.state.hovered.push(index);
            object.fillOpacity = 0.7;
            this.setState({})
        }
        if (viewMode === ViewMode.VIEW || mode !== EditMode.FREE) {
            return;
        }
        if ((viewMode === ViewMode.EDIT) && !!clicked) {
            this.updateHandler(index, object, pictureX, pictureY, zoom);
            this.setState({
                currentObjectIndex: index,
                showHandler: true,
                panZoomDisabled: true

            });
        }
    }

    mouseLeave() {
        let {objects} = this.props;
        this.state.hovered.forEach((ind) => {
            objects[ind].fillOpacity = 0.5
        });
        this.setState({hovered: []})
    }
    hideHandler() {
        let {mode} = this.state;
        if (mode === EditMode.FREE) {
            this.setState({
                showHandler: false,
                panZoomDisabled: false
            });
        }
    }
    hideHandlerForce() {
        if (this.state.viewMode !== ViewMode.EDIT) {
            this.setState({
                showHandler: false
            });
        }
    }
    getStartPointBundle(event, object) {
        let {currentObjectIndex, zoom, imageX, imageY, selectedTool} = this.state;
        let {objects} = this.props;
        object = object || objects[currentObjectIndex];

        let objectX;
        let objectY;
        if (selectedTool === 'polygon') {
            objectX = object.x / zoom + imageX;
            objectY = object.y / zoom + imageY
        }
        if (!object.isNew) {
            objectX = object.x;
            objectY = object.y
        } else {
            objectX = object.x / zoom;
            objectY = object.y / zoom
        }
        return {
            clientX: objectX,
            clientY: objectY,
            objectX: objectX,
            objectY: objectY,
            width: object.width,
            height: object.height,
            rotate: object.rotate
        };
    }
    startDrag(mode, event) {
        let {currentObjectIndex} = this.state;
        this.setState({
            mode: mode,
            startPoint: this.getStartPointBundle(event),
            selectedObjectIndex: currentObjectIndex,
            panZoomDisabled: true
        });
    }
    resetSelection() {
        this.setState({
            selectedObjectIndex: null,
            panZoomDisabled: false
        });
    }
    generateUUID() {
        let d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
    objectClick(object, index) {
        this.selectItem(index);
        let {viewMode} = this.state;
        let {objectClickHandler} = this.props;
        if (viewMode === ViewMode.VIEW && objectClickHandler) {
            objectClickHandler(object)
        }
        if (viewMode === ViewMode.EDIT) {
            console.log("ViewMode.EDIT",)
            this.showHandler(index, null, true);
        }
    }
    newObject(event) {
        let {mode, selectedTool, pictureX, pictureY, zoom, imageX, imageY} = this.state;
        this.resetSelection(event);
        if (mode !== EditMode.DRAW) {
            return;
        }
        let {meta} = this.getObjectComponent(selectedTool);
        let mouse = this.getMouseCoords(event);
        let {objects, onUpdate} = this.props;
        let object;
        imageX = imageX ? imageX : 0;
        imageY = imageY ? imageY : 0;
        if (selectedTool === 'polygon') {
            object = {
                ...meta.initial,
                type: selectedTool,
                x: mouse.x + imageX,
                y: mouse.y + imageY,
                uuid: this.generateUUID(),
                isNew: true,
            };
        } else {
            object = {
                ...meta.initial,
                type: selectedTool,
                x: mouse.x / zoom,
                y: mouse.y / zoom,
                uuid: this.generateUUID(),
                isNew: true
            }
        }

        onUpdate([...objects, object]);

        let startPoint = this.getStartPointBundle(event, object);
        this.setState({
            currentObjectIndex: objects.length,
            selectedObjectIndex: objects.length,
            startPoint: startPoint,
            mode: meta.editor ? EditMode.EDIT_OBJECT : EditMode.SCALE,
            selectedTool: null
        });
    }
    updatePath(object) {
        let {path} = object;
        let diffX = object.x - object.moveX;
        let diffY = object.y - object.moveY;
        let newPath = path.map(({x1, y1, x2, y2, x, y}) => ({
            x1: diffX + x1,
            y1: diffY + y1,
            x2: diffX + x2,
            y2: diffY + y2,
            x: diffX + x,
            y: diffY + y
        }));

        return {
            ...object,
            path: newPath,
            moveX: object.x,
            moveY: object.y
        };
    }
    updateObject(objectIndex, changes, updatePath) {
        let {objects, onUpdate} = this.props;
        onUpdate(objects.map((object, index) => {
            if (index === objectIndex) {
                let objectUpdate = {
                    ...object,
                    ...changes
                };

                return updatePath
                    ? this.updatePath(objectUpdate)
                    : objectUpdate;
            } else {
                return object;
            }
        }));
    }
    getOffset() {
        let parent = this.svgElement.getBoundingClientRect();
        let {canvasWidth, canvasHeight} = this.getCanvas();
        return {
            x: parent.left,
            y: parent.top,
            width: canvasWidth,
            height: canvasHeight
        };
    }
    applyOffset(bundle) {
        let offset = this.getOffset();
        return {
            ...bundle,
            x: bundle.x - offset.x,
            y: bundle.y - offset.y
        }
    }
    updateHandler(index, object, pictureX, pictureY, zoom) {
        let target = this.objectRefs[index];
        let bbox = target.getBoundingClientRect();
        let {canvasOffsetX, canvasOffsetY} = this.getCanvas();

        let handler = {
            ...this.state.handler,
            width: (object.width),
            height: (object.height),
            top: (object.y + canvasOffsetY - (pictureY)),
            left: (object.x + canvasOffsetX - (pictureX)),
            rotate: object.rotate
        };
        if (!object.width) {
            let offset = this.getOffset();
            handler = {
                ...handler,
                width: bbox.width / zoom,
                height: bbox.height / zoom,
                left: (bbox.left - offset.x) / zoom,
                top: (bbox.top - offset.y) / zoom
            };
        }
        this.setState({
            handler: handler,
            panZoomDisabled: true,
            bbox: bbox,
            offset: this.getOffset()
        });
    }
    snapCoordinates({x, y}) {
        let {snapToGrid} = this.props;
        return {
            x: x - (x % snapToGrid),
            y: y - (y % snapToGrid)
        };
    }
    getMouseCoords({clientX, clientY}) {
        let coords = this.applyOffset({
            x: clientX,
            y: clientY
        });
        return this.snapCoordinates(coords);
    }
    handleDraggingPicture(event) {
        if (event.type === "mousedown" && this.state.mode === 'FREE' && !this.state.showHandler) {
            this.setState({
                draggingMode: !this.state.draggingMode,
                showHandler: false,
                dragMouse: this.getMouseCoords(event),
                showPicker: false
            })
        }
    }
    getMatrix = (transformationMatrix) => {
        this.setState({imageX: transformationMatrix.x, imageY: transformationMatrix.y,})
    };
    onDrag(e) {
        let {currentObjectIndex, startPoint, mode, pictureX, pictureY, dragMouse, maxX, maxY, zoom, imageX, imageY,handler,bbox} = this.state;
        let {objects} = this.props;
        let object = objects[currentObjectIndex];
        let mouse = this.getMouseCoords(e);
        let mouseDir = this.getMouseDirection(mouse, mouseDirection);
        let {scale, rotate, drag} = actions;
        let map = {
            [EditMode.SCALE]: scale,
            [EditMode.ROTATE]: rotate,
            [EditMode.DRAG]: drag
        };
        let action = map[mode];

        if (action) {
            let newObjectDragged = action({
                object,
                startPoint,
                mouse,
                objectIndex: currentObjectIndex,
                objectRefs: this.objectRefs,
                zoom,
                mouseDir,
                mode,
                boundaryBox:handler,
                bbox:bbox
            });
            this.updateObject(currentObjectIndex, newObjectDragged);
            this.updateHandler(currentObjectIndex, newObjectDragged, pictureX, pictureY, zoom);
        }
        if (this.state.draggingMode) {
            let directionX = (mouse.x - dragMouse.x) || 0;
            let directionY = (mouse.y - dragMouse.y) || 0;
            let newX = (pictureX - directionX);
            let newY = (pictureY - directionY);
            if (newX < 0) {
                newX = 0
            }
            if (newX > maxX) {
                newX = maxX
            }
            if (newY < 0) {
                newY = 0
            }
            if (newY > maxY) {
                newY = maxY
            }
            this.setState({
                dragMouse: mouse,
                showPicker: false,
                panZoomDisabled: true
            })
        }
    }
    stopDrag() {
        let {mode} = this.state;
        if (_.includes([EditMode.DRAG,
            EditMode.ROTATE,
            EditMode.SCALE], mode)) {
            this.executeCreationAction(this);
            this.setState({
                mode: EditMode.FREE
            });
        }
        this.setState({
            draggingMode: false,
        })
    }
    stopDragging = (e) => {
        if (e) {
            this.setState({panZoomDisabled: true})
        }
    };
    showEditor() {
        let {selectedObjectIndex} = this.state;
        let {objects} = this.props,
            currentObject = objects[selectedObjectIndex],
            objectComponent = this.getObjectComponent(currentObject.type);
        if (objectComponent.meta.editor) {
            this.setState({
                mode: EditMode.EDIT_OBJECT,
                showHandler: true
            });
        }
    }
    getObjectComponent(type) {
        let {objectTypes} = this.props;
        return objectTypes[type];
    }
    getCanvas() {
        let canvasWidth = this.state.canvasWidth;
        let canvasHeight = this.state.canvasHeight;
        return {
            canvasWidth, canvasHeight,
            canvasOffsetX: 0,
            canvasOffsetY: 0
        };
    }
    getZoomFromZoomPan = (zoom) => {
        if (zoom !== undefined) {
            this.setState({zoom: zoom, center: false})
        }
    };
    handlePenZoomDrag = () => {
        this.setState({panZoomDisabled: false})
    };
    renderSVG(ObjectEditor) {
        let canvas = this.getCanvas();
        let {canvasWidth, canvasHeight} = canvas;
        let {pictureX, pictureY, layersList} = this.state;
        let {background, objects, objectTypes, backgroundUrl, getTitle, getObjectLayer,accessToRedact} = this.props;
        let filtred = objects;
        if (getObjectLayer) {
            let filterObjects = (obj) => {
                let layer = layersList.find((i) => {
                    return i.id === getObjectLayer(obj)
                });
                return !layer || layer.checked
            };
            filtred = objects.filter(filterObjects);
        }
        filtred.forEach((item) => {
            let layer = layersList.find((i) => {
                return i.id === getObjectLayer(item)
            });
            if (layer) {
                item.stroke = layer.strokeColor;
                item.fill = layer.fillColor;
            }
        });

        return (
            <SVGRenderer
                selectedMenuItem={this.state.selectedMenuItem}
                background={background}
                imageWidth={this.state.imageWidth}
                imageHeight={this.state.imageHeight}
                canvas={canvas}
                width={canvasWidth}
                height={canvasHeight}
                objects={filtred}
                objectTypes={objectTypes}
                objectRefs={this.objectRefs}
                onRender={(ref) => this.svgElement = ref}
                onMouseDown={this.newObject.bind(this)}
                onObjectClick={this.objectClick.bind(this)}
                getTitle={getTitle.bind(this)}
                backgroundUrl={backgroundUrl}
                pictureX={pictureX}
                pictureY={pictureY}
                zoom={this.state.zoom}
                center={this.state.center}
                selectedObjectIndex={this.state.selectedObjectIndex}
                mode={this.state.mode}
                handler={this.state.handler}
                // onMouseLeave={this.hideHandler.bind(this)}
                showHandler={this.state.showHandler}
                initZoom={this.state.initZoom}
                getZoomFromZoomPan={this.getZoomFromZoomPan}
                panZoomDisabled={this.state.mode !== EditMode.FREE || this.state.panZoomDisabled}
                // onDoubleClick={this.showEditor.bind(this)}
                onDrag={this.startDrag.bind(this, EditMode.DRAG)}
                onResize={this.startDrag.bind(this, EditMode.SCALE)}
                onRotate={this.startDrag.bind(this, EditMode.ROTATE)}
                isSimplePicture={!ObjectEditor}
                ObjectEditor={ObjectEditor}
                selectItem={this.selectItem}
                autoSelectItem={this.autoSelectItem}
                stopDragging={this.stopDragging}
                handlePenZoomDrag={this.handlePenZoomDrag}
                getMatrix={this.getMatrix}
                imageX={this.state.imageX}
                imageY={this.state.imageY}
                bbox={this.state.bbox}
                offset={this.state.offset}
                accessToRedact={accessToRedact}
            />
        );
    }
    selectTool(tool) {
        if (tool === 'clear') {
            this.setState({
                selectedTool: tool,
                mode: EditMode.FREE,
                currentObjectIndex: null,
                showHandler: false,
                handler: null,
                panZoomDisabled: false
            });
        } else {
            this.setState({
                selectedTool: tool,
                mode: EditMode.DRAW,
                currentObjectIndex: null,
                showHandler: false,
                handler: null,
                panZoomDisabled: true
            });
        }
    }
    removeCurrent() {
        let {selectedObjectIndex} = this.state;
        this.removeObject(selectedObjectIndex);
    }
    removeCurrentByUUID(uuid) {
        let {objects} = this.props;
        let ind = objects.findIndex(obj => obj.uuid === uuid);
        this.removeObject(ind)
    }
    removeObject(selectedObjectIndex) {
        let {objects} = this.props;
        let self = this;
        let rest = objects.filter(
            (object, index) =>
                selectedObjectIndex !== index
        );
        this.setState({
            currentObjectIndex: null,
            selectedObjectIndex: null,
            showHandler: false,
            handler: null
        }, () => {
            this.objectRefs = {};
            this.props.onUpdate(rest);
        });
        if (self.handleCheckObjects() === false) {
            self.setState({viewMode: ViewMode.VIEW})
        }
    }
    setEditMode() {
        this.setState({viewMode: ViewMode.EDIT})
    }
    setReadMode() {
        this.setState({viewMode: ViewMode.VIEW, showHandler: false, panZoomDisabled: false})
    }
    moveSelectedObject(attr, points, event, key) {
        let {selectedObjectIndex, pictureX, pictureY, zoom} = this.state;
        let {objects} = this.props;
        let object = objects[selectedObjectIndex];
        if (key.startsWith('shift')) {
            points *= 10;
        }
        let changes = {
            ...object,
            [attr]: object[attr] + points
        };
        this.updateObject(selectedObjectIndex, changes);
        this.updateHandler(selectedObjectIndex, changes, pictureX, pictureY, zoom);
    }
    getKeymapHandlers() {
        let handlers = {
            removeObject: this.removeCurrent.bind(this),
            moveLeft: this.moveSelectedObject.bind(this, 'x', -1),
            moveRight: this.moveSelectedObject.bind(this, 'x', 1),
            moveUp: this.moveSelectedObject.bind(this, 'y', -1),
            moveDown: this.moveSelectedObject.bind(this, 'y', 1),
            edit: this.setEditMode.bind(this),
            read: this.setReadMode.bind(this),
            closePath: () => {
                this.executeCreationAction(this);
                return this.setState({mode: EditMode.FREE});
            }
        };
        return _.mapValues(handlers, (handler) => (event, key) => {
            if (event.target.tagName !== 'INPUT') {
                event.preventDefault();
                handler(event, key);
            }
        });
    }
    executeCreationAction(self) {
        let {objects, creationFormHandler} = self.props;
        let {selectedObjectIndex} = self.state;
        if (objects[selectedObjectIndex].isNew) {
            objects[selectedObjectIndex].isNew = false;
            creationFormHandler(selectedObjectIndex, objects);
        }
    }
    handleMoveToCenter = () => {
        this.setState({pictureX: 0, pictureY: 0, center: true})
    };
    handleCheckObjects = () => {
        let check = this.props.objects && this.props.objects.length > 0;
        return check
    };
    handlerLayerDialog = () => {
        if (this.state.openLayersDialog) {
            this.props.saveColors(this.state.layersList)
        }
        this.setState({openLayersDialog: !this.state.openLayersDialog})
    };
    checkListObject = (item, event) => {
        let newList = Object.assign([], this.state.layersList);
        newList.forEach(i => {
            if (i.id === item) {
                i.checked = event.target.checked
            }
        });
        this.setState({layersList: newList});
    };
    reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };
    onDragEnd = (result) => {
        const {destination} = result;
        if (!destination) {
            return;
        }
        const objects = this.props.objects;
        const newObjects = this.reorder(
            objects,
            result.source.index,
            result.destination.index
        );
        this.props.onUpdate(newObjects);
    };
    handleChangeComplete = (color) => {
        let newList = Object.assign([], this.state.layersList);
        let selectedLayer = this.state.selectedLayer;
        newList.forEach(i => {
            if (i.id === selectedLayer.id) {
                if (selectedLayer.type === 'fill') {
                    i.fillColor = color.hex
                }
                if (selectedLayer.type === 'stroke') {
                    i.strokeColor = color.hex
                }
                selectedLayer.color = color.hex
            }
        });
        this.setState({layersList: newList});
    };
    closePicker = () => {
        this.setState({
            showPicker: false
        })
    };
    showPicker = (id, type, color) => {
        this.setState({
            showPicker: !this.state.showPicker,
            selectedLayer: {
                id: id,
                type: type,
                color: color,
            }
        })
    };
    autoSelectItem = () => {
        let selectedMenuItem = this.state.selectedMenuItem;
        if (selectedMenuItem && selectedMenuItem.length > 0) {
            this.selectItem(selectedMenuItem[0], false)
        }
    };
    selectItem = (index, indicator) => {
        let selectedMenuItem = this.state.selectedMenuItem;
        let {pictureX, pictureY, maxX, maxY} = this.state;
        let isSelection = true;
        if (selectedMenuItem.length === 0) {
            selectedMenuItem.push(index);
        } else if (selectedMenuItem.length === 1) {
            let idx = selectedMenuItem[0] !== index;
            if (idx) {
                selectedMenuItem[0] = index;
            } else {
                selectedMenuItem = [];
                isSelection = false
            }
        }
        let newX = pictureX;
        let newY = pictureY;
        if (isSelection && indicator) {
            let {objects} = this.props;
            let {canvasWidth, canvasHeight} = this.state;
            let obj = objects[index];
            let x = obj.x;
            let y = obj.y;
            newX = this.calcNewPictureCoord(newX, x, canvasWidth, maxX);
            newY = this.calcNewPictureCoord(newY, y, canvasHeight, maxY);
        }
        this.setState({
            selectedMenuItem: selectedMenuItem,
            pictureX: newX,
            pictureY: newY,
        })
    };
    calcNewPictureCoord(coord, objCoord, fullSize, maxCoord) {
        coord = (fullSize - this.state.imageWidth * this.state.zoom);
        if (coord < 0) {
            coord = 0
        }
        if (coord > maxCoord) {
            coord = maxCoord
        }
        return coord;
    }
    calcNewZoomCoord(canvas, imgSize, mouseCoord, picturePosition, maxCoord, zoom) {
        let result = ((imgSize * zoom) - canvas) / zoom;
        console.log('result', result)
        return result;
    }
    zooming = (zoom, mark) => {
        let screenWidth = this.state.canvasWidth;
        let screenHeight = this.state.canvasHeight;
        let initZoom = this.state.initZoom;
        let newZoom = zoom >= initZoom ? zoom : initZoom;
        let pictureX = this.state.pictureX;
        let pictureY = this.state.pictureY;
        let newPicX = mark === 'plus' ? pictureX + screenWidth / (zoom * zoom) : pictureX - screenWidth / ((zoom + 1) * (zoom + 1))
        let newPicY = mark === 'plus' ? pictureY + screenHeight / (zoom * zoom) : pictureY - screenHeight / ((zoom + 1) * (zoom + 1))
        this.setState({
            zoom: newZoom,
            pictureX: newPicX,
            pictureY: newPicY,
            maxX: (this.state.imageWidth * newZoom - screenWidth) / newZoom,
            maxY: (this.state.imageHeight * newZoom - screenHeight) / newZoom,
        });
    };
    handlerSaveChanges = () => {
        this.props.saveChanges();
    };
    getMouseDirection = (mouse, mouseDirection) => {
        if (mouse.x > mouseOldX) {
            mouseDirection.x = 1
        } else {
            mouseDirection.x = -1
        }
        if (mouse.y > mouseOldY) {
            mouseDirection.y = 1
        } else {
            mouseDirection.y = -1
        }
        mouseOldX = mouse.x;
        mouseOldY = mouse.y;
        return mouseDirection
    };

    render() {
        let {
            mode, selectedObjectIndex, selectedTool, pictureX, pictureY, openLayersDialog, selectedMenuItem, viewMode
        } = this.state;
        let {objects, objectTypes, insertMenu: InsertMenuComponent, backgroundUrl, getTitle, accessToRedact, viewSettings} = this.props;
        if (!backgroundUrl) {
            return <div> Original image not available </div>
        }
        let currentObject = objects[selectedObjectIndex],
            isEditMode = (mode === EditMode.EDIT_OBJECT),
            showPropertyPanel = selectedObjectIndex !== null;
        let {canvasWidth, canvasHeight} = this.getCanvas();
        let objectComponent, ObjectEditor;
        if (currentObject) {
            objectComponent = this.getObjectComponent(currentObject.type);
            ObjectEditor = objectComponent.meta.editor;
        }

        let layers;
        if (this.state.layersList.length > 0) {
            layers = this.state.layersList.map((layer, key) => {
                let layerColor = "#fff";
                colors.map((colorItem) => {
                    if (key === colorItem.index) {
                        return layerColor = colorItem.color
                    }
                });
                return <div key={key}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid lightgray',
                                justifyContent: 'space-between',
                                padding: '0 5px'
                            }}>
                    <input type="checkbox" checked={layer.checked} onChange={(event) => {
                        this.checkListObject(layer.id, event)
                    }}/>
                    {layer.name}
                    <div style={{display: 'flex'}}>
                        <div style={{
                            ...styles.colorPickerItem,
                            backgroundColor: '#fff',
                            border: '3px solid' + layer.strokeColor
                        }}
                             onClick={() => {
                                 accessToRedact && viewMode === 'EDIT' && this.showPicker(layer.id, 'stroke', layer.strokeColor)
                             }}/>
                        <div style={{...styles.colorPickerItem, backgroundColor: layer.fillColor}} onClick={() => {
                            accessToRedact && viewMode === 'EDIT' && this.showPicker(layer.id, 'fill', layer.fillColor)
                        }}/>
                    </div>
                </div>
            });
        }

        return (
            <div style={{display: 'flex', backgroundColor: '#f0f2f5', padding: "2px 0"}}>
                {this.state.showPicker && <div style={{
                    position: 'absolute',
                    zIndex: 100,
                    margin: '2px 0 0 260px',
                    backgroundColor: 'white',
                    padding: 3,
                    borderRadius: 3
                }} onMouseLeave={this.closePicker}>
                    <BlockPicker color={this.state.selectedLayer.color} onChangeComplete={this.handleChangeComplete}
                                 width={320} triangle={'hide'}/>
                    <HuePicker color={this.state.selectedLayer.color} onChangeComplete={this.handleChangeComplete}
                               width={320}/>
                </div>}

                {openLayersDialog && <div style={styles.layerMenuContainer}>{layers}</div>}

                <HotKeys
                    keyMap={this.keyMap}
                    style={styles.keyboardManager}
                    handlers={this.handleCheckObjects() ? this.getKeymapHandlers() : {}}>
                    <div className={'container1'}
                         style={{
                             height: this.state.canvasHeight, ...styles.container, ...this.props.style,
                             cursor: this.state.mode === "FREE" ? (this.state.draggingMode ? 'grabbing' : 'grab') : 'default'
                         }}
                         onMouseMove={this.onDrag.bind(this)}
                         onMouseUp={this.stopDrag.bind(this)}
                         onClick={this.hideHandlerForce.bind(this)}
                         onMouseDown={this.handleDraggingPicture.bind(this)}
                         onMouseLeave={this.stopDrag.bind(this)}
                    >
                        {InsertMenuComponent &&
                        <InsertMenuComponent tools={objectTypes}
                                             viewMode={this.state.viewMode}
                                             setEditMode={this.setEditMode.bind(this)}
                                             setReadMode={this.setReadMode.bind(this)}
                                             handleMoveToCenter={this.handleMoveToCenter.bind(this)}
                                             currentTool={selectedTool}
                                             onSelect={this.selectTool.bind(this)}
                                             saveChanges={this.handlerSaveChanges}
                                             handlerLayerDialog={this.handlerLayerDialog}
                                             zooming={this.zooming}
                                             zoom={this.state.zoom}
                                             access={accessToRedact}
                                             viewSettings={this.props.viewSettings}
                        />}
                        {/* Center Panel: Displays the preview */}
                        <div style={styles.canvasContainer}>
                            {isEditMode && ObjectEditor && (
                                <ObjectEditor object={currentObject}
                                              offset={this.getOffset()}
                                              onUpdate={(object) => this.updateObject(selectedObjectIndex, object)}
                                              onClose={() => {
                                                  return this.setState({mode: EditMode.FREE})
                                              }}
                                              width={canvasWidth}
                                              height={canvasHeight}
                                              pictureX={pictureX}
                                              pictureY={pictureY}
                                              imageX={this.state.imageX}
                                              imageY={this.state.imageY}
                                              zoom={this.state.zoom}
                                />
                            )
                            }
                            <div style={{overflow: 'hidden', height: canvasHeight, width: canvasWidth}}>
                                {this.renderSVG(ObjectEditor)}
                            </div>
                        </div>
                    </div>
                </HotKeys>
                <div className={"ObjectsList"}
                     style={{
                         width: '100%',
                         height: this.state.canvasHeight,
                         backgroundColor: '#dedede',
                         boxSizing: 'border-box',
                         overflow: 'auto',
                         margin: '0 5px',
                         borderRadius: '4px'
                     }}>
                    {objects && objects.length > 0 && <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided) => (
                                <div ref={provided.innerRef}
                                     {...provided.droppableProps}
                                >
                                    {objects.map((obj, index) => {
                                        return <Draggable
                                            key={obj.uuid}
                                            draggableId={obj.uuid}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <DraggableObjectItem listItemDelete={this.removeCurrentByUUID}
                                                                         onClick={this.selectItem}
                                                                         viewMode={this.state.viewMode}
                                                                         object={obj}
                                                                         getTitle={getTitle}
                                                                         index={index}
                                                                         selectedMenuItem={selectedMenuItem}
                                                                         onDoubleClick={() => {
                                                                             this.props.creationFormHandler(index, objects);
                                                                             this.props.onUpdate(objects)
                                                                         }}
                                                                         viewSettings={viewSettings}
                                                                         access={accessToRedact}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    }
                </div>
            </div>
        );
    }
}

export const styles = {
    container: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        width: 'fit-content',
        boxSizing: 'border-box',
        backgroundColor: '#f0f2f5',
    },
    canvasContainer: {
        position: 'relative'
    },
    keyboardManager: {
        outline: 'none'
    },
    colorPickerItem: {
        width: 15,
        height: 15,
        backgroundColor: "#fff",
        boxShadow: '0 0 3px gray',
        boxSizing: 'border-box',
        borderRadius: 3,
        cursor: 'pointer',
        margin: 5
    },
    layerMenuContainer: {
        position: 'absolute',
        zIndex: 12,
        marginLeft: 52,
        marginRight: 10,
        marginTop: 2,
        backgroundColor: 'white',
        width: 200,
        height: 'auto',
        overflow: 'auto',
        boxShadow: '2px 2px 5px 0 black',
        borderRadius: 3
    }
};

export default Designer;
