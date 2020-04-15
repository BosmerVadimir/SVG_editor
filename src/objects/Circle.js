import React from 'react';
import Icon from '../Icon';
import Vector from './Vector';

export default class Circle extends Vector {
  static meta = {
    icon: <Icon icon={'circle'} size={30} />,
    initial: {
      width: 5,
      height: 5,
      rotate: 0,
      fillOpacity:0.2,
      strokeWidth: 2,
      stroke:"blue",
    }
  };

  render() {
    let {object} = this.props;
    return (
      <ellipse
          onClick={this.onClick.bind(this)}
          style={this.getStyle()}
         {...this.getObjectAttributes()}
         rx={object.width / 2}
         ry={object.height / 2}
         cx={object.x + object.width / 2}
         cy={object.y + object.height / 2} >
        <title> {this.getTitleString()} </title>
      </ellipse>
    );
  }
}