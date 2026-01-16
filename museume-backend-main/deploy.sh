#!/bin/bash

# Backend Update
cd /home/ubuntu/apps/museume-backend
GIT_SSH_COMMAND="ssh -i ~/.ssh/museume-backend-key" git pull origin main

source /home/ubuntu/apps/museume-backend/venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart museume.service
deactivate

# Frontend Update
cd /home/ubuntu/apps/museume-frontend
GIT_SSH_COMMAND="ssh -i ~/.ssh/museume-frontend-key" git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx
