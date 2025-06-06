interface NotificationSettings {
  soundEnabled: boolean;
  soundType: 'beep' | 'chime' | 'bell' | 'digital';
  soundVolume: number; // 0-100
  browserNotifications: boolean;
  flashScreen: boolean;
}

// Audio context for generating different sound types
class SoundGenerator {
  private audioContext: AudioContext | null = null;

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  async playBeep(volume: number = 0.5, duration: number = 300) {
    const ctx = this.initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  }

  async playChime(volume: number = 0.5) {
    const ctx = this.initAudioContext();
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    for (let i = 0; i < frequencies.length; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[i], ctx.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      }, i * 200);
    }
  }

  async playBell(volume: number = 0.5) {
    const ctx = this.initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1);
  }

  async playDigital(volume: number = 0.5) {
    const ctx = this.initAudioContext();
    const frequencies = [440, 880]; // A4, A5
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[i % 2], ctx.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      }, i * 150);
    }
  }
}

const soundGenerator = new SoundGenerator();

export class NotificationManager {
  private settings: NotificationSettings;

  constructor(settings: NotificationSettings) {
    this.settings = settings;
  }

  updateSettings(settings: NotificationSettings) {
    this.settings = settings;
  }

  async requestBrowserPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  private async playSound() {
    if (!this.settings.soundEnabled) return;

    const volume = this.settings.soundVolume / 100; // Convert 0-100 to 0-1

    try {
      switch (this.settings.soundType) {
        case 'beep':
          await soundGenerator.playBeep(volume);
          break;
        case 'chime':
          await soundGenerator.playChime(volume);
          break;
        case 'bell':
          await soundGenerator.playBell(volume);
          break;
        case 'digital':
          await soundGenerator.playDigital(volume);
          break;
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  private showBrowserNotification(title: string, body: string, icon?: string) {
    if (!this.settings.browserNotifications) return;

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'focus-flow-timer',
        requireInteraction: false,
        silent: true // We handle audio separately
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  private flashScreen() {
    if (!this.settings.flashScreen) return;

    const flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #3B82F6;
      opacity: 0.8;
      z-index: 9999;
      pointer-events: none;
      animation: flash-fade 0.5s ease-out;
    `;

    // Add flash animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flash-fade {
        0% { opacity: 0.8; }
        50% { opacity: 0.4; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(flashOverlay);

    setTimeout(() => {
      document.body.removeChild(flashOverlay);
      document.head.removeChild(style);
    }, 500);
  }

  async notifyWorkComplete() {
    await this.playSound();
    this.showBrowserNotification(
      '🎉 Work Session Complete!',
      'Great job! Time for a well-deserved break.',
    );
    this.flashScreen();
  }

  async notifyBreakComplete() {
    await this.playSound();
    this.showBrowserNotification(
      '⚡ Break Complete!',
      'Ready to focus? Let\'s get back to work!',
    );
    this.flashScreen();
  }

  async notifyLongBreakComplete() {
    await this.playSound();
    this.showBrowserNotification(
      '🌟 Long Break Complete!',
      'Refreshed and ready for the next cycle!',
    );
    this.flashScreen();
  }

  async testSound() {
    await this.playSound();
  }
}

// Default notification settings
export const defaultNotificationSettings: NotificationSettings = {
  soundEnabled: true,
  soundType: 'beep',
  soundVolume: 50,
  browserNotifications: true,
  flashScreen: true,
};

export type { NotificationSettings }; 