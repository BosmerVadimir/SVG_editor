import React from 'react';
import Icon from '../Icon';
import Vector from './Vector';

export default class Rect extends Vector {
  static meta = {
    icon: <Icon icon={'rectangle'} size={30} />,
    initial: {
      width: 5,
      height: 5,
      radius: 0,
      rotate: 0,
      fillOpacity:0.2,
      strokeWidth: 2,
      stroke:"blue",
    }
  };

  render() {
    let {object} = this.props;
    return (
      <rect
          onClick={this.onClick.bind(this)}
          style={this.getStyle()}
         {...this.getObjectAttributes()}
         rx={object.radius}
         width={object.width}
         height={object.height} >
        <title> {this.getTitleString()} </title>
      </rect>
    );
  }
}