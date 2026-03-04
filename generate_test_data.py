import pandas as pd
import numpy as np

# Create synthetic dataset
np.random.seed(42)
n_samples = 200

data = {
    'Age': np.random.randint(18, 70, n_samples),
    'Income': np.random.randint(20000, 150000, n_samples),
    'SpendingScore': np.random.randint(1, 100, n_samples),
    'Education': np.random.choice(['High School', 'Bachelor', 'Master', 'PhD'], n_samples),
    'City': np.random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston'], n_samples),
    'Purchased': np.random.choice([0, 1], n_samples)
}

df = pd.DataFrame(data)

# Add some correlations
df['SpendingScore'] = 0.5 * df['Income'] / 1000 + np.random.randint(-10, 10, n_samples)

# Add some missing values
df.loc[10:20, 'Income'] = np.nan
df.loc[50:55, 'Education'] = np.nan

# Add some outliers
df.loc[0, 'Age'] = 150
df.loc[1, 'Income'] = 1000000

df.to_csv('sample_data.csv', index=False)
print("sample_data.csv created successfully.")
