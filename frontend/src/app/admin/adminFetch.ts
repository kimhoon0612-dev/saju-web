export const adminFetch = async (url: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('x-admin-token', token);
    }
    
    const res = await fetch(url, { ...options, headers });
    
    // If unauthorized, clear token to force re-login
    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            // We dispatch a custom event to tell the page to show the login screen
            window.dispatchEvent(new Event('adminAuthFailed'));
        }
    }
    
    return res;
};
