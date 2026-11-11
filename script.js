/*
  BLUETOOTH SPEAKER MODEL
  These variables are the speaker's "memory." They keep track of its current state.
*/

let powerOn = false;
let bluetoothConnected = false;
let isPlaying = false;
let volume = 50;
let currentSong = 0;

// This is the short playlist shown on the speaker screen.
const playlist = ["Midnight Walk", "City Lights", "Sunday Morning"];
// These names must exactly match the audio files in the audio folder.
const audioTracks = [
  "audio/midnight-walk.mp3",
  "audio/city-lights.mp3",
  "audio/sunday-morning.mp3"
];
// Each song has a different three-color light theme.
const songLightThemes = [
  ["#43c7ee", "#9d7cff", "#6ee37c"], // Midnight Walk: cool night colors
  ["#ff9b4a", "#ff4f80", "#ffd84d"], // City Lights: warm neon colors
  ["#66d98c", "#f7d56a", "#55bfe8"]  // Sunday Morning: soft daylight colors
];
const minimumVolume = 0;
const maximumVolume = 100;
const volumeStep = 10;

// Find the HTML elements that need to change after a button click.
const powerButton = document.querySelector("#power-button");
const bluetoothButton = document.querySelector("#bluetooth-button");
const volumeDownButton = document.querySelector("#volume-down-button");
const volumeUpButton = document.querySelector("#volume-up-button");
const playPauseButton = document.querySelector("#play-pause-button");
const previousButton = document.querySelector("#previous-button");
const nextButton = document.querySelector("#next-button");
const statusLight = document.querySelector("#status-light");
const speaker = document.querySelector("#speaker");
const statusText = document.querySelector("#status-text");
const connectionText = document.querySelector("#connection-text");
const songTitle = document.querySelector("#song-title");
const volumeText = document.querySelector("#volume-text");
const volumeFill = document.querySelector("#volume-fill");
const message = document.querySelector("#message");
const audioPlayer = document.querySelector("#audio-player");

// Each event listener waits for a click, then calls the matching function.
powerButton.addEventListener("click", togglePower);
bluetoothButton.addEventListener("click", toggleBluetooth);
volumeDownButton.addEventListener("click", () => changeVolume(-volumeStep));
volumeUpButton.addEventListener("click", () => changeVolume(volumeStep));
playPauseButton.addEventListener("click", togglePlayPause);
previousButton.addEventListener("click", previousSong);
nextButton.addEventListener("click", nextSong);

// When a real song reaches its end, update the model to show that it has stopped.
audioPlayer.addEventListener("ended", () => {
  isPlaying = false;
  message.textContent = "This song has ended. Press Play to hear it again.";
  updateDisplay();
});

function togglePower() {
  if (powerOn === false) {
    powerOn = true;
    message.textContent = "Speaker is on. Connect Bluetooth to use the music controls.";
  } else {
    // Turning off always clears connection and playback, as a real speaker would.
    powerOn = false;
    bluetoothConnected = false;
    isPlaying = false;
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    message.textContent = "Speaker is off. Bluetooth disconnected and playback stopped.";
  }

  updateDisplay();
}

function toggleBluetooth() {
  if (powerOn === false) {
    message.textContent = "Turn the speaker on before connecting Bluetooth.";
  } else if (bluetoothConnected === false) {
    bluetoothConnected = true;
    message.textContent = "Bluetooth connected. The music controls are ready.";
  } else {
    bluetoothConnected = false;
    isPlaying = false; // Disconnecting also stops simulated playback.
    audioPlayer.pause();
    message.textContent = "Bluetooth disconnected. Playback stopped.";
  }

  updateDisplay();
}

function canUseMusicControls() {
  // This if statement protects every music control before it changes anything.
  if (powerOn === false) {
    message.textContent = "Turn the speaker on first.";
    return false;
  } else if (bluetoothConnected === false) {
    message.textContent = "Connect Bluetooth first to use this control.";
    return false;
  }

  return true;
}

function changeVolume(amount) {
  if (canUseMusicControls() === false) {
    updateDisplay();
    return;
  }

  // Math.max and Math.min keep volume inside its 0–100 limits.
  volume = Math.max(minimumVolume, Math.min(maximumVolume, volume + amount));

  if (volume === maximumVolume && amount > 0) {
    message.textContent = "Volume is already at its maximum: 100%.";
  } else if (volume === minimumVolume && amount < 0) {
    message.textContent = "Volume is already at its minimum: 0%.";
  } else {
    message.textContent = `Volume changed to ${volume}%.`;
  }

  updateDisplay();
}

function togglePlayPause() {
  if (canUseMusicControls() === false) {
    updateDisplay();
    return;
  }

  if (isPlaying === false) {
    playCurrentSong();
  } else {
    audioPlayer.pause();
    isPlaying = false;
    message.textContent = "Playback paused.";
    updateDisplay();
  }
}

