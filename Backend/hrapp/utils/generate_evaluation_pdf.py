import base64
from io import BytesIO
from django.template.loader import render_to_string
#from weasyprint import HTML


"""def generate_evaluation_pdf(evaluation_data):
    #COMMENT HERE  
    Generates a PDF from evaluation data (dict), including base64 images for charts.
    Returns PDF bytes.
    #COMMENT HERE

    # Render HTML using a Django template (to be created)
    html_content = render_to_string('evaluation_pdf_template.html', {
        'role': evaluation_data.get('role', ''),
        'date': evaluation_data.get('date', ''),
        'professor_name': evaluation_data.get('professor_name', ''),
        'section': evaluation_data.get('section', ''),
        'subject': evaluation_data.get('subject', ''),
        'room': evaluation_data.get('room', ''),
        'program': evaluation_data.get('program', ''),
        'start_time': evaluation_data.get('start_time', ''),
        'end_time': evaluation_data.get('end_time', ''),
        'semester': evaluation_data.get('semester', ''),
        'pie_chart_img': evaluation_data.get('pie_chart_img', ''),
        'chart_img': evaluation_data.get('chart_img', ''),
        'ai_summary': evaluation_data.get('ai_summary', ''),
        # Add more fields as needed
    })
    

    # Generate PDF from HTML
    pdf_file = BytesIO()
    #HTML(string=html_content).write_pdf(pdf_file)
    pdf_file.seek(0)
    return pdf_file.read()
"""