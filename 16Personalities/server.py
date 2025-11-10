import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load model, encoder, and feature columns
model = joblib.load("pkl/model.pkl")
encoder = joblib.load("pkl/encoder.pkl")
columns = joblib.load("pkl/columns.pkl")

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    data: dict

@app.get("/columns")
def get_columns():
    return {"columns": columns}

@app.post("/predict")
def predict(input_data: InputData):
    df = pd.DataFrame([input_data.data], columns=columns)
    result = model.predict(df)
    idx = result[0].argmax()
    mbti = encoder.categories_[0][idx]
    return {"personality": mbti}

# How to run? 
# uvicorn server:app --reload --port 8000 