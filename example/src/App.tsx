import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { DrawImageView } from 'react-native-draw-image';

export default function App() {
  return (
    <View style={styles.container}>
      <DrawImageView color="#32a852" style={styles.box} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});