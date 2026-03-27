import os
import json
import re
from pathlib import Path
from groq import Groq
from openai import OpenAI
try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None
from dotenv import load_dotenv

# Always load .env from the project root
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

def ask_llm(prompt, agent_type="analysis", model=None):
    """
    Router layer that selects the best model for the agent role.
    Fallback logic ensures the system works even if keys are missing.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    # Selection Logic based on Strategy
    # research -> groq (llama-3.3-70b) or openai
    # analysis -> openai (gpt-4o) or groq
    # critic   -> anthropic (claude-3-5-sonnet) or openai or groq
    
    selected_provider = "groq"
    selected_model = "llama-3.3-70b-versatile"

    if model: # Manual override (e.g. for Debate)
        if "gpt-4" in model.lower() and openai_key:
            selected_provider = "openai"
            selected_model = model
        elif "claude" in model.lower() and anthropic_key:
            selected_provider = "anthropic"
            selected_model = model
        else:
            selected_provider = "groq"
            selected_model = "llama-3.3-70b-versatile"
    else:
        if agent_type == "research":
            # Perplexity/Grok would go here; using Llama-3.3-70b as strong web-aware fallback
            selected_provider = "groq"
            selected_model = "llama-3.3-70b-versatile"
        elif agent_type == "critic":
            if anthropic_key and Anthropic:
                selected_provider = "anthropic"
                selected_model = "claude-3-5-sonnet-20241022"
            elif openai_key:
                selected_provider = "openai"
                selected_model = "gpt-4o"
        elif agent_type in ["analysis", "shark_tank", "simulation"]:
            if openai_key:
                selected_provider = "openai"
                selected_model = "gpt-4o"
            else:
                selected_provider = "groq"
                selected_model = "llama-3.3-70b-versatile"

    # Execution
    try:
        if selected_provider == "openai" and openai_key:
            client = OpenAI(api_key=openai_key)
            resp = client.chat.completions.create(
                model=selected_model,
                messages=[{"role": "user", "content": prompt}]
            )
            return resp.choices[0].message.content
        
        elif selected_provider == "anthropic" and anthropic_key and Anthropic:
            client = Anthropic(api_key=anthropic_key)
            resp = client.messages.create(
                model=selected_model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}]
            )
            return resp.content[0].text
        
        else: # Default to Groq
            client = Groq(api_key=groq_key)
            resp = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )
            return resp.choices[0].message.content
    except Exception as e:
        print(f"Error with {selected_provider}: {e}. Falling back to Groq...")
        client = Groq(api_key=groq_key)
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        return resp.choices[0].message.content

def safe_json_parse(response):
    """Strip markdown code fences and parse JSON safely."""
    cleaned = re.sub(r"^```(?:json)?\s*", "", response.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
    try:
        return json.loads(cleaned.strip())
    except Exception:
        return {"error": "Invalid JSON from LLM", "raw": response}