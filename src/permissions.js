import { isIOS, setText, banner, show } from "utils";

export async function requestCamera() {
  setText('camStatus', 'Camera: requesting…');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    // Immediately stop tracks; AR.js will manage the camera stream itself
    stream.getTracks().forEach(t => t.stop());
    setText('camStatus', 'Camera: granted');
    return true;
  } catch (e) {
    setText('camStatus', 'Camera: denied');
    banner('Camera access denied. Please enable camera permissions in your browser settings.');
    return false;
  }
}

export async function requestGeolocation(highAccuracy = true) {
  setText('gpsStatus', 'GPS: requesting…');
  if (!('geolocation' in navigator)) {
    setText('gpsStatus', 'GPS: unavailable');
    banner('Geolocation is not supported on this device.');
    return { ok: false };
  }

  const opts = {
    enableHighAccuracy: highAccuracy,
    timeout: 8000,
    maximumAge: 0
  };

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setText('gpsStatus', `GPS: granted (~${Math.round(accuracy)}m)`);
        if (accuracy > 100) {
          banner('Poor GPS accuracy detected. You may enable coarse location or move to an open area.');
          show('useCoarseLocation', true);
        }
        resolve({ ok: true, pos });
      },
      (err) => {
        setText('gpsStatus', `GPS: error (${err.code})`);
        banner('GPS permission denied or unavailable. You can try coarse location.');
        show('useCoarseLocation', true);
        resolve({ ok: false, error: err });
      },
      opts
    );
  });
}

export async function requestMotion(activate = false) {
  // iOS 13+ requires user gesture to call requestPermission
  if (isIOS() && typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    setText('motionStatus', 'Motion: needs activation');
    show('enableMotion', true);
    if (!activate) return false;
    try {
      const res = await DeviceMotionEvent.requestPermission();
      if (res === 'granted') {
        setText('motionStatus', 'Motion: granted');
        show('enableMotion', false);
        return true;
      } else {
        setText('motionStatus', 'Motion: denied');
        banner('Motion sensor permission denied. Orientation features may be limited.');
        return false;
      }
    } catch (e) {
      setText('motionStatus', 'Motion: error');
      banner('Motion sensor request failed.');
      return false;
    }
  } else {
    // Non-iOS or older versions
    setText('motionStatus', 'Motion: available');
    return true;
  }
}

export async function coarseGeolocation() {
  // Try with low accuracy and larger timeout
  const opts = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 60000
  };
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { accuracy } = pos.coords;
        setText('gpsStatus', `GPS: coarse (~${Math.round(accuracy)}m)`);
        resolve({ ok: true, pos });
      },
      (err) => {
        setText('gpsStatus', 'GPS: coarse failed');
        banner('Coarse location failed. Please check location settings.');
        resolve({ ok: false, error: err });
      },
      opts
    );
  });
}

