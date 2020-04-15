import React, {Component} from 'react';

export default class Vector extends Component {
    static panels = [];

    getStyle() {
        let {object} = this.props;
        return {
            mixBlendMode: object.blendMode
        }
    }
    getTransformMatrix({rotate, x, y, width, height}) {
        if (rotate) {
            let centerX = width / 2 + x;
            let centerY = height / 2 + y;
            return `rotate(${rotate} ${centerX} ${centerY})`;
        }
    }
    onClick() {
        let {onObjectClick, object, index} = this.props;
        onObjectClick(object, index)
    }
    getTitleString() {
        let {getTitle, object} = this.props;
        if (getTitle && typeof getTitle === 'function') {
            return getTitle(object)
        }
        return "name not specified"
    }
    getObjectAttributes() {
        let {object, onRender, onObjectClick, getTitle, ...rest} = this.props;
        let {moveX, moveY, closed, isNew, ...objectProps} = object;
        return {
            ...objectProps,
            transform: this.getTransformMatrix(object),
            ref: onRender,
            ...rest
        };
    }
}
