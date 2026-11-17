import { useEffect, useState } from "react";
import { APP_CONSTANT } from "../util/constant";
import StartInterview from "../components/StartInterview";
import { startInterviewAPI } from "../services/interview";
import { playAudio } from "../util/audio";
import Interview from "../components/Interview";

const InterviewPage = () => {

    const [sessionId, setSessionId] = useState(null);
    const [status, setStatus] = useState(APP_CONSTANT.IDLE);
    const [question, setQuestion] = useState('');
    const [report, setReport] = useState(null);

    const endInterview = () => {
        // TODO End Interview
    }

    const skipQuestion = () => {
        // TODO skip question
    }

    useEffect(() => {
      if (status === APP_CONSTANT.ASKING) {
        playAudio(question, () => {
            setStatus(APP_CONSTANT.LISTENING);

            // todo stt
        })
      }
    }, [status, question])
    

    const startInterview = async () => {
        // start Endpoint
        const data = await startInterviewAPI();

        if(!data) {
            console.log("Something went Wrong");
            return;
        }
        // response sessionId, status, question
        setSessionId(data.session_id);
        setQuestion(data.firstQuestion);

        setStatus(APP_CONSTANT.INTRO);

        // play Text to Speach
        const introText = data.introText;
        playAudio(introText, () => {
            setStatus(APP_CONSTANT.ASKING)
        });
    }

    return <>
        {status === APP_CONSTANT.IDLE && <StartInterview onClick={startInterview} />}

        {(status === APP_CONSTANT.ASKING || status === APP_CONSTANT.LISTENING) && <Interview skipQuestion={skipQuestion} endInterview={endInterview} />}
    </>
}

export default InterviewPage;