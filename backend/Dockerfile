FROM python:3.13

COPY requirements.txt /home/requirements.txt
RUN pip install -r /home/requirements.txt

COPY app /home/app

# ENV PYTHONPATH=/home:${PYTHONPATH}
ENV PYTHONPATH=/home
WORKDIR /home/app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD ["hypercorn", "main:app", "--bind", "::1:8000", "--bind", "0.0.0.0:8000"]
# Hypercorn==0.17.3
