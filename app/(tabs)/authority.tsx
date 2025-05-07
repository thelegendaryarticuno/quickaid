import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function AuthorityScreen() {
  const router = useRouter();
  const { type, lat, lng } = useLocalSearchParams();
  const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const handleSendSOS = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      UserId: sessionStorage.getItem('userId'),
      emergencyType: type || "medical",
      location: {
        latitude: parseFloat(lat as string) || 12.9716,
        longitude: parseFloat(lng as string) || 77.5946
      },
      authority: selectedAuthorities.map(auth => auth.toLowerCase()),
      address: sessionStorage.getItem('location')
    };

    try {
      const response = await fetch('https://quickaid-backend-7mpc.onrender.com/victim/sos/raisesos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert('Success', 'SOS sent successfully');
        router.push('/home');
      } else {
        throw new Error('Failed to send SOS');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthority = (label: string) => {
    setSelectedAuthorities(prev => 
      prev.includes(label)
        ? prev.filter(auth => auth !== label)
        : [...prev, label]
    );
  };

  const AuthorityButton = ({ label }: { label: string }) => {
    const isSelected = selectedAuthorities.includes(label);
    
    return (
      <TouchableOpacity 
        style={styles.authorityButton}
        activeOpacity={0.7}
        onPress={() => toggleAuthority(label)}
      >
        <BlurView intensity={20} tint="light" style={[
          styles.authorityContent,
          isSelected && styles.authorityContentSelected
        ]}>
          <View style={styles.authorityLeft}>
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={width * 0.06}
              color={isSelected ? "#ED5353" : "#1E90FF"}
            />
            <ThemedText style={styles.authorityLabel}>{label}</ThemedText>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

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

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Who do you want in rescue?</ThemedText>

      <View style={styles.authoritiesContainer}>
        <AuthorityButton label="Hospital" />
        <AuthorityButton label="Fire Agencies" />
        <AuthorityButton label="Volunteer Committee" />
        <AuthorityButton label="Police Station" />
        <AuthorityButton label="NDRF" />
      </View>

      <TouchableOpacity 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleSendSOS}
        disabled={isSubmitting}
      >
        <Animated.View style={[{transform: [{scale: scaleAnim}]}]}>
          <LinearGradient
            colors={['#ED5353', '#ED5353']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sosButton}
          >
            <BlurView intensity={20} style={styles.sosButtonContent}>
              <ThemedText style={styles.sosButtonText}>
                {isSubmitting ? 'Sending...' : 'Send SOS'}
              </ThemedText>
            </BlurView>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: width * 0.05,
    paddingTop: width * 0.1,
  },
  title: {
    color: '#1E3A8A',
    fontSize: width * 0.065,
    fontWeight: '800',
    marginBottom: width * 0.08,
  },
  authoritiesContainer: {
    gap: width * 0.03,
    marginBottom: width * 0.08,
  },
  authorityButton: {
    borderRadius: width * 0.02,
    overflow: 'hidden',
  },
  authorityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.04,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  authorityContentSelected: {
    backgroundColor: 'rgba(237, 83, 83, 0.1)',
  },
  authorityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
  },
  authorityLabel: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  sosButton: {
    borderRadius: width * 0.02,
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: width * 0.05,
  },
  sosButtonContent: {
    padding: width * 0.04,
    alignItems: 'center',
  },
  sosButtonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: '700',
  },
});