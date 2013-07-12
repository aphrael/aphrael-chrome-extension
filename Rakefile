# -*- coding: utf-8 -*-
require 'json'
WORKSPACE = File.dirname(__FILE__)
EXTENSION_DIR = '"/Users/stay/Library/Application Support/Google/Chrome/Default/Extensions/hbiimpcojcgioiffkpanhadpgkgkjnic"'
DEPLOY_FILES = ['notify.js', 'content_script.js']
RELEASE_FILES = ['notify.js', 'content_script.js', 'jquery.min.js', 'manifest.json']
@@version = nil

task:default => :deploy

# ChromeExtension

task :init do
  File.open(WORKSPACE + "/manifest.json") do |io|
    @@version = JSON.load(io)["version"] + '_0'
  end
end

task :deploy => [:init] do
  extension_path = EXTENSION_DIR + '/' + @@version
  DEPLOY_FILES.each do |file|
    sh "cp -f #{WORKSPACE}/#{file} #{extension_path}"
  end
end

task :release => [:init] do
  sh "zip package/aphrael-#{@@version}.zip #{RELEASE_FILES.join(' ')}"
end

# Heroku server
task :github_push do
  sh 'git push origin master'
end

task :heroku_deploy => [:github_push] do
  sh 'git push heroku master'
end

task :heroku_create do
  sh "heroku create --stack cedar aphrael-chrome-extension"
end

task :timezone do
  sh "heroku config:add TZ=Asia/Tokyo"
end

task :heroku_start do
  sh "heroku scale web=1"
end

task :heroku_stop do
  sh "heroku scale web=0"
end