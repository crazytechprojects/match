import { useState } from "react";
import { BACKEND_API_ENDPOINT } from "./constants";

function App() {
  const [name, setName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGreet = async () => {
    if (!name.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_API_ENDPOINT}/jobs/greet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      const data = await response.json();
      setResult(data.name);
    } catch (err) {
      setError(`Failed to reach the backend: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Greeting App</h1>
      <div className="form">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGreet()}
        />
        <button onClick={handleGreet} disabled={loading || !name.trim()}>
          {loading ? "Loading..." : "Greet"}
        </button>
      </div>
      {result && <div className="message success">{result}</div>}
      {error && <div className="message error">{error}</div>}
    </div>
  );
}

export default App;
