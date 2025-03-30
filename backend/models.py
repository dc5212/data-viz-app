from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, create_engine, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import json
import os

Base = declarative_base()

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True)
    status = Column(String, default='pending')  # pending, in_progress, completed
    parameters = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to CarSale
    sales = relationship("CarSale", back_populates="task", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'status': self.status,
            'parameters': self.parameters,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CarSale(Base):
    __tablename__ = 'car_sales'
    
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey('tasks.id'))
    source = Column(String)  # 'source_a' or 'source_b'
    
    # Car sale data
    company = Column(String)
    model = Column(String)
    sale_date = Column(DateTime)
    price = Column(Float)
    
    # Relationship to Task
    task = relationship("Task", back_populates="sales")
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'source': self.source,
            'company': self.company,
            'model': self.model,
            'sale_date': self.sale_date.isoformat(),
            'price': self.price
        }


# Create database engine and session
DB_PATH = os.environ.get('DB_PATH', 'sqlite:///car_sales.db')
engine = create_engine(DB_PATH)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Get a database session
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()