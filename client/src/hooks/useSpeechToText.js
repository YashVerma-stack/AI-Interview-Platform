// start Microphone
// Convert speech to text
// Detect 3 sec pause / silence
// automatically call a callback function execute

import { useEffect, useRef, useState } from "react"

export const useSpeechToText = (onSilence) => {
    const recognitionRef = useRef(null);
    const silenceTimeRef = useRef(null);
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
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let finalText = "";
            let interimText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    finalText += transcript;
                } else {
                    interimText += transcript;
                }
            }

            if (finalText) {
                const updatedTranscript =
                    (transcriptRef.current + " " + finalText).trim();

                transcriptRef.current = updatedTranscript;
                setTranscript(updatedTranscript);
            }

            if (finalText || interimText) {
                resetSilenceTimer();
            }
        }

        recognition.onerror = (error) => {
            console.error("SpeechRecognition error", error);
        };

        recognition.start();
        recognitionRef.current = recognition;

    }

    const resetSilenceTimer = () => {

        clearTimeout(silenceTimeRef.current);

        silenceTimeRef.current = setTimeout(() => {
            onSilenceRef.current(transcriptRef.current);
        }, 3000);
    };

    const stopListening = () => {
        clearTimeout(silenceTimeRef.current);

        const recognition = recognitionRef.current;

        if (recognition && typeof recognition.stop === "function") {
            recognition.stop();
        }

        recognitionRef.current = null;
    };

    return {
        stopListening,
        resetSilenceTimer,
        startListening,
    }
}