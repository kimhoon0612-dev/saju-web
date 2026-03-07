"use client";

import React, { Suspense, useEffect, useState } from 'react';
import AgenticChatbot from '@/components/AgenticChatbot';

export default function AiChatPage() {
    const [sajuContext, setSajuContext] = useState<any>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem("saju_matrix");
        if (stored) {
            try {
                setSajuContext(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saju_matrix from session storage", e);
            }
        }
        setIsLoaded(true);
    }, []);

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F5F6F8]">
                <div className="w-8 h-8 rounded-full border-t-[3px] border-r-[3px] border-gray-300 border-solid animate-spin"></div>
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#F5F6F8]">
                <div className="w-8 h-8 rounded-full border-t-[3px] border-r-[3px] border-gray-300 border-solid animate-spin"></div>
            </div>
        }>
            <AgenticChatbot sajuContext={sajuContext} isFullScreen={true} />
        </Suspense>
    );
}
