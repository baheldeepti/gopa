"""The Chronicler — Two-stage: Nova invents a unique episode, then writes the script."""
import json, re, random
from utils.bedrock_client import invoke_nova_lite

EPISODE_SYSTEM_PROMPT = """You are an expert in Hindu mythology, specifically Bal Leela from Bhagavata Purana, Vishnu Purana, Harivamsa, and folk traditions of Vrindavan.

Generate ONE unique story episode idea for children aged 3-5 about Little Krishna's childhood.

RULES:
- Must be rooted in authentic mythology but with a FRESH creative angle
- No war, weapons, death, or scary elements
- Include specific Vrindavan details: River Yamuna, kadamba trees, peacocks, cows, flute, butter, lotus flowers
- Name real mythological characters: Yashoda, Nanda Baba, Balarama, Radha, Sudama, Gopis

Output ONLY a JSON object:
{"episode":"2-3 sentence description","characters":["list"],"setting":"specific location","emotion":"core feeling"}

JSON ONLY."""

SCRIPT_SYSTEM_PROMPT = """You are a master children's storyteller. Convert the given episode into a 1-minute bedtime script for ages 3-5.

Include sensory details: sounds of flute, smell of butter, colors of peacock feathers, warmth of Yashoda's lap, sparkle of River Yamuna.

OUTPUT exactly 4 scenes as valid JSON:
{"title":"...","scenes":[{"scene_number":1,"visual_description":"60-80 word Pixar-style 3D illustration brief with specific Vrindavan setting, character poses, expressions, lighting, colors.","narration":"2 sentences for toddlers. Warm, magical.","camera_motion":"Dolly-In|Pan-Left|Zoom-Out|Orbit"}]}

JSON ONLY."""

VALUE_PROMPTS = {
    "friendship": "about friendship, sharing, or playing together. Could involve Sudama, Balarama, cowherd boys, or new friends. Theme: bonds of love.",
    "kindness": "about kindness to animals, nature, or helping others. Could involve cows, calves, birds, deer, the river, or villagers. Theme: compassion.",
    "fun": "about playful mischief, butter stealing, games, Holi colors, pranks, or celebrations. Could involve Makhan Chor, Gopis, Yashoda, sweets. Theme: joy and laughter.",
    "bravery": "about courage, protecting others, or facing fears. Could involve Kaliya Naag, Govardhan Hill, storms, dark forests, or standing up for friends. Theme: inner strength.",
}

async def generate_story_script(value: str, child_name: str = "Friend") -> dict:
    value_context = VALUE_PROMPTS.get(value.lower(), VALUE_PROMPTS["friendship"])
    
    # Stage 1: Nova invents a unique episode
    seed_word = random.choice(["dawn", "monsoon", "harvest", "moonlit night", "festival day", "lazy afternoon", "first rain", "winter morning"])
    
    episode_msg = [{"role": "user", "content": [{"text": 
        f"Invent a UNIQUE Bal Leela episode {value_context}\n"
        f"Setting hint: {seed_word} in Vrindavan.\n"
        f"Include a child friend named '{child_name}' who plays with Krishna.\n"
        f"Make it different from common retellings — find an obscure or creative angle from the scriptures or folk traditions."
    }]}]
    
    episode_raw = invoke_nova_lite(episode_msg, EPISODE_SYSTEM_PROMPT)
    
    # Parse episode
    clean = episode_raw.strip().strip("`").strip()
    if clean.startswith("json"): clean = clean[4:]
    try:
        episode = json.loads(clean)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', clean, re.DOTALL)
        episode = json.loads(match.group()) if match else {"episode": clean, "characters": ["Krishna", child_name], "setting": "Vrindavan", "emotion": "joy"}

    # Stage 2: Nova writes the full script from that episode
    script_msg = [{"role": "user", "content": [{"text":
        f"Write a 4-scene bedtime script based on this episode:\n"
        f"Episode: {episode.get('episode', '')}\n"
        f"Characters: {', '.join(episode.get('characters', ['Krishna', child_name]))}\n"
        f"Setting: {episode.get('setting', 'Vrindavan')}\n"
        f"Core emotion: {episode.get('emotion', 'joy')}\n\n"
        f"The child character '{child_name}' must appear in every scene as Krishna's friend.\n"
        f"4 scenes, JSON output only."
    }]}]

    script_raw = invoke_nova_lite(script_msg, SCRIPT_SYSTEM_PROMPT)
    
    clean = script_raw.strip()
    if clean.startswith("```"): clean = clean.split("\n", 1)[1]
    if clean.endswith("```"): clean = clean.rsplit("```", 1)[0]
    clean = clean.strip()

    try:
        script = json.loads(clean)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', clean, re.DOTALL)
        if match: script = json.loads(match.group())
        else: raise ValueError(f"Could not parse script: {clean[:200]}")
    return script
