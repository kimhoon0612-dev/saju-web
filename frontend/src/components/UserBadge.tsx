"use client";
import React, { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function UserBadge({ onClick }: { onClick?: () => void }) {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const storedInfo = sessionStorage.getItem("saju_user_info");
        const storedMatrix = sessionStorage.getItem("saju_matrix");
        
        let name = "";
        if (storedMatrix) {
            try {
                const parsed = JSON.parse(storedMatrix);
                if (parsed.user_name) name = parsed.user_name;
            } catch (e) {}
        }
        
        if (!name && storedInfo) {
            try {
                const parsedInfo = JSON.parse(storedInfo);
                if (parsedInfo.name) name = parsedInfo.name;
            } catch(e) {}
        }
        
        setUserName(name);
    }, []);

    return (
        <div onClick={onClick} className="flex items-center gap-1.5 text-[13px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors border border-gray-100 shadow-sm cursor-pointer whitespace-nowrap">
            <User size={14} className="text-gray-400" />
            <span>{userName ? `${userName}님` : "방문자님"}</span>
        </div>
    );
}
