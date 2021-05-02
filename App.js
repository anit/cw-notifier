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
import { extractToken, getAvailableCenters, notifyTelegram, pingGod } from './apis';
import { ddmmyy, nextWeekSameDay } from './utils';
import { config } from './config';

const App: () => Node = () => {
  const [loading, setLoading] = React.useState(false);
  const [logs, setLogs] = React.useState();
  const recheckMins = 6;

  React.useEffect(() => {
    const interval = setInterval(() => {
      onCheckClick();
    }, 1000 * 60 * recheckMins);
    return () => clearInterval(interval);
  }, []);

  const addLog = (log) => {
    console.log(`${new Date().toLocaleString()} - ${log}`);
  };

  const onCheckClick = async () => {
    setLoading(true)
    try {
      const token = await extractToken();
      config.districts.forEach(async (dis) => {
        const availCentersNow = await getAvailableCenters(token.token, dis.id, ddmmyy(new Date()));
        availCentersNow && availCentersNow.length && dis.notifiers.forEach(n => notifyTelegram(availCentersNow, n.chat_id));
        if (!availCentersNow || !availCentersNow.length) addLog(`No centers found this week for ${dis.name}`);

        const availCentersNext = await getAvailableCenters(token.token, dis.id, ddmmyy(nextWeekSameDay(new Date())));
        availCentersNext && availCentersNext.length && dis.notifiers.forEach(n => notifyTelegram(availCentersNext, n.chat_id));
        if (!availCentersNext || !availCentersNext.length) addLog(`No centers found next week for ${dis.name}`);
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
          <Section title="Logs">
            <Button title={loading ? 'Check...' : 'Check'} onPress={onCheckClick} disabled={loading} />
            <Text>{logs}</Text>
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
