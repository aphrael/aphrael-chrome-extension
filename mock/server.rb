# -*- coding: utf-8 -*-
$: << File.dirname(__FILE__) + "/"
require 'sinatra'
require 'haml'

set :public_folder, File.dirname(__FILE__) + "/views"
set :haml, {:format => :html5}

get '/style.css' do
  content_type 'text/css', :charset => 'utf-8'
  sass :style
end

get '/' do
  haml :index
end