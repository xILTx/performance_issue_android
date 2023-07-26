import {Circle, Group, Paint} from '@shopify/react-native-skia';
import React from 'react';
import {Dimensions} from 'react-native';
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import {Extrapolation} from 'react-native-reanimated';

type SkAvatarProps = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  color?: string;
  index: number;
  positions: {
    x: number;
    y: number;
  }[];
  canvasHeight: number;
};

export const AVATAR_SIZE = 40;

export const EDGE = AVATAR_SIZE + 8;

const CANVAS_WIDTH = Dimensions.get('window').width;

export const SkAvatar = ({
  x,
  y,
  color = 'mediumpurple',
  index,
  positions,
  canvasHeight,
}: SkAvatarProps) => {
  const CANVAS_HEIGHT = canvasHeight;

  const INNER_ZONE_X_RADIUS = CANVAS_WIDTH / 2 - EDGE;
  const INNER_ZONE_Y_RADIUS = CANVAS_HEIGHT / 2 - EDGE;

  /////////// CALCULATED TRANSFORM
  const calculatedTransform = useDerivedValue(() => {
    const dx = x.value;
    const dy = y.value;
    const avatarX = positions[index].x + x.value - CANVAS_WIDTH / 2;
    const avatarY = positions[index].y + y.value - CANVAS_HEIGHT / 2;

    let isCornerRegion = false;

    // parameters

    let avatarScale = 1;
    let translateX = dx;
    let translateY = dy;

    if (
      Math.abs(avatarX) <= INNER_ZONE_X_RADIUS &&
      Math.abs(avatarY) <= INNER_ZONE_Y_RADIUS
    ) {
      // Check if bubble is in innerZonne
      isCornerRegion = false;
      avatarScale = 1;
    } else {
      // Check if bubble is in corner zone
      if (
        Math.abs(avatarX) > INNER_ZONE_X_RADIUS &&
        Math.abs(avatarY) > INNER_ZONE_Y_RADIUS
      ) {
        isCornerRegion = true;
        avatarScale = interpolate(
          Math.sqrt(
            Math.pow(Math.abs(avatarX) - INNER_ZONE_X_RADIUS, 2) +
              Math.pow(Math.abs(avatarY) - INNER_ZONE_Y_RADIUS, 2),
          ),
          [0, EDGE],
          [1, 0],
          Extrapolation.CLAMP,
        );
      } else {
        // Bubble not in corner zone
        isCornerRegion = false;
        avatarScale = interpolate(
          Math.max(
            Math.abs(avatarX) - INNER_ZONE_X_RADIUS,
            Math.abs(avatarY) - INNER_ZONE_Y_RADIUS,
          ),
          [0, EDGE],
          [1, 0],
          Extrapolation.CLAMP,
        );
      }
    }
    if (isCornerRegion) {
      const cornerDx = Math.abs(avatarX) - INNER_ZONE_X_RADIUS;
      const cornerDy = Math.abs(avatarY) - INNER_ZONE_Y_RADIUS;
      let theta = Math.atan(-cornerDy / cornerDx);
      if (avatarX > 0) {
        if (avatarY > 0) {
          theta *= -1;
        }
      } else {
        if (avatarY > 0) {
          theta += Math.PI;
        } else {
          theta += Math.PI - 2 * theta;
        }
      }
      translateX -= AVATAR_SIZE * (1 - avatarScale) * Math.cos(theta);
      translateY -= AVATAR_SIZE * (1 - avatarScale) * Math.sin(theta);
    } else if (
      Math.abs(avatarX) > INNER_ZONE_X_RADIUS ||
      Math.abs(avatarY) > INNER_ZONE_X_RADIUS
    ) {
      if (Math.abs(avatarX) > INNER_ZONE_X_RADIUS) {
        translateX -= AVATAR_SIZE * (1 - avatarScale) * Math.sign(avatarX);
      } else {
        translateY -= AVATAR_SIZE * (1 - avatarScale) * Math.sign(avatarY);
      }
    }
    return [
      {scale: avatarScale},
      {translateX: translateX},
      {translateY: translateY},
    ];
  });

  ///////////////// ORIGIN POINT
  // const origin = useDerivedValue(() => {
  //   return {
  //     x: positions[index].x + calculatedTransform.value[1].translateX!,
  //     y: positions[index].y + calculatedTransform.value[2].translateY!,
  //   };
  // });

  const viewStyle = useAnimatedStyle(() => {
    return {
      transform: calculatedTransform.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          height: AVATAR_SIZE * 2,
          width: AVATAR_SIZE * 2,
          borderRadius: AVATAR_SIZE,
          left: positions[index].x,
          top: positions[index].y,
          backgroundColor: color,
        },
        viewStyle,
      ]}
    />
    // <Group origin={origin} transform={calculatedTransform}>
    //   <Circle
    //     cx={positions[index].x}
    //     cy={positions[index].y}
    //     r={AVATAR_SIZE}
    //     color={color}
    //   />
    // </Group>
  );
};
