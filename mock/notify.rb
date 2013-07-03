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

lng = '139.688662'
lat = '35.755125'


data = {
  :channelId => config["channel_id"],
  :subchannelId => "0",
  :payload => "#{lat},#{lng}"
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