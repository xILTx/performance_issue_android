import {Circle, Group} from '@shopify/react-native-skia';
import React from 'react';
import {Dimensions} from 'react-native';
import {
  SharedValue,
  interpolate,
  useDerivedValue,
  useSharedValue,
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

  const distanceFromEdge = useSharedValue(0);
  const isCornerRegion = useSharedValue(0);

  /////////// RADIUS
  const avatarRadius = useDerivedValue(() => {
    const avatarX = positions[index].x + x.value - CANVAS_WIDTH / 2;
    const avatarY = positions[index].y + y.value - CANVAS_HEIGHT / 2;

    // Check if bubble is in innerZonne
    if (
      Math.abs(avatarX) <= INNER_ZONE_X_RADIUS &&
      Math.abs(avatarY) <= INNER_ZONE_Y_RADIUS
    ) {
      // Check if bubble is in innerZonne
      isCornerRegion.value = 0;
      return AVATAR_SIZE;
    } else {
      // Check if bubble is in corner zone
      if (
        Math.abs(avatarX) > INNER_ZONE_X_RADIUS &&
        Math.abs(avatarY) > INNER_ZONE_Y_RADIUS
      ) {
        isCornerRegion.value = 1;
        distanceFromEdge.value = interpolate(
          Math.sqrt(
            Math.pow(Math.abs(avatarX) - INNER_ZONE_X_RADIUS, 2) +
              Math.pow(Math.abs(avatarY) - INNER_ZONE_Y_RADIUS, 2),
          ),
          [0, EDGE],
          [AVATAR_SIZE, 0],
          Extrapolation.CLAMP,
        );
        return distanceFromEdge.value;
      } else {
        isCornerRegion.value = 0;
        // Bubble not in corner zone
        distanceFromEdge.value = interpolate(
          Math.max(
            Math.abs(avatarX) - INNER_ZONE_X_RADIUS,
            Math.abs(avatarY) - INNER_ZONE_Y_RADIUS,
          ),
          [0, EDGE],
          [AVATAR_SIZE, 0],
          Extrapolation.CLAMP,
        );
        return distanceFromEdge.value;
      }
    }
  });

  ///////////////// TRANSFORM X
  const calculatedX = useDerivedValue(() => {
    const dx = x.value;
    const avatarX = positions[index].x + x.value - CANVAS_WIDTH / 2;
    const avatarY = positions[index].y + y.value - CANVAS_HEIGHT / 2;

    if (isCornerRegion.value) {
      const cornerDx = Math.abs(avatarX) - INNER_ZONE_X_RADIUS;
      const cornerDy = Math.abs(avatarY) - INNER_ZONE_Y_RADIUS;
      let theta = Math.atan(cornerDy / cornerDx);
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
      return dx - (AVATAR_SIZE - avatarRadius.value) * Math.cos(theta);
    } else if (Math.abs(avatarX) > INNER_ZONE_X_RADIUS) {
      return dx - (AVATAR_SIZE - avatarRadius.value) * Math.sign(avatarX);
    }
    return dx;
  });

  ///////////////// TRANSFORM Y
  const calculatedY = useDerivedValue(() => {
    const dy = y.value;
    const avatarX = positions[index].x + x.value - CANVAS_WIDTH / 2;
    const avatarY = positions[index].y + y.value - CANVAS_HEIGHT / 2;

    if (isCornerRegion.value) {
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
      return dy - (AVATAR_SIZE - avatarRadius.value) * Math.sin(theta);
    } else if (Math.abs(avatarY) > INNER_ZONE_Y_RADIUS) {
      return dy - (AVATAR_SIZE - avatarRadius.value) * Math.sign(avatarY);
    }
    return dy;
  });

  ///////////////// ORIGIN POINT
  const origin = useDerivedValue(() => {
    return {x: positions[index].x + x.value, y: positions[index].y + y.value};
  });

  const finalTransform = useDerivedValue(() => {
    return [{translateX: calculatedX.value}, {translateY: calculatedY.value}];
  });
  return (
    <Group origin={origin} transform={finalTransform}>
      <Circle
        cx={positions[index].x}
        cy={positions[index].y}
        r={avatarRadius}
        color={color}
      />
    </Group>
  );
};
