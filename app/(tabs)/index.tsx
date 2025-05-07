import { Preloader } from '@/components/Preloader';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Image, Platform, StyleSheet, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Modal } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  logo: {
    width: width * 0.8,
    height: height * 0.25,
    alignSelf: 'center',
    marginTop: height * 0.05,
  },
  formContainer: {
    width: '90%',
    backgroundColor: 'rgba(135, 206, 235, 0.2)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 24,
    color: '#1E90FF',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  phoneInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 4,
  },
  countryCode: {
    color: '#333',
    fontSize: 14,
  },
  phoneInput: {
    flex: 1,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 14,
    color: '#333',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpInput: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 45,
    backgroundColor: '#FF3B30',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  otpButton: {
    backgroundColor: '#1E90FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  contentWrapper: {
    width: '100%',
    paddingVertical: height * 0.03,
  },
});

export default function LoginScreen() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showNameForm, setShowNameForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const router = useRouter();
  const otpInputs = useRef<Array<TextInput>>([]);

  const handlePhoneNumberChange = (number: string) => {
    setPhoneNumber(number);
  };

  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  // Helper to show error dialog
  const showErrorDialog = (msg: string) => {
    setErrorDialogMessage(msg);
    setErrorDialogVisible(true);
  };

  const handleSignupWithOtp = async () => {
    if (phoneNumber.length === 10) {
      try {
        const response = await fetch('https://quickaid-backend-7mpc.onrender.com/user/onboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone: phoneNumber })
        });
        
        if (response.ok) {
          setOtpSent(true);
        }
      } catch (error) {
        showErrorDialog('Failed to send OTP');
      }
    } else {
      showErrorDialog('Please enter a valid 10 digit phone number');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('https://quickaid-backend-7mpc.onrender.com/user/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phoneNumber,
          password: password
        })
      });

      const data = await response.json();
      if (data.success === false) {
        showErrorDialog(data.message || 'Failed to login');
        // Stay on "/" and reload the page
        window.location.href = '/';
        return;
      }
      sessionStorage.setItem('userId', data.userId);

      if (data.userType === 'newUser') {
        setShowNameForm(true);
      } else {
        sessionStorage.setItem('userName', data.userName);
        router.push('/home');
      }
    } catch (error) {
      showErrorDialog('Failed to login');
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    try {
      const response = await fetch('https://quickaid-backend-7mpc.onrender.com/user/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otpString
        })
      });

      const data = await response.json();
      sessionStorage.setItem('userId', data.userId);

      if (data.userType === 'newUser') {
        setShowNameForm(true);
      } else {
        sessionStorage.setItem('userName', data.userName);
        router.push('/home');
      }
    } catch (error) {
      showErrorDialog('Failed to verify OTP');
    }
  };

  const handleNameSubmit = async () => {
    const userId = sessionStorage.getItem('userId');
    const fullName = `${firstName} ${lastName}`;
    
    try {
      await fetch(`https://quickaid-backend-7mpc.onrender.com/user/${userId}/name=${fullName}`, {
        method: 'POST'
      });
      sessionStorage.setItem('userName', fullName);
      router.push('/home');
    } catch (error) {
      showErrorDialog('Failed to save name');
    }
  };

  if (showPreloader) {
    return <Preloader onFinish={() => setShowPreloader(false)} />;
  }

  if (showNameForm) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentWrapper}>
            <Image 
              source={require('@/assets/images/loader.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <BlurView intensity={80} style={styles.formContainer}>
              <ThemedText style={styles.title}>Enter Your Name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#666"
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#666"
              />
              <TouchableOpacity 
                style={styles.button}
                onPress={handleNameSubmit}
              >
                <ThemedText style={styles.buttonText}>Next</ThemedText>
              </TouchableOpacity>
            </BlurView>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentWrapper}>
          <Image 
            source={require('@/assets/images/loader.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <BlurView intensity={80} style={styles.formContainer}>
            <ThemedText style={styles.title}>Login or Signup</ThemedText>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Image 
                  source={{uri: 'https://flagcdn.com/w40/in.png'}}
                  style={styles.flag}
                />
                <ThemedText style={styles.countryCode}>+91</ThemedText>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your phone number"
                keyboardType="numeric"
                maxLength={10}
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                placeholderTextColor="#666"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Create or Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#666"
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={handleLogin}
            >
              <ThemedText style={styles.buttonText}>Login</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.otpButton]}
              onPress={handleSignupWithOtp}
            >
              <ThemedText style={styles.buttonText}>Signup with OTP</ThemedText>
            </TouchableOpacity>
            {otpSent && (
              <>
                <ThemedText style={styles.title}>Enter OTP</ThemedText>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => { otpInputs.current[index] = ref! }}
                      style={styles.otpInput}
                      keyboardType="numeric"
                      maxLength={1}
                      value={digit}
                      onChangeText={text => handleOtpChange(text, index)}
                    />
                  ))}
                </View>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={verifyOtp}
                >
                  <ThemedText style={styles.buttonText}>Verify OTP</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </BlurView>
        </View>
      </ScrollView>
      {/* Error Dialog */}
      <Modal
        visible={errorDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorDialogVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 24,
            width: '80%',
            alignItems: 'center'
          }}>
            <ThemedText style={{ color: '#E63946', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              Error
            </ThemedText>
            <ThemedText style={{ color: '#333', fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
              {errorDialogMessage}
            </ThemedText>
            <TouchableOpacity
              style={{
                backgroundColor: '#1E90FF',
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 24,
              }}
              onPress={() => setErrorDialogVisible(false)}
            >
              <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>OK</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
