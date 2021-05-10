import { AudioContext, IAudioContext } from 'standardized-audio-context';
import * as audioContextTimers from 'audio-context-timers';
import { WebSocketConnection } from './websocket';

const audioContext: IAudioContext = new AudioContext();
let intervalId: number;
let playing: boolean = false;
let count = 0;

/**
 * Set up DOM for user A or B and get references to all 
 * nodes for UI updates.
 */

const transportMap: Map<string, HTMLElement> = new Map([
  ['t1', document.getElementById('t1')],
  ['t2', document.getElementById('t2')],
  ['t3', document.getElementById('t3')],
  ['t4', document.getElementById('t4')],
])

const a = document.getElementById('a');
const aMap: Map<string, HTMLInputElement> = new Map([
  ['a1', document.getElementById('a1') as HTMLInputElement],
  ['a2', document.getElementById('a2') as HTMLInputElement],
  ['a3', document.getElementById('a3') as HTMLInputElement],
  ['a4', document.getElementById('a4') as HTMLInputElement],
])

const b = document.getElementById('b');
const bMap: Map<string, HTMLInputElement> = new Map([
  ['b1', document.getElementById('b1') as HTMLInputElement],
  ['b2', document.getElementById('b2') as HTMLInputElement],
  ['b3', document.getElementById('b3') as HTMLInputElement],
  ['b4', document.getElementById('b4') as HTMLInputElement],
])

switch (process.env.CURRENT_USER) {
  case 'A':
    a.className = "current";
    aMap.forEach((el, id) =>
      el.addEventListener('click', () => toggleNote(id, el))
    );
    b.className = "other";
    bMap.forEach(el => el.disabled = true)
    break;
  case 'B':
    b.className = "current";
    bMap.forEach((el, id) =>
      el.addEventListener('click', () => toggleNote(id, el))
    );
    a.className = "other";
    aMap.forEach(el => el.disabled = true)
    break;
  default:
    alert('Invalid user. Set the CURRENT_USER to A or B in .env')
}

const websocket = new WebSocketConnection(receiveChanges)

/**
 * Note data, local and cache with latest from server
 */

let localData: Notes = {
  A: { 1: false, 2: false, 3: false, 4: false },
  B: { 1: false, 2: false, 3: false, 4: false }
};

let serverData: Notes = {
  A: { 1: false, 2: false, 3: false, 4: false },
  B: { 1: false, 2: false, 3: false, 4: false }
};

/**
 * Note updates. Flip the boolean value for the note in localData
 * and update the DOM to show it off or on.
 * @param id  The id of the note. Matches DOM id. 
 * @param el  The DOM node.
 */
function toggleNote(id: string, el: HTMLInputElement) {
  const [current, note] = [...id];
  switch (current) {
    case 'a':
      localData.A[+note] = !localData.A[note];
      break;

    case 'b':
      localData.B[+note] = !localData.B[note];
      break;

    default:
      break;
  }

  el.className = el.className === '' ? 'active' : '';
}

/**
 * Update JS interval timer with web audio time and show the change 
 * in the UI transport. When we are the last note, send localData to
 * the server and update to used the cached server data.
 */

function updateInterval(): number {
  const now: number = audioContext.currentTime;
  const drift: number = Math.round(now) - now;

  // console.log('-------------')
  // console.log('now', now);
  // console.log('drift', drift);
  // console.log('next', now + 1 + drift);

  if (count === 2) {
    console.log('updating local data and sending changes');
    localData = serverData;
    sendChanges();
  }

  updateTransport();

  audioContextTimers.clearInterval(intervalId);
  return audioContextTimers.setInterval(() => {
    intervalId = updateInterval();
  }, (1 + drift) * 1000);
}

function sendChanges() {
  console.log('local data', localData)
  websocket.send(localData);
}

function receiveChanges (notes: Notes) {
  console.log('server data:', notes)
  serverData = notes;
}

function updateTransport() {
  count = (count + 1) % 4;
  transportMap.forEach(el => el.className = "");
  transportMap.get('t' + (count + 1)?.toString()).className = "active";
  console.log('count:', count + 1)
}

/**
 * Transport controls.
 */

const start: VoidFunction = () => {
  if (!playing) {
    playing = true;
    audioContext.resume();
    intervalId = updateInterval();
  }
}

const stop: VoidFunction = () => {
  audioContextTimers.clearInterval(intervalId);
  audioContext.suspend();
  playing = false;
}

document.getElementById('start').addEventListener('click', start);
document.getElementById('stop').addEventListener('click', stop);

export { }
