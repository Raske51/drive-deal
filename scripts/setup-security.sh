#!/bin/bash

# Install ClamAV
echo "Installing ClamAV..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get update
    sudo apt-get install -y clamav clamav-daemon
    sudo systemctl stop clamav-freshclam
    sudo freshclam
    sudo systemctl start clamav-freshclam
    sudo systemctl enable clamav-freshclam
elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew install clamav
    cp /usr/local/etc/clamav/freshclam.conf.sample /usr/local/etc/clamav/freshclam.conf
    freshclam
fi

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Set up AWS S3
echo "Setting up AWS S3..."
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file"
fi

# Set up Sentry
echo "Setting up Sentry..."
if [ -z "$SENTRY_DSN" ]; then
    echo "Please set SENTRY_DSN in your .env file"
fi

# Generate secure keys
echo "Generating secure keys..."
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)" >> .env
echo "PASSWORD_PEPPER=$(openssl rand -hex 32)" >> .env
echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env

# Set up SSL certificate for development
echo "Setting up SSL certificate for development..."
if [ ! -f "./certificates/localhost.key" ]; then
    mkdir -p ./certificates
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./certificates/localhost.key \
        -out ./certificates/localhost.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

echo "Security setup complete!"
echo "Please ensure you have:"
echo "1. Set up your .env file with all required variables"
echo "2. Configured your AWS S3 bucket with proper permissions"
echo "3. Set up your Sentry project and added the DSN"
echo "4. Added your production domain to CORS_ORIGIN in .env"
echo "5. Set up SSL certificates for production" 