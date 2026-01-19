// config.js - ไฟล์ตั้งค่ากลางของระบบ
// รวม Supabase Client และ Auth Logic ไว้ที่นี่ที่เดียว

const SUPABASE_URL = 'https://nmezqexpvhdozpdzxxek.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZXpxZXhwdmhkb3pwZHp4eGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTAwNTEsImV4cCI6MjA4MjU2NjA1MX0.N1OjCh1sp0xx0DGFjR6yX2hix5oIX7suzrnvQk8qPWU';

// 1. Initialize Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Auth Helper Functions
const Auth = {
    // ตรวจสอบว่ามี Session หรือไม่ และ Role ถูกต้องไหม
    requireRole: (allowedRoles = []) => {
        const session = localStorage.getItem('cmms_user_session');
        if (!session) {
            window.location.href = 'index.html';
            return null;
        }
        
        const user = JSON.parse(session);
        
        // ถ้า allowedRoles เป็นว่าง [] แปลว่าอนุญาตทุกคนที่มี session
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Role: ' + user.role + ')');
            window.location.href = 'index.html';
            return null;
        }
        
        return user;
    },

    // ออกจากระบบ
    logout: () => {
        if(confirm('ยืนยันออกจากระบบ?')) {
            localStorage.removeItem('cmms_user_session');
            window.location.href = 'index.html';
        }
    },

    // ดึงข้อมูล User ปัจจุบัน
    getUser: () => {
        const session = localStorage.getItem('cmms_user_session');
        return session ? JSON.parse(session) : null;
    }
};

// 3. Utility Functions (Format วันที่, ฯลฯ)
const Utils = {
    formatDate: (dateString) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    },
    
    safeRedirect: (url) => {
        try { window.location.href = url; } catch(e) { console.error(e); }
    }
};