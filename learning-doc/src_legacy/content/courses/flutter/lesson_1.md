# 🎓 **LESSON 1: INTRODUCTION TO FLUTTER AND ENVIRONMENT SETUP**

## 🎯 **Learning Objectives**

- Understand **what Flutter is**.
- Distinguish basic differences between **Flutter**, **React Native**, and **Xamarin**.
- Understand Flutter's architecture: **Widget Tree**, **Rendering Engine**.
- Successfully set up the Flutter environment.
- Create and run your first Flutter application.

## 📝 **Detailed Content**

### 1. 🔍 **What is Flutter?**

**Definition:**
Flutter is an open-source **UI software development kit (UI toolkit)** developed by Google, allowing developers to create **mobile, web, and desktop** applications from a **single codebase**.

**Key Advantages:**

- Write once, run on multiple platforms (Android, iOS, Web, Desktop).
- Smooth interface with near-**native** performance.
- Rich widget library, easily customizable.

### 2. ⚖️ **Comparing Flutter with React Native and Xamarin**

| Criteria       | Flutter                    | React Native                 | Xamarin                |
| -------------- | -------------------------- | ---------------------------- | ---------------------- |
| Language       | Dart                       | JavaScript                   | C#                     |
| UI             | 100% custom via widgets    | Uses native components       | Native + Xamarin Forms |
| Performance    | Near-native                | Good but JS-bridge dependent | Good                   |
| Learning Curve | Medium                     | Easy (with JS background)    | Requires C# and .NET   |
| Multi-platform | Android, iOS, Web, Desktop | Android, iOS, Web            | Android, iOS, Windows  |

### 3. 🧱 **Flutter Architecture: Widget Tree and Rendering Engine**

#### **What is a Widget?**

> Everything in Flutter is a widget – from buttons and text to color frames and layouts.

#### **Widget Tree:**

- Similar to a **hierarchical tree**, where each node is a widget.
- Each child widget is **contained inside** a parent widget.

📌 Example:

```dart
MaterialApp(
  home: Scaffold(
    appBar: AppBar(title: Text("Hello")),
    body: Center(child: Text("Flutter")),
  ),
);
```

The widget tree diagram for the code above:

```
MaterialApp
 └── Scaffold
     ├── AppBar
     │   └── Text("Hello")
     └── Center
         └── Text("Flutter")
```

#### **Rendering Engine:**

Flutter uses **Skia**, a powerful graphics engine, to draw every pixel directly on the screen – independent of the native UI.

### 4. 🛠 **Installing Flutter SDK on Windows**

#### Step 1: Download the SDK

- Visit: [https://flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install)
- Download the Flutter Windows version.

#### Step 2: Extract and Set PATH

- Extract it into a directory without spaces (e.g., `C:\flutter`).
- Add `C:\flutter\bin` to your **Environment Variables > PATH**.

#### Step 3: Open CMD and type

```bash
flutter doctor
```

### 5. 🧑‍💻 **Installing IDE and Emulator**

#### Install Android Studio

- Used for:

  - Creating and managing emulators.
  - Providing the Android SDK.

- During installation, remember to **tick Android SDK, SDK Command-line Tools**.

### 6. 🚀 **Creating and Running the First Flutter App**

#### Create a new project

Open terminal/cmd:

```bash
flutter create hello_flutter
cd hello_flutter
code .
```

#### Run the application

```bash
flutter run
```

🎉 "Hello World" is now running on the emulator!

## 🧪 **Practice Exercises**

### 🔖 Task

> Set up a complete Flutter environment on your machine and create a Flutter application with a simple interface displaying:
> `Welcome to Flutter!`

## 🔑 **Key Points to Remember**

| Topic          | Memory Aid                        |
| -------------- | --------------------------------- |
| Flutter        | Uses Dart, UI built with widgets  |
| Widget Tree    | Every widget is a tree node       |
| flutter doctor | Used to check environment setup   |
| Emulator       | Requires Android Studio to create |
| `flutter run`  | Command to run the application    |

❗ **Common Issues:**

- Forgetting to add `flutter/bin` to PATH.
- Running the emulator without starting it.
- VS Code missing Flutter/Dart extensions.

## 📝 **Homework**

### 📌 Task

> Create a new Flutter app named `my_profile` that displays:
>
> - Full name
> - Email
> - A short introduction
