"""
GOPA Voice Narrator — LiveKit + Amazon Nova Sonic
Runs as a standalone LiveKit agent that narrates stories in real-time.

Usage: python -m livekit_agent.narrator
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from livekit import agents
from livekit.agents import Agent, AgentSession, RoomInputOptions
from livekit.plugins import aws


NARRATOR_INSTRUCTIONS = """You are "Gopa", a warm, magical storyteller for children aged 3-5.
You narrate Bal Krishna stories in a gentle, animated voice — like a loving grandparent.

RULES:
- Speak slowly and clearly for young children.
- Use simple words. No complex sentences.
- Add sound effects with your voice: "Whoooosh!" "Moo moo!" "La la la!"
- Be warm, encouraging, and full of wonder.
- If the child says something, respond playfully and kindly.
- You can ask simple questions: "Can you say Krishna? Krish-na!"
- Keep responses short — 2-3 sentences max per turn.
- If asked about scary things, redirect to something happy and fun.
- You love talking about: butter, flutes, cows, peacock feathers, friendship.

You are currently narrating a Bal Krishna story. The child is your audience.
When you start, greet the child warmly and begin the story."""


class GopaNarrator(Agent):
    """LiveKit Agent that narrates Krishna stories using Nova Sonic."""

    def __init__(self):
        super().__init__(instructions=NARRATOR_INSTRUCTIONS)

    async def on_enter(self):
        """Called when the agent joins a room. Greet the child."""
        # Get story context from room metadata if available
        metadata = self.session.room.metadata if self.session.room else ""
        greeting = "Greet the child warmly and start telling a short Bal Krishna story about friendship."

        if metadata:
            greeting = f"Greet the child and narrate this story: {metadata}"

        await self.session.generate_reply(instructions=greeting)


def run_narrator():
    """Entry point for the LiveKit agent."""
    server = agents.AgentServer()

    @server.rtc_session()
    async def entrypoint(ctx: agents.JobContext):
        await ctx.connect()

        session = AgentSession(
            llm=aws.realtime.RealtimeModel.with_nova_sonic_2(
                voice="tiffany",
                region="us-east-1",
                turn_detection="MEDIUM",
            ),
        )

        await session.start(
            agent=GopaNarrator(),
            room=ctx.room,
            room_input_options=RoomInputOptions(),
        )

    server.run()


if __name__ == "__main__":
    run_narrator()
