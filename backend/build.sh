#!/bin/bash
set -e

echo "📦 Installing Node dependencies..."
npm install

echo "🐍 Installing Python dependencies..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Build complete!"
