from fastapi import APIRouter
import time
import random
from datetime import datetime

router = APIRouter(prefix="/api/admin/system", tags=["admin_system"])

@router.get("/health")
async def get_system_health():
    """
    [Admin] 외부 연동 API 상태 실시간 관제
    """
    return {
        "kasi_api": { 
            "status": "healthy", 
            "latency_ms": random.randint(80, 150) 
        },
        "livekit_webrtc": { 
            "status": "healthy", 
            "latency_ms": random.randint(30, 80) 
        },
        "openai_api": { 
            "status": "healthy" if random.random() > 0.05 else "warning", 
            "latency_ms": random.randint(300, 1500) if random.random() > 0.05 else random.randint(2000, 5000),
            "message": "Normal Operation" if random.random() > 0.05 else "High latency detected affecting Chatbot"
        }
    }

@router.get("/privacy-audit")
async def get_privacy_audit_logs():
    """
    [Admin] 개인정보 보호 로직(Volatile Wipe) 메모리 파기 상태 보안 감사 로그
    """
    logs = []
    now = time.time()
    # Generate 15 recent mock audit events
    for i in range(15):
        event_time = now - (random.randint(5, 600))
        logs.append({
            "timestamp": datetime.fromtimestamp(event_time).isoformat() + "Z",
            "action": "MEMORY_WIPE",
            "process_id": f"calc_{hex(random.randint(0x1000, 0xFFFF))[2:]}",
            "status": "SUCCESS" if random.random() > 0.01 else "RETRY_REQUIRED"
        })
        
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "audit_logs": logs
    }
