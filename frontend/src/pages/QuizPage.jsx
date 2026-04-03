import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { formatTime } from "../utils/algorithms";
import { useAuth } from "../context/AuthContext";

const QUESTION_COUNT = 10;

export default function QuizPage() {
  const { topicId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { updateScore } = useAuth();

  const [phase, setPhase] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState(state?.topic || null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const startQuiz = useCallback(async () => {
    setPhase("loading");
    setError("");
    setAnswers([]);
    setCurrent(0);

    try {
      const { data } = await api.post("/quiz/start", {
        topicId,
        count: QUESTION_COUNT,
      });

      setQuestions(data.questions);
      setTopic(data.topic);
      setPhase("ready");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load quiz.");
      setPhase("error");
    }
  }, [topicId]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  useEffect(() => {
    if (phase !== "question" || revealed) return;

    const limit = questions[current]?.timeLimitSeconds || 30;
    setTimeLeft(limit);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, current, revealed]);

  const handleTimeout = () => {
    if (revealed) return;
    clearInterval(timerRef.current);

    setRevealed(true);
    setSelected(null);

    setAnswers((prev) => [
      ...prev,
      {
        questionId: questions[current]._id,
        selectedOption: null,
        timedOut: true,
        timeTakenSeconds: questions[current]?.timeLimitSeconds || 30,
      },
    ]);
  };

  const handleSelect = (optIndex) => {
    if (revealed) return;
    clearInterval(timerRef.current);

    const q = questions[current];
    const timeTaken = (q.timeLimitSeconds || 30) - timeLeft;

    setSelected(optIndex);

    setTimeout(() => {
      setRevealed(true);

      setAnswers((prev) => [
        ...prev,
        {
          questionId: q._id,
          selectedOption: optIndex,
          timedOut: false,
          timeTakenSeconds: timeTaken,
        },
      ]);
    }, 200);
  };

  const handleNext = () => {
    setSelected(null);
    setRevealed(false);

    if (current + 1 >= questions.length) {
      submitQuiz();
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const submitQuiz = async () => {
    setPhase("submitting");

    try {
      const totalTime = Math.round(
        (Date.now() - startTimeRef.current) / 1000
      );

      const { data } = await api.post("/quiz/submit", {
        topicId,
        answers,
        timeTakenSeconds: totalTime,
      });

      updateScore(data.newTotalScore);
      navigate("/results", {
        state: { result: data, topic, questions },
      });
    } catch {
      setError("Failed to submit quiz.");
      setPhase("question");
    }
  };

  if (phase === "loading" || phase === "submitting") {
    return <div className="center">Loading…</div>;
  }

  if (phase === "error") {
    return (
      <div className="card center">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn" onClick={startQuiz}>
          Retry
        </button>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="card center">
        <h1>{topic?.name}</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            startTimeRef.current = Date.now();
            setPhase("question");
          }}
        >
          Start Quiz ⚡
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-progress">
            Question {current + 1} / {questions.length}
          </div>

          <div className="quiz-timer">
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        <h2 style={{ marginBottom: "20px" }}>{q.text}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
        >
          {q.options.map((opt, i) => {
            const isSelected = selected === i;

            const isCorrect =
              revealed && selected !== null && i === q.correctAnswer;

            const isWrong =
              revealed &&
              selected === i &&
              selected !== q.correctAnswer;

            let bg = "var(--bg-3)";
            let border = "var(--border)";
            let color = "var(--text)";

            if (isCorrect) {
              bg = "rgba(34,197,94,0.15)";
              border = "var(--success)";
              color = "var(--success)";
            }

            if (isWrong) {
              bg = "rgba(239,68,68,0.15)";
              border = "var(--error)";
              color = "var(--error)";
            }

            if (!revealed && isSelected) {
              bg = "rgba(99,102,241,0.15)";
              border = "var(--accent)";
              color = "var(--accent)";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={revealed}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: `1px solid ${border}`,
                  background: bg,
                  color,
                  fontSize: "0.95rem",
                  textAlign: "left",
                  cursor: revealed ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
              >
                <span>{["A", "B", "C", "D"][i]}</span>
                <span style={{ flex: 1 }}>{opt}</span>

                {isCorrect && "✅"}
                {isWrong && "❌"}
              </button>
            );
          })}
        </div>

        {revealed && q.explanation && (
          <div className="explanation">
            💡 {q.explanation}
          </div>
        )}

        {revealed && (
          <button
            className="btn btn-primary"
            style={{ marginTop: "20px" }}
            onClick={handleNext}
          >
            {current + 1 >= questions.length
              ? "Submit 🏆"
              : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}