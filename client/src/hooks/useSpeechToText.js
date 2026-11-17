// start Microphone
// Convert speech to text
// Detect 3 sec pause / silence
// automatically call a callback function execute

import { useEffect, useRef, useState } from "react"

export const useSpeechToText = (onSilence) => {
    const recognitionRef = useRef('');
    const silenceTimeRef = useRef('');
    const onSilenceRef = useRef(onSilence);
    const transcriptRef = useRef('');
    const [transcript, setTranscript] = useState('');

    useEffect(() => {
      onSilenceRef.current = onSilence
    }, [onSilence])

    useEffect(() => {
      transcriptRef.current = transcript
    }, [transcript])
    
    

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error("SpeechRecognition is not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continous = true;
        recognition.lang = "en-US";
        recognition.interimResult = true;

        recognition.onresult = (event) => {
            let finalText = "";
            let interimText = "";

            for (let i = event.resultIndex; i < event.result.length; i++) {
                const result = event.result[i];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    finalText += transcript;
                } else {
                    interimText += transcript;
                }
            }

            if (finalText) {
                setTranscript(prev => (prev + " " + finalText).trim());
            }

            if(finalText || interimText) {
                resetSilenceTimer();
            }
        }

        recognition.onerror = (error) => {
            console.error("SpeechRecognition error", error);
        };

        recognition.start();
        recognition.current = recognition;
        
    }

    const resetSilenceTimer = () => {

        clearTimeout(silenceTimeRef.current);

        silenceTimeRef.current  = setTimeout(() => {
            onSilenceRef.current(transcriptRef.current);
        }, 3000);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        clearTimeout(silenceTimeRef.current);
    };

    return {
        stopListening,
        resetSilenceTimer,
        startListening,
    }
}