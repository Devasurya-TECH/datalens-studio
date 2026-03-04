import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import skew
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder
import io
import os

# --- Configuration & Styling ---
st.set_page_config(
    page_title="DataLens Studio – AI EDA & Preprocessing",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="expanded"
)

def apply_custom_css():
    st.markdown("""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        
        :root {
            --brand: #6366f1;
            --brand-subtle: #818cf8;
            --bg: #ffffff;
            --sidebar-bg: #fafafa;
            --text-primary: #111827;
            --text-secondary: #4b5563;
            --text-error: #ef4444;
            --border-subtle: #f3f4f6;
            --border-main: #e5e7eb;
            --radius-main: 6px;
        }

        /* Reset & Global */
        * { font-family: 'Inter', sans-serif !important; }
        code, pre, [data-testid="stTable"] td, .stDataFrame td { 
            font-family: 'JetBrains Mono', monospace !important; 
            font-size: 0.9rem !important;
        }

        .main {
            background-color: var(--bg);
            padding: 4rem 10% !important;
        }

        /* Sidebar - Pure Minimalism */
        section[data-testid="stSidebar"] {
            background-color: var(--sidebar-bg) !important;
            border-right: 1px solid var(--border-main);
            width: 320px !important;
        }

        div[data-testid="stSidebarNav"] { display: none; } /* Custom nav only */

        .nav-item {
            padding: 10px 14px;
            border-radius: var(--radius-main);
            margin-bottom: 2px;
            color: var(--text-secondary);
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.1s ease;
            text-decoration: none;
            display: block;
        }

        .nav-item:hover {
            background-color: #f3f4f6;
            color: var(--text-primary);
        }

        .nav-active {
            background-color: #000000 !important;
            color: #ffffff !important;
        }

        /* Typography */
        h1 {
            font-weight: 800 !important;
            letter-spacing: -0.04em !important;
            color: var(--text-primary) !important;
            font-size: 3.2rem !important;
            margin-bottom: 3rem !important;
        }

        h2, h3 {
            font-weight: 700 !important;
            letter-spacing: -0.02em !important;
            color: var(--text-primary) !important;
            margin-top: 2rem !important;
        }

        /* Metric Cards - Minimalist Flat */
        div[data-testid="metric-container"] {
            background: transparent;
            border: 0;
            padding: 0;
            box-shadow: none;
            border-left: 2px solid var(--border-main);
            padding-left: 1.5rem;
            margin-bottom: 2rem;
        }
        
        [data-testid="stMetricValue"] {
            font-size: 2.5rem !important;
            font-weight: 700 !important;
            color: var(--text-primary) !important;
            letter-spacing: -0.03em;
        }

        [data-testid="stMetricLabel"] {
            font-weight: 500 !important;
            color: var(--text-secondary) !important;
            font-size: 0.85rem !important;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        /* Buttons - Pro Interface */
        .stButton > button {
            background: #000000;
            color: #ffffff;
            border: 1px solid #000000;
            border-radius: var(--radius-main);
            padding: 0.6rem 1.2rem;
            font-weight: 600;
            font-size: 0.9rem;
            transition: opacity 0.2s ease;
        }

        .stButton > button:hover {
            background: #000000;
            opacity: 0.8;
            color: #ffffff;
        }

        /* Secondary actions */
        [data-testid="stExpander"], [data-testid="stForm"] {
            border: 1px solid var(--border-main) !important;
            border-radius: 8px !important;
            box-shadow: none !important;
        }

        /* Insight System */
        .insight-card {
            background-color: #fafafa;
            border: 1px solid var(--border-main);
            padding: 2rem;
            border-radius: 12px;
            margin: 2rem 0;
        }

        /* Hide unnecessary decorations */
        #MainMenu, footer { visibility: hidden; }
        
        /* Selectboxes & Inputs */
        [data-baseweb="select"], [data-baseweb="input"] {
            border-radius: var(--radius-main) !important;
        }
    </style>
    """, unsafe_allow_html=True)

