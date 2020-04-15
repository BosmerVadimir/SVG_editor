import React from 'react';
import Icon from '../Icon';
import Vector from './Vector';
import SimpleEditor from "../editors/SimpleEditor";

export default class Polyline extends Vector {
    constructor(props) {
        super(props);
        this.state = {
            zoom: 1,
            imgX: 0,
            imgY: 0,
            bbox: null,
        }
    }
    componentDidMount(): void {
        let {imageX, imageY, zoom} = this.props;
        this.setState({zoom: zoom, imgX: imageX, imgY: imageY})
    }
    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        let {imageX, imageY, zoom} = this.props;
        if (prevProps.index !== this.props.index) {
            this.setState({zoom: zoom, imgX: imageX, imgY: imageY})
        }
        if (prevProps.bbox !== this.props.bbox) {
            if (this.state.bbox === null) {
                this.setState({bbox: this.props.bbox})
            }
        }
    }

    static meta = {
        initial: {
            closed: false,
            rotate: 0,
            moveX: 0,
            moveY: 0,
            path: [],
            strokeWidth: 2,
            fillOpacity: 0.2,
            stroke: "blue",
        },
        icon: <Icon icon={'polygon'} size={30}/>,
        editor: SimpleEditor
    };

    buildPolyline(object) {
        let {zoom, imgX, imgY} = this.state;
        let {path} = object;
        let curves = path.map(({x1, x2, y1, y2, x, y}) => {
            let x1_Mod = x1 / zoom;
            let x2_Mod = x2 / zoom;
            let y1_Mod = y1 / zoom;
            let y2_Mod = y2 / zoom;

            x1 = x1 ? x1_Mod : "";
            y1 = y1 ? y1_Mod : "";
            x2 = x && y && x2 ? x2_Mod : "";
            y2 = x && y && y2 ? y2_Mod : "";
            return (
                `${x1} ${y1} ${x2} ${y2}`
            );
        });
        return curves.join(' ');
    }

    getTransformMatrix({rotate, x, y, moveX, moveY}) {
        let {object, zoom} = this.props;
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
        let centerX =(maxX - ((maxX - minX) / 2))/zoom;
        let centerY = (maxY - ((maxY - minY) / 2))/zoom;

        return `translate(${x - moveX} ${y - moveY})rotate(${rotate} ${Math.round(centerX )} ${Math.round(centerY)})`;
    }

    render() {
        let {object} = this.props;
        let fill = (!!object.closed ? object.fillOpacity.toString() : "transparent");

        return (
            <polygon
                onClick={this.onClick.bind(this)}
                style={this.getStyle(object)}
                {...this.getObjectAttributes()}
                points={this.buildPolyline(object)}
                fill={fill}
            >
                <title> {this.getTitleString()} </title>
            </polygon>
        );
    }
}
