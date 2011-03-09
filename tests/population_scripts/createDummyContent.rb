#!/usr/bin/env ruby
require 'net/http'

@name = 'admin';
@password = 'admin';

def file_to_multipart(key,filename,mime_type,content)
  if ( filename != nil )
    return "Content-Disposition: form-data; name=\"*\"; filename=\"#{filename}\"\r\n" +
         "Content-Transfer-Encoding: binary\r\n" +
         "Content-Type: #{mime_type}\r\n" +
         "\r\n" +
         "#{content}\r\n"
  else
    return "Content-Disposition: form-data; name=\"jcr:content\"\r\n" +
         "Content-Transfer-Encoding: binary\r\n" +
         "Content-Type: #{mime_type}\r\n" +
         "\r\n" +
         "#{content}\r\n"
  end

end

def execute_file_post(path, fieldname, filename, data, content_type)
  uri = URI.parse(path)
  fileTypeHint = "Content-Disposition: form-data; name=\"*@TypeHint\"\r\n\r\n" +
                 "nt:file\r\n"

  params = [fileTypeHint,file_to_multipart(fieldname, filename, content_type, data)]
  boundary = '349832898984244898448024464570528145'
  query = params.collect {|p| '--' + boundary + "\r\n" + p}.join('') + "--" + boundary + "--\r\n"
  req = Net::HTTP::Post.new(uri.path)
  req.basic_auth(@name, @password)
  pwd = "#{@name}:#{@password}"
  # base64 encode
  pwd = [pwd].pack('m').chop
  res = Net::HTTP.new(uri.host, uri.port).start {|http| http.request_post(path,query,"Content-type" => "multipart/form-data; boundary=" + boundary, "Authorization" => "Basic #{pwd}") }
  return res
end

res = execute_file_post('http://localhost:8080/system/pool/createfile', 'lorem', 'lorem'+Time.now.to_i.to_s , 'lorem ipsum dolor sit amet', 'text/plain');
