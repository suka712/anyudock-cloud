# AnyuDock S3 Setup

Simple S3 file storage for sharing files and env configs between machines.

See my setup live at [AnyuDock.cloud](https://anyudock.cloud)
## Start

1. Copy the env file and fill in your values:
```bash
cp api/.env.example api/.env
```

2. Configure your S3 credentials in `api/.env`:
```
PORT=8080
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
JWT_SECRET=your_jwt_secret

S3_ENDPOINT=https://your-s3-endpoint.com
S3_BUCKET_NAME=your-bucket
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
```

3. Install and run:
```bash
cd api
bun install
bun run dev
```

4. Serve the client

Open `client/index.html` in your browser. Update `client/config.js` with your backend URL if needed.

Serve the backend through `localhost:3000` with 
```bash
bun x serve
```

---
The app runs without deployment. Just have the correct S3 credentials filled in.