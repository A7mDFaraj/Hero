# Cloudinary Setup Guide

This project uses Cloudinary for image storage and hosting. Follow these steps to set it up:

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account (no credit card required)
3. The free tier includes:
   - 25GB storage
   - 25GB bandwidth/month
   - Image transformations
   - CDN delivery

## Step 2: Get Your Cloudinary Credentials

1. After signing up, go to your [Dashboard](https://console.cloudinary.com/)
2. You'll see your account details:
   - **Cloud Name** (e.g., `dxyz123456`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Cloudinary credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

3. **Important**: Never commit `.env.local` to git! It's already in `.gitignore`

## Step 4: Restart Your Development Server

After adding the environment variables, restart your Next.js server:

```bash
npm run dev
```

## Step 5: Test the Upload

1. Go to `/admin` and log in (default password: `admin123`)
2. Upload a test image
3. Check that it appears in the fan art gallery

## Troubleshooting

### Images not uploading?
- Check that your `.env.local` file exists and has the correct credentials
- Make sure you restarted the dev server after adding environment variables
- Check the browser console for error messages
- Verify your Cloudinary credentials in the Cloudinary dashboard

### Images not displaying?
- Check that `res.cloudinary.com` is in your `next.config.js` remote patterns (already configured)
- Verify the image URL in the browser network tab
- Check Cloudinary dashboard to see if images were uploaded

### Getting "Invalid credentials" error?
- Double-check your Cloudinary credentials in `.env.local`
- Make sure there are no extra spaces or quotes
- Try regenerating your API secret in Cloudinary dashboard

## Security Notes

- **Never commit** `.env.local` to version control
- Keep your API Secret secure
- The free tier is sufficient for development and small projects
- For production, consider upgrading to a paid plan for better performance

## What Happens When You Upload?

1. Image is uploaded to Cloudinary's servers
2. Cloudinary automatically optimizes the image
3. Image is stored in the `fanart-gallery` folder
4. A secure URL is returned and saved to your database/storage
5. Images are delivered via Cloudinary's global CDN

## Benefits of Cloudinary

✅ **Automatic optimization** - Images are compressed and optimized  
✅ **CDN delivery** - Fast loading worldwide  
✅ **Image transformations** - Resize, crop, format conversion on-the-fly  
✅ **Reliable storage** - No localStorage limits  
✅ **Direct URLs** - Shareable image links  
✅ **Free tier** - Perfect for development and small projects
