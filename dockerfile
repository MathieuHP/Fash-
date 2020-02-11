FROM python:3.7.3-stretch

WORKDIR /app

COPY . /app

RUN pip3 install -r requirements.txt                                                                            

EXPOSE 5000

ENTRYPOINT  ["python3"]

CMD ["main.py"]