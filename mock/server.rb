# -*- coding: utf-8 -*-
require 'sinatra'
require 'haml'

set :public_folder, File.dirname(__FILE__) + "/mock/"
set :haml, {:format => :html5}

get '/' do
  haml :index
end