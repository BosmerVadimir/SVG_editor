import React from 'react';
import Icon from '../Icon';
import Vector from './Vector';
import BezierEditor from '../editors/BezierEditor';

export default class Path extends Vector {
  static meta = {
    initial: {
      fill: "#e3e3e3",
      closed: false,
      rotate: 0,
      moveX: 0,
      moveY: 0,
      path: [],
      strokeWidth: 3 ,
      fillOpacity:0,
      stroke:"blue",
    },
    icon: <Icon icon={'polygon'} size={30} />,
    editor: BezierEditor
  };

  buildPath(object) {
    let {path} = object;
    
    let curves = path.map(({x1, y1, x2, y2, x, y}, i) => (
      `C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`
    ));

    let instructions = [
      `M ${object.moveX} ${object.moveY}`,
      ...curves
    ];

    if (object.closed) {
      instructions = [
        ...instructions, 'Z'
      ];
    }

    return instructions.join('\n');
  }

  getTransformMatrix({rotate, x, y, moveX, moveY}) {
    return `
      translate(${x - moveX} ${y - moveY})
      rotate(${rotate} ${x} ${y})
    `;
  }

  render() {
    let {object} = this.props;
    let fill = (object.closed ? object.fill : "transparent");
    return (
      <path style={this.getStyle(object)}
         {...this.getObjectAttributes()}
         d={this.buildPath(object)}
         fill={fill} />
    );
  }
}
