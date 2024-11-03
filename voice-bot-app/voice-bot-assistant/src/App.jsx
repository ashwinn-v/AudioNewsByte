import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

function App() {
  const options = ['EN', 'ES', 'FR'];
  const [isListening, setIsListening] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [summary, setSummary] = useState('');
  const [language, setLanguage] = useState('EN');
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Initialize speech recognition
  useEffect(() => {
    if (window.MediaRecorder && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunksRef.current.push(e.data);
            }
          };

          mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(chunksRef.current, { type: 'audio/mp3' });
            chunksRef.current = [];
            
            // Create FormData and append the audio blob
            const formData = new FormData();
            formData.append('audio', audioBlob, 'question.mp3');

            try {
              const response = await fetch('http://localhost:8000/ask_a_question', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error('Network response was not ok');
              }

              const data = await response.json();
              console.log('Question audio file:', data.audio_file);
              
            } catch (error) {
              console.error('Error sending question:', error);
            }
          };
        })
        .catch(err => console.error('Error accessing microphone:', err));
    }
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
    
    try {
      const response = await fetch('http://localhost:8000/new-news', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setSummary(data.summary);

      const audioBlob = base64ToBlob(data.audio, 'audio/mpeg');
      const audioURL = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioURL;
      audioRef.current.play();
      setIsAudioPlaying(true);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const toggleQuestion = () => {
    if (isAskingQuestion) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
      chunksRef.current = [];
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start();
      }
    }
    setIsAskingQuestion(!isAskingQuestion);
  };

  const base64ToBlob = (base64, type) => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: type });
  };

  const toggleAudioPlayback = () => {
    if (isAudioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsAudioPlaying(!isAudioPlaying);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang.value);
  };

  const getText = (enText, esText, frText) => {
    if (language === 'ES') return esText;
    if (language === 'FR') return frText;
    return enText;
  };

  return (
    <div className="App min-h-screen bg-[#0A0B2E] text-[#F8F7FF] font-mono">
      <header className="p-6 text-center border-b border-[#F8F7FF] border-opacity-20 flex justify-between items-center">
        <div className="pacman-logo">
          <div className="pacman"></div>
          <div className="food"></div>
        </div>
        <h1 className="text-4xl font-bold pixelated">Space Voice Chat</h1>
        <div>
          <Dropdown
            options={options}
            onChange={handleLanguageChange}
            value={language}
            placeholder="Select an option"
          />
        </div>
      </header>
      <main className="container mx-auto p-6 space-y-6">
        <textarea
          value={summary}
          readOnly
          className="w-full h-96 bg-[#0A0B2E] border-2 border-[#F8F7FF] text-[#F8F7FF] p-4 font-mono text-lg resize-none rounded-xl shadow-lg"
          placeholder={getText(
            'Your transmission will appear here...',
            'Tu transmisión aparecerá aquí...',
            'Votre transmission apparaîtra ici...'
          )}
        />
        <div className="flex justify-center space-x-6">
          <button
            onClick={toggleListening}
            className="cursor-pointer bg-transparent hover:bg-[#F8F7FF] hover:text-[#0A0B2E] font-bold py-3 px-6 border-2 border-[#F8F7FF] rounded-full shadow-lg flex items-center gap-2"
          >      
            {isListening ? 
              getText('End news', 'Terminar Transmisión', 'Terminer la Transmission') : 
              getText('Start new news', 'Iniciar Transmisión', 'Commencer la Transmission')
            }
          </button>

          <button
            onClick={toggleAudioPlayback}
            className="cursor-pointer bg-transparent hover:bg-[#F8F7FF] hover:text-[#0A0B2E] font-bold py-3 px-6 border-2 border-[#F8F7FF] rounded-full shadow-lg flex items-center gap-2"
          >
            {isAudioPlaying ? 
              getText('Pause ', 'Pausar Audio', 'Pause Audio') : 
              getText('Play ', 'Iniciar Audio', 'Démarrer Audio')
            }
          </button>
          <button
            onClick={toggleQuestion}
            className="cursor-pointer bg-transparent hover:bg-[#F8F7FF] hover:text-[#0A0B2E] font-bold py-3 px-6 border-2 border-[#F8F7FF] rounded-full shadow-lg flex items-center gap-2"
          >
            {isAskingQuestion ? <MicOff /> : <Mic />}
            {isAskingQuestion ? 'Stop Recording' : 'Ask a Question'}
          </button>
        </div>
        <audio ref={audioRef} onEnded={() => setIsAudioPlaying(false)} hidden />
      </main>
    </div>
  );
}

export default App;