# Sinatra web server to handle YSlow! beacon POSTs
require 'sinatra'
require 'hpricot'

enable :logging, :dump_errors

post '/' do
  doc = Hpricot.parse(request.body.read)
  out = ""
  doc.search('//thead/tr/th').each do |header|
    out << "||" << header.inner_html
  end
  out << "||\n"
  rows = []
  doc.search('//tbody/tr').each do |row|
    thisrow = []
    row.search("//td").each do |col|
      thisrow.push(col.inner_html)
    end
    rows.push(thisrow)
  end
  rows.sort! do |a,b| 
    b[4].to_f <=> a[4].to_f
  end
  rows.each do |row|
    row.each do |col|
        out << "|" << col
    end
    out << "|\n"
  end
  filename = "results/fireunit_results_" + Time.now.year.to_s + "_" + Time.now.month.to_s + "_" + Time.now.day.to_s + ".txt"
  File.open(filename, 'w') {|f| f.write(out)}
  "success"
end
