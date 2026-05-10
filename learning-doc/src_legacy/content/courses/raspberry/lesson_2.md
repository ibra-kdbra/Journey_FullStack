# 🔧 # Lesson 2: GUIDE TO INSTALLING AND CONTROLLING RASPBERRY PI FROM A Desktop VIA VNC

## 🧾 Prerequisites

- 1 Raspberry Pi with an installed operating system (Raspberry Pi OS)
- Raspberry Pi connected to a network (Wi-Fi or LAN)
- 1 Desktop computer (laptop or PC)
- Mouse, keyboard, and monitor for the initial configuration (or SSH if you have it enabled)

## 🥇 STEP 1: Install and enable VNC on the Raspberry Pi

### Method 1: Enable VNC through the graphical interface

1. Activate VNC Server: sudo raspi-config → Interfacing Options → VNC → Enable
2. Or install RealVNC: sudo apt update && sudo apt install realvnc-vnc-server
3. Start VNC: sudo systemctl enable vncserver-x11-serviced

## 🥉 STEP 2: Connect from the Desktop to the Raspberry Pi

1. Open **VNC Viewer** on the Desktop

2. Enter the IP address of the Raspberry Pi (e.g., `192.168.1.100`) into the connection field

   > You can find the IP on the Raspberry Pi with the command:

   ```bash
   hostname -I
   ```

3. Press **Enter**

4. When prompted, enter:

   - **Username**: usually `pi`
   - **Password**: the login password for the Raspberry Pi (default is `raspberry` if you haven't changed it)

5. Press **OK** to connect, and you will see the Raspberry Pi's screen displayed on your Desktop computer.

## 💡 NOTES

- Ensure that the Raspberry Pi and the computer are on the same network (Wi-Fi/LAN)
- You can set a static IP address for the Raspberry Pi for easier future connections
- Change the default password of the Pi to increase security
- If you don't see an image after connecting with VNC, temporarily attach a monitor to the Raspberry Pi so it can detect the resolution
