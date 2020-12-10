import pandas as pd
#download the earthquake.csv from USGS and apply following script for preprocessing
readfile = pd.read_csv(r"earthquake.csv", delimiter = ',')
#get the updated data by concatenating columns
readfile = pd.concat([readfile['time'],readfile['latitude'],readfile['longitude'],readfile['depth'],readfile['mag'],readfile['magType'],readfile['magNst'],readfile['place'].str.split(', ',1 , expand=True)], axis=1)
#copy updated file to destination folder
readfile.to_csv(r"\updatedearthquake.csv", index = None)