import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const backendURL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [socket, setSocket] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [numbers, setNumbers] = useState(Array(10).fill(0));

  // Socket connection
  useEffect(() => {
    const newSocket = io(backendURL);
    setSocket(newSocket);

    newSocket.on("timerUpdate", (seconds) => {
      setTimeLeft(seconds);
    });

    return () => {
      newSocket.disconnect(); 
    };
  }, []);

  // Input change handler
  const handleChange = (index, value) => {
    const updated = [...numbers];
    updated[index] = Number(value);
    setNumbers(updated);
  };

  const total = numbers.reduce((sum, val) => sum + val, 0);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // Place bet
  const handleProceed = () => {
    if (socket) {
      numbers.forEach((val, index) => {
        if (val > 0) {
          const betnumber = index === 9 ? 0 : index + 1;

          socket.emit("placeBet", {
            amount: val,
            betnumber: betnumber
          });
        }
      });
    }
  };

  // Listen to backend responses
  useEffect(() => {
    if (!socket) return;

    // Bet success
    socket.on("betSuccess", (data) => {
      alert(`${data.message}. Current Balance: ₹${data.balance}`);
    });

    // Bet error
    socket.on("betError", (data) => {
      alert(data.message);
    });

    // Win/Lose result
    socket.on("betResult", (data) => {
      alert(
        `Round ${data.roundid}, Bet Number: ${data.betnumber}\nResult: ${data.result.toUpperCase()}\nCurrent Balance: ₹${data.balance}`
      );
    });

    // Cleanup
    return () => {
      socket.off("betSuccess");
      socket.off("betError");
      socket.off("betResult");
    };
  }, [socket]);

  return (
    <>
      {/* Timer */}
      <div className="header">
        <h1>Time Left: {formatTime(timeLeft)}</h1>
      </div>

      {/* Ander */}
      <div className="ander">
        <h1>Ander</h1>
      </div>

      {/* Numbers input */}
      <div className="container">
        {numbers.map((val, i) => (
          <div className="numbered-box" key={i}>
            <h1>{i === 9 ? 0 : i + 1}</h1>
            <input
              type="number"
              className="number-input"
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Total points */}
      <div className="total-point">
        <h1>Total point: {total}</h1>
      </div>

      {/* Proceed button */}
      <div className="button">
        <button className="button-1" onClick={handleProceed}>
          Proceed
        </button>
      </div>
    </>
  );
}

export default App;
