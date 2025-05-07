import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

const FLAG_URL = 'https://flagcdn.com/w40/in.png';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState({
    emergencycontact1: '',
    emergencycontact1phone: '',
    emergencycontact2: '',
    emergencycontact2phone: '',
    address: '',
  });
  const [originalFields, setOriginalFields] = useState(fields);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = sessionStorage.getItem('userId');
      if (!userId) return;
      try {
        const response = await fetch(`https://quickaid-backend-7mpc.onrender.com/user/${userId}`);
        const data = await response.json();
        setUser(data.data);
        // Optionally, fetch these fields from user if they exist
        setFields({
          emergencycontact1: data.data.emergencycontact1 || '',
          emergencycontact1phone: data.data.emergencycontact1phone || '',
          emergencycontact2: data.data.emergencycontact2 || '',
          emergencycontact2phone: data.data.emergencycontact2phone || '',
          address: data.data.address || '',
        });
        setOriginalFields({
          emergencycontact1: data.data.emergencycontact1 || '',
          emergencycontact1phone: data.data.emergencycontact1phone || '',
          emergencycontact2: data.data.emergencycontact2 || '',
          emergencycontact2phone: data.data.emergencycontact2phone || '',
          address: data.data.address || '',
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEdit = () => setEditMode(true);

  const handleFieldChange = (key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  const hasChanges = () => {
    return Object.keys(fields).some(key => fields[key as keyof typeof fields] !== originalFields[key as keyof typeof fields]);
  };

  const handleSave = async () => {
    // Validation
    if (fields.emergencycontact1 && !fields.emergencycontact1phone) {
      Alert.alert('Validation', 'Please enter Emergency Contact 1 Phone');
      return;
    }
    if (fields.emergencycontact2 && !fields.emergencycontact2phone) {
      Alert.alert('Validation', 'Please enter Emergency Contact 2 Phone');
      return;
    }
    try {
      const userId = sessionStorage.getItem('userId');
      const payload = {
        userId,
        emergencycontact1: fields.emergencycontact1,
        emergencycontact1phone: fields.emergencycontact1phone,
        emergencycontact2: fields.emergencycontact2,
        emergencycontact2phone: fields.emergencycontact2phone,
        address: fields.address,
      };
      const response = await fetch('http://localhost:5000/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setEditMode(false);
        setOriginalFields(fields);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Profile</ThemedText>
          <TouchableOpacity onPress={handleEdit} style={styles.editIcon}>
            <Ionicons name="pencil" size={width * 0.07} color="#1E90FF" />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <ThemedText style={styles.value}>{user?.name || '-'}</ThemedText>
          <ThemedText style={styles.label}>Phone</ThemedText>
          <View style={styles.phoneRow}>
            <Image source={{ uri: FLAG_URL }} style={styles.flag} />
            <ThemedText style={styles.phonePrefix}>+91</ThemedText>
            <ThemedText style={styles.value}>{user?.phone || '-'}</ThemedText>
          </View>
        </View>
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Emergency Details</ThemedText>
          <ThemedText style={styles.label}>Emergency Contact 1 Name</ThemedText>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={fields.emergencycontact1}
              onChangeText={text => handleFieldChange('emergencycontact1', text)}
              placeholder="Enter name"
              placeholderTextColor="#64748B"
            />
          ) : (
            <ThemedText style={styles.value}>{fields.emergencycontact1 || '-'}</ThemedText>
          )}
          <ThemedText style={styles.label}>Emergency Contact 1 Phone</ThemedText>
          <View style={styles.phoneRow}>
            <Image source={{ uri: FLAG_URL }} style={styles.flag} />
            <ThemedText style={styles.phonePrefix}>+91</ThemedText>
            {editMode ? (
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={fields.emergencycontact1phone}
                onChangeText={text => handleFieldChange('emergencycontact1phone', text)}
                placeholder="Enter phone"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                maxLength={10}
              />
            ) : (
              <ThemedText style={styles.value}>{fields.emergencycontact1phone || '-'}</ThemedText>
            )}
          </View>
          <ThemedText style={styles.label}>Emergency Contact 2 Name</ThemedText>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={fields.emergencycontact2}
              onChangeText={text => handleFieldChange('emergencycontact2', text)}
              placeholder="Enter name"
              placeholderTextColor="#64748B"
            />
          ) : (
            <ThemedText style={styles.value}>{fields.emergencycontact2 || '-'}</ThemedText>
          )}
          <ThemedText style={styles.label}>Emergency Contact 2 Phone</ThemedText>
          <View style={styles.phoneRow}>
            <Image source={{ uri: FLAG_URL }} style={styles.flag} />
            <ThemedText style={styles.phonePrefix}>+91</ThemedText>
            {editMode ? (
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={fields.emergencycontact2phone}
                onChangeText={text => handleFieldChange('emergencycontact2phone', text)}
                placeholder="Enter phone"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                maxLength={10}
              />
            ) : (
              <ThemedText style={styles.value}>{fields.emergencycontact2phone || '-'}</ThemedText>
            )}
          </View>
          <ThemedText style={styles.label}>Address</ThemedText>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={fields.address}
              onChangeText={text => handleFieldChange('address', text)}
              placeholder="Enter address"
              placeholderTextColor="#64748B"
              multiline
            />
          ) : (
            <ThemedText style={styles.value}>{fields.address || '-'}</ThemedText>
          )}
          {editMode && hasChanges() && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </TouchableOpacity>
          )}
        </View>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          sessionStorage.clear();
          window.location.href = '/';
        }}>
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: width * 0.1,
    gap: width * 0.04,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: width * 0.08,
    marginBottom: width * 0.04,
  },
  editIcon: {
    padding: width * 0.02,
  },
  title: {
    color: '#1E3A8A',
    fontSize: width * 0.065,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#1E90FF',
    borderRadius: 16,
    padding: width * 0.05,
    marginBottom: width * 0.06,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    color: '#000000',
    fontSize: width * 0.05,
    fontWeight: '700',
    marginBottom: width * 0.03,
  },
  label: {
    color: '#000000',
    fontSize: width * 0.038,
    marginTop: width * 0.03,
    marginBottom: width * 0.01,
    fontWeight: '600',
  },
  value: {
    color: '#F7F9FB',
    fontSize: width * 0.045,
    fontWeight: '600',
    marginBottom: width * 0.01,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: width * 0.01,
    gap: 6,
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 4,
    borderRadius: 3,
  },
  phonePrefix: {
    color: '#000000',
    fontSize: width * 0.045,
    fontWeight: '700',
    marginRight: 2,
  },
  input: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: width * 0.045,
    color: '#1B263B',
    marginBottom: width * 0.01,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#ED5353',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: width * 0.05,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#E63946',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
});