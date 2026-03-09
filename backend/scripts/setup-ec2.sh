#!/bin/bash
# One-time EC2 server setup for ATS Career Kit backend.
# Run on a fresh Ubuntu 22.04 instance. Review and replace placeholders before running.
# chmod +x backend/scripts/setup-ec2.sh

set -euo pipefail

echo "=== ATS Career Kit EC2 Setup ==="

# System updates
sudo apt update && sudo apt upgrade -y

# Python 3.12 + pip + venv
sudo apt install -y python3.12 python3.12-venv python3-pip

# Nginx
sudo apt install -y nginx

# Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Clone repo (TODO: Replace OWNER/REPO with your GitHub org/repo, use deploy key or HTTPS)
cd /home/ubuntu
git clone https://github.com/OWNER/REPO.git ats-career-kit

# Virtual environment and dependencies
cd /home/ubuntu/ats-career-kit/backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Nginx config
sudo cp /home/ubuntu/ats-career-kit/nginx/ats-backend.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/ats-backend.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Systemd service
sudo cp /home/ubuntu/ats-career-kit/backend/systemd/ats-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ats-backend

# Create .env (TODO: Replace all placeholder values before starting the service)
cat > /home/ubuntu/ats-career-kit/backend/.env << 'ENVEOF'
ANTHROPIC_API_KEY=sk-ant-REPLACE_ME
DATABASE_URL=postgresql+asyncpg://user:pass@RDS_ENDPOINT:5432/ats_career_kit
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
LLM_PROVIDER=anthropic
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
APP_VERSION=0.5.0
ENVEOF

# Run migrations
cd /home/ubuntu/ats-career-kit/backend
source .venv/bin/activate
alembic upgrade head

# Start backend (after editing .env with real values)
# sudo systemctl start ats-backend

echo ""
echo "Setup complete. Next steps:"
echo "1. Edit /home/ubuntu/ats-career-kit/backend/.env with real API keys and DATABASE_URL"
echo "2. Point DNS for api.yourdomain.com to this EC2 instance"
echo "3. Run: sudo certbot --nginx -d api.yourdomain.com"
echo "4. Run: sudo systemctl start ats-backend"
echo "5. Test: curl http://localhost:8000/health"
echo "   After SSL: curl https://api.yourdomain.com/health"
