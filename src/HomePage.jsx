import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const createSession = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    navigate(`/${code}`);
  };

  return (
    <div className="p-4 text-center space-y-4">
      <h1 className="text-xl font-bold">Easy Paster</h1>
      <button
        onClick={createSession}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        New session
      </button>
    </div>
  );
}
