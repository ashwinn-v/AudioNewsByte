
import { Mic, MicOff } from 'lucide-react';


const TransmissionControls = ({ isListening, toggleListening, clearTransmission, language }) => {  
  return (
    <div className="flex justify-center space-x-6">
      {/* <button onClick={clearTransmission} className="bg-transparent hover:bg-[#F8F7FF] text-[#F8F7FF] font-bold py-3 px-6 border-2 border-[#F8F7FF] rounded-full shadow-lg cursor-pointer">
        {language === 'EN' ? "Clear Transmission" : "Translated Clear Text"}
      </button> */}
      <button onClick={toggleListening} className={`bg-transparent ${isListening ? 'bg-[#F8F7FF] text-[#0A0B2E]' : 'text-[#F8F7FF]'} font-bold py-3 px-6 border-2 border-[#F8F7FF] rounded-full shadow-lg flex items-center gap-2`}>
        {isListening ? <MicOff /> : <Mic />}
        {isListening ? (language === 'EN' ? 'End Transmission' : "End Translation") : (language === 'EN' ? 'Start Transmission' : "Start Translation")}
      </button>
    </div>
  );
};

export default TransmissionControls;
