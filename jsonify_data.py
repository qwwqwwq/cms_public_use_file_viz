__author__ = 'jeffreyquinn'
import pandas
import json


def main():
    print 'Loading from MMLEADS_PUF_2006-2010.xlsx..'
    sheets = [('2006', pandas.read_excel('MMLEADS_PUF_2006-2010.xlsx', 'PUF_2006', skiprows=1, index_col=0)),
              ('2007', pandas.read_excel('MMLEADS_PUF_2006-2010.xlsx', 'PUF_2007', skiprows=1, index_col=0)),
              ('2008', pandas.read_excel('MMLEADS_PUF_2006-2010.xlsx', 'PUF_2008', skiprows=1, index_col=0)),
              ('2009', pandas.read_excel('MMLEADS_PUF_2006-2010.xlsx', 'PUF_2009', skiprows=1, index_col=0)),
              ('2010', pandas.read_excel('MMLEADS_PUF_2006-2010.xlsx', 'PUF_2010', skiprows=1, index_col=0))]
    print 'Parsing JSON..'
    obj = {x: json.loads(y.to_json(orient='index')) for (x, y) in sheets}
    obj['column_names'] = sheets[0][1].keys().tolist()
    print 'Writing app/static/cms_data.json..'
    with open('app/static/cms_data.json', 'w') as of:
        json.dump(obj, of)


if __name__ == '__main__':
    main()