function playCurrentSong() {
  // Set the audio file for the selected playlist item before requesting playback.
  audioPlayer.src = audioTracks[currentSong];

  // play() returns a promise because the browser may need time to begin audio.
  audioPlayer.play().then(() => {
    isPlaying = true;
    message.textContent = `Playing "${playlist[currentSong]}".`;
    updateDisplay();
  }).catch(() => {
    isPlaying = false;
    message.textContent = `Audio file not found: add ${audioTracks[currentSong]} to hear this song.`;
    updateDisplay();
  });
}

function nextSong() {
  if (canUseMusicControls() === false) {
    updateDisplay();
    return;
  }

  const wasPlaying = isPlaying;
  audioPlayer.pause();
  isPlaying = false;

  // At the last song, go back to the first song instead of going out of range.
  if (currentSong === playlist.length - 1) {
    currentSong = 0;
    message.textContent = "Reached the last song, so the playlist returned to the first song.";
  } else {
    currentSong = currentSong + 1;
    message.textContent = "Moved to the next song.";
  }

  if (wasPlaying) {
    playCurrentSong(); // Continue playing when a user switches songs during playback.
  } else {
    updateDisplay();
  }
}

function previousSong() {
  if (canUseMusicControls() === false) {
    updateDisplay();
    return;
  }

  const wasPlaying = isPlaying;
  audioPlayer.pause();
  isPlaying = false;

  // At the first song, go back to the last song. This makes the playlist loop.
  if (currentSong === 0) {
    currentSong = playlist.length - 1;
    message.textContent = "Reached the first song, so the playlist moved to the last song.";
  } else {
    currentSong = currentSong - 1;
    message.textContent = "Moved to the previous song.";
  }

  if (wasPlaying) {
    playCurrentSong(); // Continue playing when a user switches songs during playback.
  } else {
    updateDisplay();
  }
}

function updateDisplay() {
  // One function redraws the visual feedback from the current state variables.
  songTitle.textContent = playlist[currentSong];
  volumeText.value = `${volume}%`;
  volumeFill.style.width = `${volume}%`;
  // The audio element uses a decimal volume from 0 (silent) to 1 (maximum).
  audioPlayer.volume = volume / maximumVolume;
  // The volume also controls the maximum height and glow size of the playing lights.
  speaker.style.setProperty("--light-height", `${18 + volume * 0.44}px`);
  speaker.style.setProperty("--light-glow", `${8 + volume * 0.2}px`);
  speaker.style.setProperty("--bar-glow", `${3 + volume * 0.1}px`);
  // Choose the current song's color theme for the animated light bars.
  speaker.style.setProperty("--music-color", songLightThemes[currentSong][0]);
  speaker.style.setProperty("--music-color-two", songLightThemes[currentSong][1]);
  speaker.style.setProperty("--music-color-three", songLightThemes[currentSong][2]);

  // This class turns the CSS light animation on while music is playing.
  speaker.classList.toggle("is-playing", isPlaying);

  if (powerOn === false) {
    statusText.textContent = "Speaker is off";
    connectionText.textContent = "Bluetooth disconnected";
    statusLight.className = "status-light off";
    playPauseButton.innerHTML = "▶<span>Play</span>";
  } else if (bluetoothConnected === false) {
    statusText.textContent = "On — Bluetooth disconnected";
    connectionText.textContent = "Bluetooth disconnected";
    statusLight.className = "status-light on";
    playPauseButton.innerHTML = "▶<span>Play</span>";
  } else if (isPlaying === true) {
    statusText.textContent = "Connected — playing";
    connectionText.textContent = "Bluetooth connected";
    statusLight.className = "status-light playing";
    playPauseButton.innerHTML = "⏸<span>Pause</span>";
  } else {
    statusText.textContent = "Connected — paused";
    connectionText.textContent = "Bluetooth connected";
    statusLight.className = "status-light connected";
    playPauseButton.innerHTML = "▶<span>Play</span>";
  }

  updateControlAvailability();
}

function updateControlAvailability() {
  /*
    Button order:
    1. Power is always available.
    2. Bluetooth unlocks after the speaker is on.
    3. Play unlocks after Bluetooth connects.
    4. Volume and song controls unlock only while a song is playing.
  */
  bluetoothButton.disabled = powerOn === false;
  playPauseButton.disabled = powerOn === false || bluetoothConnected === false;

  const musicIsPlaying = powerOn && bluetoothConnected && isPlaying;
  volumeDownButton.disabled = !musicIsPlaying;
  volumeUpButton.disabled = !musicIsPlaying;
  previousButton.disabled = !musicIsPlaying;
  nextButton.disabled = !musicIsPlaying;
}

// Draw the starting state once when the page first opens.
updateDisplay();
