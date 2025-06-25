from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel
from typing import List, Optional
import os
import jwt
import requests
import uuid
from datetime import datetime
import asyncpg
import asyncio

# FastAPI app setup
app = FastAPI(title="LinkedIn Clone API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/linkedin_clone")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
security = HTTPBearer()

# Environment variables
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")

# Database Models
class User(Base):
    __tablename__ = "profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    headline = Column(String)
    about = Column(Text)
    location = Column(String)
    website = Column(String)
    avatar_url = Column(String)
    banner_url = Column(String)
    connections_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    content = Column(Text, nullable=False)
    media_urls = Column(ARRAY(String))
    post_type = Column(String, default="user")
    source_id = Column(UUID(as_uuid=True))
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    author = relationship("User")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    posted_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    location = Column(String)
    job_type = Column(String, default="full-time")
    experience_level = Column(String)
    remote_work = Column(Boolean, default=False)
    status = Column(String, default="active")
    applications_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    website = Column(String)
    logo_url = Column(String)
    industry = Column(String)
    location = Column(String)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Connection(Base):
    __tablename__ = "connections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    status = Column(String, default="pending")
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime)

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    content = Column(Text)
    media_url = Column(String)
    message_type = Column(String, default="text")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sender = relationship("User")

# Pydantic models
class PostCreate(BaseModel):
    content: str
    media_urls: Optional[List[str]] = []
    post_type: Optional[str] = "user"
    source_id: Optional[str] = None

class JobSearch(BaseModel):
    query: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    remote_work: Optional[bool] = None
    page: Optional[int] = 1
    limit: Optional[int] = 20

class MessageCreate(BaseModel):
    recipient_id: Optional[str] = None
    conversation_id: Optional[str] = None
    content: Optional[str] = None
    media_url: Optional[str] = None

# Dependency functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# AI Integration
async def call_perplexity_ai(prompt: str, model: str = "llama-3.1-sonar-small-128k-online"):
    if not PERPLEXITY_API_KEY:
        raise HTTPException(status_code=500, detail="Perplexity API key not configured")
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://api.perplexity.ai/chat/completions",
            headers={
                "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000,
                "temperature": 0.7
            }
        ) as response:
            if response.status != 200:
                raise HTTPException(status_code=500, detail="AI service error")
            
            data = await response.json()
            return {
                "content": data["choices"][0]["message"]["content"],
                "usage": data.get("usage")
            }

# API Routes

@app.get("/")
async def root():
    return {"message": "LinkedIn Clone API"}

