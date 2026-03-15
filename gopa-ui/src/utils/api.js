const API_URL = "https://xky29a0bl1.execute-api.us-east-1.amazonaws.com/Prod";

export const generateStory = async (prompt, value) => {
  const res = await fetch(`${API_URL}/api/story/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, value })
  });
  return res.json();
};

export const generateVoice = async (story) => {
  const res = await fetch(`${API_URL}/api/voice/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ story })
  });
  return res.json();
};

export const getToken = async (room, participant) => {
  const res = await fetch(`${API_URL}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, participant })
  });
  return res.json();
};
