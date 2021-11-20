require "json"
require "open-uri"

# Downloads Moonrank data for collection and generates moonrank file

data = {}

URI.open("https://moonrank.app/mints/#{ARGV[0]}") do |moonrank_data|
  data = JSON.parse moonrank_data.read
end

processed_data = data["mints"].map do |m|
  id = m["name"]
  id = id.split("#")[1] if id.include?("#")
  rank = m["rank"]

  [id, rank]
end

processed_data.sort_by! { |a, b| a.to_i }

processed_json = JSON.pretty_generate(processed_data.to_h)

File.open(File.join(File.dirname(__FILE__), "../.github/moonrank/#{ARGV[0]}.json"), "w") do |moonrank_file|
  moonrank_file.write processed_json
end
