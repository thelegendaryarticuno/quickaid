import { Link } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { LinearGradient } from 'expo-linear-gradient';

export function CustomBottomBar() {
  const { width } = useWindowDimensions();

  // Responsive styles based on screen width
  const dynamicStyles = {
    iconSize: width < 768 ? 28 : 32,
    padding: width < 768 ? 12 : 16,
  };

  return (
    <LinearGradient
      colors={['#1E90FF', '#87CEEB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <View style={[styles.container, { padding: dynamicStyles.padding }]}>
        <Link href="/home" style={styles.tab}>
          <Ionicons 
            name="home" 
            size={dynamicStyles.iconSize} 
            color="#000000"
            style={styles.icon} 
          />
        </Link>
        
        <Link href="/history" style={styles.tab}>
          <Ionicons 
            name="time" 
            size={dynamicStyles.iconSize} 
            color="#000000"
            style={styles.icon}
          />
        </Link>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 25,
  },
  icon: {
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