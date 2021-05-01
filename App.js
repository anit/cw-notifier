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
  Header
} from 'react-native/Libraries/NewAppScreen';
import { readOtpFromSms, requestOTP, validateOTP } from './apis';

const App: () => Node = () => {

  React.useEffect(async () => {
    try {
      const txnId = await requestOTP('9665549658', 'b5cab167-7977-4df1-8027-a63aa144f04e');
      console.log('===================Response from request otp is ', txnId);
      const otp = txnId && await readOtpFromSms();
      console.log('============otp is ', otp);
      const token = otp && await validateOTP(otp, txnId);
      console.log('=====================Token value is', token); 
    } catch (e) {
      console.log('==============fucked....', e)
    }
  }, [])

  return (
    <SafeAreaView style={Colors.darker}>
      <StatusBar barStyle={'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={Colors.darker}>
        <Header />
        <View
          style={{
            backgroundColor: Colors.black,
          }}>
          <Section title="Logs">
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({children, title}): Node => {
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: Colors.white,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: Colors.light,
          },
        ]}>
        {children}
      </Text>
    </View>
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
