import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("OPENAI_API_KEY")

if not api_key:
    print("No OPENAI_API_KEY found in .env")
    exit(1)

client = OpenAI(api_key=api_key)

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Test"}],
        max_tokens=5
    )
    print("OpenAI Success:", response.choices[0].message.content)
except Exception as e:
    print("OpenAI Error:", repr(e))
