import { requestGeolocation, requestMotion, coarseGeolocation, requestCamera } from "permissions";
import { startGPSWatch, updateDistanceToPOI } from "gps";
import { show, setText } from "utils";

export default function initApp() {
  // Request camera and GPS immediately
  requestCamera();

  // Monitor AR.js video readiness to update status
  const iv = setInterval(() => {
    const v = document.getElementById('arjs-video');
    if (v) {
      v.setAttribute('playsinline', ''); // Redundant but safe
      v.play().catch(e => console.warn("Video play failed:", e)); // Try to play video
    }
    if (v && (v.srcObject || v.readyState > 2 || v.videoWidth > 0)) {
      setText('camStatus', 'Camera: live');
      clearInterval(iv);
    }
  }, 300);

  requestGeolocation(true).then(result => {
    if (result.ok) {
      startGPSWatch(true);
      updateDistanceToPOI();
    }
  });

  // Prepare iOS motion activation button
  const motionBtn = document.getElementById('enableMotion');
  if (motionBtn) {
    motionBtn.addEventListener('click', async () => {
      const granted = await requestMotion(true);
      if (granted) {
        // A-Frame rotation-reader will now read motion sensors
      }
    }, { passive: true });
  }

  // Coarse location fallback button
  const coarseBtn = document.getElementById('useCoarseLocation');
  if (coarseBtn) {
    coarseBtn.addEventListener('click', async () => {
      const res = await coarseGeolocation();
      if (res.ok) {
        startGPSWatch(false);
        updateDistanceToPOI();
        show('useCoarseLocation', false);
      }
    }, { passive: true });
  }

  // Try to pre-set motion status for non-iOS
  requestMotion(false);
}