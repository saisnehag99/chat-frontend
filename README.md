# Chat frontend

This repository is a React + Vite implementation of the Project Nanda chat frontend. The original [implementation](https://github.com/projnanda/chat-frontend) was written in HTML/CSS/JS.

As of February 14, 2025 [Create React App was deprecated]( https://react.dev/blog/2025/02/14/sunsetting-create-react-app) for React. Therefore, we chose to use React + Vite instead.

## Create a Vite project
```bash
npm create vite@latest <your_project_name> -- --template react
cd <your_project_name>
```

## Run a Vite project
```bash
npm install
npm run dev
```

This will launch your Vite React application in development mode, accessible at http://localhost:5173.

## Google authentication setup
1. Add http://localhost:5173 to Authorized JavaScript Origins
2. Add http://localhost:5173 to Authorized redirect URIs
3. Install required packages

```bash
npm install @react-oauth/google jwt-decode
```

3. Create a .env file in your project root

```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```
