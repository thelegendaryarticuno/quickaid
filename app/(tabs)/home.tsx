import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [location, setLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [recentSOS, setRecentSOS] = useState<{
    type: string;
    sosStatus: string;
    timeGapMinutes: number;
  } | null>(null);
  const router = useRouter();
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.replace('/');
      return;
    }

    // Fetch recent SOS
    const fetchRecentSOS = async () => {
      try {
        const response = await fetch('https://quickaid-backend-7mpc.onrender.com/victim/sos/sos/recent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });
        
        const data = await response.json();
        if (!data.data || data.data.length === 0) {
          setRecentSOS(null);
        } else {
          setRecentSOS(data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching recent SOS:', error);
      }
    };

    fetchRecentSOS();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for this app');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setCoordinates({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude
      });

      try {
        const response = await fetch(
          `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${loc.coords.latitude},${loc.coords.longitude}&language=en&region=en&key=AlzaSyD2jnjF6VypJoXAyoTHoNvWbC2pAsZQj0O`
        );
        
        const data = await response.json();
        
        if (data.results && data.results[0]) {
          setLocation(data.results[0].formatted_address);
        }
      } catch (error) {
        console.error('Error getting address:', error);
      }
    })();
  }, []);

  const EmergencyButton = ({ icon, label }: { icon: any; label: string }) => {
    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true
      }).start();
    };

    const handlePress = () => {
      router.push(`/emergency?type=${label.toLowerCase()}`);
    };

    return (
      <TouchableOpacity 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View style={[{transform: [{scale: scaleAnim}]}]}>
          <LinearGradient
            colors={['#ED5353', '#ED5353']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emergencyButton}
          >
            <BlurView intensity={20} style={styles.buttonContent}>
              <MaterialCommunityIcons name={icon} size={width * 0.08} color="#fff" />
              <ThemedText style={styles.buttonLabel}>{label}</ThemedText>
            </BlurView>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Address Bar */}
        <LinearGradient
          colors={['#1E90FF', '#87CEEB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addressBarContainer}
        >
          <View style={styles.addressBar}>
            <Ionicons name="location" size={width * 0.05} color="#000000" />
            <ThemedText style={styles.addressText}>
              {location ? location : 'Fetching location...'}
            </ThemedText>
          </View>
        </LinearGradient>

        {/* Title */}
        <ThemedText style={styles.title}>What's your Emergency?</ThemedText>

        {/* Recent SOS Card */}
        <BlurView intensity={40} tint="light" style={styles.sosCard}>
          {recentSOS ? (
            <>
              <View style={styles.sosHeader}>
                <ThemedText style={styles.sosTitle}>Recent SOS</ThemedText>
                <View style={[styles.statusBadge, { 
                  backgroundColor: 
                    recentSOS.sosStatus === 'Active' ? '#10B981' :
                    recentSOS.sosStatus === 'ongoing' ? '#F59E0B' :
                    recentSOS.sosStatus === 'completed' ? '#64748B' : '#64748B'
                }]}>
                  <ThemedText style={styles.statusText}>{recentSOS.sosStatus}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.sosType}>{recentSOS.type} Emergency</ThemedText>
              <ThemedText style={styles.sosTime}>{recentSOS.timeGapMinutes} minutes ago</ThemedText>
            </>
          ) : (
            <ThemedText style={styles.sosTitle}>No SOS Made</ThemedText>
          )}
        </BlurView>

        {/* Emergency Buttons Grid */}
        <View style={styles.gridContainer}>
          <EmergencyButton icon="medical-bag" label="Medical" />
          <EmergencyButton icon="fire" label="Fire" />
          <EmergencyButton icon="car" label="Accident" />
          <EmergencyButton icon="alert-circle" label="Other" />
        </View>
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
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingBottom: width * 0.1,
    gap: width * 0.04,
  },
  addressBarContainer: {
    marginTop: -1, // To remove any gap with navbar
    paddingVertical: width * 0.02,
    marginHorizontal: -width * 0.05, // To extend beyond padding
    marginBottom: width * 0.04,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: width * 0.025,
    borderRadius: width * 0.02,
    marginHorizontal: width * 0.02,
  },
  addressText: {
    color: '#000000',
    fontSize: width * 0.038,
    fontWeight: '600',
    flex: 1,
    marginLeft: width * 0.02,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    color: '#1E3A8A',
    fontSize: width * 0.065,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: width * 0.06,
  },
  sosCard: {
    padding: width * 0.04,
    borderRadius: width * 0.03,
    marginBottom: width * 0.04,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: width * 0.02,
  },
  sosTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: width * 0.03,
    paddingVertical: width * 0.01,
    borderRadius: width * 0.02,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: width * 0.032,
    fontWeight: '600',
  },
  sosType: {
    fontSize: width * 0.04,
    color: '#1E3A8A',
    marginBottom: width * 0.01,
  },
  sosTime: {
    fontSize: width * 0.035,
    color: '#64748B',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: width * 0.03,
  },
  emergencyButton: {
    width: width * 0.42,
    aspectRatio: 1,
    borderRadius: width * 0.04,
    overflow: 'hidden',
  },
  buttonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 0.03,
    padding: width * 0.04,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
