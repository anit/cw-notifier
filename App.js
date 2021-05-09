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
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  Button,
  View,
} from 'react-native';

import {
  Colors,
  Header
} from 'react-native/Libraries/NewAppScreen';
import { extractToken, pingGod, submitToken } from './apis';
import BackgroundJob from "react-native-background-job";


BackgroundJob.register({
  jobKey: 'vnTokenGatherer',
  job: async () => {
    let token = null;
    try {
      token = await extractToken();
      if (token && token.token) submitToken(token.token);
    } catch (e) { pingGod(`Not able to extract token ${e.toString()}`); }
  }
});


const App: () => Node = () => {
  React.useEffect(() => {
    BackgroundJob.isAppIgnoringBatteryOptimization(
      (error, ignoringOptimization) => {
        if (ignoringOptimization === true) {
          BackgroundJob.schedule({
            jobKey: 'vnTokenGatherer',
            period: 1000 * 60 * 600, // sort of disable the background
            exact: true,
            allowWhileIdle: true,
            allowExecutionInForeground: true
          });
        } else {
          console.log(
            "To ensure app functions properly,please manually remove app from battery optimization menu."
          );
          //Dispay a toast or alert to user indicating that the app needs to be removed from battery optimization list, for the job to get fired regularly
        }
      }
    );
    console.log('Background job scheduled');
  }, []);

  return (
    <SafeAreaView style={Colors.darker}>
      <StatusBar barStyle={'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={Colors.darker}>
        <View
          style={{
            backgroundColor: Colors.black,
          }}>
          <Section title="VaccNotifier Volunteer App">
            <Text>
              Simple! Just keep this app running in the background. It will do its job of keeping  the system alive.
              All I need is permission to read SMS. Dont worry, I only process the Cowin OTP sms. Everything else is untouched.
              Most Important: Please go to your Battery Optimization settings and give this app full access, so that it can generate tokens every 15 mins
            </Text>
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
