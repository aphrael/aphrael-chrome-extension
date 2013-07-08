# -*- coding: utf-8 -*-
require 'httpclient'

client = HTTPClient.new

pos_list = [
  {:lng => '139.774219', :lat => '35.698683'}, # 秋葉原駅
  {:lng => '139.771907', :lat => '35.6983'}, # ゲマ
  {:lng => '139.771092', :lat => '35.698587'}, # 交差点
  {:lng => '139.771103', :lat => '35.699145'}, # メロン横
  {:lng => '139.77062', :lat => '35.699668'}, # K
  {:lng => '139.769686', :lat => '35.69972'}, # クラサバ
  {:lng => '139.768968', :lat => '35.699816'}, # サイゼだっけ？
  {:lng => '139.768356', :lat => '35.699903'}, # 神田明神坂下 
  {:lng => '139.767991', :lat => '35.700225'}, # 神田明神前
  {:lng => '139.768142', :lat => '35.7006'}, # 神田明神
]

pos_list.each do |position|
  res = client.get("http://localhost:9223/rest/position", position)
  sleep 1
  p res.status
end
