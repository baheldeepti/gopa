# 🪈 GOPA — Bal Krishna Story Generator

**AI-powered personalized children's stories featuring Little Krishna**

Built for the **Amazon Nova AI Hackathon 2026** | Powered by Amazon Bedrock + LiveKit

---

## 🌟 What is GOPA?

GOPA creates personalized animated bedtime stories about Bal Krishna for children aged 3-5. Parents select a value (Friendship, Kindness, Fun, Bravery), optionally upload their child's photo, and GOPA generates a unique 1-minute animated story using Amazon Nova's multi-agent pipeline.

### Core Features
- **Value-Based Stories**: Choose from Friendship, Kindness, Fun, or Bravery themes
- **"Me in the Story"**: Upload a child's photo to create a 3D character that plays with Krishna
- **Voice AI Narrator**: LiveKit + Nova Sonic powers an interactive voice narrator
- **Bedtime Mode**: Dark amber UI with lower volume for nighttime viewing
- **Language Bridge**: English + Hindi/Gujarati toggle for immigrant families

### Architecture (3-Agent Pipeline)
1. **The Chronicler** (Nova 2 Lite) — Writes a 4-scene script based on selected value
2. **The Visionary** (Nova Canvas) — Generates Pixar-style illustrations for each scene
3. **The Animator** (Nova Reel) — Creates 60-second animated video from images

---

## 📁 Project Structure

```
deepti.bahel/project/gopa/
├── README.md                  ← You are here
├── gopa-env/                  ← Backend (FastAPI + Bedrock + LiveKit)
│   ├── .env.example           ← Environment variables template
│   ├── requirements.txt       ← Python dependencies
│   ├── main.py                ← FastAPI application entry point
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── chronicler.py      ← Story script generator (Nova 2 Lite)
│   │   ├── visionary.py       ← Image generator (Nova Canvas)
│   │   └── animator.py        ← Video generator (Nova Reel)
│   ├── livekit_agent/
│   │   ├── __init__.py
│   │   └── narrator.py        ← LiveKit + Nova Sonic voice narrator
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── story.py           ← Story generation endpoints
│   │   ├── voice.py           ← LiveKit token endpoint
│   │   └── upload.py          ← Photo upload endpoint
│   └── utils/
│       ├── __init__.py
│       ├── bedrock_client.py  ← Shared Bedrock client
│       └── s3_utils.py        ← S3 upload/download helpers
│
├── gopa-ui/                   ← Frontend (React + Vite)
│   ├── .env.example           ← Frontend env variables
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   └── krishna-hero.png
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── styles/
│       │   └── globals.css
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── ValueCard.jsx
│       │   ├── PhotoUpload.jsx
│       │   ├── StoryPlayer.jsx
│       │   ├── LoadingState.jsx
│       │   ├── BedtimeToggle.jsx
│       │   └── VoiceNarrator.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── SelectValuePage.jsx
│       │   ├── UploadPhotoPage.jsx
│       │   └── StoryViewPage.jsx
│       ├── hooks/
│       │   └── useStoryGeneration.js
│       └── utils/
│           └── api.js
│
└── .gitignore
```

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+ 
- Node.js 18+
- AWS account with Bedrock access (Nova models enabled)
- LiveKit Cloud account (free tier) OR local LiveKit server

### Step 1: Clone & Configure Backend

```bash
cd deepti.bahel/project/gopa/gopa-env

# Create virtual environment
python -m venv venv
source venv/bin/activate    # macOS/Linux
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and edit env file
cp .env.example .env
# Edit .env with your AWS credentials, LiveKit keys, etc.
```

### Step 2: Configure Frontend

```bash
cd ../gopa-ui

# Install dependencies
npm install

# Copy and edit env file
cp .env.example .env
# Edit .env with your backend URL
```

### Step 3: Start LiveKit Server (Local Dev)

```bash
# Option A: Install locally
brew install livekit          # macOS
# Or download from https://github.com/livekit/livekit/releases

# Run in dev mode
livekit-server --dev

# Option B: Use LiveKit Cloud (recommended)
# Sign up at https://cloud.livekit.io — no local server needed
```

### Step 4: Start the LiveKit Voice Agent

```bash
cd gopa-env
source venv/bin/activate
python -m livekit_agent.narrator
```

### Step 5: Run Backend

```bash
cd gopa-env
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Step 6: Run Frontend

```bash
cd gopa-ui
npm run dev
# Opens at http://localhost:5173
```

---

## 🔑 AWS Setup Checklist

1. **Enable Nova Models in Bedrock Console:**
   - Go to Amazon Bedrock → Model Access → Request access for:
     - `amazon.nova-lite-v1:0` (or `us.amazon.nova-lite-v1:0`)
     - `amazon.nova-canvas-v1:0`
     - `amazon.nova-reel-v1:0`
     - `amazon.nova-2-sonic-v1:0`
   - Region: `us-east-1`

2. **Create S3 Bucket** for video output:
   - Bucket name: `gopa-stories-<your-account-id>`
   - Region: `us-east-1`
   - Enable CORS for frontend access

3. **IAM Permissions** — attach to your user/role:
   - `AmazonBedrockFullAccess`
   - `AmazonS3FullAccess` (or scoped to your bucket)

---

## 🏗️ AWS Deployment (Optional)

For hosting on AWS:

```bash
# Backend: Deploy as ECS Fargate or Lambda + API Gateway
# Frontend: Deploy to S3 + CloudFront

# Quick option — deploy frontend to S3:
cd gopa-ui
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
```

---

## 📹 Demo Video Tips (for Devpost)

1. Show the value selection flow
2. Demo photo upload + personalization
3. Show the story being generated (loading state)
4. Play the final animated story
5. Toggle bedtime mode
6. Demo voice narrator (LiveKit + Nova Sonic)

---

## 🏷️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Story Gen | Amazon Nova 2 Lite (Bedrock) |
| Image Gen | Amazon Nova Canvas (Bedrock) |
| Video Gen | Amazon Nova Reel (Bedrock) |
| Voice AI | Amazon Nova 2 Sonic + LiveKit |
| Backend | Python FastAPI |
| Frontend | React + Vite |
| Storage | Amazon S3 |
| Hosting | AWS (ECS / S3 + CloudFront) |

---

## 📄 License

Built for Amazon Nova AI Hackathon 2026. MIT License.
