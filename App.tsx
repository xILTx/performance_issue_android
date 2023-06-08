/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {SkMainCanvas} from './src/skiaComponents/SkMainCanvas';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SkMainCanvas />
    </GestureHandlerRootView>
  );
}

export default App;
