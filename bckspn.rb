require 'rubygems'
require 'sinatra'
require 'sinatra/json'
require 'net/http'
require 'net/https'
require 'uri'
require 'json'
require 'tilt/haml'
require 'tilt/sass'
require 'pry'
require 'wordsmith-sdk'

get '/hello' do
  haml :index
end

post '/ws' do
  # binding.pry

  Wordsmith.configure do |config|
    config.token = '72e14c49fdba9d099f5f8c4b2ccfb2c1878f267f1b3e1ea73991d30e568c12f8'
    config.url = 'https://anvil.autoi.co/api/v0.1'
  end

  stuff = JSON.parse(request.body.read)["data"]

  project = Wordsmith::Project.find('ping-pong-pbp')
  template = project.templates.find('pbp')           #fetch a template by slug
  result = template.generate(stuff)

  json result
end
