// Voice Assistant Service using Web Speech API

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = this.handleResult.bind(this);
      this.recognition.onerror = this.handleError.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);
    }
  }

  // Start listening
  startListening(onResult, onError) {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      if (onError) onError('Speech recognition not supported in this browser');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.isListening = true;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      this.isListening = false;
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Handle recognition result
  handleResult(event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log('Voice input:', transcript);

    if (this.onResultCallback) {
      this.onResultCallback(transcript);
    }
  }

  // Handle recognition error
  handleError(event) {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;

    if (this.onErrorCallback) {
      this.onErrorCallback(event.error);
    }
  }

  // Handle recognition end
  handleEnd() {
    this.isListening = false;
  }

  // Speak text
  speak(text, options = {}) {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    this.synthesis.speak(utterance);

    return new Promise((resolve) => {
      utterance.onend = () => resolve();
    });
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Process voice command
  processCommand(transcript, medications) {
    const intent = this.detectIntent(transcript);
    return this.generateResponse(intent, medications);
  }

  // Detect user intent
  detectIntent(transcript) {
    const lowerTranscript = transcript.toLowerCase();

    // What medicine should I take now?
    if (lowerTranscript.includes('what medicine') && 
        (lowerTranscript.includes('now') || lowerTranscript.includes('take'))) {
      return { type: 'CURRENT_MEDICINE', transcript };
    }

    // Did I take my morning/afternoon/evening dose?
    if (lowerTranscript.includes('did i take') || lowerTranscript.includes('have i taken')) {
      return { type: 'CHECK_DOSE', transcript };
    }

    // Explain my prescription
    if (lowerTranscript.includes('explain') && 
        (lowerTranscript.includes('prescription') || lowerTranscript.includes('medicine'))) {
      return { type: 'EXPLAIN_PRESCRIPTION', transcript };
    }

    // When is my next dose?
    if (lowerTranscript.includes('next') && 
        (lowerTranscript.includes('dose') || lowerTranscript.includes('medicine'))) {
      return { type: 'NEXT_DOSE', transcript };
    }

    // List all medicines
    if (lowerTranscript.includes('list') && lowerTranscript.includes('medicine')) {
      return { type: 'LIST_MEDICINES', transcript };
    }

    // Help command
    if (lowerTranscript.includes('help')) {
      return { type: 'HELP', transcript };
    }

    return { type: 'UNKNOWN', transcript };
  }

  // Generate response based on intent
  generateResponse(intent, medications) {
    const now = new Date();
    const currentHour = now.getHours();

    switch (intent.type) {
      case 'CURRENT_MEDICINE': {
        const currentMeds = this.getMedicationsDueNow(medications);
        if (currentMeds.length === 0) {
          return {
            text: "You don't have any medication scheduled right now.",
            data: null
          };
        }
        
        const medNames = currentMeds.map(m => m.name).join(', ');
        return {
          text: `You should take ${medNames} now.`,
          data: currentMeds
        };
      }

      case 'CHECK_DOSE': {
        return {
          text: "Let me check your medication logs. Please check the dashboard for detailed information.",
          data: null
        };
      }

      case 'EXPLAIN_PRESCRIPTION': {
        if (medications.length === 0) {
          return {
            text: "You don't have any medications in your schedule.",
            data: null
          };
        }

        let explanation = "Here are your medications: ";
        medications.forEach((med, index) => {
          explanation += `${index + 1}. ${med.name}, ${med.dosage}, ${med.frequency}. `;
          if (med.instructions) {
            explanation += `Instructions: ${med.instructions}. `;
          }
        });

        return {
          text: explanation,
          data: medications
        };
      }

      case 'NEXT_DOSE': {
        const nextMed = this.getNextMedication(medications);
        if (!nextMed) {
          return {
            text: "You don't have any upcoming medication scheduled.",
            data: null
          };
        }

        return {
          text: `Your next medication is ${nextMed.name} at ${nextMed.nextTime}.`,
          data: nextMed
        };
      }

      case 'LIST_MEDICINES': {
        if (medications.length === 0) {
          return {
            text: "You don't have any medications in your schedule.",
            data: null
          };
        }

        const medList = medications.map((m, i) => `${i + 1}. ${m.name}`).join(', ');
        return {
          text: `You have ${medications.length} medications: ${medList}`,
          data: medications
        };
      }

      case 'HELP': {
        return {
          text: "You can ask me: What medicine should I take now? Did I take my morning dose? Explain my prescription. When is my next dose? List my medicines.",
          data: null
        };
      }

      default: {
        return {
          text: "I didn't understand that. Try saying 'help' to see what I can do.",
          data: null
        };
      }
    }
  }

  // Helper: Get medications due now
  getMedicationsDueNow(medications) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return medications.filter(med => {
      if (!med.times || !Array.isArray(med.times)) return false;
      
      return med.times.some(time => {
        const [hour, minute] = time.split(':');
        const medMinutes = parseInt(hour) * 60 + parseInt(minute);
        const nowMinutes = currentHour * 60 + currentMinute;
        const diff = Math.abs(medMinutes - nowMinutes);
        
        return diff <= 15; // Within 15 minutes window
      });
    });
  }

  // Helper: Get next medication
  getNextMedication(medications) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextMed = null;
    let minDiff = Infinity;

    medications.forEach(med => {
      if (!med.times || !Array.isArray(med.times)) return;

      med.times.forEach(time => {
        const [hour, minute] = time.split(':');
        const medMinutes = parseInt(hour) * 60 + parseInt(minute);
        
        let diff = medMinutes - currentMinutes;
        if (diff < 0) diff += 24 * 60; // Next day

        if (diff < minDiff) {
          minDiff = diff;
          nextMed = { ...med, nextTime: time };
        }
      });
    });

    return nextMed;
  }

  // Check if browser supports speech recognition
  isSupported() {
    return this.recognition !== null && this.synthesis !== null;
  }
}

export default new VoiceService();
