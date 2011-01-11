# Sinatra web server to handle YSlow! beacon POSTs
require 'sinatra'
require 'json'
require 'cgi'

post '/' do
  body = JSON.parse(request.body.read)
  # structure of request.body is documented at 
  # http://developer.yahoo.com/yslow/help/beacons.html#version2
  pageSize = (body["w"]/1000.0).to_f.to_s + "kb"
  yslowScore = body["o"].to_s
  url = CGI::unescape(body["u"])
  totalNumRequests = body["r"].to_s
  pageLoadTime = (body["lt"]/1000.0).to_f.to_s + "s"
  individualStats = body["stats"]
  out = ""
  out << "--------------------------\n"
  out << "URL: #{url}\n"
  out << "YSlow! Score: #{yslowScore}/100\n"
  out << "HTTP Requests: #{totalNumRequests}\n"
  out << "Page Load Time: #{pageLoadTime}\n"
  out << "Page Size: #{pageSize}\n"
  out << "Page components:\n"
  out << "\t|Requests\t|Component\t|Size\t|\n"
  individualStats.each do |stat|
    out << "\t|" << stat[1]["r"].to_s << "\t|" << stat[0] << "\t|" << (stat[1]["w"]/1000.0).to_f.to_s << "kb\t|\n"
  end
  out << "--------------------------\n"
  File.open("yslow_results.txt", 'a') {|f| f.write(out)}
end
