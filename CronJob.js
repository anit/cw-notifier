import BackgroundTask from 'react-native-background-task';
import { pingGod } from './apis';

BackgroundTask.define(async ()  => {
  await pingGod('Pinging regularly.....');
  BackgroundTask.finish()
})

console.log('Scheduling background task.....')
BackgroundTask.schedule({});