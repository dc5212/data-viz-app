import queue
import threading
import time
from datetime import datetime
import pandas as pd
import json
import os
from models import Task, CarSale, get_db

# Create a queue for tasks
task_queue = queue.Queue()

def process_task(task_id):
    """Process a task with the given ID."""
    db = get_db()
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        print(f"Task {task_id} not found")
        return
    
    # Update task status to in_progress
    task.status = "in_progress"
    db.commit()
    
    # Simulate delay
    time.sleep(5)
    
    try:
        # Retrieve parameters
        params = task.parameters
        start_year = params.get('start_year', 2020)
        end_year = params.get('end_year', 2025)
        companies_filter = params.get('companies', [])
        
        # Process source A (JSON)
        source_a_data = process_source_a(task_id, start_year, end_year, companies_filter)
        
        # Process source B (CSV)
        source_b_data = process_source_b(task_id, start_year, end_year, companies_filter)
        
        # Save data to database
        for sale in source_a_data + source_b_data:
            db.add(sale)
        
        # Update task status to completed
        task.status = "completed"
        db.commit()
        
    except Exception as e:
        # Handle errors
        print(f"Error processing task {task_id}: {e}")
        task.status = "failed"
        db.commit()
    finally:
        db.close()


def process_source_a(task_id, start_year, end_year, companies_filter):
    """Process JSON data from source A."""
    # In a real app, this might be a URL request
    with open(os.path.join('..', 'data', 'dealer1.json'), 'r') as f:
        data = json.load(f)
    
    results = []
    
    for item in data:
        sale_date = datetime.strptime(item['sale_date'], '%Y-%m-%d')
        
        # Apply filters
        sale_year = sale_date.year
        if sale_year < start_year or sale_year > end_year:
            continue
            
        if companies_filter and item['company'] not in companies_filter:
            continue
        
        # Create CarSale object
        sale = CarSale(
            task_id=task_id,
            source='source_a',
            company=item['company'],
            model=item['model'],
            sale_date=sale_date,
            price=float(item['price'])
        )
        results.append(sale)
    
    return results


def process_source_b(task_id, start_year, end_year, companies_filter):
    """Process CSV data from source B."""
    # In a real app, this might be a URL request
    df = pd.read_csv(os.path.join('..', 'data', 'dealer2.csv'))
    
    results = []
    
    for _, row in df.iterrows():
        sale_date = datetime.strptime(row['sale_date'], '%Y-%m-%d')
        
        # Apply filters
        sale_year = sale_date.year
        if sale_year < start_year or sale_year > end_year:
            continue
            
        if companies_filter and row['company'] not in companies_filter:
            continue
        
        # Create CarSale object
        sale = CarSale(
            task_id=task_id,
            source='source_b',
            company=row['company'],
            model=row['model'],
            sale_date=sale_date,
            price=float(row['price'])
        )
        results.append(sale)
    
    return results


def worker():
    """Worker function to process tasks from the queue."""
    while True:
        task_id = task_queue.get()
        process_task(task_id)
        task_queue.task_done()


# Start worker thread
worker_thread = threading.Thread(target=worker, daemon=True)
worker_thread.start()

def add_task_to_queue(task_id):
    """Add a task to the processing queue."""
    task_queue.put(task_id)