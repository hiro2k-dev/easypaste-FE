import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [code, setCode] = useState("");
  const [retrieved, setRetrieved] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const publish = async () => {
    const payload = image
      ? { type: "image", content: image }
      : { type: "text", content: text };
    const res = await axios.post(`${API_URL}/api/publish`, payload);
    setCode(res.data.code);
  };

  const retrieve = async () => {
    const res = await axios.get(`${API_URL}/api/get/${code}`);
    setRetrieved(res.data);
  };

  const handleCopy = () => {
    if (!retrieved) return;
    if (retrieved.type === "text") {
      navigator.clipboard.writeText(retrieved.content);
    } else if (retrieved.type === "image") {
      fetch(retrieved.content)
        .then(res => res.blob())
        .then(blob => {
          const data = [new ClipboardItem({ [blob.type]: blob })];
          navigator.clipboard.write(data);
        });
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Easy Paster</h1>

      <textarea
        placeholder="Paste text here..."
        rows={5}
        className="w-full border p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <input type="file" accept="image/*" onChange={handleImageUpload} />

      <button onClick={publish} className="bg-blue-500 text-white px-4 py-2">Publish</button>

      {code && <p>Share this code: <strong>{code}</strong></p>}

      <hr />

      <input
        placeholder="Enter 6-digit code"
        className="border p-2 w-full"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={retrieve} className="bg-green-500 text-white px-4 py-2">Retrieve</button>

      {retrieved && (
        <div className="mt-4 border p-4 space-y-2">
          {retrieved.type === "text" ? (
            <pre className="whitespace-pre-wrap">{retrieved.content}</pre>
          ) : (
            <img src={retrieved.content} alt="pasted" className="max-w-full" />
          )}
          <button onClick={handleCopy} className="bg-gray-600 text-white px-4 py-2 rounded">
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
