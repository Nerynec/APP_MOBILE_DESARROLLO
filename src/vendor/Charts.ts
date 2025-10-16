// src/vendor/Charts.ts
import { Platform } from 'react-native';

let lib: any;
if (Platform.OS === 'web') {
  // ✅ Web usa victory DOM
  lib = require('victory');
} else {
  // ✅ Native usa victory-native
  lib = require('victory-native');
}

export const {
  VictoryChart,
  VictoryArea,
  VictoryBar,
  VictoryPie,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
} = lib;
