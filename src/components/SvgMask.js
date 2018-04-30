// @flow
import React, { Component } from 'react';
import {
  View,
  Animated,
  Easing,
} from 'react-native';
// import { Svg } from 'expo';
import Svg from 'react-native-svg';
import AnimatedSvgPath from './AnimatedPath';

import type { valueXY } from '../types';

const path = (size, position, canvasSize): string => `M0,0H${canvasSize.x}V${canvasSize.y}H0V0ZM${position.x._value},${position.y._value}H${position.x._value + size.x._value}V${position.y._value + size.y._value}H${position.x._value}V${position.y._value}Z`;

type Props = {
  size: valueXY,
  position: valueXY,
  style: object | number | Array,
  easing: func,
  animationDuration: number,
  animated: boolean,
};

type State = {
  size: Animated.ValueXY,
  position: Animated.ValueXY,
  canvasSize: valueXY,
};

class SvgMask extends Component<Props, State> {
  static defaultProps = {
    animationDuration: 300,
    easing: Easing.linear,
  };

  constructor(props) {
    super(props);

    this.state = {
      canvasSize: { x: 0, y: 0 },
      size: new Animated.ValueXY({ x: 0, y: 0 }),
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      animated: false,
    };

    this.state.position.addListener(this.animationListener);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.position !== nextProps.position || this.props.size !== nextProps.size) {
      this.animate(nextProps.size, nextProps.position);
    }
  }

  animationListener = (): void => {
    const d: string = path(this.state.size, this.state.position, this.state.canvasSize);
    if (this.mask) {
      this.mask.setNativeProps({ d });
    }
  };

  animate = (size: valueXY = this.props.size, position: valueXY = this.props.position): void => {
    if (this.state.animated) {
      Animated.parallel([
        Animated.timing(this.state.size, {
          toValue: size,
          duration: this.props.animationDuration,
          easing: this.props.easing,
        }),
        Animated.timing(this.state.position, {
          toValue: position,
          duration: this.props.animationDuration,
          easing: this.props.easing,
        }),
      ]).start();
    } else {
      this.state.size.setValue(size);
      this.state.position.setValue(position);
      this.setState({ animated: this.props.animated });
    }
  }

  handleLayout = ({ nativeEvent: { layout: { width, height } } }) => {
    this.setState({
      canvasSize: {
        x: width,
        y: height,
      },
    });
  }

  render() {
    return (
      <View pointerEvents="box-none" style={this.props.style} onLayout={this.handleLayout}>
        <Svg pointerEvents="none" width={this.state.canvasSize.x} height={this.state.canvasSize.y}>
          <AnimatedSvgPath
            ref={(ref) => { this.mask = ref; }}
            fill="rgba(0, 0, 0, 0.4)"
            fillRule="evenodd"
            strokeWidth={1}
            d={path(this.state.size, this.state.position, this.state.canvasSize)}
          />
        </Svg>
      </View>
    );
  }
}

export default SvgMask;
