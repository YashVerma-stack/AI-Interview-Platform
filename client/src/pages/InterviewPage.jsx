import { useEffect, useState } from "react";
import { APP_CONSTANT } from "../util/constant";
import StartInterview from "../components/StartInterview";
import { endInterviewAPI, reportAPI, submitAPI } from "../services/interview";
import { playAudio } from "../util/audio";
import Interview from "../components/Interview";
import { useSpeechToText } from "../hooks/useSpeechToText";
import Report from "../components/Report";
import "../assets/css/InterviewPage.css";

const InterviewPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState(APP_CONSTANT.IDLE);
  const [question, setQuestion] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const onAutoSubmit = async (finalText) => {
    stopListening();
    if (!finalText.trim()) {
      return;
    }

    // submit response
    const payload = {
      session_id: sessionId,
      answer: finalText,
      skip: false,
    };
    const data = await submitAPI(payload);

    if (!data) {
      return;
    }

    if (data.interviewEnded) {
      // Report generate
      await finishInterview();
    } else {
      // ASk next question
      setQuestion(data.nextQuestion);
      setStatus(APP_CONSTANT.ASKING);
    }
  };

  const { startListening, stopListening } = useSpeechToText(onAutoSubmit);

  const finishInterview = async () => {
    setLoading(true);

    try {
      const data = await reportAPI(sessionId);

      console.log("Report API Response:", data);

      if (!data || !data.result) {
        console.error("Report generation failed");
        return;
      }

      setReport(data.result);
      setStatus(APP_CONSTANT.COMPLETED);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    // TODO End Interview
    stopListening();

    // call end endpoint
    await endInterviewAPI(sessionId);
    await finishInterview();
  };

  const skipQuestion = async () => {
    // TODO skip question
    stopListening();
    // submit response
    const payload = {
      session_id: sessionId,
      answer: "",
      skip: true,
    };
    const data = await submitAPI(payload);

    if (!data) {
      return;
    }

    if (data.interviewEnded) {
      // Report generate
      finishInterview();
    } else {
      // ASk next question
      setQuestion(data.nextQuestion);
      setStatus(APP_CONSTANT.ASKING);
    }
  };

  useEffect(() => {
    if (status === APP_CONSTANT.ASKING) {
      playAudio(question, () => {
        setStatus(APP_CONSTANT.LISTENING);

        startListening();
      });
    }
  }, [status, question]);

  const startInterview = async (data, session_id) => {
    setLoading(true);

    // response sessionId, status, question
    setSessionId(session_id);
    setQuestion(data.firstQuestion);

    setStatus(APP_CONSTANT.INTRO);

    // play Text to Speach
    const introText = data.introText;
    playAudio(introText, () => {
      setLoading(false);
      setStatus(APP_CONSTANT.ASKING);
    });
  };

  return (
    <>
      {loading && <div className ="loader"></div>}
      {status === APP_CONSTANT.IDLE && (
        <StartInterview onClick={startInterview} />
      )}

      {(status === APP_CONSTANT.ASKING ||
        status === APP_CONSTANT.LISTENING) && (
        <Interview
          skipQuestion={skipQuestion}
          endInterview={endInterview}
          state={status}
        />
      )}

      {status === APP_CONSTANT.COMPLETED && <Report report={report} />}
    </>
  );
};

export default InterviewPage;
