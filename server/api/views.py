from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import get_object_or_404, GenericAPIView
from .models import EIAData, CrudeOil

from .serializers import UserSerializer, TokenObtainPairSerializer, PasswordSerializer, EIADataSerializer, CrudeOilSerializer

from keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
from urllib.request import Request, urlopen as uReq
import ssl
import json
import os
from datetime import datetime, timedelta, date

def make_soup(website) :

    req =  Request(website,headers = {'User-Agent' : 'Mozilla/5.0'})
    context = ssl._create_unverified_context()
    uClient = uReq(req, context=context)
    page_html = uClient.read()
    uClient.close()
    page_soup = BeautifulSoup(page_html, 'html.parser')
    return page_soup

def data_split(data, look_back=1):
    x, y = [], []
    for i in range(len(data) - look_back - 1):
        a = data[i:(i + look_back), 0]
        x.append(a)
        y.append(data[i + look_back, 0])
    return np.array(x), np.array(y)

def predict(df, model):
    df = pd.DataFrame(df)
    scaler = MinMaxScaler(feature_range=(-1, 1))
    scaler = scaler.fit(df)
    scale_data = scaler.transform(df)
    X, Y = data_split(scale_data, look_back=18)
    x = X[-1]
    pred = model.predict(x.reshape((1, 1, 18)))
    pred = scaler.inverse_transform(pred).flatten().astype('int')
    return pred

def getPrediction(data):
    df = pd.DataFrame(data)
    df.set_index('date', inplace=True)
    df.index = pd.to_datetime(df.index)
    df.sort_index(inplace=True)
    df_SAS = df.iloc[:,3]
    df_SAX = df.iloc[:,2]
    current_path = os.path.dirname(__file__)
    model_SAS = load_model(os.path.join(current_path, 'model/model_spr.h5'))
    model_SAX = load_model(os.path.join(current_path, 'model/model_nspr.h5'))
    SAS = predict(df_SAS, model_SAS)
    SAX = predict(df_SAX, model_SAX)
    return SAX[0], SAS[0]

def getEIAData():
    url = "https://api.eia.gov/v2/petroleum/sum/sndw/data/?frequency=weekly&data[0]=value&facets[process][]=SAE&facets[process][]=SAS&facets[process][]=SAX&facets[duoarea][]=NUS&facets[product][]=EPC0&sort[0][column]=period&sort[0][direction]=desc&end=2023-06-23&offset=0&length=3&api_key=M1TKk38zIbimr79GC7ZYRGk9Ermw1p2fuMkF8uER"
    req = Request(url)
    context = ssl._create_unverified_context()
    res = uReq(req, context=context).read()
    data = json.loads(res)
    data = data.get('response').get('data')
    date = data[0].get('period')
    dict = {}
    SAS = 0
    SAX = 0
    SAE = 0
    for i in range(3):
        label = data[i].get('process')
        value = data[i].get('value')
        if label == 'SAE': 
            SAE = value
        elif label == "SAS": 
            SAS = value
        elif label == "SAX": 
            SAX = value
    data = {"date": date, "SAX": SAX, "SAS": SAS, "SAE": SAE}
    serializer = EIADataSerializer(data=data)
    if serializer.is_valid():
        serializer.save()


class SignUpView(APIView):
    http_method_names = ['post']

    def post(self, request, *args, **kwargs):

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            get_user_model().objects.create_user(**serializer.validated_data)
            return Response(status=HTTP_201_CREATED)
        return Response(status=HTTP_400_BAD_REQUEST)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer


class ResetPasswordView(APIView):

    def get_object(self, email):
        user = get_object_or_404(get_user_model(), email=email)
        return user

    def put(self, request):
        serializer = PasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.data['email']
            user = self.get_object(email)
            password = serializer.data['password']
            if user.check_password(password):
                return Response({
                    'status': HTTP_400_BAD_REQUEST,
                    "message": "It should be different from your last password."
                })
            user.set_password(password)
            user.save()
            return Response({"status": HTTP_200_OK})
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class CrudeOilView(GenericAPIView):
    serializer_class = CrudeOilSerializer
    queryset = CrudeOil.objects.all()

    def get(self, request):
        eia_date = self.serializer_class(EIAData.objects.latest('date')).data.get('date')
        crude_date = self.serializer_class(CrudeOil.objects.latest('date')).data.get('date')
        if eia_date == crude_date:
            serializers = self.serializer_class(EIAData.objects.all(), many=True)
            SAX, SAS = getPrediction(serializers.data)
            SAE = SAS + SAX
            date = (datetime.strptime(eia_date, "%Y-%m-%d") + timedelta(7)).date()
            new_data={"date":date, "SAE":SAE,"SAX":SAX, "SAS":SAS}
            serializer_data = self.serializer_class(data=new_data)
            if serializer_data.is_valid():
                serializer_data.save()

        data = CrudeOil.objects.all()   
        print(request.query_params.get('start', None))
        if request.query_params.get('start', None) is not None and request.query_params.get('end', None) is not None:
            data = CrudeOil.objects.filter(date__range=(
                request.query_params.get("start"), request.query_params.get('end')))

        if request.query_params.get('start', None) is not None and request.query_params.get('end', None) is None:
            data = CrudeOil.objects.filter(
                date__gte=request.query_params.get('start'))

        if request.query_params.get('start', None) is None and request.query_params.get('end', None) is not None:
            data = CrudeOil.objects.filter(
                date__lte=request.query_params.get('end'))
        serializer = self.serializer_class(data, many=True)

        return Response({
            "status": "success",
            "data": serializer.data
        }, status=HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", 'data': serializer.data}, status=HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

class EIADataView(GenericAPIView):
    serializer_class = EIADataSerializer
    queryset = EIAData.objects.all()

    def get(self, request):
        getEIAData()
        data = EIAData.objects.all()

        print(request.query_params.get('start', None))
        if request.query_params.get('start', None) is not None and request.query_params.get('end', None) is not None:
            data = EIAData.objects.filter(date__range=(
                request.query_params.get("start"), request.query_params.get('end')))

        if request.query_params.get('start', None) is not None and request.query_params.get('end', None) is None:
            data = EIAData.objects.filter(
                date__gte=request.query_params.get('start'))

        if request.query_params.get('start', None) is None and request.query_params.get('end', None) is not None:
            data = EIAData.objects.filter(
                date__lte=request.query_params.get('end'))
        serializer = self.serializer_class(data, many=True)

        return Response({
            "status": "success",
            "data": serializer.data
        }, status=HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", 'data': serializer.data}, status=HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

class ArticleView(GenericAPIView):
    
    def get(self, request):
        url = "https://oilprice.com/Latest-Energy-News/World-News/"
        soup = make_soup(url)
        articleList = soup.find_all('div', {'class': 'categoryArticle'})
        data = []
        i = 0
        for article in articleList:
            i += 1
            if i > 15: break
            title = article.find('h2', {'class': 'categoryArticle__title'}).getText()
            meta = article.find('p', {'class': 'categoryArticle__meta'}).getText()
            link = article.find('a')['href']

            if link: 
                article_soup = make_soup(link).find('div', {'id': "news-content"})
                description = article_soup.get_text()            
           
            data.append({'title': title, 'link': link, 'meta': meta, 'description': description.strip()})
            

        return Response({
            "status": "success",
            "data": data
        }, status=HTTP_200_OK)