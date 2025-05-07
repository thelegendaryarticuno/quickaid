// app/emergency.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function EmergencyScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();

  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (useCurrentLocation) {
      (async () => {
        setIsLoading(true);
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setUseCurrentLocation(false);
            return;
          }

          const loc = await Location.getCurrentPositionAsync({});
          setCoordinates({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude
          });
          
          // Using Google Places API to get address from coordinates
          const response = await fetch(
            `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${loc.coords.latitude},${loc.coords.longitude}&language=en&region=en&key=AlzaSyD2jnjF6VypJoXAyoTHoNvWbC2pAsZQj0O`
          );
          
          const data = await response.json();
          
          if (data.results && data.results[0]) {
            const formattedAddress = data.results[0].formatted_address;
            setAddressInput(formattedAddress);
            setCurrentLocation(formattedAddress);
            sessionStorage.setItem('location', formattedAddress);
          }
        } catch (error) {
          console.error('Error getting location:', error);
          setUseCurrentLocation(false);
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      setAddressInput('');
      setCurrentLocation(null);
      setCoordinates(null);
    }
  }, [useCurrentLocation]);

  const handleProceed = () => {
    if (coordinates) {
      router.push(`/authority?type=${type}&lat=${coordinates.lat}&lng=${coordinates.lng}`);
    } else {
      router.push(`/authority?type=${type}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Choose a location</ThemedText>

        <BlurView intensity={20} tint="light" style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isLoading && styles.inputDisabled]}
            placeholder={isLoading ? "Fetching location..." : "Enter address"}
            placeholderTextColor="#64748B"
            value={addressInput}
            onChangeText={(text) => {
              setAddressInput(text);
              setCurrentLocation(text);
            }}
            editable={!isLoading}
          />
        </BlurView>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setUseCurrentLocation(!useCurrentLocation)}
        >
          <Ionicons
            name={useCurrentLocation ? 'checkbox-outline' : 'square-outline'}
            size={width * 0.06}
            color="#1E90FF"
          />
          <ThemedText style={styles.checkboxLabel}>Use my current location</ThemedText>
        </TouchableOpacity>
        
        <View style={styles.mapContainer}>
          <Image
            source={require('@/assets/images/map.png')}
            style={styles.mapImage}
            contentFit="cover"
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.proceedButton,
            (!currentLocation && !addressInput) && styles.proceedButtonDisabled
          ]} 
          onPress={handleProceed}
          disabled={!currentLocation && !addressInput}
        >
          <LinearGradient
            colors={['#1E90FF', '#87CEEB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <ThemedText style={styles.proceedButtonText}>
              {isLoading ? 'Getting location...' : 'Proceed with location'}
            </ThemedText>
          </LinearGradient>
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
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.05,
    gap: width * 0.04,
  },
  title: {
    color: '#1E3A8A',
    fontSize: width * 0.065,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: width * 0.04,
  },
  inputContainer: {
    borderRadius: width * 0.03,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: width * 0.04,
  },
  input: {
    padding: width * 0.04,
    color: '#1E3A8A',
    fontSize: width * 0.04,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
    marginBottom: width * 0.04,
  },
  checkboxLabel: {
    color: '#1E3A8A',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
  mapContainer: {
    width: '100%',
    height: width * 0.6,
    borderRadius: width * 0.03,
    overflow: 'hidden',
    marginBottom: width * 0.06,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  proceedButton: {
    borderRadius: width * 0.03,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  gradientButton: {
    paddingVertical: width * 0.04,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
