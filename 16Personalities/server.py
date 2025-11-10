import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load model, encoder, and feature columns
# columns means questions
model = joblib.load("pkl/model.pkl")       
le = joblib.load("pkl/encoder.pkl")        
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

# Pydantic model for input
class InputData(BaseModel):
    data: dict

@app.get("/columns")
def get_columns():
    return {"columns": columns}

@app.post("/predict")
def predict(input_data: InputData):
    df = pd.DataFrame([input_data.data], columns=columns)
    result_encoded = model.predict(df)
    mbti = le.inverse_transform(result_encoded)[0]
    return {"personality": mbti}

# How to run?
# uvicorn server:app --reload --host 0.0.0.0 --port 8000