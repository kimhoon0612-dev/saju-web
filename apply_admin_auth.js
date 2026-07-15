const fs = require('fs');
const path = require('path');

const pageFilePath = path.join(__dirname, 'frontend/src/app/admin/page.tsx');
const expertsFilePath = path.join(__dirname, 'frontend/src/app/admin/experts/ExpertsManager.tsx');

function replaceFetchCalls(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if not present
    if (!content.includes('import { adminFetch }')) {
        let importStr = "import { adminFetch } from './adminFetch';";
        if (filePath.includes('ExpertsManager')) {
            importStr = "import { adminFetch } from '../adminFetch';";
        }
        content = content.replace(
            "import React, { useState, useEffect } from 'react';",
            `import React, { useState, useEffect } from 'react';\n${importStr}`
        );
    }
    
    // Replace fetch calls
    content = content.replace(/fetch\(\s*['"`]\/api\/admin/g, function(match) {
        return "adminFetch(" + match.substring(6);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
}

replaceFetchCalls(pageFilePath);
replaceFetchCalls(expertsFilePath);

// Inject Login Screen into page.tsx
let pageContent = fs.readFileSync(pageFilePath, 'utf8');

if (!pageContent.includes('const [isAuthenticated, setIsAuthenticated]')) {
    const injection = `
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminTokenInput, setAdminTokenInput] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) setIsAuthenticated(true);
        
        const handleAuthFail = () => setIsAuthenticated(false);
        window.addEventListener('adminAuthFailed', handleAuthFail);
        return () => window.removeEventListener('adminAuthFailed', handleAuthFail);
    }, []);

    const handleLogin = () => {
        localStorage.setItem('adminToken', adminTokenInput);
        setIsAuthenticated(true);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full space-y-6">
                    <div className="text-center space-y-2">
                        <ShieldAlert className="w-12 h-12 text-[#FF9100] mx-auto" />
                        <h1 className="text-xl font-bold text-[#2D3748]">관리자 인증</h1>
                        <p className="text-sm text-gray-500">보안을 위해 비밀번호 토큰을 입력해주세요.</p>
                    </div>
                    <div className="space-y-4">
                        <input 
                            type="password"
                            placeholder="Admin Token Password"
                            value={adminTokenInput}
                            onChange={(e) => setAdminTokenInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9100]/20 focus:border-[#FF9100]"
                        />
                        <button 
                            onClick={handleLogin}
                            className="w-full bg-[#2D3748] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#FF9100] transition-colors"
                        >
                            로그인
                        </button>
                    </div>
                </div>
            </div>
        );
    }
`;
    // Insert after export default function AdminDashboard() {
    pageContent = pageContent.replace(
        "export default function AdminDashboard() {", 
        "export default function AdminDashboard() {" + injection
    );
    fs.writeFileSync(pageFilePath, pageContent, 'utf8');
}

console.log("Successfully patched fetch calls and injected Admin Login UI!");
