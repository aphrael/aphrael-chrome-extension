# -*- coding: utf-8 -*-
require 'httpclient'

client = HTTPClient.new
request = {
  :lat => "35.698683",
  :lng => "139.774219"
}

res = client.get("http://localhost:9223/rest/position", request)
p res.status
