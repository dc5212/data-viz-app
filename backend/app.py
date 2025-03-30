from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from models import Task, CarSale, get_db, init_db
from queue_manager import add_task_to_queue
from datetime import datetime
from sqlalchemy import func, extract

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the database
init_db()

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks."""
    db = get_db()
    tasks = db.query(Task).all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task."""
    data = request.json
    
    # Create new task
    db = get_db()
    task = Task(parameters=data)
    db.add(task)
    db.commit()
    
    # Add task to processing queue
    add_task_to_queue(task.id)
    
    return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task."""
    db = get_db()
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
        
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>/data', methods=['GET'])
def get_task_data(task_id):
    """Get data for a specific task."""
    db = get_db()
    
    # Check if task exists and is completed
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404
    if task.status != "completed":
        return jsonify({"error": "Task not completed yet"}), 400
    
    # Get filter parameters
    company = request.args.get('company')
    year = request.args.get('year')
    
    # Query sales data
    query = db.query(CarSale).filter(CarSale.task_id == task_id)
    
    # Apply filters if provided
    if company and company != 'All Companies':
        query = query.filter(CarSale.company == company)
    if year and year != 'All Years':
        # Use extract for more reliable year filtering across different DB backends
        query = query.filter(extract('year', CarSale.sale_date) == int(year))
    
    sales = query.all()
    return jsonify([sale.to_dict() for sale in sales])

@app.route('/api/tasks/<int:task_id>/analytics', methods=['GET'])
def get_task_analytics(task_id):
    """Get analytics data for visualizations with optional filters."""
    db = get_db()
    
    # Check if task exists and is completed
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404
    if task.status != "completed":
        return jsonify({"error": "Task not completed yet"}), 400
    
    # Get filter parameters
    company = request.args.get('company')
    year = request.args.get('year')
    
    # Build the query with task_id filter
    query = db.query(CarSale).filter(CarSale.task_id == task_id)
    
    # Apply company filter if provided and not 'All Companies'
    if company and company != 'All Companies':
        query = query.filter(CarSale.company == company)
        
    # Apply year filter if provided and not 'All Years'
    if year and year != 'All Years':
        # Use extract for more reliable year filtering across different DB backends
        query = query.filter(extract('year', CarSale.sale_date) == int(year))
    
    # Get filtered sales
    sales = query.all()
    
    # Prepare data for timeline chart (sales by month)
    timeline_data = {}
    for sale in sales:
        month_key = sale.sale_date.strftime('%Y-%m')
        if month_key not in timeline_data:
            timeline_data[month_key] = 0
        timeline_data[month_key] += 1
    
    # Sort the timeline data by date
    sorted_timeline_data = dict(sorted(timeline_data.items()))
    timeline_chart = [{"date": k, "count": v} for k, v in sorted_timeline_data.items()]
    
    # Prepare data for bar chart (sales by company)
    company_data = {}
    for sale in sales:
        company = sale.company
        if company not in company_data:
            company_data[company] = 0
        company_data[company] += 1
    
    # Sort companies by count (descending) for better visualization
    sorted_company_data = dict(sorted(company_data.items(), key=lambda item: item[1], reverse=True))
    bar_chart = [{"company": k, "count": v} for k, v in sorted_company_data.items()]
    
    # Add price analysis data (average price by company)
    price_data = {}
    for sale in sales:
        company = sale.company
        if company not in price_data:
            price_data[company] = {'total': 0, 'count': 0}
        price_data[company]['total'] += sale.price
        price_data[company]['count'] += 1
    
    price_chart = []
    for company, data in price_data.items():
        avg_price = round(data['total'] / data['count'], 2)
        price_chart.append({"company": company, "avg_price": avg_price})
    
    # Return all analytics data
    return jsonify({
        "timeline_chart": timeline_chart,
        "bar_chart": bar_chart,
        "price_chart": price_chart  # Added price analysis
    })

@app.route('/api/companies', methods=['GET'])
def get_companies():
    """Get a list of all unique companies in the database."""
    db = get_db()
    companies = db.query(CarSale.company).distinct().all()
    return jsonify([company[0] for company in companies])

@app.route('/api/years', methods=['GET'])
def get_years():
    """Get a list of all unique years in the database."""
    db = get_db()
    years = db.query(extract('year', CarSale.sale_date)).distinct().all()
    return jsonify([year[0] for year in years])

if __name__ == '__main__':
    app.run(debug=True)