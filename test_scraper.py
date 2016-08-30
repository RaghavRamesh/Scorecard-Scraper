from lxml import html
import requests

page = request.get('http://seasonedprosg.com/Scorecard2015?Live=0&id=1252')
tree = html.fromstring(page.content)

print tree