def apply_plotly_theme():
    import plotly.io as pio
    pio.templates["datalens_pro"] = pio.templates["plotly_white"]
    pio.templates["datalens_pro"].layout.update(
        font={"family": "Inter, sans-serif", "color": "#111827"},
        hoverlabel={"bgcolor": "white"},
        colorway=['#000000', '#6366f1', '#10b981', '#f59e0b', '#ef4444'],
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        xaxis={"gridcolor": "#f3f4f6", "zerolinecolor": "#f3f4f6"},
        yaxis={"gridcolor": "#f3f4f6", "zerolinecolor": "#f3f4f6"}
    )
    pio.templates.default = "datalens_pro"

apply_custom_css()
apply_plotly_theme()

apply_custom_css()
apply_plotly_theme()

# --- Session State Persistence ---
def init_session_state():
    if 'df_original' not in st.session_state:
        st.session_state.df_original = None
    if 'df_processed' not in st.session_state:
        st.session_state.df_processed = None
    if 'target_column' not in st.session_state:
        st.session_state.target_column = None
    if 'history' not in st.session_state:
        st.session_state.history = []

init_session_state()

# --- Helper Functions ---
def get_dataset_stats(df):
    if df is None: return {}
    return {
        "rows": df.shape[0],
        "cols": df.shape[1],
        "numeric": len(df.select_dtypes(include=[np.number]).columns),
        "categorical": len(df.select_dtypes(include=['object', 'category']).columns),
        "missing": df.isnull().sum().sum(),
        "duplicates": df.duplicated().sum(),
        "memory": f"{df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB"
    }

# --- Sidebar Navigation ---
with st.sidebar:
    st.markdown("<h1 style='font-size: 2rem !important; margin-bottom: 0 !important;'>🧪 DataLens <span style='font-weight: 400'>Studio</span></h1>", unsafe_allow_html=True)
    st.caption("Minimalist Pro Edition • v4.0")
    
    navigation_items = {
        "📤 Upload Dataset": "upload",
        "📊 Dataset Overview": "overview",
        "🛡️ Data Quality": "quality",
        "🔍 Feature Explorer": "explorer",
        "🔗 Correlation Insights": "correlation",
        "❗ Outlier Detection": "outliers",
        "🧪 Preprocessing Lab": "lab",
        "🛠️ Feature Engineering": "engineering",
        "🤖 ML Problem Detection": "ml_detect",
        "💡 Model Suggestions": "suggestions",
        "📥 Export Clean Dataset": "export"
    }

    if 'studio_selection' not in st.session_state:
        st.session_state.studio_selection = "📤 Upload Dataset"

    for label, key in navigation_items.items():
        is_active = st.session_state.studio_selection == label
        active_class = "nav-active" if is_active else ""
        if st.button(label, key=f"nav_{key}", use_container_width=True, help=f"Go to {label}"):
            st.session_state.studio_selection = label
            st.rerun()

    selection = st.session_state.studio_selection

    st.markdown("---")
    if st.session_state.df_original is not None:
        with st.container():
            st.markdown(f"""
            <div style='background: #000; color: #fff; padding: 1rem; border-radius: 8px; font-size: 0.8rem; margin-top: 1rem;'>
                <p style='margin:0; opacity: 0.6;'>ACTIVE DATASET</p>
                <p style='margin:0; font-family: "JetBrains Mono", monospace;'>{st.session_state.df_original.shape[0]} rows × {st.session_state.df_original.shape[1]} cols</p>
            </div>
            """, unsafe_allow_html=True)

# --- Main App Logic ---

# --- Main App Logic ---

# 1. UPLOAD DATASET
if selection == "📤 Upload Dataset":
    st.markdown("<h1>📤 Dataset Upload</h1>", unsafe_allow_html=True)
    with st.container(border=True):
        uploaded_file = st.file_uploader("Upload your CSV file here", type=["csv"])
        if uploaded_file:
            df = pd.read_csv(uploaded_file)
            st.session_state.df_original = df.copy()
            st.session_state.df_processed = df.copy()
            st.toast("Dataset uploaded!", icon="✅")
            
            c1, c2, c3 = st.columns(3)
            stats = get_dataset_stats(df)
            with c1: st.metric("File Size", f"{uploaded_file.size / 1024:.1f} KB")
            with c2: st.metric("Rows", stats['rows'])
            with c3: st.metric("Memory", stats['memory'])
            
            st.markdown("### 📋 Preview")
            st.dataframe(df.head(10), use_container_width=True)
        else:
            st.info("👋 Welcome! Start by uploading your dataset above.")

