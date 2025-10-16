// src/utils/share.ts
import { Platform } from 'react-native';

export async function saveAndShareText(filename: string, content: string) {
  if (Platform.OS === 'web') {
    // ✅ Web: descarga con Blob
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    // crear <a> y click
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return url;
  } else {
    // ✅ Native: RNFS + Share (cargados con require para no romper web)
    const RNFS = require('react-native-fs');
    const Share = require('react-native-share').default;
    const path = `${RNFS.CachesDirectoryPath}/${filename}`;
    await RNFS.writeFile(path, content, 'utf8');
    await Share.open({
      url: 'file://' + path,
      type: 'text/csv',
      failOnCancel: false,
      showAppsToView: true,
    });
    return path;
  }
}
