# P&C Engineering Knowledge Base & Tools Site

A static documentation site built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/) for Protection & Control (P&C) Engineering resources.

## Features

- 📚 Protection engineering documentation
- 🎛️ Controls systems guides
- 📡 Telecom reference materials
- ⚡ Standards and best practices
- 🛠️ Interactive tools (IEC 61850 file comparison, etc.)

## Prerequisites

- Node.js 18+ 
- npm
- SSH access to the Debian server (192.168.0.110)
- Nginx installed on the server

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server will start at `http://localhost:4321`.

## Build

```bash
npm run build
```

This generates a static site in the `dist/` directory.

## Deploy

### Prerequisites

1. **SSH Access**: Ensure you can SSH to the server without a password (using SSH keys):
   ```bash
   ssh root@192.168.0.110
   ```

2. **Nginx Setup** (one-time server configuration):
   
   Copy the nginx config to the server:
   ```bash
   scp nginx/pnc-eng-site.conf root@192.168.0.110:/etc/nginx/sites-available/
   ```
   
   On the server, enable the site:
   ```bash
   ssh root@192.168.0.110
   ln -s /etc/nginx/sites-available/pnc-eng-site.conf /etc/nginx/sites-enabled/
   nginx -t  # Test configuration
   systemctl reload nginx
   ```

3. **Create webroot directory**:
   ```bash
   ssh root@192.168.0.110 "mkdir -p /var/www/pnc-eng-site"
   ```

### Deploy Script

Run the deploy script to build and deploy:

```bash
./deploy.sh
```

This will:
1. Build the site (`npm run build`)
2. Copy the `dist/` folder to the server at `/var/www/pnc-eng-site`
3. Print the access URL

### Manual Deploy

If you prefer to deploy manually:

```bash
# Build
npm run build

# Copy files to server
rsync -avz --delete ./dist/ root@192.168.0.110:/var/www/pnc-eng-site/
```

## Access

Once deployed, the site is available at:

```
http://192.168.0.110:8081
```

(Note: Port 8081 is used because 8080 was already in use by another service.)

## Project Structure

```
.
├── dist/              # Build output (generated)
├── nginx/             # Nginx configuration
│   └── pnc-eng-site.conf
├── public/            # Static assets
├── src/
│   ├── assets/        # Images and other assets
│   ├── content/docs/  # Documentation content
│   └── content.config.ts
├── deploy.sh          # Deployment script
├── astro.config.mjs   # Astro configuration
└── package.json
```

## Troubleshooting

### Build fails

```bash
# Clear cache and rebuild
rm -rf dist/ .astro/
npm run build
```

### Permission denied during deploy

Ensure SSH key authentication is set up:
```bash
ssh-copy-id root@192.168.0.110
```

### Site not accessible

1. Check Nginx is running:
   ```bash
   ssh root@192.168.0.110 "systemctl status nginx"
   ```

2. Check Nginx configuration:
   ```bash
   ssh root@192.168.0.110 "nginx -t"
   ```

3. Check firewall rules (port 8080):
   ```bash
   ssh root@192.168.0.110 "iptables -L -n | grep 8080"
   ```

4. Verify files are in place:
   ```bash
   ssh root@192.168.0.110 "ls -la /var/www/pnc-eng-site/"
   ```

### 404 errors on page refresh

This is usually a server configuration issue. Ensure the Nginx config includes:
```nginx
try_files $uri $uri/ /index.html;
```

### rsync not found

Install rsync on the server:
```bash
ssh root@192.168.0.110 "apt-get update && apt-get install -y rsync"
```

## Commands Reference

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at localhost:4321 |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |
| `./deploy.sh` | Build and deploy to server |

## Nginx Configuration Details

The site is served on port 8080 with the following features:

- **Gzip compression** enabled for text assets
- **Static asset caching** (6 months for images, fonts, etc.)
- **SPA routing support** (fallback to index.html)
- **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)

To change the port, edit `nginx/pnc-eng-site.conf` and reload Nginx.

## License

Internal use only - P&C Engineering Team
