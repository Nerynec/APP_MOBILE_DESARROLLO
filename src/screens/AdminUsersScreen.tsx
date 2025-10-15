import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function AdminUsersScreen() {
  const { getAllUsers, updateRole, user } = useAuth();
  const [users, setUsers] = useState<{ username: string; role: string }[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const all = await getAllUsers();
    setUsers(all);
  };

  const handleToggleRole = async (username: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateRole(username, newRole);
    loadUsers();
  };

  if (user?.role !== 'admin') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No tienes permisos para ver esta pantalla 🚫</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
        👑 Panel de Usuarios
      </Text>
      <FlatList
        data={users}
        keyExtractor={item => item.username}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <Card.Title
              title={item.username}
              subtitle={`Rol actual: ${item.role}`}
              right={() => (
                <Button onPress={() => handleToggleRole(item.username, item.role)}>
                  {item.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                </Button>
              )}
            />
          </Card>
        )}
      />
    </View>
  );
}
