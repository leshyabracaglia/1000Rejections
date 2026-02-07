import React from 'react';
import { View, Text } from 'react-native';

const Svg = ({ children, ...props }: any) => <View {...props}>{children}</View>;
const Circle = (props: any) => <View {...props} />;
const Line = (props: any) => <View {...props} />;
const Polyline = (props: any) => <View {...props} />;
const SvgText = ({ children, ...props }: any) => <Text {...props}>{children}</Text>;
const Rect = (props: any) => <View {...props} />;
const Path = (props: any) => <View {...props} />;
const G = ({ children, ...props }: any) => <View {...props}>{children}</View>;

export default Svg;
export { Circle, Line, Polyline, SvgText as Text, Rect, Path, G };
