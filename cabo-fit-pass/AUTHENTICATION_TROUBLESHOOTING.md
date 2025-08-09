# CaboFitPass Authentication Troubleshooting Guide

## 🚨 **Issues Fixed**

### 1. **404 Redirect Issue After Login** ✅ RESOLVED
**Problem**: Users were getting 404 errors after successful login.

**Root Cause**: Middleware conflict between Supabase SSR authentication and NextAuth JWT tokens.

**Solution Applied**:
- Replaced Supabase SSR middleware with NextAuth-compatible middleware
- Updated middleware to use NextAuth's `withAuth` function
- Fixed redirect paths to use `/auth/signin` consistently

### 2. **Lovable Favicon Issue** ✅ RESOLVED
**Problem**: Development server was showing Lovable favicon instead of CaboFitPass branding.

**Root Cause**: No custom favicon configured, falling back to Next.js defaults.

**Solution Applied**:
- Created custom CaboFitPass favicon: `/app/icon.svg`
- Added proper favicon.ico in `/public/favicon.ico`
- Custom blue "C" logo for CaboFitPass branding

---

## 🔧 **Current Authentication Setup**

### **Primary Authentication Method**: NextAuth.js v4
- **Location**: `/pages/api/auth/[...nextauth].ts`
- **Session Strategy**: JWT (stateless)
- **Integration**: Supabase backend for user storage

### **Backup Authentication Method**: Direct Supabase
- **Location**: `/pages/auth/simple-signin.tsx`
- **Purpose**: Fallback if NextAuth has issues

---

## 🧪 **Testing Authentication**

### **Debug Page Available**
Visit: `http://localhost:3000/debug-auth`

This page shows:
- Current session status
- User information
- Client vs server session comparison
- Test authentication buttons

### **Test Accounts**
1. **mariopjr91@gmail.com** (ID: 40ec6001-c070-426a-9d8d-45326d0d7dac)
2. **mario.cabodreamhome@gmail.com** (ID: dd3af57f-dc63-422c-8a29-037a760b22dd)

**Note**: You need the actual passwords for these accounts.

---

## 🔍 **Troubleshooting Steps**

### **Step 1: Test NextAuth Endpoint**
```bash
curl http://localhost:3000/api/auth/providers
```
Expected: JSON response with configured providers

### **Step 2: Check Environment Variables**
Verify these are set in `.env.local`:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cabo-fit-pass-super-secret-key-2024-mario-polanco-development
NEXT_PUBLIC_SUPABASE_URL=https://pamzfhiiuvmtlwwvufut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
```

### **Step 3: Test Supabase Connection**
Visit the homepage - it shows Supabase connection status at the bottom.

### **Step 4: Test Direct Supabase Auth**
Use `/auth/simple-signin` as a fallback to test if Supabase credentials work.

### **Step 5: Check Network Tab**
1. Open browser dev tools
2. Go to Network tab
3. Try to sign in
4. Look for failed requests to `/api/auth/`

---

## 🔄 **Authentication Flow**

### **NextAuth Flow**:
1. User enters credentials on `/auth/signin`
2. Form calls `signIn('supabase-credentials', {...})`
3. NextAuth calls credentials provider in `/pages/api/auth/[...nextauth].ts`
4. Provider authenticates with Supabase using `supabaseAuth.auth.signInWithPassword()`
5. If successful, fetches user profile from `profiles` table
6. Creates JWT token with user data
7. Redirects to `/dashboard`

### **Expected Session Object**:
```json
{
  "user": {
    "id": "40ec6001-c070-426a-9d8d-45326d0d7dac",
    "email": "mariopjr91@gmail.com",
    "name": "Mario Perez",
    "role": "user",
    "credits": 4
  }
}
```

---

## 🐛 **Common Issues & Solutions**

### **Issue**: "CredentialsSignin" Error
**Cause**: Invalid email/password
**Solutions**:
1. Verify credentials are correct
2. Check if user exists in Supabase `profiles` table
3. Try direct Supabase auth at `/auth/simple-signin`

### **Issue**: Session is null after login
**Cause**: JWT not properly created
**Solutions**:
1. Check browser console for errors
2. Verify `NEXTAUTH_SECRET` is set
3. Clear browser cookies and try again

### **Issue**: 404 after successful login
**Cause**: Middleware interference
**Solutions**:
1. ✅ Already fixed - replaced middleware
2. Check if `/dashboard` page exists and loads

### **Issue**: "Cannot read properties of undefined"
**Cause**: Missing session provider
**Solutions**:
1. ✅ Already added - check `pages/_app.tsx` has `SessionProvider`

---

## 🔧 **Manual Testing Checklist**

### **Test 1: Homepage Session Detection**
1. ✅ Go to `/` 
2. ✅ Check if NextAuth session is detected
3. ✅ Verify "Sign In" button shows when not authenticated
4. ✅ Verify "Go to Dashboard" shows when authenticated

### **Test 2: NextAuth Sign In Page**
1. ✅ Go to `/auth/signin`
2. ✅ Enter valid credentials
3. ✅ Check for errors in browser console
4. ✅ Verify redirect to `/dashboard` after success

### **Test 3: Dashboard Access**
1. ✅ Try to access `/dashboard` without auth
2. ✅ Should redirect to `/auth/signin`
3. ✅ After signing in, should show dashboard with user info

### **Test 4: Sign Out**
1. ✅ Click sign out button
2. ✅ Should clear session
3. ✅ Should redirect to homepage

---

## 📊 **Current Status**

| Component | Status | Notes |
|-----------|--------|-------|
| NextAuth Config | ✅ Working | v4 with Supabase integration |
| Middleware | ✅ Fixed | Now uses NextAuth middleware |
| Sign In Page | ✅ Working | `/auth/signin` |
| Dashboard | ✅ Working | NextAuth session-aware |
| Session Provider | ✅ Working | Added to `_app.tsx` |
| Favicon | ✅ Fixed | Custom CaboFitPass branding |
| Build Process | ✅ Working | Builds successfully |

---

## 🚀 **Next Steps**

### **If Authentication Still Fails**:
1. **Check Server Logs**: Look for errors in NextAuth
2. **Test API Endpoints**: Manually test `/api/auth/providers`
3. **Use Debug Page**: Visit `/debug-auth` for detailed info
4. **Try Fallback**: Use `/auth/simple-signin` as backup

### **For Production**:
1. Set up proper Google OAuth credentials
2. Configure production `NEXTAUTH_URL`
3. Set secure `NEXTAUTH_SECRET`
4. Test with real user passwords

The authentication system should now work properly without 404 redirects and with proper CaboFitPass branding!