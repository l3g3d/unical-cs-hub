// Web Speech API wrapper for mobile and desktop speech-to-text

export interface SpeechListenerOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// Window typing for speech recognition
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

let activeRecognition: any = null;

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindow;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function startSpeechToText(options: SpeechListenerOptions): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindow;
  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    if (options.onError) {
      options.onError('Speech recognition is not supported in this browser. Please use text input.');
    }
    return false;
  }

  // Stop any ongoing session
  stopSpeechToText();

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-NG'; // Nigerian English preference, fallback to en-US

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      options.onResult(text, Boolean(finalTranscript));
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (options.onError) {
        let msg = 'Microphone error.';
        if (event.error === 'not-allowed') {
          msg = 'Microphone access was denied. Please allow microphone permissions.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech was detected. Please try speaking again.';
        }
        options.onError(msg);
      }
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (options.onEnd) {
        options.onEnd();
      }
    };

    activeRecognition = recognition;
    recognition.start();
    return true;
  } catch (err: any) {
    console.error('Failed to start speech recognition:', err);
    if (options.onError) {
      options.onError(err.message || 'Could not start voice recognition.');
    }
    return false;
  }
}

export function stopSpeechToText(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }
}
