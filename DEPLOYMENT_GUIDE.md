# 🚀 Deployment Guide - AI Personal Trainer

## Prerequisites

- Node.js v18+ installed
- MongoDB Atlas account (or local MongoDB)
- Redis instance (or Redis Cloud)
- Git installed
- Domain name (for production)

---

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/Rishikeshh19/AI---Based-Personal-Trainer.git
cd AI---Based-Personal-Trainer
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## 📝 Environment Variables

Create `.env` file in `backend/` directory:

```env
# Server Configuration
NODE_ENV=production
PORT=8000

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Redis (Optional - for session management)
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Secret
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
EMAIL_FROM_NAME=AI Personal Trainer

# Frontend URL
FRONTEND_URL=https://your-production-domain.com

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
SAMBANOVA_API_KEY=your_sambanova_api_key

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://your-production-domain.com,https://www.your-production-domain.com
```

---

## 🌐 Deployment Options

### Option 1: Render (Recommended)

#### Backend Deployment

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ai-trainer-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Instance Type**: Free or Starter
5. Add Environment Variables (all from .env)
6. Click "Create Web Service"
7. Note your backend URL (e.g., `https://ai-trainer-backend.onrender.com`)

#### Frontend Deployment

1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:
   - **Name**: `ai-trainer-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add Environment Variable:
   - `VITE_API_URL`: Your backend URL
5. Click "Create Static Site"

#### Update CORS

After deployment, update backend `.env`:

```env
FRONTEND_URL=https://your-frontend-url.onrender.com
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

Redeploy backend for changes to take effect.

---

### Option 2: Vercel (Frontend) + Render (Backend)

#### Backend on Render

Same as Option 1 backend deployment.

#### Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL
6. Click "Deploy"

---

### Option 3: Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will detect services:
   - Backend (Node.js)
   - Frontend (Vite)
5. Add environment variables
6. Click "Deploy"

---

### Option 4: Heroku

#### Backend

```bash
cd backend
heroku create ai-trainer-backend
heroku addons:create mongolab:sandbox
heroku addons:create heroku-redis:hobby-dev
heroku config:set JWT_SECRET=your_secret
heroku config:set GEMINI_API_KEY=your_key
git push heroku main
```

#### Frontend

```bash
cd frontend
heroku create ai-trainer-frontend
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static
# Create static.json for Heroku
echo '{"root": "dist/", "clean_urls": true, "routes": {"/**": "index.html"}}' > static.json
git push heroku main
```

---

### Option 5: DigitalOcean App Platform

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect GitHub repository
4. DigitalOcean auto-detects:
   - Backend (Node.js)
   - Frontend (Static Site)
5. Configure resources and environment variables
6. Click "Launch App"

---

### Option 6: AWS (EC2 + S3)

#### Backend on EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone https://github.com/Rishikeshh19/AI---Based-Personal-Trainer.git
cd AI---Based-Personal-Trainer/backend
npm install

# Create .env file
nano .env
# (Add all environment variables)

# Start with PM2
pm2 start server.js --name "ai-trainer-backend"
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/ai-trainer
```

Nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ai-trainer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Frontend on S3

```bash
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Configure CloudFront for HTTPS
```

---

## 🗄️ Database Setup

### MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Add to `.env`: `MONGODB_URI=mongodb+srv://...`

### Redis Cloud (Optional)

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create free database
3. Get connection details
4. Add to `.env`:
   ```env
   REDIS_HOST=redis-xxxxx.redis.cloud.com
   REDIS_PORT=xxxxx
   REDIS_PASSWORD=your_password
   ```

---

## 📧 Email Configuration (Gmail)

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Generate new app password
4. Add to `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=generated_app_password
   ```

---

## 🔑 API Keys

