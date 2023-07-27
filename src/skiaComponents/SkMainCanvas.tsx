import React, {useEffect, useMemo, useState} from 'react';
import {Canvas, Group} from '@shopify/react-native-skia';
import {Dimensions, View} from 'react-native';
import {EDGE, SkAvatar} from './SkAvatar';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import {AVATAR_SIZE} from './SkAvatar';
import HexGrid from '../utils/HexGrid';

const width = Dimensions.get('window').width;

export const AVATAR_NB = 50;

const AVATAR_ARRAY = [...new Array(AVATAR_NB)];

export const SkMainCanvas = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const [canvasHeight, setCanvasHeight] = useState(0);

  const [virtualizedCanvasDimensions, setVirtualizedCanvasDimensions] =
    useState<{width: number; height: number}>({width: 0, height: 0});

  const positions = useMemo(() => {
    const unshiftPositions = HexGrid(AVATAR_SIZE * 1.3).coords(AVATAR_NB);
    let minPositionX = 0;
    let minPositionY = 0;
    unshiftPositions.forEach(position => {
      minPositionX = Math.min(minPositionX, position.x);
      minPositionY = Math.min(minPositionY, position.y);
    });

    setVirtualizedCanvasDimensions({
      width: Math.abs(minPositionX) * 2 + AVATAR_SIZE * 4,
      height: Math.abs(minPositionY) * 2 + AVATAR_SIZE * 4,
    });
    return unshiftPositions.map(position => ({
      x: position.x + Math.abs(minPositionX) + AVATAR_SIZE * 2,
      y: position.y + Math.abs(minPositionY) + AVATAR_SIZE * 2,
    }));
  }, [AVATAR_SIZE, AVATAR_NB]);

  useEffect(() => {
    if (
      virtualizedCanvasDimensions.width !== 0 &&
      virtualizedCanvasDimensions.height !== 0 &&
      canvasHeight !== 0
    ) {
      translateX.value = -virtualizedCanvasDimensions.width / 2 + width / 2;
      translateY.value =
        -virtualizedCanvasDimensions.height / 2 + canvasHeight / 2;
    }
  }, [
    virtualizedCanvasDimensions.width,
    virtualizedCanvasDimensions.height,
    canvasHeight,
    translateX,
    translateY,
  ]);

  const panGesture = Gesture.Pan().onChange(e => {
    translateX.value += e.changeX;
    translateY.value += e.changeY;
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{flex: 1, paddingVertical: 32, backgroundColor: 'white'}}>
        <Canvas
          style={{flex: 1}}
          onLayout={e => setCanvasHeight(e.nativeEvent.layout.height)}>
          <Group>
            {AVATAR_ARRAY.map((_, index) => (
              <SkAvatar
                key={index}
                x={translateX}
                y={translateY}
                index={index}
                color={'mediumPurple'}
                positions={positions}
                canvasHeight={canvasHeight}
              />
            ))}
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
};
