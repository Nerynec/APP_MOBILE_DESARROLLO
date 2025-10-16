// src/components/ChartCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';

export default class ChartCard extends React.PureComponent<{ title: string } & ViewProps> {
  render() {
    const { title, style, children, ...rest } = this.props;
    return (
      <View style={[s.card, style]} {...rest}>
        <Text style={s.title}>{title}</Text>
        <View style={{ marginTop: 8 }}>{children}</View>
      </View>
    );
  }
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
    padding: 12,
  },
  title: {
    fontSize: 16, fontWeight: '800',
    backgroundColor: 'transparent',
    color: '#111827',
  },
});
