import os, json
import joblib
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from config import ART_DIR, TEST_SPLIT, RANDOM_SEED

ART_REG = os.path.join(ART_DIR, "regressor.pkl")

def load_xy():
    npz = np.load(os.path.join(ART_DIR, "embeddings.npz"))
    X = npz["X"]
    y = np.load(os.path.join(ART_DIR, "labels.npy"))
    return X, y

def train():
    X, y = load_xy()
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=TEST_SPLIT, random_state=RANDOM_SEED)
    model = Ridge(alpha=1.0)
    model.fit(Xtr, ytr)
    pred = model.predict(Xte)
    rmse = mean_squared_error(yte, pred, squared=False)
    r2 = r2_score(yte, pred)
    joblib.dump(model, ART_REG)
    print(f"[train] saved {ART_REG} | test RMSE={rmse:.4f} R2={r2:.3f}")

if __name__ == "__main__":
    train()
