<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1eoU-5jW4lIDsppPoGd6AK1doNhiL7Lmw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   API_KEY=your_api_key_here
   ```
   Get your API key from: https://aistudio.google.com/app/apikey
   
   **Important:** Never commit `.env.local` to git (it's already in `.gitignore`).
3. Run the app:
   `npm run dev`
