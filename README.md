<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/bar-chart-3.svg" alt="DataLens Studio Logo" width="120" height="auto" />
  <h1>DataLens Studio</h1>
  
  <p>
    <strong>An interactive data science studio for automated dataset understanding, profiling, and preprocessing.</strong>
  </p>

  <p>
    <a href="#-features"><img alt="Features" src="https://img.shields.io/badge/Features-Data_Science-blue" /></a>
    <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/Frontend-React-61dafb?logo=react&logoColor=black" /></a>
    <a href="https://fastapi.tiangolo.com/"><img alt="FastAPI" src="https://img.shields.io/badge/Engine-FastAPI-009688?logo=fastapi&logoColor=white" /></a>
    <a href="https://opensource.org/licenses/MIT"><img alt="License" src="https://img.shields.io/badge/License-MIT-success" /></a>
  </p>
</div>

---

## 📌 Overview

**DataLens Studio** is a premium, full-stack open-source data science environment built for students, educators, and machine learning practitioners. It functions as an automated "mini data science studio." Simply upload your raw dataset, and the platform will instantly generate Exploratory Data Analysis (EDA) metrics, feature distributions, and correlation maps. 

The studio includes an interactive **Preprocessing Lab** that lets you visually build transformation pipelines to clean missing values, scale features, and encode categories, before generating targeted Machine Learning strategy recommendations based on your data's schema.

## ✨ Features

- 📤 **Dataset Upload & Schematics**: Upload CSVs and immediately understand your data schematic and variable types.
- 📊 **Automated Dashboard**: Automatic generation of descriptive statistics and distribution metrics.
- 🧹 **Data Quality Analysis**: Instant detection of missing values, duplicates, high skewness, and constant columns.
- 🔍 **Feature Exploration**: Deep dive into individual features with interactive distributions using area and bar charts.
- 🔗 **Correlation Insights**: Interactive scatter heatmaps with automatic collinearity warnings to prevent model leakage.
- 🧪 **Preprocessing Lab**: Visually build sequential transformation pipelines (Imputation, Scaling, Outlier Handling, Encoding) and preview them against your data frame in real time.
- 🤖 **ML Intelligence Engine**: Automated machine learning problem-type detection (e.g. Binary Classification, Regression) mapping features to optimal algorithm recommendations.
- 💾 **Export Pipeline**: Download your fully engineered and scrubbed dataset as a clean CSV, ready for immediate training.

## 🏗️ Architecture

DataLens Studio utilizes a modern three-tier architecture to securely bridge beautiful UI paradigms with heavy scientific computation:

1. **Frontend (React)**: A highly interactive, responsive SPA built with **Vite**, **Tailwind CSS**, and **Framer Motion**. Handles all application state, pipeline sequencing, and visual chart rendering (Recharts).
2. **Orchestrator Backend (Node.js / Express)**: Acts as the middleman API layer. It securely handles multipart file uploads, stores execution metadata in **MongoDB**, and routes structured requests to the processing engine.
3. **Data Analysis Engine (Python / FastAPI)**: The analytical heavy lifter. Powered by **Pandas**, **NumPy**, and **Scikit-Learn**. It executes statistical computations, computes PCA/correlation matrices, applies transformations, and runs ML heuristics.

```text
User ↔ [ React Dashboard ] ↔ [ Node.js API (Upload & DB) ] ↔ [ Python FastAPI Engine (Pandas & Scikit) ]
                                      |
                                 [ MongoDB ]
```

## 🛠️ Tech Stack

**Client Application**
- React 18 (Vite)
- Tailwind CSS
- framer-motion (Micro-interactions & page transitions)
- Recharts (Data visualisations)
- lucide-react (Premium iconography)

**Server Gateway**
- Node.js & Express
- MongoDB (Mongoose)
- multer (Multipart/form-data)

**Scientific Compute Service**
- Python 3
- FastAPI
- pandas & numpy
- scikit-learn & scipy

## 📸 Screenshots

*(Replace these placeholders with actual screenshots of your application)*