# CHECK IF DATA EXISTS FOR OTHER SECTIONS
if st.session_state.df_processed is None and selection != "📤 Upload Dataset":
    st.warning("🚨 Please upload a dataset first to unlock the Studio features.")
    st.stop()

df = st.session_state.df_processed

if selection == "📊 Dataset Overview":
    st.markdown("<h1>📊 Dataset Overview</h1>", unsafe_allow_html=True)
    stats = get_dataset_stats(df)
    
    m1, m2, m3, m4, m5, m6 = st.columns(6)
    m1.metric("Total Rows", stats['rows'])
    m2.metric("Total Columns", stats['cols'])
    m3.metric("Numeric", stats['numeric'])
    m4.metric("Categorical", stats['categorical'])
    m5.metric("Missing", stats['missing'])
    m6.metric("Duplicates", stats['duplicates'])
    
    st.markdown("---")
    with st.container(border=True):
        st.subheader("🕵️ Data Explorer View")
        st.dataframe(df.head(15), use_container_width=True)

elif selection == "🛡️ Data Quality":
    st.markdown("<h1>🛡️ Data Quality Report</h1>", unsafe_allow_html=True)
    
    col1, col2 = st.columns([1.2, 2])
    
    with col1:
        st.subheader("⚠️ Missing Summary")
        missing_df = df.isnull().sum().reset_index()
        missing_df.columns = ['Column', 'Count']
        missing_df['%'] = (missing_df['Count'] / len(df) * 100).round(1).astype(str) + '%'
        st.dataframe(missing_df[missing_df['Count'] > 0], use_container_width=True)
        
        st.markdown("---")
        st.subheader("📉 Skewness Analysis")
        num_cols = df.select_dtypes(include=[np.number]).columns
        skew_data = []
        for col in num_cols:
            s = skew(df[col].dropna())
            if abs(s) > 1: skew_data.append({"Feature": col, "Skew": round(s, 2)})
        if skew_data: st.table(pd.DataFrame(skew_data))
        else: st.success("No highly skewed features!")

    with col2:
        if df.isnull().sum().sum() > 0:
            fig = px.bar(missing_df[missing_df['Count'] > 0], x='Column', y='Count', 
                         title="Missing Values Heatmap (Count)", color='Count',
                         color_continuous_scale='Reds')
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.success("✨ Your data is perfectly complete!")

elif selection == "🔍 Feature Explorer":
    st.markdown("<h1>🔍 Feature Explorer</h1>", unsafe_allow_html=True)
    col = st.selectbox("Select Feature to Visualize", df.columns)
    
    with st.container(border=True):
        if col in df.select_dtypes(include=[np.number]).columns:
            c1, c2 = st.columns(2)
            with c1:
                fig_hist = px.histogram(df, x=col, title=f"Distribution Profile: {col}", marginal="box", opacity=0.8)
                st.plotly_chart(fig_hist, use_container_width=True)
            with c2:
                fig_kde = px.violin(df, y=col, box=True, points="all", title=f"Statistical Density: {col}")
                st.plotly_chart(fig_kde, use_container_width=True)
            
            sc1, sc2, sc3, sc4 = st.columns(4)
            desc = df[col].describe()
            sc1.metric("Mean", round(desc['mean'], 2))
            sc2.metric("Median", round(df[col].median(), 2))
            sc3.metric("Std Dev", round(desc['std'], 2))
            sc4.metric("Max", round(desc['max'], 2))
        else:
            vc = df[col].value_counts().reset_index()
            fig_bar = px.bar(vc, x='index', y=col, title=f"Categorical Distribution: {col}", color=col)
            st.plotly_chart(fig_bar, use_container_width=True)

