from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import io
import json

class Operation(BaseModel):
    action: str
    column: str
    params: Dict[str, Any]

class PreprocessRequest(BaseModel):
    file_path: str
    operations: List[Operation]
    export: bool = False

app = FastAPI()

@app.post("/api/analyze")
async def analyze_dataset(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        return {"error": "Invalid CSV file"}

    # Basic Stats
    stats = {
        "rows": int(df.shape[0]),
        "cols": int(df.shape[1]),
        "numeric": int(len(df.select_dtypes(include=[np.number]).columns)),
        "categorical": int(len(df.select_dtypes(include=['object', 'category']).columns)),
        "missing": int(df.isnull().sum().sum()),
        "duplicates": int(df.duplicated().sum())
    }

    # Data Quality: Missing & Skewness
    missing_dict = df.isnull().sum()[df.isnull().sum() > 0].to_dict()
    missing_list = [{"column": k, "count": int(v)} for k, v in missing_dict.items()]
    
    num_cols = df.select_dtypes(include=[np.number]).columns
    skewness = []
    for col in num_cols:
        s = df[col].skew()
        if abs(s) > 1:
            skewness.append({"column": col, "skew": float(s)})

    constant_cols = [col for col in df.columns if df[col].nunique() <= 1]

    # Sample data for preview
    preview = json.loads(df.head(5).to_json(orient='records'))

    return {
        "stats": stats,
        "quality": {
            "missing": missing_list,
            "skewed": skewness,
            "constant": constant_cols
        },
        "preview": preview
    }

@app.get("/api/ml-detect")
async def ml_detect(file_path: str, target: str):
    try:
        df = pd.read_csv(file_path)
    except Exception:
        return {"error": "File unreadable"}
    
    if target not in df.columns:
        return {"error": "Target column not found"}

    is_num = pd.api.types.is_numeric_dtype(df[target])
    distinct = df[target].nunique()
    
    problem_type = "Regression" if is_num and distinct > 15 else "Classification"
    
    suggestions = []
    if problem_type == "Classification":
        suggestions = [
            {"name": "Logistic Regression", "desc": "Perfect for simple, fast baselines and interpretability."},
            {"name": "Random Forest", "desc": "Best for robust predictions with mixed data types."},
            {"name": "Gradient Boosting", "desc": "Top-tier accuracy for complex patterns (e.g., XGBoost)."},
            {"name": "SVM", "desc": "Great for high-dimensional or clear-margin separations."}
        ]
    else:
        suggestions = [
            {"name": "Linear Regression", "desc": "Interpretable and best for simple linear trends."},
            {"name": "Random Forest Regressor", "desc": "Handles non-linear numeric trends without much tuning."},
            {"name": "Gradient Boosting Regressor", "desc": "State-of-the-art performance for structured tabular regression."}
        ]

    return {
        "problem_type": problem_type,
        "suggestions": suggestions
    }

@app.get("/api/insights")
async def generate_insights(file_path: str):
    try:
        df = pd.read_csv(file_path)
    except Exception:
        return {"error": "File unreadable"}

    rows = df.shape[0]
    cols = df.shape[1]
    missing_cols = (df.isnull().sum() > 0).sum()
    
    num_df = df.select_dtypes(include=[np.number])
    corr_insight = ""
    if num_df.shape[1] >= 2:
        corr = num_df.corr()
        np.fill_diagonal(corr.values, np.nan)
        max_corr = corr.unstack().dropna().sort_values(ascending=False)
        if not max_corr.empty and max_corr.iloc[0] > 0.6:
            col1, col2 = max_corr.index[0]
            corr_insight = f"Interestingly, '{col1[0]}' strongly correlates with '{col1[1]}' (r={max_corr.iloc[0]:.2f})."
            
    insight = f"This dataset contains {rows} rows and {cols} columns. "
    if missing_cols > 0:
        insight += f"{missing_cols} columns contain missing values that need cleaning. "
    else:
        insight += "There is no missing data, which is excellent. "
        
    insight += corr_insight

    return {"insight": insight}
@app.get("/api/feature")
async def feature_analysis(file_path: str, column: str):
    try:
        df = pd.read_csv(file_path)
    except Exception:
        return {"error": "File not found or unreadable"}

    if column not in df.columns:
        return {"error": "Column not found"}

    col_data = df[column].dropna()
    is_num = pd.api.types.is_numeric_dtype(col_data)

    if is_num:
        counts, bins = np.histogram(col_data, bins=20)
        hist_data = [{"bin": f"{bins[i]:.1f}", "count": int(counts[i])} for i in range(len(counts))]
        
        box_data = {
            "min": float(col_data.min()), 
            "q1": float(col_data.quantile(0.25)), 
            "median": float(col_data.median()), 
            "q3": float(col_data.quantile(0.75)), 
            "max": float(col_data.max())
        }

        return {"type": "numeric", "histogram": hist_data, "boxplot": box_data}
    else:
        vc = col_data.value_counts().head(20).to_dict()
        bar_data = [{"category": str(k), "count": int(v)} for k, v in vc.items()]
        return {"type": "categorical", "barchart": bar_data}

@app.get("/api/correlation")
async def correlation_matrix(file_path: str):
    try:
        df = pd.read_csv(file_path)
    except Exception:
        return {"error": "File unreadable"}

    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty or num_df.shape[1] < 2:
        return {"error": "Not enough numeric columns for correlation"}

    corr = num_df.corr().round(2)
    
    heatmap_data = []
    cols = list(corr.columns)
    for i in range(len(cols)):
        for j in range(len(cols)):
            val = corr.iloc[i, j]
            if pd.isna(val):
                val = 0.0
            heatmap_data.append({
                "x": cols[i],
                "y": cols[j],
                "value": float(val)
            })
            
    high_corr = []
    for i in range(len(cols)):
        for j in range(i+1, len(cols)):
            val = float(corr.iloc[i, j])
            if abs(val) > 0.8 and not pd.isna(val):
                high_corr.append({"col1": cols[i], "col2": cols[j], "val": val})
                
    return {"matrix": heatmap_data, "columns": cols, "high_corr": high_corr}

@app.post("/api/preprocess")
async def preprocess_dataset(req: PreprocessRequest):
    try:
        df = pd.read_csv(req.file_path)
    except Exception:
        return {"error": "File unreadable"}

    try:
        for op in req.operations:
            col = op.column
            if col not in df.columns:
                continue
                
            if op.action == "impute":
                method = op.params.get("method", "mean")
                if method == "mean" and pd.api.types.is_numeric_dtype(df[col]):
                    df[col] = df[col].fillna(df[col].mean())
                elif method == "median" and pd.api.types.is_numeric_dtype(df[col]):
                    df[col] = df[col].fillna(df[col].median())
                elif method == "mode":
                    df[col] = df[col].fillna(df[col].mode()[0])
                elif method == "drop":
                    df = df.dropna(subset=[col])
                    
            elif op.action == "encode":
                method = op.params.get("method", "label")
                if method == "label":
                    from sklearn.preprocessing import LabelEncoder
                    le = LabelEncoder()
                    valid_idx = df[col].notnull()
                    df.loc[valid_idx, col] = le.fit_transform(df.loc[valid_idx, col].astype(str))
                elif method == "onehot":
                    df = pd.get_dummies(df, columns=[col])
                    
            elif op.action == "outliers":
                method = op.params.get("method", "remove")
                if pd.api.types.is_numeric_dtype(df[col]):
                    q1 = df[col].quantile(0.25)
                    q3 = df[col].quantile(0.75)
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    if method == "remove":
                        df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
                    elif method == "cap":
                        df[col] = np.clip(df[col], lower_bound, upper_bound)
                        
            elif op.action == "scale":
                method = op.params.get("method", "standard")
                if pd.api.types.is_numeric_dtype(df[col]):
                    col_data = df[[col]].copy()
                    from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
                    if method == "standard":
                        scaler = StandardScaler()
                    elif method == "minmax":
                        scaler = MinMaxScaler()
                    elif method == "robust":
                        scaler = RobustScaler()
                    else:
                        scaler = StandardScaler()
                    df[col] = scaler.fit_transform(col_data)
                    
            elif op.action == "transform":
                method = op.params.get("method", "log")
                if pd.api.types.is_numeric_dtype(df[col]):
                    if method == "log":
                        df[col] = np.log1p(df[col].clip(lower=0))
                    elif method == "poly":
                        degree = int(op.params.get("degree", 2))
                        df[col] = df[col] ** degree

        if req.export:
            export_path = req.file_path.replace(".csv", "_processed.csv")
            df.to_csv(export_path, index=False)
            import os
            return {"download_url": os.path.basename(export_path)}

        preview = json.loads(df.head(10).to_json(orient='records'))
        return {"preview": preview}
    except Exception as e:
        return {"error": str(e)}

