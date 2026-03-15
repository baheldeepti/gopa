const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function generateStory(value, childName = 'Friend', childPhotoKey = null) {
  const res = await fetch(`${API_URL}/api/story/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      value,
      child_name: childName,
      child_photo_key: childPhotoKey,
      duration: 'short',
    }),
  });
  if (!res.ok) throw new Error(`Story generation failed: ${res.statusText}`);
  return res.json();
}

export async function generateScriptOnly(value, childName = 'Friend') {
  const res = await fetch(`${API_URL}/api/story/generate-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, child_name: childName }),
  });
  if (!res.ok) throw new Error(`Script generation failed: ${res.statusText}`);
  return res.json();
}

export async function getStoryStatus(storyId) {
  const res = await fetch(`${API_URL}/api/story/status/${storyId}`);
  if (!res.ok) throw new Error(`Status check failed: ${res.statusText}`);
  return res.json();
}

export async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/api/upload/photo`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function getLiveKitToken(roomName = 'gopa-story-room', participantName = 'child') {
  const res = await fetch(`${API_URL}/api/voice/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_name: roomName, participant_name: participantName }),
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.statusText}`);
  return res.json();
}