elif selection == "🔗 Correlation Insights":
    st.markdown("<h1>🔗 Correlation Matrix</h1>", unsafe_allow_html=True)
    num_df = df.select_dtypes(include=[np.number])
    if num_df.shape[1] > 1:
        corr = num_df.corr()
        fig = px.imshow(corr, text_auto=".2f", color_continuous_scale='RdBu_r', 
                        title="Feature Correlation Heatmap", aspect="auto")
        st.plotly_chart(fig, use_container_width=True)
        
        with st.container(border=True):
            st.subheader("💡 High-Correlation Warnings")
            high_corr = []
            for i in range(len(corr.columns)):
                for j in range(i):
                    if abs(corr.iloc[i, j]) > 0.8:
                        high_corr.append(f"**{corr.columns[i]}** and **{corr.columns[j]}** are highly linked ({corr.iloc[i, j]:.2f})")
            
            if high_corr: st.markdown("\n".join([f"- {h}" for h in high_corr]))
            else: st.info("No redundant features detected.")
    else:
        st.warning("Correlation requires at least two numeric features.")

elif selection == "❗ Outlier Detection":
    st.markdown("<h1>❗ Outlier Analysis</h1>", unsafe_allow_html=True)
    num_cols = df.select_dtypes(include=[np.number]).columns
    selected_col = st.selectbox("Target Column", num_cols)
    
    Q1 = df[selected_col].quantile(0.25)
    Q3 = df[selected_col].quantile(0.75)
    IQR = Q3 - Q1
    lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
    
    outliers = df[(df[selected_col] < lower) | (df[selected_col] > upper)]
    
    col1, col2 = st.columns([1, 2])
    with col1:
        st.metric("Outlier Count", len(outliers))
        if len(outliers) > 0:
            if st.button("🚀 Clean Outliers Now"):
                df = df[(df[selected_col] >= lower) & (df[selected_col] <= upper)]
                st.session_state.df_processed = df
                st.toast("Outliers removed!", icon="🧹")
                st.rerun()
    
    with col2:
        fig = px.box(df, y=selected_col, title=f"Boxplot Visualization: {selected_col}", points="outliers")
        st.plotly_chart(fig, use_container_width=True)

elif selection == "🧪 Preprocessing Lab":
    st.markdown("<h1>🧪 Preprocessing Lab</h1>", unsafe_allow_html=True)
    
    with st.container(border=True):
        tab1, tab2, tab3 = st.tabs(["🧩 Imputation", "🏷️ Encoding", "📏 Scaling"])
        
        with tab1:
            missing_cols = df.columns[df.isnull().any()]
            if len(missing_cols) > 0:
                col_miss = st.selectbox("Field to Impute", missing_cols)
                method = st.radio("Strategy", ["Mean", "Median", "Mode", "Drop"], horizontal=True)
                if st.button("Apply Cleaning", key="impute"):
                    if method == "Drop": df.dropna(subset=[col_miss], inplace=True)
                    elif method == "Mode": df[col_miss].fillna(df[col_miss].mode()[0], inplace=True)
                    elif method == "Median": df[col_miss].fillna(df[col_miss].median(), inplace=True)
                    else: df[col_miss].fillna(df[col_miss].mean(), inplace=True)
                    st.session_state.df_processed = df
                    st.rerun()
            else: st.success("No missing values to impute!")

        with tab2:
            cat_cols = df.select_dtypes(include=['object']).columns
            if len(cat_cols) > 0:
                cat_col = st.selectbox("Categorical Feature", cat_cols)
                enc_method = st.radio("Type", ["Label", "One-Hot"], horizontal=True)
                if st.button("Transform Labels", key="encode"):
                    if enc_method == "Label":
                        df[cat_col] = LabelEncoder().fit_transform(df[cat_col].astype(str))
                    else:
                        df = pd.get_dummies(df, columns=[cat_col])
                    st.session_state.df_processed = df
                    st.rerun()
            else: st.info("All categorical features already processed.")

        with tab3:
            scale_cols = st.multiselect("Numeric Features to Scale", df.select_dtypes(include=[np.number]).columns)
            scale_method = st.radio("Scaler Type", ["Standard", "MinMax", "Robust"], horizontal=True)
            if st.button("Apply Scaling", key="scale"):
                scaler = StandardScaler() if scale_method == "Standard" else MinMaxScaler() if scale_method == "MinMax" else RobustScaler()
                df[scale_cols] = scaler.fit_transform(df[scale_cols])
                st.session_state.df_processed = df
                st.rerun()

