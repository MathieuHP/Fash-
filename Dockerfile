
FROM python:3.6.4-stretch


WORKDIR /fash-

RUN pip install --upgrade pip

COPY requirements.txt /fash-/

RUN pip install -r requirements.txt

COPY . /fash-/

EXPOSE 5000

CMD python main.py

CMD CD /fash-/frontend

CMD npm start

