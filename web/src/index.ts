import { AudioContext, IAudioContext } from 'standardized-audio-context';
import * as audioContextTimers from 'audio-context-timers';

const audioContext: IAudioContext = new AudioContext();
let intervalId: number;
let playing: boolean = false;

function updateInterval(): number {
  const now: number = audioContext.currentTime;
  const drift: number = Math.round(now) - now;

  console.log('-------------')
  console.log('now', now);
  console.log('drift', drift);
  console.log('next', now + 1 + drift);

  audioContextTimers.clearInterval(intervalId);
  return audioContextTimers.setInterval(() => {
    intervalId = updateInterval();
  }, (1 + drift) * 1000);
}

const start: VoidFunction = () => {
  if (!playing) {
    audioContext.resume();
    intervalId = updateInterval();
    playing = true;
  }
}

const stop: VoidFunction = () => {
  audioContextTimers.clearInterval(intervalId);
}

document.getElementById('start').addEventListener('click', start);
document.getElementById('stop').addEventListener('click', stop);

export { }
