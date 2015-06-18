__author__ = 'jeffreyquinn'
import pandas
import json
import re
import numpy
from collections import defaultdict


TYPES = ['Full Benefit',
         'Partial Benefit',
         'Medicare Only',
         'Medicaid Only (Disability)']

SHEETS = ['PUF_2006', 'PUF_2007', 'PUF_2008', 'PUF_2009', 'PUF_2010']

STATES = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "DC",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY"
]


def load_sheet(sheet):
    year = sheet.split("_")[-1]
    print 'Loading from MMLEADS_PUF_2006-2010.xlsx..'
    df = pandas.read_excel('MMLEADS_PUF_2006-2010.xlsx', sheet, skiprows=1, index_col=[0, 1])
    df = df.replace('.', 0)
    df = df.replace('*', 0)
    df = df.replace('<0.01%', 0.01)
    df = df[4:]  # drop national stats

    for col in df.keys().tolist():
        if 'percent' in col.lower():
            new_col_name = re.sub("[Pp]ercent", "Number", col)
            if 'ffs males' in col.lower():
                df[new_col_name] = df['Number of Males with FFS'] * df[col]
            elif 'ffs females' in col.lower():
                df[new_col_name] = df['Number of Females with FFS'] * df[col]
            elif 'ffs' in col.lower():
                df[new_col_name] = df['Number of People with FFS'] * df[col]
            else:
                df[new_col_name] = df['Number of People'] * df[col]
            del df[col]
    output = {}

    for t in TYPES:
        slice = df.xs(t, level='Number of People by Medicare-Medicaid Enrollment Type')
        obj = {}
        for s in STATES:
            obj[s] = json.loads(slice.loc[s].to_json(orient='index'))
        output[t] = obj
    return year, output


def get_variable_categories():
    df = pandas.read_excel('MMLEADS_PUF_2006-2010.xlsx', 'PUF_2006')
    vars = df.ix[0].tolist()
    vars = [re.sub("[Pp]ercent", "Number", x) for x in vars]
    categories = pandas.Series(df.keys())
    categories[categories.apply(lambda x: 'Unnam' in x)] = numpy.nan
    categories = categories.ffill().tolist()
    output = defaultdict(list)
    for x,y in zip(categories, vars):
        output[x].append(y)
    json.dump(dict(output), open("app/static/variable_categories.json", "w"), indent=True)


def main():
    output = {}
    for sheet in SHEETS:
        output.__setitem__(*load_sheet(sheet))
    print 'Parsing JSON..'
    output['column_names'] = output.values()[0].values()[0].values()[0].keys()
    get_variable_categories()
    print 'Writing app/static/cms_data.json..'
    with open('app/static/cms_data.json', 'w') as of:
        json.dump(output, of)


if __name__ == '__main__':
    main()
