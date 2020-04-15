//...contains three classes used to transform an object
import React, {Component} from 'react';

class ScaleAnchor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorHovered: false
        }
    }

    setAnchorHovered = (newAnchorHovered) => {
        this.state.anchorHovered = newAnchorHovered
    };

    render() {
        return (
            <div
                style={{
                    ...styles.anchor,
                    ...this.state.anchorHovered ? styles.anchorHovered : {},
                    ...styles.scaleAnchor,
                }}
                className={'resize-anchor'}
                onMouseOver={() => this.setAnchorHovered(true)}
                onMouseOut={() => this.setAnchorHovered(false)}
                onMouseDown={this.props.onMouseDown}/>
        );
    }
}

class RotateAnchor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorHovered: false
        }
    }

    setAnchorHovered = (newAnchorHovered) => {
        this.state.anchorHovered = newAnchorHovered
    };

    render() {
        let arrow =
            <svg viewBox="0 0 408 408">
                <g>
                    <g id="refresh" style={{}}>
                        <path d="M346.8,61.2C311.1,22.95,260.1,0,204,0C91.8,0,0,91.8,0,204s91.8,204,204,204c94.35,0,173.4-66.3,196.35-153H346.8
			C326.4,313.65,270.3,357,204,357c-84.15,0-153-68.85-153-153c0-84.15,68.85-153,153-153c43.35,0,79.05,17.85,107.1,45.9
			l-81.6,81.6H408V0L346.8,61.2z"/>
                    </g>
                </g>
            </svg>;
        return (
            <div style={{
                ...this.state.anchorHovered ? styles.anchorHovered : {},
                ...styles.rotateAnchor,
            }}
                 className={'rotate-anchor'}
                 onMouseOver={() => this.setAnchorHovered(true)}
                 onMouseOut={() => this.setAnchorHovered(false)}
                 onMouseDown={this.props.onMouseDown}>{arrow}</div>
        )
    }
}

class Handler extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bbox: {},
        }
    }

    componentDidMount(): void {
        this.setState({bbox: this.props.bbox})
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        if (prevProps.bbox !== this.props.bbox) {
            if (this.state.bbox === {}) {
                this.setState({bbox: this.props.bbox})
            }
        }
    }

    onMouseDown(event) {
        // event.preventDefault();
        if (event.target.classList.contains('handler')) {
            this.props.onDrag(event);
        }
    }

    click = () => {
        this.props.autoSelectItem();
    };

    render() {
        let {props} = this;
        let {boundingBox, canResize, canRotate, zoom, isSimplePicture, object} = this.props;
        let showHandler = canRotate || canResize ? styles.handler : styles.handlerDeselected;
        let objectWidth = boundingBox.width;
        let objectHeight = boundingBox.height;
        let objectLeft = boundingBox.left;
        let objectTop = boundingBox.top;
        if (object && object.path && object.path.length > 0) {
            let xArr = object.path.map((i) => {
                return i.x
            }).sort((a, b) => {
                return b - a;
            });
            let yArr = object.path.map((i) => {
                return i.y
            }).sort((a, b) => {
                return b - a;
            });
            let maxX = xArr.shift();
            let minX = xArr.pop();
            let maxY = yArr.shift();
            let minY = yArr.pop();
            objectWidth = (maxX - minX) / zoom;
            objectHeight = (maxY - minY) / zoom;
            objectLeft = minX / zoom - 15;
            objectTop = minY / zoom - 15;
        }

        let handlerStyle = {
            ...showHandler,
            ...boundingBox,
            width: objectWidth + 15,
            height: objectHeight + 15,
            left: objectLeft,
            top: objectTop,
            transform: `rotate(${boundingBox.rotate}deg)`
        };

        return (
            <div className={'handler'}
                 onClick={this.click}
                 style={handlerStyle}
                 onMouseLeave={props.onMouseLeave}
                 onMouseDown={this.onMouseDown.bind(this)}>
                {props.canRotate &&
                <RotateAnchor onMouseDown={props.onRotate}
                              boundingBox={boundingBox}
                              isSimplePicture={isSimplePicture}
                              zoom={zoom}

                />}
                {props.canResize &&
                <ScaleAnchor onMouseDown={props.onResize}
                             boundingBox={boundingBox}
                             isSimplePicture={isSimplePicture}
                />}
                <div style={{margin: 10, fontSize: 40}}>rotate:{boundingBox.rotate}</div>
            </div>
        );
    }
}

const styles = {
    handlerDeselected: {
        'position': 'absolute',
        'zIndex': 1,
    },
    handler: {
        'position': 'absolute',
        'border': '1px solid #dedede',
        'boxShadow': '0 0 5px 0 black',
        'zIndex': 1,
        backgroundColor: 'rgba(125,125,125,.5)'
    },
    anchor: {
        'width': 30,
        'height': 30,
        'zIndex': 2,
    },
    anchorHovered: {
        'zIndex': 1,
        'fill': 'darkblue',
    },
    scaleAnchor: {
        'color': 'white',
        'borderRight': '5px solid #dedede',
        'borderBottom': '5px solid #dedede',
        'position': 'absolute',
        'zIndex': 1,
        'cursor': 'pointer',
        'right': 3,
        'bottom': 3,
    },
    rotateAnchor: {
        'fill': 'white',
        'width': 30,
        'height': 30,
        'borderRadius': 10,
        'cursor': 'pointer',
        'marginTop': 2,
        'right': 5,
        'zIndex': 1,
        'position': 'absolute',
    }
};

export default Handler;
