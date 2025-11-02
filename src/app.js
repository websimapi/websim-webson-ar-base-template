import { requestGeolocation, requestMotion, coarseGeolocation } from "permissions";
import { startGPSWatch, updateDistanceToPOI } from "gps";
import { show } from "utils";

export default function initApp() {
  // Request camera and GPS immediately
  // requestCamera();

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

