import os
import google.generativeai as genai

def transcribe_audio_gemini(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """
    Transcribes audio using Gemini 1.5 Flash.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("WARNING: GEMINI_API_KEY is not set.")
        return "GEMINI_API_KEY가 설정되지 않아 시스템(Mock) 응답으로 대체합니다. 테스트용 음성입니다."
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    try:
        # Pass the bytes directly as inline data
        response = model.generate_content([
            "사용자의 한국어 음성을 정확한 텍스트로 변환(전사)해 줘. 부가 설명 없이 변환된 텍스트만 출력해.",
            {"mime_type": mime_type, "data": audio_bytes}
        ])
        return response.text.strip()
    except Exception as e:
        print(f"Gemini STT Error: {e}")
        return "음성 인식 중 우주 파동 통신에 오류가 발생했습니다."