elif selection == "🛠️ Feature Engineering":
    st.markdown("<h1>🛠️ Feature Engineering</h1>", unsafe_allow_html=True)
    
    with st.container(border=True):
        st.subheader("🖋️ Formula-Based Creator")
        c1, c2 = st.columns(2)
        new_name = c1.text_input("Feature Name", placeholder="e.g. debt_to_income")
        expr = c2.text_input("Formula", placeholder="e.g. Debt / Income")
        if st.button("Create Feature", use_container_width=True):
            try:
                st.session_state.df_processed = df.eval(f"{new_name} = {expr}")
                st.toast("Feature synthesized!", icon="🧪")
                st.rerun()
            except Exception as e: st.error(f"Computation error: {e}")

    with st.container(border=True):
        st.subheader("⚡ Quick Transformations")
        tc1, tc2 = st.columns(2)
        t_col = tc1.selectbox("Column", df.select_dtypes(include=[np.number]).columns)
        t_type = tc2.radio("Transform", ["Log", "Sqrt", "Poly"], horizontal=True)
        if st.button("Apply Transformation", use_container_width=True):
            if t_type == "Log": df[f"log_{t_col}"] = np.log1p(df[t_col])
            elif t_type == "Sqrt": df[f"sqrt_{t_col}"] = np.sqrt(df[t_col])
            else: df[f"sq_{t_col}"] = df[t_col] ** 2
            st.session_state.df_processed = df
            st.rerun()

elif selection == "🤖 ML Problem Detection":
    st.markdown("<h1>🤖 AI Intelligence</h1>", unsafe_allow_html=True)
    target = st.selectbox("Define Target Variable", df.columns)
    st.session_state.target_column = target
    
    if target:
        is_num = df[target].dtype in [np.float64, np.int64]
        distinct = df[target].nunique()
        problem = "Regression" if is_num and distinct > 15 else "Classification"
        
        st.markdown(f'<div class="insight-card"><h3>🎯 Target Analysis: {target}</h3>'
                    f'<p>My AI engine detects a <b>{problem}</b> task. '
                    f'The target variable contains {distinct} distinct values.</p></div>', 
                    unsafe_allow_html=True)

elif selection == "💡 Model Suggestions":
    st.markdown("<h1>💡 Model Recommendations</h1>", unsafe_allow_html=True)
    target = st.session_state.target_column
    if not target:
        st.info("👈 Please select a target column in the **ML Problem Detection** tab first.")
    else:
        is_num = df[target].dtype in [np.float64, np.int64]
        distinct = df[target].nunique()
        problem = "Regression" if is_num and distinct > 15 else "Classification"
        
        st.subheader(f"Optimal Models for {problem}")
        
        cols = st.columns(3)
        if problem == "Classification":
            with cols[0]:
                st.markdown("### 🌲 Random Forest")
                st.caption("Best for mixed data & robustness.")
            with cols[1]:
                st.markdown("### 🚀 Gradient Boosting")
                st.caption("Top-tier accuracy for complex patterns.")
            with cols[2]:
                st.markdown("### 📈 Logistic Reg")
                st.caption("Perfect for simple, fast baselines.")
        else:
            with cols[0]:
                st.markdown("### 🏠 Linear Regression")
                st.caption("Interpretable & simple trends.")
            with cols[1]:
                st.markdown("### 🌳 RF Regressor")
                st.caption("Handles non-linear numeric trends.")
            with cols[2]:
                st.markdown("### 🌪️ XGBoost/LGBM")
                st.caption("SOTA performance for regressions.")

elif selection == "📥 Export Clean Dataset":
    st.markdown("<h1>📥 Export Hub</h1>", unsafe_allow_html=True)
    col1, col2 = st.columns([1, 1.5])
    
    with col1:
        st.metric("Final Rows", df.shape[0])
        st.metric("Final Features", df.shape[1])
        csv = df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="💾 Download Processed CSV",
            data=csv,
            file_name='datalens_studio_export.csv',
            mime='text/csv',
            use_container_width=True
        )
    
    with col2:
        with st.container(border=True):
            st.subheader("📑 Generation Summary")
            st.markdown(f"""
            - **Status:** Cleansed & Ready
            - **Missing Data:** {'None' if df.isnull().sum().sum() == 0 else f"{df.isnull().sum().sum()} fields"}
            - **Target Identified:** {st.session_state.get('target_column', 'Not Set')}
            - **Export Format:** UTF-8 CSV
            """)
