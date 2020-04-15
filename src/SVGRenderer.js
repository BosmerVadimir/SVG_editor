import React, {Component} from 'react';
import PanZoom from "./panZoom/PanZoom";
import Handler from './Handler';
import _ from "lodash";

class SVGRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: null
        };
        this.svgMoving = null;

        this.setSvgMovingRef = element => {
            this.svgMoving = element;
        }
    }

    getObjectComponent(type) {
        let {objectTypes} = this.props;
        return objectTypes[type];
    }

    renderObject(object, index) {
        let {objectRefs, onMouseOver, onMouseDown, onObjectClick, onMouseLeave, getTitle, selectedMenuItem, imageX, imageY, bbox} = this.props;
        let Renderer = this.getObjectComponent(object.type);
        return <Renderer onRender={(ref) => objectRefs[index] = ref}
            // onMouseOver={onMouseOver(this, index)}
            // onMouseLeave={onMouseLeave(this, index)}
                         object={object} key={index} index={index}
                         onMouseDown={onMouseDown}
                         onObjectClick={onObjectClick}
                         getTitle={getTitle}
                         style={{cursor: 'default'}}
                         zoom={this.props.zoom}
                         bbox={bbox}
            // onClick={()=>{selectItem(index)}}
        />;
    }

    onStateChange = (x) => {
        this.props.getZoomFromZoomPan(x.scale)
    };

    render() {
        let {
            background, objects, svgStyle, canvas, onMouseDown, onRender, backgroundUrl, pictureX, pictureY, zoom, stopDragging, ObjectEditor,
            initZoom, selectedObjectIndex, showHandler, handler, onMouseLeave, onDoubleClick, onDrag, onResize, onRotate, selectItem,
            autoSelectItem, getMatrix, bbox, offset, imageWidth, imageHeight,accessToRedact
        } = this.props;
        let {canvasWidth, canvasHeight, canvasOffsetX, canvasOffsetY} = canvas;
        let style = {
            zIndex: 5,
            borderRadius: 4,
            ...background ? {
                backgroundColor: background
            } : "",
            ...{
                ...svgStyle,
                marginTop: canvasOffsetY,
                marginLeft: canvasOffsetX,
            }
        };
        let currentObject = objects[selectedObjectIndex];
        return (<div id={'SVG'} ref={this.setSvgMovingRef}>
                {initZoom !== 1 && <PanZoom
                    className={"PANZOOM"}
                    minZoom={initZoom}
                    maxZoom={6}
                    onStateChange={this.onStateChange}
                    disabled={this.props.panZoomDisabled}
                    initZoom={zoom}
                    style={{width: canvasWidth, height: canvasHeight, overflow: 'hidden', borderRadius: 4}}
                    getMatrix={getMatrix}

                >
                    {showHandler && accessToRedact && (
                        <Handler
                            pictureX={ObjectEditor ? 0 : pictureX}
                            pictureY={ObjectEditor ? 0 : pictureY}
                            boundingBox={handler}
                            canResize={_(currentObject).has('width') || _(currentObject).has('height')}
                            canRotate={_(currentObject).has('rotate')}
                            onDoubleClick={onDoubleClick}
                            onDrag={onDrag}
                            onResize={onResize}
                            onRotate={onRotate}
                            zoom={zoom}
                            isSimplePicture={!ObjectEditor}
                            onMouseLeave={onMouseLeave}
                            selectItem={selectItem}
                            autoSelectItem={autoSelectItem}
                            onMouseOver={(e) => {return stopDragging(e)}}
                            bbox={bbox}
                            offset={offset}
                            object={currentObject}
                        />
                    )}
                    <div ref={ref => this.state.content = ref}>
                        <svg onMouseDown={onMouseDown}
                            // onMouseOver={this.scrollZooming}
                            // preserveAspectRatio="xMidYMid slice"
                             preserveAspectRatio="xMinYMin meet"
                             viewBox={`${pictureX} ${pictureY} ${imageWidth} ${imageHeight}`}
                             ref={onRender}
                             width={imageWidth}
                             height={imageHeight}
                             style={style}
                             isroot={"true"}
                        >
                            <image
                                width={this.props.imageWidth}
                                height={this.props.imageHeight}
                                xlinkHref={backgroundUrl}
                                x="0" y="0"/>
                            {objects.map(this.renderObject.bind(this))}
                            <filter id="shadow">
                                <feColorMatrix in="SourceGraphic"
                                               type="matrix"
                                               values="0 0 0 0 0
                                                1 1 1 .5 0
                                                0 0 0 0 1
                                                0 0 0 1.5 0"
                                />
                            </filter>
                        </svg>
                    </div>
                </PanZoom>}
            </div>
        );
    }
}

export default SVGRenderer;
