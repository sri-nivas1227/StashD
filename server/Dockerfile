FROM python:3.14-slim

WORKDIR /server

COPY ./requirements.txt .
RUN pip install --no-cache-dir gunicorn -r requirements.txt

COPY . .

CMD [ "gunicorn","--no-control-socket", "--bind", "0.0.0.0:5000", "app:app" ]
