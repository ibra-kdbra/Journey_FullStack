# Lesson 1: Introduction and Installation of Raspberry Pi

## 🎯 Learning Objectives

- Understand the history and philosophy behind the Raspberry Pi
- Differentiate between various Raspberry Pi models and their technical specifications
- Master the basic components of the Raspberry Pi ecosystem
- Know how to set up a Raspberry Pi for the first time
- Understand and practice the basic applications of the Raspberry Pi

## 📝 Detailed Content

### 1. History and Development Philosophy of Raspberry Pi

#### 1.1 Origin and Vision

The Raspberry Pi was launched in 2012, developed by the Raspberry Pi Foundation in the United Kingdom.

##### The main vision of the project is to

- Create a low-cost, accessible computer
- Encourage learning in programming and computer hardware

#### 1.2 Development Through the Ages

- **2012**: Launch of the first Raspberry Pi Model B
- **2014**: Launch of the Raspberry Pi 1 Model B+
- **2015**: Launch of the Raspberry Pi 2
- **2016**: Launch of the Raspberry Pi 3
- **2019**: Launch of the Raspberry Pi 4
- **2021**: Launch of the Raspberry Pi Pico
- **2023**: Launch of the Raspberry Pi 5

### 2. Existing Raspberry Pi Models and Comparison of Technical Specifications

#### 2.1 Main Raspberry Pi Series

| Model       | CPU                         | RAM         | USB                    | HDMI          | Ethernet | Wi-Fi/BT        | GPIO   | Reference Price |
| ----------- | --------------------------- | ----------- | ---------------------- | ------------- | -------- | --------------- | ------ | --------------- |
| Pi 5        | Quad-core Cortex-A76 2.4GHz | 4GB/8GB     | 2× USB 3.0, 2× USB 2.0 | 2× micro HDMI | Gigabit  | Wi-Fi 5, BT 5.0 | 40 pin | $60-80          |
| Pi 4        | Quad-core Cortex-A72 1.5GHz | 2GB/4GB/8GB | 2× USB 3.0, 2× USB 2.0 | 2× micro HDMI | Gigabit  | Wi-Fi 5, BT 5.0 | 40 pin | $35-75          |
| Pi 3B+      | Quad-core Cortex-A53 1.4GHz | 1GB         | 4× USB 2.0             | 1× HDMI       | 300Mbps  | Wi-Fi 4, BT 4.2 | 40 pin | $35             |
| Pi Zero 2 W | Quad-core Cortex-A53 1GHz   | 512MB       | 1× micro USB           | 1× mini HDMI  | None     | Wi-Fi 4, BT 4.2 | 40 pin | $15             |
| Pi Pico     | Dual-core RP2040 133MHz     | 264KB       | 1× micro USB           | None          | None     | None            | 26 pin | $4              |

#### 2.2 Comparative Analysis

- **Pi 5**: The most powerful
- **Pi 4**: A balance between performance and price
- **Pi 3B+**: Still capable for many projects
- **Pi Zero 2 W**: Ultra-compact
- **Pi Pico**: For simple microcontroller projects

### 3. Overview of the Hardware and Software Ecosystem

#### 3.1 Hardware Ecosystem

- **Main Component**: Raspberry Pi board
- **Essential Accessories**:
  - Power supply (5V with appropriate current for each model)
  - microSD card (minimum 8GB, Class 10 or higher)
  - Protective case
  - HDMI or micro HDMI cable
  - USB keyboard and mouse

#### 3.2 Software Ecosystem

- **Operating System**:

  - Raspberry Pi OS (formerly Raspbian)

- **Supported Programming Languages**:
  - Python
  - C/C++
  - JavaScript/Node.js
  - Scratch (visual programming)
  - Rust, Go, Java, and many other languages
- **Development Tools**:
  - Thonny IDE (default for Python)

### 4. Common Real-World Applications of Raspberry Pi

#### 4.1 Education and Learning

#### 4.2 Entertainment Center

#### 4.3 IoT (Internet of Things) Projects

#### 4.4 Servers and Networking

#### 4.5 Automation and Industry

### 5. Setting Up the Raspberry Pi for the First Time

#### 5.1 Preparing the Equipment

- Raspberry Pi (we will use a Pi 4 as an example)
- Official power supply (5V/3A)
- microSD card (16GB or larger)
- micro HDMI cable
- USB keyboard and mouse
- Monitor with an HDMI port

#### 5.2 Installing the Operating System

1. Download the Raspberry Pi Imager from the official website
2. Install and run the software
3. Select OS: Raspberry Pi OS (32-bit) with desktop
4. Select the SD card (be careful not to choose the wrong drive)
5. Configure advanced options (username, password, Wi-Fi)
6. Write the operating system to the card

#### 5.3 Connecting and Booting

1. Insert the microSD card into the Raspberry Pi
2. Connect peripheral devices (monitor, keyboard, mouse)
3. Connect the power supply and boot up
4. Go through the initial setup process
5. Explore the Raspberry Pi OS desktop

## 🏆 Practice Exercises

### Exercise 1: Install Raspberry Pi OS and set up Wi-Fi from scratch

### Exercise 2: Explore GPIO and control an LED

**Requirement**: Connect an LED to the Raspberry Pi and write a simple Python script to make the LED blink.

## 🔑 Key Points to Remember

1. **Regarding the power supply**:

   - Always use a power supply with the appropriate capacity. The Raspberry Pi 4 needs a 5V/3A supply, while the Pi 3 needs 5V/2.5A.

2. **Regarding the microSD card**:
   - Choose a high-quality microSD card (SanDisk, Samsung) to ensure performance and durability.
