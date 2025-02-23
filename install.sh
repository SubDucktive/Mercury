if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run with sudo or as root."
    exit 1 
fi

read -p "Are you sure you want to proceed with the installation? [y/n]: " choice

if [ "$choice" != "y" ]; then
    echo "Installation canceled."
    exit 0
fi

echo "Installing Mercury.\n\n"

npm install readline-sync --prefix /opt/mercury
echo "Installed readling-sync (required for interpreter)"
 
mkdir -p /opt/mercury/src
echo "Created /opt/mercury"

cp -r src/ /opt/mercury/
echo "Copied source to mercury/src"

cp mercury.sh /usr/bin/mercury
echo "Copied mercury.sh to /usr/bin/mercury"

chmod +x /usr/bin/mercury
echo "Gave execution permissions to /usr/bin/mercury"

echo "Installation completed successfully"

