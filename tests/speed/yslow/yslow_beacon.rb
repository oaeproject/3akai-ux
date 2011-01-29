# Sinatra web server to handle YSlow! beacon POSTs
require 'sinatra'
require 'json'
require 'cgi'

post '/' do
  body = JSON.parse(request.body.read)
  # structure of request.body is documented at 
  # http://developer.yahoo.com/yslow/help/beacons.html#version2
  pageSize = (body["w"]/1000.0).to_f.to_s + "kb"
  cachePageSize = (body["w_c"]/1000.0).to_f.to_s + "kb"
  yslowScore = body["o"].to_s
  url = CGI::unescape(body["u"])
  totalNumRequests = body["r"].to_s
  cahceRequests = body["r_c"].to_s
  pageLoadTime = (body["lt"]/1000.0).to_f.to_s + "s"
  stats = body["stats"]
  cacheStats = body["stats_c"]
  out = ""
  out << "--------------------------\n"
  out << "URL: #{url}\n"
  out << "YSlow! Score: #{yslowScore}/100\n"
  out << "Page Load Time: #{pageLoadTime}\n"
  out << "\nFirst visit, no cache:\n"
  out << "HTTP Requests: #{totalNumRequests}\n"
  out << "Page Size: #{pageSize}\n"
  out << "Page components:\n"
  out << "\t|Requests\t|Component\t|Size\t|\n"
  stats.each do |stat|
    out << "\t|" << stat[1]["r"].to_s << "\t|" << stat[0] << "\t|" << (stat[1]["w"]/1000.0).to_f.to_s << "kb\t|\n"
  end
  out << "\nWith a primed cache (already visited the page):\n"
  out << "HTTP Requests: #{cahceRequests}\n"
  out << "Page Size: #{cachePageSize}\n"
  out << "Page components:\n"
  out << "\t|Requests\t|Component\t|Size\t|\n"
  cacheStats.each do |stat|
    out << "\t|" << stat[1]["r"].to_s << "\t|" << stat[0] << "\t|" << (stat[1]["w"]/1000.0).to_f.to_s << "kb\t|\n"
  end
  out << "--------------------------\n"
  filename = "results/yslow_results_" + Time.now.month.to_s + "_" + Time.now.day.to_s + ".txt"
  File.open(filename, 'w') {|f| f.write(out)}
end
