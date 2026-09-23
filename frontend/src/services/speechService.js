/**
 * MindSaathi - Speech Service (Web Speech API)
 * Zero paid external API dependencies. Uses native browser speech synthesis and recognition.
 */

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isSpeaking = false;
  }

  /**
   * Speak a phrase out loud with elderly-optimized pacing (slightly slower, gentle pitch).
   * @param {string} text - The text to speak.
   * @param {Object} options - Custom rate, pitch, language.
   * @returns {Promise<boolean>}
   */
  speak(text, options = {}) {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('[SpeechService] Speech synthesis not supported in this browser.');
        return resolve(false);
      }

      // Stop any ongoing speech
      this.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.88; // Gentle, clear speed for elderly listeners
      utterance.pitch = options.pitch || 1.0;
      utterance.lang = options.lang || 'en-IN'; // Indian accent English / fallback

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve(true);
      };

      utterance.onerror = (e) => {
        console.warn('[SpeechService] Speech error:', e);
        this.isSpeaking = false;
        resolve(false);
      };

      this.isSpeaking = true;
      this.synth.speak(utterance);
    });
  }

  /**
   * Cancel any currently playing speech.
   */
  cancel() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Check if speech recognition is available in current browser.
   */
  isRecognitionSupported() {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  /**
   * Start a quick speech recognition listener for voice commands (e.g. "medicine", "play").
   * @param {Function} onResult - Callback with transcribed text.
   * @param {Function} onError - Callback on failure.
   */
  startListening(onResult, onError) {
    if (!this.isRecognitionSupported()) {
      if (onError) onError(new Error('Speech recognition not supported in browser.'));
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
      if (onError) onError(event);
    };

    recognition.start();
    return recognition;
  }
}

export const speech = new SpeechService();
