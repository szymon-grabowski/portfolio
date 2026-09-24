/** Client entry point: wires up every interactive module. */
import { initBootSequence } from './boot-sequence';
import { initMonitorFit } from './monitor-fit';
import { initStartButton } from './start-button';
import { initThemePicker } from './theme-picker';
import { BOOT_SESSION_KEY } from '../data/boot';
import { writeStorage } from './storage';

initMonitorFit();
const boot = initBootSequence(); // null on pages without the boot screen
initStartButton();
initThemePicker({
  onReplay: () => {
    if (boot) return boot.replay();
    // From other pages: forget the finished boot and go back to the start screen.
    writeStorage('sessionStorage', BOOT_SESSION_KEY, '0');
    window.location.href = '/';
  },
});
