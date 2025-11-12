# Logo Setup Instructions

## To Use Your 3D Gold Logo:

### Option 1: Upload to Public Folder (Recommended)
1. Save your 3D gold logo image as `duna-logo.png`
2. Place it in the `public` folder
3. The logo will automatically load from `/duna-logo.png`

### Option 2: Use Image Hosting
1. Upload your logo to Imgur, Cloudinary, or any image hosting service
2. Update the fallback URL in `components/Navbar.tsx` line 83
3. Replace `https://i.imgur.com/duna-logo-3d.png` with your hosted image URL

### Option 3: Use Discord CDN
If your logo is already on Discord, you can use the Discord CDN URL directly.

The logo will automatically fallback to a gold gradient "D" if the image fails to load.

