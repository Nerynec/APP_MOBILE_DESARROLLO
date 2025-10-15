// src/components/ConfirmModal.tsx
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default class ConfirmModal extends React.Component<Props> {
  static defaultProps = { confirmText: 'Confirmar', cancelText: 'Cancelar' };

  render() {
    const { visible, title, message, confirmText, cancelText, loading, onCancel, onConfirm } = this.props;
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
        <View style={s.backdrop}>
          <View style={s.card}>
            <Text style={s.title}>{title}</Text>
            <Text style={s.msg}>{message}</Text>
            <View style={s.row}>
              <Pressable onPress={onCancel} style={[s.btn, s.btnGhost]}>
                <Text style={s.btnGhostText}>{cancelText}</Text>
              </Pressable>
              <Pressable onPress={onConfirm} disabled={!!loading} style={[s.btn, s.btnDanger, !!loading && s.disabled]}>
                <Text style={s.btnDangerText}>{loading ? 'Procesando…' : confirmText}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.35)', alignItems: 'center', justifyContent: 'center' },
  card: { width: '88%', backgroundColor: 'white', borderRadius: 16, padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  msg: { color: '#374151' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  btn: { height: 44, minWidth: 110, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnGhost: { borderColor: '#e5e7eb' },
  btnGhostText: { color: '#111827', fontWeight: '600' },
  btnDanger: { borderColor: '#fecaca', backgroundColor: '#ef4444' },
  btnDangerText: { color: 'white', fontWeight: '700' },
  disabled: { opacity: 0.7 },
});
