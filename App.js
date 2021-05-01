/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import SmsAndroid from 'react-native-get-sms-android';
import CryptoJS from "react-native-crypto-js";
import { generateOTP } from './apis';


var smsFilter = {
  minDate: Date.now() - (1000 * 60 * 120), // change last number to change mins.
  maxDate: Date.now,
  bodyRegex: '(.*)Your OTP to register\/access CoWIN(.*)', // content regex to match
  maxCount: 10
};

const getSecret = () => {
  const key = 'CoWIN@$#&*(!@%^&';
  return CryptoJS.AES.encrypt('b5cab167-7977-4df1-8027-a63aa144f04e', key).toString();
}

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const [smsList, setSmsList] = React.useState([]);
  const [secret, ] = React.useState(getSecret())
  const regex = /OTP .{0,} CoWIN is (.*)\. It will be valid/i;
  SmsAndroid.list(
    JSON.stringify(smsFilter),
    (fail) => {
      console.log('Failed with this error: ' + fail);
    },
    (count, response) => {
      setSmsList(JSON.parse(response));
    },
  );

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };


  React.useEffect(() => {
    console.log('Making api call....')
    generateOTP(getSecret(), '9665549658').then(x => {
      console.log('response is ', x);
    }, e => console.log('error is ', e));
    
  }, [])
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Logs">
            OTP for now is: {
              smsList.map(x => regex.exec(x.body)[1])
            }

            Secret is {secret}
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
