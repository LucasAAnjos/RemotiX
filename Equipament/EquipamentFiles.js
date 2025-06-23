import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
import { getDownloadedFile, saveDownloadedFile } from '../src/storage/localStorage';
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db, storage } from '../services/firebaseConfig';
import { getPlantId } from '../src/storage/localStorage';

const EquipamentFiles = ({ route }) => {
  const { areaId, equipamentId, equipamentName } = route.params || {};
  const [plantId, setPlantId] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({});

  useEffect(() => {
    (async () => {
      const id = await getPlantId();
      if (id) {
        setPlantId(id);
        fetchFiles(id);
      }
    })();
  }, []);

  const fetchFiles = async (currentPlantId) => {
    if (!currentPlantId || !areaId || !equipamentId) return;

    try {
      setLoading(true);

      const filesRef = collection(
        db,
        'plants',
        String(currentPlantId),
        'areas',
        String(areaId),
        'equipaments',
        String(equipamentId),
        'files'
      );

      const q = query(filesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const fetched = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const isDownloaded = !!(await getDownloadedFile(data.name, data.url));
          return { id: doc.id, ...data, isDownloaded };
        })
      );

      setFiles(fetched);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar arquivos.');
      console.error('Erro ao buscar arquivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    const currentPlantId = await getPlantId();

    if (!currentPlantId || !areaId || !equipamentId) {
      Alert.alert('Erro', 'IDs incompletos para anexar arquivo.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        setLoading(true);

        const response = await fetch(file.uri);
        const blob = await response.blob();

        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(
          storage,
          `plants/${currentPlantId}/areas/${areaId}/equipaments/${equipamentId}/files/${fileName}`
        );

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        const filesRef = collection(
          db,
          'plants',
          String(currentPlantId),
          'areas',
          String(areaId),
          'equipaments',
          String(equipamentId),
          'files'
        );

        await addDoc(filesRef, {
          name: file.name,
          url: downloadURL,
          size: file.size,
          mimeType: file.mimeType,
          createdAt: new Date(),
        });

        Alert.alert('Sucesso', 'Arquivo anexado com sucesso!');
        fetchFiles(currentPlantId);
      } else {
        Alert.alert('Cancelado', 'Nenhum arquivo foi selecionado.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao anexar arquivo.');
      console.error('Erro ao anexar arquivo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrDownload = async (file) => {
    try {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permissão negada', 'Permita acesso à mídia para abrir o arquivo.');
        return;
      }

      let localUri = await getDownloadedFile(file.name, file.url);

      if (!localUri) {
        setLoading(true);
        const uri = `${FileSystem.documentDirectory}${file.name}`;
        const downloaded = await FileSystem.downloadAsync(file.url, uri);
        localUri = downloaded.uri;
        await saveDownloadedFile(file.name, file.url, localUri);
        file.isDownloaded = true;
      }

      const asset = await MediaLibrary.createAssetAsync(localUri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);

      IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: asset.uri,
        flags: 1,
        type: file.mimeType || '*/*',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o arquivo.');
      console.error('Erro ao abrir o arquivo:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFileCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardInfo}>Tamanho: {(item.size / 1024).toFixed(1)} KB</Text>
        <Text style={styles.cardInfo}>Tipo: {item.mimeType || 'Desconhecido'}</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={() => handleOpenOrDownload(item)}>
          <Text style={styles.downloadText}>{item.isDownloaded ? 'Abrir' : 'Baixar'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Anexar Arquivo" onPress={pickDocument} disabled={loading} />
      {loading && <Text style={{ marginVertical: 10 }}>Carregando...</Text>}

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>Nenhum arquivo anexado.</Text>}
        renderItem={renderFileCard}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardInfo: {
    fontSize: 14,
    color: '#555',
  },
  downloadBtn: {
    marginTop: 10,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  downloadText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default EquipamentFiles;
