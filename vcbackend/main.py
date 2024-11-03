from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64
from openai import OpenAI
import os
from typing import Dict, Union
from pydub import AudioSegment

client = OpenAI(api_key="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")
news_audio_path = "/Users/ashwinv/Downloads/AudioNewsByte/vcbackend/Spain floods death toll rises as rescuers continue search for survivors  BBC News.mp3"
summary_model = "gpt-4o-mini"
qa_model = "gpt-4o-mini"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/new-news")
async def get_news():
    def transcribe_audio(audio_path: str) -> Dict[str, Union[str, list, None]]:
        try:
            if not os.path.exists(audio_path):
                raise FileNotFoundError(f"Audio file not found: {audio_path}")
                
            valid_extensions = ('.mp3', '.wav', '.m4a', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm')
            if not audio_path.lower().endswith(valid_extensions):
                raise ValueError(f"File must be an audio file with one of these extensions: {valid_extensions}")
            
            with open(audio_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json"
                )
                
            return {
                "text": transcription.text,
                "status": "success",
                "language": transcription.language,
                "duration": transcription.duration
            }
            
        except Exception as e:
            return {
                "text": None,
                "status": "error",
                "error_message": str(e)
            }

    result = transcribe_audio(news_audio_path)

    system_prompt = """ 
    You are a precise and comprehensive news summarizer. Your task is to condense news articles into two well-structured paragraphs while maintaining all crucial information...
    """  # (keeping the rest of the system prompt as is)

    user_prompt = f""" 
    Please provide a two-paragraph summary of the following news article, focusing on the key information and maintaining the original context. The article text is enclosed below:
    {result["text"]}
    Please follow the summarization guidelines provided in the system prompt, ensuring that all critical information is captured while maintaining clarity and conciseness.
    """

    response = client.chat.completions.create(
        model=summary_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=256,
        n=1,
        temperature=0.3,
    )

    summary = response.choices[0].message.content.strip()

    response_tts = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=summary,
    )

    # Save the audio file temporarily
    temp_audio_path = "./summary_news_tts_output.mp3"
    response_tts.stream_to_file(temp_audio_path)

    # Read the audio file and convert to base64
    with open(temp_audio_path, "rb") as audio_file:
        audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')

    # Clean up the temporary file
    os.remove(temp_audio_path)

    # Return both summary and audio as JSON
    return JSONResponse({
        "summary": summary,
        "audio": audio_base64,
        "status": "success"
    })

@app.post("/ask_a_question")
async def ask_a_question(audio: UploadFile = File(...)):
    try:
        # Create a temporary file to store the uploaded audio
        temp_audio_path = "temp_question.mp3"
        
        # Write the uploaded file to disk
        with open(temp_audio_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        
        # Print the audio file path for checking
        print(f"Received audio file: {temp_audio_path}")
        print(f"Audio file size: {os.path.getsize(temp_audio_path)} bytes")

        


          # Convert to MP3 format
        # mp3_audio_path = "temp_question.mp3"
        # audio_segment = AudioSegment.from_file(temp_audio_path)  # Load the audio file
        # audio_segment.export(mp3_audio_path, format="mp3")  # Export as MP3
        
        # Clean up the temporary file
        # os.remove(temp_audio_path)
        
        return JSONResponse({
            "status": "success",
            "message": "Audio received successfully",
            "audio_file": temp_audio_path
        })
        
    except Exception as e:
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)