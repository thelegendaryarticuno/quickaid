import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ThemedText } from './ThemedText';

export function CustomNavbar() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const userName = sessionStorage.getItem('userName')?.split(' ')[0] || '';
  
  // Responsive styles based on screen width
  const dynamicStyles = {
    logo: {
      width: width < 768 ? width * 0.15 : 60,
      height: width < 768 ? width * 0.15 : 60,
    },
    iconSize: width < 768 ? 36 : 40, // Increased icon size
    padding: width < 768 ? 16 : 24,
  };

  return (
    <LinearGradient
      colors={['#1E90FF', '#87CEEB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <View style={[styles.navbar, { paddingHorizontal: dynamicStyles.padding }]}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={[styles.logo, dynamicStyles.logo]}
          contentFit="contain"
        />
        <TouchableOpacity style={styles.userContainer} onPress={() => router.push('/profile')}>
          <ThemedText style={styles.userName}>{userName}</ThemedText>
          <Ionicons
            name="person-circle-outline"
            size={dynamicStyles.iconSize}
            color="#000000"
            style={styles.userIcon}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    marginTop: 35,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logo: {
    width: 60,
    height: 60,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Increased gap
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Added semi-transparent background
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  userName: {
    color: '#000000', // Changed to black
    fontSize: 18, // Increased font size
    fontWeight: '700', // Made text bolder
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userIcon: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});