import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from groq import Groq
import pypdf
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

frontend_url = os.environ.get("FRONTEND_URL", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url], 
    allow_credentials=True, # Recommended for file uploads
    allow_methods=["*"],
    allow_headers=["*"],
)

# In main.py
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    # This helps you see the error in Railway logs if you forgot to add the key
    print("WARNING: GROQ_API_KEY is not set in environment variables")

client = Groq(api_key=api_key)

store = {"text": ""}

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not client:
        raise HTTPException(status_code=500, detail="API Key not configured")
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        reader = pypdf.PdfReader(file.file)
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
        
        if not full_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text. Is it a scanned image?")
        
        store["text"] = full_text
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Summarize the document in 3-5 clear bullet points."},
                {"role": "user", "content": full_text[:12000]} 
            ],
            temperature=0.3,
        )
        return {"summary": response.choices[0].message.content}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask")
async def ask_question(question: str = Form(...)):
    if not store["text"]:
        raise HTTPException(status_code=400, detail="Please upload a PDF first")
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system", 
                    "content": f"Answer based ONLY on this text:\n\n{store['text'][:15000]}"
                },
                {"role": "user", "content": question}
            ],
            temperature=0.2,
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI Service Error")

