<div align="center">
  <h1>🧮 StepSolve</h1>
  <p><strong>AI-Powered Mathematical Problem Solver with Step-by-Step Explanations</strong></p>
  
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](#)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](#)
</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About

**StepSolve** is an innovative AI-powered calculator that revolutionizes the way students and educators approach mathematical problem-solving. Unlike traditional calculators that only provide answers, StepSolve delivers comprehensive step-by-step explanations for every solution, making it an invaluable learning tool.

Built with modern web technologies and powered by Google's Gemini AI, StepSolve bridges the gap between computation and comprehension, helping users understand the "why" behind mathematical solutions.

---

## ✨ Features

### 🧠 **Intelligent Problem Solving**
- Supports arithmetic, algebra, calculus, geometry, and advanced mathematics
- AI-powered solution generation with detailed explanations
- Mathematical expression parsing and validation

### 📱 **Modern User Experience**
- Clean, intuitive dark-themed interface
- Responsive design optimized for all devices
- Progressive Web App (PWA) capabilities for offline usage
- Fast loading with optimized performance

### 📷 **Camera Integration**
- Capture handwritten or printed mathematical problems
- Advanced image processing for text recognition
- Seamless conversion from images to solvable expressions

### 🔧 **Developer-Friendly**
- Built with TypeScript for type safety
- Modular component architecture
- Comprehensive error handling and offline support

---

## 🚀 Demo

Experience StepSolve in action: [Live Demo](https://ai.studio/apps/drive/1JNH99G8rb5pzWfOgLGmTEaoQNTfLPNTh)

---

## 🛠️ Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Gemini API Key** - [Get your free API key](https://ai.google.dev/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stepsolve.git
   cd stepsolve
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to view the application.

---

## 📖 Usage

### Basic Problem Solving
1. Enter your mathematical expression in the input field
2. Click "Solve" or press Enter
3. View the detailed step-by-step solution

### Camera Input
1. Click the camera icon in the interface
2. Position your device camera over the mathematical problem
3. Capture the image when the problem is clearly visible
4. Wait for AI processing and view the solution

### Offline Mode
- StepSolve works offline for previously solved problems
- Core functionality remains available without internet connection

---

## 🏗️ Technology Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend tooling

### AI & APIs
- **Google Gemini AI** - Advanced mathematical problem solving
- **MathJax** - Mathematical notation rendering

### Tools & Services
- **PWA** - Progressive Web App capabilities
- **Service Workers** - Offline functionality
- **Modern Browser APIs** - Camera, storage, and more

---

## 📁 Project Structure

```
stepsolve/
├── public/                 # Static assets
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── src/
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API and utility services
│   ├── utils/            # Helper functions
│   └── types.ts          # TypeScript type definitions
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md            # Project documentation
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Project Maintainer:** [Your Name]
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

**Project Link:** [https://github.com/your-username/stepsolve](https://github.com/your-username/stepsolve)

---

<div align="center">
  <p>Made with ❤️ for the mathematics community</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>