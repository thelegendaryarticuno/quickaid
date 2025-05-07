import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Location {
  latitude: number;
  longitude: number;
}

interface SOSData {
  location: Location;
  _id: string;
  sosId: string;
  UserId: string;
  emergencyType: string;
  authority: string[];
  address: string;
  sosStatus: string;
  sosAtendee: string;
  createdAt: string;
  updatedAt: string;
  volunteerName: string;
}

interface APIResponse {
  success: boolean;
  data: SOSData[];
}

export default function History() {
  const [sosHistory, setSOSHistory] = useState<SOSData[]>([]);
  const [selectedSOS, setSelectedSOS] = useState<SOSData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchSOSHistory();
  }, []);

  const fetchSOSHistory = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      const response = await axios.get<APIResponse>(`https://quickaid-backend-7mpc.onrender.com/victim/sos/getsos/${userId}`);
      setSOSHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching SOS history:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmergencyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'medical': return 'medical-bag';
      case 'fire': return 'fire';
      case 'accident': return 'car';
      default: return 'alert-circle';
    }
  };

  const handleCardPress = (sos: SOSData) => {
    setSelectedSOS(sos);
    setModalVisible(true);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Recent SOS</ThemedText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {sosHistory.map((sos) => (
          <TouchableOpacity key={sos._id} onPress={() => handleCardPress(sos)}>
            <BlurView intensity={20} tint="light" style={styles.card}>
              <View style={styles.header}>
                <LinearGradient
                  colors={['#ED5353', '#ED5353']}
                  style={styles.iconContainer}
                >
                  <MaterialCommunityIcons 
                    name={getEmergencyIcon(sos.emergencyType)} 
                    size={width * 0.06} 
                    color="#fff" 
                  />
                </LinearGradient>
                <View style={styles.headerText}>
                  <ThemedText style={styles.emergencyType}>
                    {sos.emergencyType.charAt(0).toUpperCase() + sos.emergencyType.slice(1)}
                  </ThemedText>
                  <ThemedText style={styles.time}>
                    {formatDate(sos.createdAt)}
                  </ThemedText>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedSOS && (
          <View style={styles.modalContainer}>
            <BlurView intensity={90} tint="light" style={styles.modalContent}>
              <MaterialCommunityIcons 
                name={getEmergencyIcon(selectedSOS.emergencyType)}
                size={width * 0.15}
                color="#ED5353"
                style={styles.modalIcon}
              />
              
              <ThemedText style={styles.modalTitle}>
                {selectedSOS.emergencyType.toUpperCase()} EMERGENCY
              </ThemedText>
              
              <ThemedText style={styles.modalAddress}>
                {selectedSOS.address}
              </ThemedText>

              <View style={styles.modalAuthorities}>
                <ThemedText style={styles.modalSubtitle}>Authorities Notified:</ThemedText>
                <View style={styles.authoritiesContainer}>
                  {selectedSOS.authority.map((auth, index) => (
                    <View key={index} style={styles.authorityTag}>
                      <ThemedText style={styles.authorityText}>
                        {auth.charAt(0).toUpperCase() + auth.slice(1)}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalInfo}>
                <ThemedText style={styles.modalSubtitle}>Volunteer Assigned:</ThemedText>
                <ThemedText style={styles.modalValue}>{selectedSOS.volunteerName}</ThemedText>
              </View>

              <View style={styles.modalInfo}>
                <ThemedText style={styles.modalSubtitle}>Status:</ThemedText>
                <ThemedText style={[styles.modalValue, { color: '#ED5353' }]}>
                  {selectedSOS.sosStatus.toUpperCase()}
                </ThemedText>
              </View>

              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.closeButtonText}>Close</ThemedText>
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: width * 0.05,
    paddingTop: width * 0.05,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: width * 0.05,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: width * 0.02,
    padding: width * 0.04,
    marginBottom: width * 0.03,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: width * 0.02,
    borderRadius: width * 0.015,
    marginRight: width * 0.03,
  },
  headerText: {
    flex: 1,
  },
  emergencyType: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: width * 0.01,
  },
  time: {
    fontSize: width * 0.035,
    color: '#64748B',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: width * 0.05,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: width * 0.03,
    padding: width * 0.05,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: width * 0.03,
    opacity: 0.8,
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: width * 0.03,
  },
  modalAddress: {
    fontSize: width * 0.04,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: width * 0.05,
  },
  modalAuthorities: {
    width: '100%',
    marginBottom: width * 0.05,
  },
  modalSubtitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: width * 0.02,
  },
  authoritiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: width * 0.02,
  },
  authorityTag: {
    backgroundColor: '#1E90FF',
    paddingVertical: width * 0.01,
    paddingHorizontal: width * 0.03,
    borderRadius: width * 0.04,
  },
  authorityText: {
    color: '#fff',
    fontSize: width * 0.035,
  },
  modalInfo: {
    width: '100%',
    marginBottom: width * 0.03,
  },
  modalValue: {
    fontSize: width * 0.04,
    color: '#64748B',
  },
  closeButton: {
    backgroundColor: '#ED5353',
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.06,
    borderRadius: width * 0.02,
    marginTop: width * 0.03,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});
