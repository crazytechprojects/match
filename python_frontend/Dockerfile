FROM python:3.13

COPY requirements.txt /home/requirements.txt
RUN pip install -r /home/requirements.txt

COPY app /home/app

# ENV PYTHONPATH=/home:${PYTHONPATH}
ENV PYTHONPATH=/home
WORKDIR /home/app

CMD ["streamlit", "run", "main.py", "--server.address", "0.0.0.0", "--server.port", "8501"]

