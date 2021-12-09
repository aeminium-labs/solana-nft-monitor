require "erb"
require "json"
require "open-uri"

# Re-generates all moonrank data

collection_index_filename = File.join(File.dirname(__FILE__), "../.github/collections.json")
collections = JSON.parse File.open(collection_index_filename).read

collections.each do |collection|
  collection.transform_keys!(&:to_sym)

  ARGV[0] = collection[:moonrank]

  # Downloads Moonrank data for collection and generates moonrank file

  data = {}

  begin
    URI.open("https://moonrank.app/mints/#{ARGV[0]}") do |moonrank_data|
      data = JSON.parse moonrank_data.read
    end
  rescue OpenURI::HTTPError
    puts "❗️❗️❗️ Could not get MoonRank for #{ARGV[0]}! Make sure you rank the collection manually."
    next
  end

  processed_data = data["mints"].map do |m|
    id = m["name"]
    id = id.split("#")[1] if id.include?("#")
    rank = m["rank"]

    processed_attributes = m["rank_explain"].map do |a|
      [a["attribute"], a["value"]]
    end.sort_by { |a, v| a.downcase }

    [id, {rank: rank, attributes: processed_attributes.to_h}]
  end

  processed_data.sort_by! { |a, b| a.to_i }

  processed_json = JSON.pretty_generate(processed_data.to_h)

  File.open(File.join(File.dirname(__FILE__), "../.github/moonrank/#{ARGV[0]}.json"), "w") do |moonrank_file|
    moonrank_file.write processed_json
  end
end
