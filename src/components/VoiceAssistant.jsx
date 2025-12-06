import React, { useState, useEffect } from 'react';
import voiceService from '../services/voiceService';
import { FiMic, FiMicOff, FiVolume2 } from 'react-icons/fi';

const VoiceAssistant = ({ medications }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if voice services are supported
    if (!voiceService.isSupported()) {
      setSupported(false);
      setError('Voice assistant is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  const startListening = () => {
    setError('');
    setTranscript('');
    setResponse('');
    setIsListening(true);

    voiceService.startListening(
      (recognizedText) => {
        setTranscript(recognizedText);
        handleVoiceCommand(recognizedText);
        setIsListening(false);
      },
      (err) => {
        setError(`Error: ${err}`);
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const handleVoiceCommand = (command) => {
    const result = voiceService.processCommand(command, medications);
    setResponse(result.text);
    
    // Speak the response
    voiceService.speak(result.text);
  };

  const speakExample = (text) => {
    voiceService.speak(text);
    setResponse(text);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <FiVolume2 className="mr-2 text-accent-purple" />
          Voice Assistant
        </h3>
        {supported && (
          <span className="badge-success">
            <FiMic className="inline mr-1" />
            Active
          </span>
        )}
      </div>

      {!supported ? (
        <div className="alert-warning">
          <FiMicOff className="inline mr-2" />
          {error}
        </div>
      ) : (
        <>
          {/* Microphone Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative w-24 h-24 rounded-full shadow-xl shadow-accent-orange/20 transform transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
                  : 'bg-gradient-to-br from-accent-orange to-accent-red hover:from-accent-orange/90 hover:to-accent-red/90 hover:scale-105'
              }`}
            >
              {isListening ? (
                <FiMicOff className="text-white text-4xl mx-auto" />
              ) : (
                <FiMic className="text-white text-4xl mx-auto" />
              )}
              {isListening && (
                <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"></span>
              )}
            </button>
          </div>

          <p className="text-center text-gray-400 mb-6">
            {isListening
              ? 'Listening... Speak your question'
              : 'Tap the microphone to start'}
          </p>

          {/* Transcript */}
          {transcript && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-400 mb-2">You said:</p>
              <div className="bg-accent-blue/10 border-l-4 border-accent-blue p-4 rounded-r-xl">
                <p className="text-gray-200">{transcript}</p>
              </div>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-400 mb-2">Assistant:</p>
              <div className="bg-accent-green/10 border-l-4 border-accent-green p-4 rounded-r-xl">
                <p className="text-gray-200">{response}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !isListening && (
            <div className="alert-danger">
              {error}
            </div>
          )}

          {/* Example Commands */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-300 mb-3">Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={() => speakExample("You can ask me: What medicine should I take now?")}
                className="text-left px-4 py-3 bg-dark-bg hover:bg-dark-hover rounded-xl text-sm transition-colors border border-dark-border text-gray-300"
              >
                "What medicine should I take now?"
              </button>
              <button
                onClick={() => speakExample("You can ask me: When is my next dose?")}
                className="text-left px-4 py-3 bg-dark-bg hover:bg-dark-hover rounded-xl text-sm transition-colors border border-dark-border text-gray-300"
              >
                "When is my next dose?"
              </button>
              <button
                onClick={() => speakExample("You can ask me: Explain my prescription")}
                className="text-left px-4 py-3 bg-dark-bg hover:bg-dark-hover rounded-xl text-sm transition-colors border border-dark-border text-gray-300"
              >
                "Explain my prescription"
              </button>
              <button
                onClick={() => speakExample("You can ask me: List my medicines")}
                className="text-left px-4 py-3 bg-dark-bg hover:bg-dark-hover rounded-xl text-sm transition-colors border border-dark-border text-gray-300"
              >
                "List my medicines"
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-4">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-accent-blue">💡 Tips:</span> Speak clearly and wait for the beep. 
              The assistant can help you check medication schedules, verify doses, and provide reminders.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceAssistant;