@app.get("/api/feed")
async def get_feed(
    page: int = 1,
    limit: int = 20,
    type: str = "all",
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get user's feed with pagination"""
    offset = (page - 1) * limit
    
    query = db.query(Post).join(User).order_by(Post.created_at.desc())
    
    if type == "connections":
        # Get user's connections
        connections = db.query(Connection).filter(
            ((Connection.requester_id == current_user) | (Connection.receiver_id == current_user)) &
            (Connection.status == "accepted")
        ).all()
        
        connection_ids = [
            conn.receiver_id if conn.requester_id == current_user else conn.requester_id
            for conn in connections
        ]
        connection_ids.append(current_user)
        
        query = query.filter(Post.author_id.in_(connection_ids))
    
    posts = query.offset(offset).limit(limit).all()
    
    # Process posts
    processed_posts = []
    for post in posts:
        post_dict = {
            "id": str(post.id),
            "content": post.content,
            "media_urls": post.media_urls or [],
            "post_type": post.post_type,
            "likes_count": post.likes_count,
            "comments_count": post.comments_count,
            "shares_count": post.shares_count,
            "created_at": post.created_at.isoformat(),
            "author": {
                "id": str(post.author.id),
                "name": post.author.name,
                "avatar_url": post.author.avatar_url
            }
        }
        processed_posts.append(post_dict)
    
    total = query.count()
    
    return {
        "posts": processed_posts,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    }

@app.post("/api/posts")
async def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new post"""
    if not post.content.strip():
        raise HTTPException(status_code=400, detail="Post content cannot be empty")
    
    if len(post.content) > 3000:
        raise HTTPException(status_code=400, detail="Post content too long (max 3000 characters)")
    
    new_post = Post(
        author_id=current_user,
        content=post.content,
        media_urls=post.media_urls,
        post_type=post.post_type,
        source_id=post.source_id
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return {
        "post": {
            "id": str(new_post.id),
            "content": new_post.content,
            "media_urls": new_post.media_urls,
            "post_type": new_post.post_type,
            "likes_count": new_post.likes_count,
            "comments_count": new_post.comments_count,
            "created_at": new_post.created_at.isoformat()
        }
    }

@app.get("/api/jobs/search")
async def search_jobs(
    query: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    remote_work: Optional[bool] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Search jobs with filters"""
    offset = (page - 1) * limit
    
    job_query = db.query(Job).filter(Job.status == "active")
    
    if query:
        job_query = job_query.filter(
            (Job.title.ilike(f"%{query}%")) | (Job.description.ilike(f"%{query}%"))
        )
    
    if location:
        job_query = job_query.filter(Job.location.ilike(f"%{location}%"))
    
    if job_type:
        job_query = job_query.filter(Job.job_type == job_type)
    
    if remote_work is not None:
        job_query = job_query.filter(Job.remote_work == remote_work)
    
    jobs = job_query.offset(offset).limit(limit).all()
    total = job_query.count()
    
    return {
        "jobs": [
            {
                "id": str(job.id),
                "title": job.title,
                "description": job.description,
                "location": job.location,
                "job_type": job.job_type,
                "remote_work": job.remote_work,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "applications_count": job.applications_count,
                "created_at": job.created_at.isoformat()
            }
            for job in jobs
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    }

@app.get("/api/jobs/recommendations")
async def get_job_recommendations(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get AI-powered job recommendations"""
    # Get user profile
    user = db.query(User).filter(User.id == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get available jobs (simplified for example)
    jobs = db.query(Job).filter(Job.status == "active").limit(50).all()
    
    if not jobs:
        return {"recommendations": [], "message": "No jobs available"}
    
    # Create AI prompt
    prompt = f"""
    Based on this user profile:
    - Name: {user.name}
    - Headline: {user.headline or 'Not specified'}
    - Location: {user.location or 'Not specified'}
    - About: {user.about or 'Not specified'}
    
    Recommend the top {limit} jobs from these options:
    {chr(10).join([f"- {job.title} at {job.company_id} in {job.location}" for job in jobs[:10]])}
    
    Provide recommendations with match scores (0-100) and reasons.
    Format as JSON: [{"jobId": "uuid", "matchScore": 85, "reasons": ["reason1", "reason2"]}]
    """
    
    try:
        ai_response = await call_perplexity_ai(prompt)
        # Process AI response and match with jobs
        # For demo purposes, return first few jobs
        recommendations = [
            {
                "job": {
                    "id": str(job.id),
                    "title": job.title,
                    "location": job.location,
                    "job_type": job.job_type
                },
                "match_score": 85,  # Would come from AI
                "match_reasons": ["Skills match", "Location preference"]
            }
            for job in jobs[:limit]
        ]
        
        return {"recommendations": recommendations}
    except Exception as e:
        # Fallback to simple recommendations
        return {
            "recommendations": [
                {
                    "job": {
                        "id": str(job.id),
                        "title": job.title,
                        "location": job.location,
                        "job_type": job.job_type
                    },
                    "match_score": 75,
                    "match_reasons": ["General match"]
                }
                for job in jobs[:limit]
            ]
        }

@app.post("/api/messages")
async def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Send a message"""
    if not message.content and not message.media_url:
        raise HTTPException(status_code=400, detail="Message content or media is required")
    
    # Generate conversation ID if not provided
    conversation_id = message.conversation_id or str(uuid.uuid4())
    
    new_message = Message(
        conversation_id=conversation_id,
        sender_id=current_user,
        content=message.content,
        media_url=message.media_url
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return {
        "message": {
            "id": str(new_message.id),
            "conversation_id": conversation_id,
            "content": new_message.content,
            "media_url": new_message.media_url,
            "created_at": new_message.created_at.isoformat()
        }
    }

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    bucket: str = Form(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Upload a file"""
    # Validate file size and type
    max_sizes = {
        'avatars': 5 * 1024 * 1024,  # 5MB
        'resumes': 10 * 1024 * 1024,  # 10MB
        'post-media': 50 * 1024 * 1024  # 50MB
    }
    
    if bucket not in max_sizes:
        raise HTTPException(status_code=400, detail="Invalid bucket")
    
    # In a real implementation, you would save to cloud storage
    # For demo, we'll just return a mock response
    file_path = f"{bucket}/{current_user}/{file.filename}"
    
    return {
        "path": file_path,
        "public_url": f"https://storage.example.com/{file_path}",
        "file_name": file.filename,
        "file_size": file.size,
        "bucket": bucket
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)