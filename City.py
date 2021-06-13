import pandas as pd
def SelectCity(cityname):
    df = pd.read_csv('outlierremovedZameen.csv')
    df.drop(df[df['city'] != cityname].index, inplace=True)
    return df
dfcity = SelectCity('Islamabad')
print(dfcity.head())