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

const transportMap: Map<string, HTMLElement> = new Map([
  ['t1', document.getElementById('t1')],
  ['t2', document.getElementById('t2')],
  ['t3', document.getElementById('t3')],
  ['t4', document.getElementById('t4')],
])


/**
 * User selection. Set user from environment at initialization,
 * and update user when selected from the UI.
 */

function setUser(user: string) {
  switch (user) {
    case 'A':
      a.className = "current";
      aMap.forEach((el, id) => {
        el.addEventListener('click', () => toggleNote(id, el));
        el.disabled = false;
      });
      b.className = "other";
      bMap.forEach(el => el.disabled = true);
      break;
    case 'B':
      b.className = "current";
      bMap.forEach((el, id) => {
        el.addEventListener('click', () => toggleNote(id, el));
        el.disabled = false;
      });
      a.className = "other";
      aMap.forEach(el => el.disabled = true);
      break;
    default:
      alert('Invalid user. Set the CURRENT_USER to A or B in .env');
  }
}

setUser(process.env.CURRENT_USER);

document.getElementById('select-user').addEventListener('change', event => {
  const user = (event.target as HTMLInputElement).value;
  setUser(user);
})


/**
 * Open websocket connection. Set up callback for incoming messages
 */

const websocket = new WebSocketConnection(receiveChanges)


/**
 * Initialize local data and server data.
 */

let localData: Session = {
  A: { mtime: 0, notes: { 1: false, 2: false, 3: false, 4: false } },
  B: { mtime: 0, notes: { 1: false, 2: false, 3: false, 4: false } }
};

let serverData: Session = {
  A: { mtime: 0, notes: { 1: false, 2: false, 3: false, 4: false } },
  B: { mtime: 0, notes: { 1: false, 2: false, 3: false, 4: false } }
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
      localData.A.notes[+note] = !localData.A[note];
      localData.A.mtime = Date.now();
      break;

    case 'b':
      localData.B.notes[+note] = !localData.B[note];
      localData.B.mtime = Date.now();
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

  // zero indexed count -- this is the penultimate note
  if (count === 2) {
    console.log('updating local data and sending changes');
    syncLocalData(localData, serverData);
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

function receiveChanges(session: Session) {
  console.log('server data:', session)
  serverData = session;
}

function syncLocalData(localData: Session, serverData: Session) {
  if (localData.A.mtime < serverData.A.mtime) {
    localData.A = serverData.A;
  }

  if (localData.B.mtime < serverData.B.mtime) {
    localData.B = serverData.B;
  }
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
