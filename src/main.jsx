import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm VisionChat AI. Upload an image and ask me anything about it."
    }
  ]);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const pickImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("Please choose an image smaller than 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage({
      name: file.name,
      mimeType: file.type,
      dataUrl: reader.result
    });
    reader.readAsDataURL(file);
  };

  const send = async () => {
    const text = prompt.trim();
    if (!text && !image) return;

    const userMessage = {
      role: "user",
      text: text || "Analyze this image.",
      image: image?.dataUrl || null
    };
    setMessages((m) => [...m, userMessage]);
    setPrompt("");
    setBusy(true);

    try {
      const payload = {
        prompt: text || "Describe this image in detail and identify the important objects, text, colors, and context.",
        image: image ? {
          data: image.dataUrl.split(",")[1],
          mimeType: image.mimeType
        } : null
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");

      setMessages((m) => [...m, { role: "assistant", text: data.text }]);
      setImage(null);
    } catch (err) {
      setMessages((m) => [...m, {
        role: "assistant",
        text: "Sorry, I couldn't process that request. " + err.message
      }]);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <main className="app">
      <section className="shell">
        <header className="header">
          <div className="brand">
            <div className="logo">V</div>
            <div>
              <h1>VisionChat AI</h1>
              <p>Ask questions. Understand images.</p>
            </div>
          </div>
          <span className="status"><i /> AI Online</span>
        </header>

        <div className="chat">
          {messages.map((m, i) => (
            <div className={`row ${m.role}`} key={i}>
              <div className="avatar">{m.role === "assistant" ? "V" : "You"}</div>
              <div className="bubble">
                {m.image && <img className="chat-image" src={m.image} alt="Uploaded" />}
                <div>{m.text}</div>
              </div>
            </div>
          ))}
          {busy && (
            <div className="row assistant">
              <div className="avatar">V</div>
              <div className="bubble typing"><span /> <span /> <span /></div>
            </div>
          )}
        </div>

        <div className="composer">
          {image && (
            <div className="preview">
              <img src={image.dataUrl} alt="Preview" />
              <div>
                <strong>{image.name}</strong>
                <button onClick={() => setImage(null)}>Remove</button>
              </div>
            </div>
          )}

          <div className="input-row">
            <button className="icon-btn" title="Upload image" onClick={() => fileRef.current?.click()}>＋</button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => pickImage(e.target.files?.[0])}
            />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask something about your image..."
              rows="1"
            />
            <button className="send" onClick={send} disabled={busy || (!prompt.trim() && !image)}>
              {busy ? "..." : "Send"}
            </button>
          </div>
          <p className="hint">VisionChat AI can analyze objects, scenes, text, colors and more.</p>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
