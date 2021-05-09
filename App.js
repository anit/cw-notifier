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
import { extractToken, getAvailableCenters, notifyTelegram, pingGod, pingTelegram, submitToken } from './apis';
import { ddmmyy, nextWeekSameDay } from './utils';
import { config } from './config';
import { districts } from './districts';
import BackgroundJob from "react-native-background-job";


BackgroundJob.register({
  jobKey: 'vnTokenGatherer',
  job: async () => {
    let token = null;
    try {
      token = await extractToken();
      if (token && token.token) submitToken(token.token);
      console.log('============Submitted Token Successfully from BG Service');
    } catch (e) { console.log('===========Unable to get token', e); }
  }
});


const App: () => Node = () => {
  const [loading, setLoading] = React.useState(false);
  const [logs, setLogs] = React.useState();
  const recheckMins = 6;

  React.useEffect(() => {
    const interval = setInterval(() => {
      onCheckClick();
    }, 1000 * 60 * recheckMins);


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

    return () => clearInterval(interval);
  }, []);

  const addLog = (log) => {
    console.log(`${new Date().toLocaleString()} - ${log}`);
  };

  const onPingGroups = () => {
    try {
      districts.forEach(async (dis) => {
        dis.notifiers.forEach(n => pingTelegram(n.chat_id));
      });
    } catch (e) { Alert.alert('Error', 'Something went wrong in pinging', e && e.toString && e.toString());  }
  };
  
  const onPingGod = () => {
    pingGod();
  }

  const onCheckClick = async () => {
    setLoading(true);
    let token = null;
    try {
      token = await extractToken();
      if (token && token.token) submitToken(token.token);
    } catch (e) { console.log('Unable to get token', e); }
    try {
      districts.forEach(async (dis) => {
        const availCentersNow = await getAvailableCenters((token && token.token), dis.id, ddmmyy(new Date()), dis.minAge || 18);
        availCentersNow && availCentersNow.length && dis.notifiers.forEach(async (n) => {
          notifyTelegram(availCentersNow, n.chat_id)
        });
      });
      setLoading(false);
    } catch (e) {
      console.log('Error is ', e);
      pingGod('Error is ', e)
      setLoading(false);
    }
  };

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
          <Section title="Check with COWIN">
            <Button title={loading ? 'Check...' : 'Check'} onPress={onCheckClick} disabled={loading} />
          </Section>
          <Section title="Ping Telegram Groups">
            <Button title="Ping Telegram Groups" onPress={onPingGroups} />
          </Section>

          <Section title="Ping God">
            <Button title="Ping God" onPress={onPingGod} />
            {/* <Button title="Ping Total Members" onPress={onPingTotal} /> */}
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
