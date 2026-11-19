import { useState } from "react";
import "../assets/css/StartInterview.css";
import { generateQuestionAPI, startInterviewAPI } from "../services/interview";

const ALLOWED_FILE = ["application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const StartInterview = ({ onClick }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlefileUpload = (e) => {
    try {
      const file = e.target.files[0];

      if (!file) {
        return;
      }

      if (!ALLOWED_FILE.includes(file.type)) {
        setError("Only PDF allowed");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be under 5mb");
        return;
      }

      setError("");
      setResume(file);

    } catch (error) {
        console.error("Error", error);
    }
  };

    const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if(!jobDescription || !jobTitle || !resume) {
        setError("All fields are required!");
        return;
    }

    setLoading(true);
    setError("");

    try {

        const formData = new FormData();
        formData.append("job_title", jobTitle);
        formData.append("job_description", jobDescription);
        formData.append("resume", resume);

        // Generate question endpoint
        const response = await generateQuestionAPI(formData);

        if(!response || !response.session_id) {
            setError("Failed to generate interview questions. Please try again.");
            return;
        }

        // start interview endpoint

        const data = await startInterviewAPI(response.session_id);

        if (!data) {
            setError("Failed to start interview. Please try again.");
            return;
        }

        onClick(data, response.session_id);


    } catch (error) {
        console.error("Error", error);
    } finally {
        setLoading(false)
    }
  };
  return (
    <>
      <div className="start-interview-container">
        <form className="start-interview-form" onSubmit={handleFormSubmit}>
          <h1>AI Interview</h1>

          {error && <p className="error-message" >{error}</p> }

          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              placeholder="Enter Job Title"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea
              placeholder="Enter Job Description"
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Resume (PDF) </label>
            <input
              type="file"
              accept=".pdf"
              required
              onChange={handlefileUpload}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading} >
            {loading ? 'Generating Questions' : 'Start Interview'}
          </button>
        </form>
      </div>
    </>
  );
};

export default StartInterview;
