# -*- coding: utf-8 -*-
require 'httpclient'
require 'json'
require 'yaml'

config = YAML.load_file(File.dirname(__FILE__) + '/auth.yml')

request = {
  'client_id' => config["client_id"],
  'client_secret' => config["client_secret"],
  'refresh_token' => config["refresh_token"],
  'grant_type' => 'refresh_token'
}

client = HTTPClient.new
client.ssl_config.verify_mode = nil

res = client.post(
  'https://accounts.google.com/o/oauth2/token',
  request
)

access_token = JSON.parse(res.body)['access_token']

pos_list = [
  {:lng => '139.774219', :lat => '35.698683'}, # 秋葉原駅
  {:lng => '139.771811', :lat => '35.698779'}, # ボークスあたり
  {:lng => '139.770352', :lat => '35.699555'}, # K-BOOKSあたり
  {:lng => '139.771843', :lat => '35.700696'}, # アニメイトあたり
  {:lng => '139.76797' , :lat => '35.700461'}  # 神田明神あたり  
]

pos = pos_list[rand(pos_list.length)]

data = {
  :channelId => config["channel_id"],
  :subchannelId => "0",
  :payload => "#{pos[:lat]},#{pos[:lng]}"
}

response = client.post(
  'https://www.googleapis.com/gcm_for_chrome/v1/messages',
  data.to_json,
  {
    'Content-Type' => "application/json",
    'Authorization' => "Bearer #{access_token}"
  }
)

p response.status