### Google Gemini AI

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env`: `GEMINI_API_KEY=your_key`

### SambaNova AI

1. Go to [SambaNova Cloud](https://sambanova.ai/)
2. Sign up and get API key
3. Add to `.env`: `SAMBANOVA_API_KEY=your_key`

---

## ✅ Post-Deployment Checklist

### Backend

- [ ] Environment variables set correctly
- [ ] MongoDB connection working
- [ ] Redis connection working (if used)
- [ ] CORS configured with frontend URL
- [ ] Email sending working
- [ ] AI APIs responding
- [ ] Socket.IO connections working
- [ ] HTTPS enabled (production)

### Frontend

- [ ] API URL pointing to backend
- [ ] HTTPS enabled (production)
- [ ] All pages loading correctly
- [ ] Authentication working
- [ ] Real-time notifications working
- [ ] Animations rendering smoothly
- [ ] Mobile responsive

### Testing

- [ ] User registration/login
- [ ] Password reset flow
- [ ] Admin dashboard access
- [ ] Trainer dashboard with clients
- [ ] Member dashboard with workouts
- [ ] Real-time Socket.IO notifications
- [ ] File uploads (if applicable)
- [ ] API rate limiting working

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` template
2. **Use strong JWT secret** - At least 32 random characters
3. **Enable HTTPS** - Use Let's Encrypt for free SSL
4. **Rate limiting** - Already implemented in backend
5. **MongoDB user permissions** - Limit to read/write only
6. **CORS whitelist** - Only allow your frontend domain
7. **Regular updates** - Keep dependencies updated
8. **Monitor logs** - Check for errors regularly
9. **Backup database** - Regular MongoDB backups
10. **Environment separation** - Different .env for dev/staging/prod

---

## 📊 Monitoring

### Backend Logs

- **Render**: View logs in dashboard
- **Heroku**: `heroku logs --tail`
- **PM2**: `pm2 logs ai-trainer-backend`

### Monitoring Tools

- **Sentry** - Error tracking
- **New Relic** - Performance monitoring
- **UptimeRobot** - Uptime monitoring
- **MongoDB Atlas** - Database metrics
- **Prometheus + Grafana** - Already configured in `/infra`

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: curl https://api.render.com/deploy/srv-xxxxx

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🐛 Troubleshooting

### CORS Errors

```javascript
// backend/app.js - Already configured
const allowedOrigins = [
  "https://your-production-domain.com",
  "https://www.your-production-domain.com",
];
```

### Socket.IO Connection Failed

```javascript
// frontend - Update Socket.IO URL
const socket = io("https://your-backend-url.com", {
  transports: ["websocket", "polling"],
});
```

### Database Connection Error

- Check MongoDB Atlas IP whitelist
- Verify connection string in .env
- Ensure database user has correct permissions

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [Redis Cloud Guide](https://docs.redis.com/latest/rc/)
- [Socket.IO Deployment](https://socket.io/docs/v4/deployment/)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

## 💡 Performance Optimization

1. **Enable Compression** - Already configured in backend
2. **Use CDN** - CloudFlare or AWS CloudFront
3. **Database Indexing** - Already configured in models
4. **Redis Caching** - Implement for frequently accessed data
5. **Image Optimization** - Compress workout GIFs
6. **Lazy Loading** - Already implemented in frontend
7. **Code Splitting** - Vite handles automatically

---

## 🎉 Success!

Your AI Personal Trainer app is now deployed and ready for users!

### Important URLs to Save:

- **Frontend**: `https://your-frontend-url.com`
- **Backend API**: `https://your-backend-url.com/api`
- **Admin Dashboard**: `https://your-frontend-url.com/pages/admin-dashboard.html`
- **MongoDB**: Check MongoDB Atlas dashboard
- **Monitoring**: `https://your-backend-url.com:9090` (if Prometheus deployed)

---

## 📞 Support

- GitHub Issues: [Report a bug](https://github.com/Rishikeshh19/AI---Based-Personal-Trainer/issues)
- Documentation: Check all `.md` files in repository
- Email: Support email configured in .env

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