| Overview Dashboard | Preprocessing Lab |
| :---: | :---: |
| <img src="https://via.placeholder.com/600x350/ffffff/94a3b8?text=Overview+Dashboard+Screenshot" alt="Overview" /> | <img src="https://via.placeholder.com/600x350/ffffff/94a3b8?text=Preprocessing+Lab+Screenshot" alt="Preprocessing" /> |
| **Correlation Explorer** | **ML Intelligence** |
| <img src="https://via.placeholder.com/600x350/ffffff/94a3b8?text=Correlation+Heatmap+Screenshot" alt="Correlation" /> | <img src="https://via.placeholder.com/600x350/ffffff/94a3b8?text=ML+Intelligence+Screenshot" alt="ML Intelligence" /> |

## 📂 Folder Structure

```text
datalens-studio/
├── frontend/             # Single Page Application (React + Vite)
│   ├── src/
│   │   ├── components/   # UI components (Upload, Overview, Preprocessing, etc.)
│   │   ├── App.jsx       # Main application routing and core UI shell
│   │   └── index.css     # Global styles and Tailwind directives
├── backend/              # Orchestration API (Node.js)
│   ├── uploads/          # Temporary storage for buffered CSVs
│   ├── server.js         # Express server, MongoDB connection, proxy logic
│   └── package.json      
└── engine/               # Scientific Compute Service (Python)
    ├── main.py           # FastAPI instance and analysis endpoints
    └── requirements.txt  # Python pip dependencies
```

## 🚀 Getting Started

### Prerequisites

You will need the following installed on your local environment:
- **Node.js** (v18+)
- **Python** (3.8+)
- **MongoDB** (Local instance running on `mongodb://localhost:27017` or an Atlas URI)

### Local Development Setup

The application microservices are run independently. You will need three terminal windows.

#### 1. Start the Data Analysis Engine (Python)

Navigate to the engine directory, create a virtual environment, install dependencies, and run the FastAPI server:

```bash
cd engine
python -m venv .venv

# Activate environment (Windows)
.venv\Scripts\activate
# Activate environment (Mac/Linux)
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Start the Backend API (Node.js)

Navigate to the backend directory, install packages, and start the proxy gateway:

```bash
cd backend
npm install
# Ensure your MongoDB instance is running before starting the server
npm run dev
```

#### 3. Start the Frontend Dashboard (React)

Navigate to the frontend directory, install Vite plugins, and start the development dashboard:

```bash
cd frontend
npm install
npm run dev
```

The application will now be available globally at `http://localhost:5173`.

## 📡 API Architecture Overview

### Gateway Service (Node.js - Port 5000)
- `POST /api/upload`: Receives form-data, buffers files, interacts with DB models, and pipes data to the engine.
- `GET /api/datasets`: Performs CRUD lookups for loaded datasets.

### Compute Engine (Python - Port 8000)
- `POST /api/analyze`: Ingests CSV binary, generating full EDA JSON blobs (schemas, descriptives, skew computations).
- `GET /api/correlation/{filename}`: Executes `df.corr()` and constructs matrix points for Recharts scatter plots.
- `GET /api/insights/{filename}`: Executes heuristic LLM-style data overview synthesis.
- `GET /api/ml-detect/{filename}/{target}`: Performs cardinality mapping to recommend model estimators based on target.
- `POST /api/preprocess/{filename}`: Recursively applies requested Pipeline JSON operations (e.g., MinMax scaling, imputation) to the target DataFrame structure.

## 🗺️ Roadmap

- [ ] Export transformation pipelines to directly executable Python/Jupyter Notebooks.
- [ ] Add direct database connection capabilities (Postgres, MySQL).
- [ ] Introduce an AutoML workflow for browser-side model training and evaluation tracking.
- [ ] Improve outlier detection visually with robust interactive BoxPlots.

## 🤝 Contributing

We welcome community contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get your local environment configured and submit pull requests.

## 📄 License

This repository is distributed under the MIT License. See [LICENSE](LICENSE) for more information.
