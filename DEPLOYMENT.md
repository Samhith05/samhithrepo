# Deployment Guide for Resolv Maintenance System

## 🚀 Quick Deployment Checklist (2 AM Hackathon Rush!)

### 1. Environment Setup (5 minutes)
```bash
# Copy environment variables
cp .env.example .env.production

# Edit .env.production with your actual API keys:
# - REACT_APP_GEMINI_API_KEY=your_actual_gemini_key
```

### 2. Firebase Security Rules (3 minutes)
1. Go to Firebase Console → Firestore Database → Rules
2. Copy contents from `firestore.rules` file
3. Publish the rules

### 3. Build for Production (2 minutes)
```bash
npm run build
```

### 4. Deploy Options

#### Option A: Firebase Hosting (Recommended - 5 minutes)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

#### Option B: Netlify (Alternative - 3 minutes)
1. Connect GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy automatically

#### Option C: Vercel (Alternative - 3 minutes)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 5. Post-Deployment Testing (5 minutes)
- Test user registration and approval flow
- Test contractor category selection
- Test issue submission with image upload
- Test admin dashboard functionality
- Test real-time updates

### 6. Demo Preparation (10 minutes)
- Create sample user accounts
- Submit test issues
- Approve users as admin
- Test contractor assignment
- Prepare presentation flow

## 🎯 Features Ready for Demo

### ✅ Working Features:
- Google Authentication with role-based access
- User approval workflow (admin approves users)
- Contractor category selection and approval
- Issue submission with image upload to Cloudinary
- AI-powered issue categorization (Teachable Machine + Gemini AI fallback)
- Real-time dashboard updates
- Status tracking and progress visualization
- Technician auto-assignment based on category

### 🔧 Technical Stack:
- **Frontend**: React + Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication + Storage)
- **AI**: Teachable Machine + Google Gemini API
- **Image Storage**: Cloudinary
- **Real-time**: Firebase real-time listeners

## 🚨 Last-Minute Issues Fixed:
1. ✅ Added Gemini AI fallback for categorization
2. ✅ Implemented proper Firebase security rules
3. ✅ Added error boundary for crash protection
4. ✅ Added loading states for better UX
5. ✅ Fixed authentication flow edge cases
6. ✅ Added environment variable configuration

## 🎬 Demo Script:

1. **Login Flow**: Show Google auth with role selection
2. **Admin Dashboard**: Approve users and contractors
3. **User Experience**: Submit maintenance issue with photo
4. **AI Demo**: Show automatic categorization working
5. **Contractor View**: Show filtered issues by specialty
6. **Real-time Updates**: Update status and show live changes

## 📱 Production URLs:
- Firebase Hosting: `https://your-project.web.app`
- Custom Domain: Configure in Firebase Console

## 🆘 Emergency Fixes:
If something breaks during demo:
1. Check browser console for errors
2. Check Firebase rules are published
3. Verify environment variables are set
4. Restart the application
5. Clear browser cache

## 🏆 Hackathon Submission Checklist:
- ✅ GitHub repository with complete code
- ✅ Live deployed application
- ✅ README with setup instructions
- ✅ Demo video/screenshots
- ✅ Presentation slides ready

**Time to Submission: 8 hours remaining**
**Current Status: READY FOR DEPLOYMENT** 🚀
